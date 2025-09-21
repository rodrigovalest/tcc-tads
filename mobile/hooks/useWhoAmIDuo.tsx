import { useEffect, useRef, useState, useCallback } from "react";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  MediaStreamConstraints,
  EventOnAddStream,
  EventOnCandidate
} from "react-native-webrtc";
import webSocketService from "../services/web-socket-service";
import useMatchStore from "../store/match-store";
import { ImageSourcePropType } from "react-native";


const turnServerUrl = process.env.EXPO_PUBLIC_API_URL ?? '192.168.1.22';
const turnServerPort = process.env.EXPO_PUBLIC_TURN_SERVER_PORT ?? '3478';
const turnServerUsername = process.env.EXPO_PUBLIC_TURN_SERVER_USERNAME ?? 'webrtcuser';
const turnServerCredential = process.env.EXPO_PUBLIC_TURN_SERVER_CREDENTIAL ?? 'webrctpass';

const PEER_CONSTRAINTS = {
  iceServers: [
    {
      urls: [`turn:${turnServerUrl}:${turnServerPort}`],
      username: turnServerUsername,
      credential: turnServerCredential,
    },
  ],
};

const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  audio: true,
  video: true,
};

const SESSION_CONSTRAINTS: RTCOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

// Imagens disponíveis para o jogo Who Am I
const WHO_AM_I_IMAGES: ImageSourcePropType[] = [
  require("../assets/images/who_am_i_characters/whoami1.jpg"),
  require("../assets/images/who_am_i_characters/whoami2.jpg"),
  require("../assets/images/who_am_i_characters/whoami3.jpg"),
  require("../assets/images/who_am_i_characters/whoami4.jpg"),
  require("../assets/images/who_am_i_characters/whoami5.jpg"),
  require("../assets/images/who_am_i_characters/whoami6.jpg"),
  require("../assets/images/who_am_i_characters/whoami7.jpg"),
  require("../assets/images/who_am_i_characters/whoami8.jpg"),
];


