import { useEffect, useRef, useState } from "react";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
  RTCIceCandidate
} from "react-native-webrtc";
import webSocketService from "../services/web-socket-service";
import useMatchStore from "../store/match-store";
import { WhoAmICharacter, WhoAmICharacterPair } from "../models/types/who-am-i-character.interface";
import { WHO_AM_I_CHARACTERS } from "../constants/who-am-i-characters";


const turnServerUrl = process.env.EXPO_PUBLIC_API_URL ?? '10.182.240.50';
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

const MEDIA_CONSTRAINTS = {
  audio: true,
  video: true,
};

const SESSION_CONSTRAINTS: RTCOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const useWhoAmIDuo = (redirectOnEnd: () => void, onAdversaryCorrect?: () => void) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const { matchId, isOfferer } = useMatchStore();
  
  console.log("[STORE] matchId:", matchId, "isOfferer:", isOfferer);

  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  
  const [myCharacter, setMyCharacter] = useState<WhoAmICharacter | null>(null);
  const [opponentCharacter, setOpponentCharacter] = useState<WhoAmICharacter | null>(null);
  const [usedCharacters, setUsedCharacters] = useState<WhoAmICharacter[]>([]);

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

  const selectRandomCharacters = (): WhoAmICharacterPair => {
    if (usedCharacters.length >= WHO_AM_I_CHARACTERS.length) {
      console.log("[SELECT] Todos os personagens foram usados, resetando lista");
      setUsedCharacters([]);
    }

    const availableCharacters = WHO_AM_I_CHARACTERS.filter(char => 
      !usedCharacters.some(used => used.id === char.id)
    );
    
    const charactersToChooseFrom = availableCharacters.length >= 2 ? availableCharacters : WHO_AM_I_CHARACTERS;
    
    const shuffled = [...charactersToChooseFrom].sort(() => Math.random() - 0.5);
    const selected = [shuffled[0], shuffled[1]];
    
    console.log("[SELECT] Personagens selecionados:", selected.map(c => c.name));
    console.log("[SELECT] Personagens já usados:", usedCharacters.map(c => c.name));
    
    return {
      myCharacter: selected[0],
      opponentCharacter: selected[1]
    };
  };

  const syncCharactersWithOpponent = (characters: WhoAmICharacterPair) => {
    if (webSocketService.isConnected()) {
      const characterIds = [characters.myCharacter.id, characters.opponentCharacter.id];
      
      console.log("[SYNC] Enviando personagens:", characterIds);
      webSocketService.emit("who-am-i:duo:sync-images", {
        matchId,
        images: characterIds
      });
    } else {
      console.log("[SYNC] WebSocket não conectado, não foi possível sincronizar personagens");
    }
  };

  const generateNewCharacters = () => {
    console.log("[NEW_CHARACTERS] Gerando novos personagens");
    const selectedCharacters = selectRandomCharacters();
    
    if (myCharacter && opponentCharacter) {
      setUsedCharacters(prev => [...prev, myCharacter, opponentCharacter]);
    }
    
    setMyCharacter(selectedCharacters.myCharacter);
    setOpponentCharacter(selectedCharacters.opponentCharacter);
    syncCharactersWithOpponent(selectedCharacters);
    
    if (webSocketService.isConnected()) {
      webSocketService.emit("who-am-i:duo:new-round", {
        matchId,
      });
    }
  };

  const notifyCorrectAnswer = () => {
    if (webSocketService.isConnected()) {
      webSocketService.emit("who-am-i:duo:correct-answer", {
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
    console.log("[INIT] PeerConnection criada");

    await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)
      .then((localMediaStream) => {
        console.log("[INIT] Local stream obtido:", localMediaStream);
        setLocalStream(localMediaStream);
        pc.addStream(localMediaStream);
        console.log("[INIT] Local stream adicionado ao peer connection");
      });

    // @ts-ignore - These properties exist at runtime
    pc.onaddstream = (event: any) => {
      console.log("[WEBRTC] Remote stream received");
      setRemoteStream(event.stream);
    }

    // @ts-ignore - These properties exist at runtime
    pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        webSocketService.emit("who-am-i:duo:webrtc:ice-candidate", {
          matchId,
          candidate: event.candidate,
        });
      }
    };

    // @ts-ignore - These properties exist at runtime
    pc.oniceconnectionstatechange = () => {
      console.log("[ICE] Estado ICE:", pc.connectionState);

      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        endCall();
      }
    };

    if (isOfferer) {
      const offer = await pc.createOffer(SESSION_CONSTRAINTS);
      // @ts-ignore - offer is compatible with RTCSessionDescription
      await pc.setLocalDescription(offer);

      webSocketService.emit("who-am-i:duo:webrtc:offer", {
        matchId,
        offer,
      });
    }
  };

  useEffect(() => {
    console.log("[DEBUG] useEffect triggered - matchId:", matchId, "isOfferer:", isOfferer);
    
    if (!matchId) {
      console.log("[DEBUG] matchId não definido, saindo");
      return;
    }

    const timeout = setTimeout(() => {
      if (isOfferer === true) {
        console.log("[MATCH] Sou o offerer, selecionando personagens");
        const selectedCharacters = selectRandomCharacters();
        console.log("[MATCH] Personagens selecionados:", selectedCharacters);
        console.log("[MATCH] Meu personagem:", selectedCharacters.myCharacter.name);
        console.log("[MATCH] Personagem do oponente:", selectedCharacters.opponentCharacter.name);
        setMyCharacter(selectedCharacters.myCharacter);
        setOpponentCharacter(selectedCharacters.opponentCharacter);
        setUsedCharacters(prev => [...prev, selectedCharacters.myCharacter, selectedCharacters.opponentCharacter]);
        syncCharactersWithOpponent(selectedCharacters);
      } else if (isOfferer === false) {
        console.log("[MATCH] Não sou o offerer, aguardando sincronização");
      } else {
        console.log("[MATCH] isOfferer ainda não definido após timeout, tentando mesmo assim");
        const selectedCharacters = selectRandomCharacters();
        console.log("[MATCH] Fallback - Meu personagem:", selectedCharacters.myCharacter.name);
        console.log("[MATCH] Fallback - Personagem do oponente:", selectedCharacters.opponentCharacter.name);
        setMyCharacter(selectedCharacters.myCharacter);
        setOpponentCharacter(selectedCharacters.opponentCharacter);
        setUsedCharacters(prev => [...prev, selectedCharacters.myCharacter, selectedCharacters.opponentCharacter]);
        syncCharactersWithOpponent(selectedCharacters);
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
        // @ts-ignore - answer is compatible with RTCSessionDescription
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

    webSocketService.on("who-am-i:duo:sync-images", ({ images }) => {
      console.log("[SYNC] Recebendo personagens:", images);
      const characterIds = images as number[];
      const receivedCharacters = characterIds.map(id => 
        WHO_AM_I_CHARACTERS.find(char => char.id === id)!
      );
      
      console.log("[SYNC] Personagens encontrados:", receivedCharacters.map(c => c.name));
      
      setMyCharacter(receivedCharacters[1]);
      setOpponentCharacter(receivedCharacters[0]);
      
      console.log("[SYNC] Meu personagem definido:", receivedCharacters[1]?.name);
      console.log("[SYNC] Personagem do oponente definido:", receivedCharacters[0]?.name);
      
      setUsedCharacters(prev => [...prev, ...receivedCharacters]);
    });

    webSocketService.on("who-am-i:duo:new-round", ({ from }) => {
      console.log("[NEW_ROUND] Oponente iniciou nova rodada:", from);
    });

    webSocketService.on("who-am-i:duo:adversary-correct", ({ from }) => {
      console.log("[ADVERSARY_CORRECT] Oponente acertou:", from);
      onAdversaryCorrect?.();
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
    myCharacter,
    opponentCharacter,
    generateNewCharacters,
    notifyCorrectAnswer,
    usedCharacters,
    myCharacterImage: myCharacter?.image || null,
    opponentCharacterImage: opponentCharacter?.image || null,
    generateNewImages: generateNewCharacters,
  };
};

export default useWhoAmIDuo;
