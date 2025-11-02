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


const turnServerUrl = process.env.EXPO_PUBLIC_API_URL ?? '192.168.1.7';
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
  const [previousMyCharacter, setPreviousMyCharacter] = useState<WhoAmICharacter | null>(null);
  const [usedCharacters, setUsedCharacters] = useState<WhoAmICharacter[]>([]);
  
  // Sistema de papéis: true = vê imagem, false = vê dicas
  // Inicializa baseado no isOfferer para garantir papéis diferentes
  const [isImageRole, setIsImageRole] = useState<boolean>(isOfferer === true);

  // Sincroniza papéis quando isOfferer mudar
  useEffect(() => {
    if (isOfferer !== null) {
      const newRole = isOfferer === true;
      setIsImageRole(newRole);
      console.log("[ROLES] Inicializando papel baseado no isOfferer:", newRole ? "imagem" : "dicas");
    }
  }, [isOfferer]);

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

  const selectRandomCharacter = (): WhoAmICharacter => {
    
    const availableCharacters = WHO_AM_I_CHARACTERS.filter(char => char.id !== previousMyCharacter?.id);
    //const availableCharacters = WHO_AM_I_CHARACTERS.filter(char => 
      //!usedCharacters.some(used => used.id === char.id)
    //);
    
    //const charactersToChooseFrom = availableCharacters.length >= 1 ? availableCharacters : WHO_AM_I_CHARACTERS;
    const shuffled = Math.floor(Math.random() * availableCharacters.length)
    //const shuffled = [...charactersToChooseFrom].sort(() => Math.random() - 0.5);
    const selected = availableCharacters[shuffled];
    setPreviousMyCharacter(selected);
    console.log("--------------------------------");
    console.log(selected.name);
    console.log(selected.hints);
    console.log("--------------------------------");
    return selected;
  };

  const syncCharacterWithOpponent = (character: WhoAmICharacter) => {
    if (webSocketService.isConnected()) {
      console.log('no sync foi',character);
      console.log("[SYNC] Enviando personagem:", character.id);
      webSocketService.emit("who-am-i:duo:sync-character", {
        matchId,
        characterId: character.id
      });
    } else {
      console.log("[SYNC] WebSocket não conectado, não foi possível sincronizar personagem");
    }
  };

  const generateNewCharacter = () => {
    console.log("[NEW_CHARACTER] Gerando novo personagem");
    const selectedCharacter = selectRandomCharacter();
    
    //if (myCharacter) {
      //setUsedCharacters(prev => [...prev, myCharacter]);
    //}
    
    // Ambos os usuários recebem o mesmo personagem
    setMyCharacter(selectedCharacter);
    setOpponentCharacter(selectedCharacter);
    //console.log("selecionado foi: ", selectedCharacter.name);
    syncCharacterWithOpponent(selectedCharacter);
    
    // Alterna os papéis a cada nova rodada
    const newRole = !isImageRole;
    setIsImageRole(newRole);
    console.log("[NEW_ROUND] Alternando papéis para nova rodada:", newRole ? "imagem" : "dicas");
    syncRolesWithOpponent(newRole);
    
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

  const switchRoles = () => {
    const newRole = !isImageRole;
    setIsImageRole(newRole);
    
    console.log("[ROLES] Alternando papéis localmente:", newRole ? "imagem" : "dicas");
    
    if (webSocketService.isConnected()) {
      webSocketService.emit("who-am-i:duo:switch-roles", {
        matchId,
        isImageRole: newRole,
      });
    }
  };

  const syncRolesWithOpponent = (isImageRole: boolean) => {
    if (webSocketService.isConnected()) {
      webSocketService.emit("who-am-i:duo:sync-roles", {
        matchId,
        isImageRole,
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
        console.log("[MATCH] Sou o offerer, selecionando personagem");
        const selectedCharacter = selectRandomCharacter();
        console.log("[MATCH] Personagem selecionado:", selectedCharacter.name);
        setMyCharacter(selectedCharacter);
        setOpponentCharacter(selectedCharacter);
        setUsedCharacters(prev => [...prev, selectedCharacter]);
        syncCharacterWithOpponent(selectedCharacter);
      } else if (isOfferer === false) {
        console.log("[MATCH] Não sou o offerer, aguardando sincronização");
      } else {
        console.log("[MATCH] isOfferer ainda não definido após timeout, tentando mesmo assim");
        const selectedCharacter = selectRandomCharacter();
        console.log("[MATCH] Fallback - Personagem:", selectedCharacter.name);
        setMyCharacter(selectedCharacter);
        setOpponentCharacter(selectedCharacter);
        setUsedCharacters(prev => [...prev, selectedCharacter]);
        syncCharacterWithOpponent(selectedCharacter);
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

    webSocketService.on("who-am-i:duo:sync-character", ({ characterId }) => {
      console.log("[SYNC] Recebendo personagem:", characterId);
      const receivedCharacter = WHO_AM_I_CHARACTERS.find(char => char.id === characterId);
      
      if (receivedCharacter) {
        console.log("[SYNC] Personagem encontrado:", receivedCharacter.name);
        
        // Ambos os usuários recebem o mesmo personagem
        setMyCharacter(receivedCharacter);
        setOpponentCharacter(receivedCharacter);
        
        console.log("[SYNC] Personagem definido para ambos:", receivedCharacter.name);
        
        setUsedCharacters(prev => [...prev, receivedCharacter]);
      }
    });

    webSocketService.on("who-am-i:duo:new-round", ({ from }) => {
      console.log("[NEW_ROUND] Oponente iniciou nova rodada:", from);
    });

    webSocketService.on("who-am-i:duo:adversary-correct", ({ from }) => {
      console.log("[ADVERSARY_CORRECT] Oponente acertou:", from);
      onAdversaryCorrect?.();
    });

    webSocketService.on("who-am-i:duo:switch-roles", ({ isImageRole: newRole }) => {
      console.log("[ROLES] Recebendo alternância de papéis:", newRole ? "imagem" : "dicas");
      // Garante que o papel seja sempre oposto ao do adversário
      const oppositeRole = !newRole;
      setIsImageRole(oppositeRole);
      console.log("[ROLES] Definindo papel oposto:", oppositeRole ? "imagem" : "dicas");
    });

    webSocketService.on("who-am-i:duo:sync-roles", ({ isImageRole: newRole }) => {
      console.log("[ROLES] Recebendo sincronização de papéis:", newRole ? "imagem" : "dicas");
      console.log("newRole::::", newRole);
      const oppositeRole = !newRole;
      setIsImageRole(oppositeRole);
      console.log("[ROLES] Definindo papel oposto:", oppositeRole ? "imagem" : "dicas");
    });

    webSocketService.onDisconnect(() => {
      endCall();
    });

    return () => {
      webSocketService.off("who-am-i:duo:webrtc:offer");
      webSocketService.off("who-am-i:duo:webrtc:answer");
      webSocketService.off("who-am-i:duo:webrtc:ice-candidate");
      webSocketService.off("who-am-i:duo:sync-character");
      webSocketService.off("who-am-i:duo:new-round");
      webSocketService.off("who-am-i:duo:adversary-correct");
      webSocketService.off("who-am-i:duo:switch-roles");
      webSocketService.off("who-am-i:duo:sync-roles");
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
    generateNewCharacter,
    notifyCorrectAnswer,

    usedCharacters,
    myCharacterImage: myCharacter?.image || null,
    opponentCharacterImage: opponentCharacter?.image || null,
    generateNewImages: generateNewCharacter,
    isImageRole,
    switchRoles,
    myCharacterHints: myCharacter?.hints || [],
    opponentCharacterHints: opponentCharacter?.hints || [],
  };
};

export default useWhoAmIDuo;