const useWhoAmIDuo = (redirectOnEnd: () => void) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const { matchId, isOfferer } = useMatchStore();
  
  // Debug: log do estado do store
  console.log("[STORE] matchId:", matchId, "isOfferer:", isOfferer);

  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  
  // Estados para as imagens do jogo Who Am I
  const [myCharacterImage, setMyCharacterImage] = useState<ImageSourcePropType | null>(null);
  const [opponentCharacterImage, setOpponentCharacterImage] = useState<ImageSourcePropType | null>(null);
  const [usedImages, setUsedImages] = useState<ImageSourcePropType[]>([]);

  const switchAudio = () => {
    setIsMicMuted((prev) => {
      localStream?.getAudioTracks().forEach((track) => {
        track.enabled = prev;
      });
      return !prev;
    });
  };

  const switchVideo = () => {
    setIsVideoMuted((prev) => {
      localStream?.getVideoTracks().forEach((track) => {
        track.enabled = prev;
      });
      return !prev;
    });
  };

  // Função para selecionar duas imagens aleatórias diferentes que não foram usadas
  const selectRandomImages = () => {
    // Se já usamos todas as imagens, reseta a lista de usadas
    if (usedImages.length >= WHO_AM_I_IMAGES.length) {
      console.log("[SELECT] Todas as imagens foram usadas, resetando lista");
      setUsedImages([]);
    }

    // Filtra imagens que não foram usadas
    const availableImages = WHO_AM_I_IMAGES.filter(img => !usedImages.includes(img));
    
    // Se não há imagens suficientes, usa todas
    const imagesToChooseFrom = availableImages.length >= 2 ? availableImages : WHO_AM_I_IMAGES;
    
    // Embaralha e seleciona duas imagens diferentes
    const shuffled = [...imagesToChooseFrom].sort(() => Math.random() - 0.5);
    const selected = [shuffled[0], shuffled[1]];
    
    console.log("[SELECT] Imagens selecionadas:", selected);
    console.log("[SELECT] Imagens já usadas:", usedImages);
    
    return selected;
  };

  // Função para sincronizar imagens entre os jogadores
  const syncImagesWithOpponent = (images: ImageSourcePropType[]) => {
    if (webSocketService.isConnected()) {
      const imageIndices = images.map(img => {
        // Encontra o índice da imagem no array original
        return WHO_AM_I_IMAGES.findIndex(originalImg => originalImg === img);
      });
      
      console.log("[SYNC] Enviando imagens:", imageIndices);
      webSocketService.emit("who-am-i:duo:sync-images", {
        matchId,
        images: imageIndices
      });
    } else {
      console.log("[SYNC] WebSocket não conectado, não foi possível sincronizar imagens");
    }
  };

  // Função para gerar novas imagens (chamada quando Give up ou Nailed it é pressionado)
  const generateNewImages = () => {
    console.log("[NEW_IMAGES] Gerando novas imagens");
    const selectedImages = selectRandomImages();
    
    // Marca as imagens anteriores como usadas
    if (myCharacterImage && opponentCharacterImage) {
      setUsedImages(prev => [...prev, myCharacterImage, opponentCharacterImage]);
    }
    
    setMyCharacterImage(selectedImages[0]);
    setOpponentCharacterImage(selectedImages[1]);
    syncImagesWithOpponent(selectedImages);
    
    // Notifica o oponente que uma nova rodada foi iniciada
    if (webSocketService.isConnected()) {
      webSocketService.emit("who-am-i:duo:new-round", {
        matchId,
      });
    }
  };

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;

    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setRemoteStream(null);

    if (webSocketService.isConnected()) {
      webSocketService.disconnect();
    }

    redirectOnEnd();
  };

  const initializeConnection = async () => {
    console.log("[INIT] Inicializando conexão - matchId:", matchId, "isOfferer:", isOfferer);
    
    if (!matchId || isOfferer === null) {
      console.log("[INIT] Condições não atendidas, saindo");
      return;
    }

    const pc = new RTCPeerConnection(PEER_CONSTRAINTS);
    peerConnection.current = pc;

    await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)
      .then((localMediaStream) => {
        setLocalStream(localMediaStream);
        pc.addStream(localMediaStream);
      });

    pc.onaddstream = (event: EventOnAddStream) => {
      setRemoteStream(event.stream);
    }

    pc.onicecandidate = (event: EventOnCandidate) => {
      if (event.candidate) {
        webSocketService.emit("who-am-i:duo:webrtc:ice-candidate", {
          matchId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[ICE] Estado ICE:", pc.connectionState);

      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        endCall();
      }
    };

    if (isOfferer) {
      const offer = await pc.createOffer(SESSION_CONSTRAINTS);
      await pc.setLocalDescription(offer);

      webSocketService.emit("who-am-i:duo:webrtc:offer", {
        matchId,
        offer,
      });
    }
  };

  // Efeito separado para sincronizar imagens imediatamente
  useEffect(() => {
    console.log("[DEBUG] useEffect triggered - matchId:", matchId, "isOfferer:", isOfferer);
    
    if (!matchId) {
      console.log("[DEBUG] matchId não definido, saindo");
      return;
    }

    // Aguarda um pouco para garantir que o isOfferer seja definido
    const timeout = setTimeout(() => {
      if (isOfferer === true) {
        console.log("[MATCH] Sou o offerer, selecionando imagens");
        const selectedImages = selectRandomImages();
        console.log("[MATCH] Imagens selecionadas:", selectedImages);
        setMyCharacterImage(selectedImages[0]);
        setOpponentCharacterImage(selectedImages[1]);
        // Marca as imagens iniciais como usadas
        setUsedImages(prev => [...prev, ...selectedImages]);
        syncImagesWithOpponent(selectedImages);
      } else if (isOfferer === false) {
        console.log("[MATCH] Não sou o offerer, aguardando sincronização");
      } else {
        console.log("[MATCH] isOfferer ainda não definido após timeout, tentando mesmo assim");
        // Fallback: se isOfferer não foi definido, tenta selecionar imagens
        const selectedImages = selectRandomImages();
        setMyCharacterImage(selectedImages[0]);
        setOpponentCharacterImage(selectedImages[1]);
        // Marca as imagens iniciais como usadas
        setUsedImages(prev => [...prev, ...selectedImages]);
        syncImagesWithOpponent(selectedImages);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [matchId, isOfferer]);

  useEffect(() => {
    if (!matchId) return;

    webSocketService.on("who-am-i:duo:webrtc:offer", async ({ offer }) => {
      if (!peerConnection.current)
        await initializeConnection();

      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current?.createAnswer();

      if (answer) {
        await peerConnection.current?.setLocalDescription(answer);

        webSocketService.emit("who-am-i:duo:webrtc:answer", {
          matchId,
          answer,
        });
      }
    });

    webSocketService.on("who-am-i:duo:webrtc:answer", async ({ answer }) => {
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    webSocketService.on("who-am-i:duo:webrtc:ice-candidate", async ({ candidate }) => {
      await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Listener para sincronização de imagens
    webSocketService.on("who-am-i:duo:sync-images", ({ images }) => {
      console.log("[SYNC] Recebendo imagens:", images);
      const imageIndices = images as number[];
      const receivedImages = imageIndices.map(index => WHO_AM_I_IMAGES[index]);
      
      // O jogador que recebe as imagens inverte a ordem (sua imagem é a segunda, do oponente é a primeira)
      setMyCharacterImage(receivedImages[1]);
      setOpponentCharacterImage(receivedImages[0]);
      
      // Marca as imagens recebidas como usadas
      setUsedImages(prev => [...prev, ...receivedImages]);
    });

    // Listener para nova rodada iniciada pelo oponente
    webSocketService.on("who-am-i:duo:new-round", ({ from }) => {
      console.log("[NEW_ROUND] Oponente iniciou nova rodada:", from);
      // O oponente já gerou as novas imagens, então só aguardamos a sincronização
    });

    webSocketService.onDisconnect(() => {
      endCall();
    });

    return () => {
      webSocketService.off("who-am-i:duo:webrtc:offer");
      webSocketService.off("who-am-i:duo:webrtc:answer");
      webSocketService.off("who-am-i:duo:webrtc:ice-candidate");
      webSocketService.off("who-am-i:duo:sync-images");
      webSocketService.off("who-am-i:duo:new-round");
      endCall();
    };
  }, [matchId]);

  return {
    localStream,
    remoteStream,
    start: initializeConnection,
    switchAudio,
    switchVideo,
    isMicMuted,
    isVideoMuted,
    endCall,
    myCharacterImage,
    opponentCharacterImage,
    generateNewImages,
    usedImages, // Para debug
  };
};

export default useWhoAmIDuo;
