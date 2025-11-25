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
import { getWhoAmICharacters } from "../constants/who-am-i-characters";
import { MatchLanguage } from "../models/types/match-language.type";


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

const useWhoAmIDuo = (redirectOnEnd: () => void, onAdversaryCorrect?: (isGiveUp: boolean, isImageRole: boolean) => void, onNewRound?: () => void, onGameEnded?: () => void) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const { matchId, isOfferer, matchLanguage, timerStartTimestamp: storeTimerStart, timerDurationMs: storeTimerDuration, timerServerOffset: storeServerOffset, setTimer } = useMatchStore();
  
  // Timer sincronizado - usa o store como fonte de verdade
  const [timerStartTimestamp, setTimerStartTimestamp] = useState<number | null>(storeTimerStart);
  const [timerDurationMs, setTimerDurationMs] = useState<number>(storeTimerDuration);
  const [serverOffset, setServerOffset] = useState<number>(storeServerOffset);
  
  // Sincroniza com o store quando mudar
  useEffect(() => {
    if (storeTimerStart !== null) {
      setTimerStartTimestamp(storeTimerStart);
    }
    setTimerDurationMs(storeTimerDuration);
    setServerOffset(storeServerOffset);
  }, [storeTimerStart, storeTimerDuration, storeServerOffset]);
  
  // Obtém os personagens com as dicas no idioma selecionado
  const getCharacters = (): WhoAmICharacter[] => {
    const language: MatchLanguage = (matchLanguage || 'pt') as MatchLanguage;
    return getWhoAmICharacters(language);
  };
  

  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  
  const [myCharacter, setMyCharacter] = useState<WhoAmICharacter | null>(null);
  const [opponentCharacter, setOpponentCharacter] = useState<WhoAmICharacter | null>(null);
  const [previousMyCharacter, setPreviousMyCharacter] = useState<WhoAmICharacter | null>(null);
  const [usedCharacters, setUsedCharacters] = useState<WhoAmICharacter[]>([]);
  const isGeneratingCharacter = useRef<boolean>(false);
  const lastSyncedCharacterId = useRef<number | null>(null);
  
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
    const characters = getCharacters();
    const availableCharacters = characters.filter(char => char.id !== previousMyCharacter?.id);
    //const availableCharacters = characters.filter(char => 
      //!usedCharacters.some(used => used.id === char.id)
    //);
    
    //const charactersToChooseFrom = availableCharacters.length >= 1 ? availableCharacters : characters;
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
      console.log("[SYNC] Enviando personagem:", character.id, character.name);
      console.log("[SYNC] Personagem tem hints:", character.hints?.length || 0);
      
      // Marca como o último sincronizado ANTES de enviar (para evitar receber nossa própria mensagem)
      lastSyncedCharacterId.current = character.id;
      
      webSocketService.emit("who-am-i:duo:sync-character", {
        matchId,
        characterId: character.id
      });
    } else {
      console.log("[SYNC] WebSocket não conectado, tentando novamente em breve...");
      // Tenta novamente após um pequeno delay
      setTimeout(() => {
        if (webSocketService.isConnected()) {
          console.log("[SYNC] WebSocket conectado, sincronizando agora:", character.id);
          lastSyncedCharacterId.current = character.id;
          webSocketService.emit("who-am-i:duo:sync-character", {
            matchId,
            characterId: character.id
          });
        } else {
          console.error("[SYNC] WebSocket ainda não conectado após retry");
        }
      }, 500);
    }
  };

  const generateNewCharacter = () => {
    // Previne múltiplas chamadas simultâneas
    if (isGeneratingCharacter.current) {
      console.log("[NEW_CHARACTER] Já está gerando personagem, ignorando chamada duplicada");
      return;
    }

    isGeneratingCharacter.current = true;
    console.log("[NEW_CHARACTER] ========== INICIANDO GERAÇÃO ==========");
    console.log("[NEW_CHARACTER] Gerando novo personagem");
    console.log("[NEW_CHARACTER] Estado atual - isImageRole:", isImageRole);
    console.log("[NEW_CHARACTER] isOfferer:", isOfferer);
    
    // IMPORTANTE: Alterna os papéis ANTES de definir o novo personagem
    // Isso evita que o jogador que deve ver dicas veja a imagem por alguns segundos
    // Alterna os papéis a cada nova rodada
    // Se estava vendo imagem, agora vê dicas e vice-versa
    const newRole = !isImageRole;
    setIsImageRole(newRole);
    console.log("[NEW_ROUND] Alternando papéis para nova rodada:", newRole ? "imagem" : "dicas");
    
    // Sincroniza os papéis com o oponente (oposto do atual) PRIMEIRO
    syncRolesWithOpponent(newRole);
    
    // Pequeno delay para garantir que os papéis sejam sincronizados antes de definir o personagem
    setTimeout(() => {
      // APENAS o jogador que chama esta função sorteia o personagem
      // O outro jogador receberá via WebSocket
      const selectedCharacter = selectRandomCharacter();
      console.log("[NEW_CHARACTER] Personagem selecionado:", selectedCharacter.name, "ID:", selectedCharacter.id);
      console.log("[NEW_CHARACTER] Personagem tem hints:", selectedCharacter.hints?.length || 0);
      console.log("[NEW_CHARACTER] Personagem tem image:", !!selectedCharacter.image);
      
      // Define o personagem localmente
      setMyCharacter(selectedCharacter);
      setOpponentCharacter(selectedCharacter);
      
      // Marca qual personagem foi sincronizado
      lastSyncedCharacterId.current = selectedCharacter.id;
      
      // Sincroniza o personagem com o oponente
      syncCharacterWithOpponent(selectedCharacter);
      
      if (webSocketService.isConnected()) {
        webSocketService.emit("who-am-i:duo:new-round", {
          matchId,
        });
      }
      
      isGeneratingCharacter.current = false;
      console.log("[NEW_CHARACTER] ========== GERAÇÃO CONCLUÍDA ==========");
    }, 100); // Pequeno delay para garantir sincronização dos papéis
  };

  const notifyCorrectAnswer = (isGiveUp: boolean = false) => {
    if (webSocketService.isConnected()) {
      webSocketService.emit("who-am-i:duo:correct-answer", {
        matchId,
        isGiveUp,
        isImageRole,
      });
    }
  };

  const notifyGameEnded = () => {
    if (webSocketService.isConnected()) {
      console.log("[GAME_ENDED] Notificando servidor que o jogo encerrou");
      webSocketService.emit("who-am-i:duo:game-ended", {
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

    // Aguarda a conexão do WebSocket antes de iniciar
    const initializeFirstCharacter = async () => {
      // Aguarda um pouco para garantir que o WebSocket está conectado
      let retries = 0;
      while (!webSocketService.isConnected() && retries < 5) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }
      
      if (!webSocketService.isConnected()) {
        console.error("[MATCH] WebSocket não conectado após tentativas, inicializando mesmo assim");
      }

      if (isOfferer === true) {
        console.log("[MATCH] Sou o offerer, selecionando personagem inicial");
        const selectedCharacter = selectRandomCharacter();
        console.log("[MATCH] Personagem selecionado:", selectedCharacter.name);
        console.log("[MATCH] Personagem tem hints:", selectedCharacter.hints?.length || 0);
        console.log("[MATCH] Personagem tem image:", !!selectedCharacter.image);
        
        // Define o personagem localmente primeiro (para garantir que está disponível)
        setMyCharacter(selectedCharacter);
        setOpponentCharacter(selectedCharacter);
        setUsedCharacters(prev => [...prev, selectedCharacter]);
        
        // Define o papel do offerer como imagem desde o início
        setIsImageRole(true);
        
        // Sincroniza o personagem com o oponente
        syncCharacterWithOpponent(selectedCharacter);
        
        // Sincroniza os papéis: offerer vê imagem, não-offerer vê dicas
        syncRolesWithOpponent(true);
        
        console.log("[MATCH] Personagem e papéis sincronizados - Offerer vê imagem, Não-offerer vê dicas");
      } else if (isOfferer === false) {
        console.log("[MATCH] Não sou o offerer, aguardando sincronização do personagem");
        // Não-offerer vê dicas por padrão (oposto do offerer)
        setIsImageRole(false);
      }
    };

    const timeout = setTimeout(initializeFirstCharacter, 800);

    return () => clearTimeout(timeout);
  }, [matchId, isOfferer]);

  useEffect(() => {
    if (!matchId) return;

    console.log("[WS_LISTENERS] Registrando listeners para matchId:", matchId);
    console.log("[WS_LISTENERS] WebSocket conectado:", webSocketService.isConnected());
    console.log("[WS_LISTENERS] isOfferer:", isOfferer);

    // Listener para receber o timer sincronizado quando a partida começa
    webSocketService.on("who-am-i:duo:match-started", ({ timerStartTimestamp: startTimestamp, timerDurationMs: duration, serverCurrentTimestamp: serverTime }) => {
      if (startTimestamp !== undefined && duration !== undefined) {
        console.log("[TIMER] Recebendo timer sincronizado do servidor:", startTimestamp, duration);
        
        // Calcula o offset entre o relógio do servidor e do cliente
        // Isso compensa diferenças de relógio e delay de rede
        let calculatedOffset = 0;
        if (serverTime !== undefined) {
          const clientReceiveTime = Date.now();
          // Offset = diferença entre o tempo do cliente e o tempo do servidor
          // Quando o servidor diz que são X, o cliente está em X + offset
          calculatedOffset = clientReceiveTime - serverTime;
          console.log("[TIMER] serverTime:", serverTime, "clientTime:", clientReceiveTime, "offset:", calculatedOffset, "ms");
        }
        
        setTimer(startTimestamp, duration, calculatedOffset); // Atualiza o store com o offset
        setTimerStartTimestamp(startTimestamp);
        setTimerDurationMs(duration);
        setServerOffset(calculatedOffset);
      }
    });

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
      console.log("[SYNC] ========== RECEBENDO PERSONAGEM ==========");
      console.log("[SYNC] characterId recebido:", characterId);
      console.log("[SYNC] isOfferer:", isOfferer);
      console.log("[SYNC] matchId:", matchId);
      console.log("[SYNC] Personagem atual antes de receber:", myCharacter?.name, "ID:", myCharacter?.id);
      console.log("[SYNC] lastSyncedCharacterId:", lastSyncedCharacterId.current);
      
      // Ignora se estivermos gerando um personagem (evita conflito)
      if (isGeneratingCharacter.current) {
        console.log("[SYNC] Ignorando - estamos gerando personagem localmente");
        return;
      }
      
      // Ignora se já recebemos este personagem recentemente (evita mensagens duplicadas/antigas)
      if (lastSyncedCharacterId.current === characterId) {
        console.log("[SYNC] Ignorando - personagem já foi sincronizado recentemente");
        return;
      }
      
      const characters = getCharacters();
      const receivedCharacter = characters.find(char => char.id === characterId);
      
      if (receivedCharacter) {
        console.log("[SYNC] Personagem encontrado:", receivedCharacter.name);
        console.log("[SYNC] Personagem hints (quantidade):", receivedCharacter.hints?.length || 0);
        console.log("[SYNC] Personagem hints (conteúdo):", receivedCharacter.hints);
        console.log("[SYNC] Personagem image:", receivedCharacter.image);
        
        // Marca este personagem como o último sincronizado
        lastSyncedCharacterId.current = characterId;
        
        // Define o mesmo personagem para ambos os jogadores
        // IMPORTANTE: Sempre atualiza, mesmo que já tenha um personagem
        setMyCharacter(receivedCharacter);
        setOpponentCharacter(receivedCharacter);
        
        console.log("[SYNC] Personagem definido para ambos:", receivedCharacter.name);
        console.log("[SYNC] Estado após definir - myCharacter:", receivedCharacter);
        
        setUsedCharacters(prev => {
          // Evita duplicatas
          if (prev.some(char => char.id === receivedCharacter.id)) {
            return prev;
          }
          return [...prev, receivedCharacter];
        });
        
        // NÃO altera o papel aqui quando recebe um novo personagem em uma nova rodada
        // O papel será sincronizado via sync-roles
        console.log("[SYNC] ========== PERSONAGEM DEFINIDO ==========");
        console.log("[SYNC] Aguardando sincronização de papéis...");
      } else {
        console.error("[SYNC] Personagem não encontrado com ID:", characterId);
      }
    });

    webSocketService.on("who-am-i:duo:new-round", ({ timerStartTimestamp: newTimerStart, timerDurationMs: newTimerDuration, serverCurrentTimestamp: serverTime }) => {
      console.log("[NEW_ROUND] Oponente iniciou nova rodada");
      console.log("[NEW_ROUND] myCharacter atual:", myCharacter?.name);
      console.log("[NEW_ROUND] isImageRole atual:", isImageRole);
      
      // Atualiza o timer sincronizado quando uma nova rodada começa
      if (newTimerStart !== undefined && newTimerDuration !== undefined) {
        console.log("[NEW_ROUND] Atualizando timer sincronizado:", newTimerStart, newTimerDuration);
        
        // Recalcula o offset para a nova rodada (pode ter mudado)
        let calculatedOffset = serverOffset; // Mantém o offset anterior por padrão
        if (serverTime !== undefined) {
          const clientReceiveTime = Date.now();
          calculatedOffset = clientReceiveTime - serverTime;
          console.log("[NEW_ROUND] Recalculando offset:", calculatedOffset, "ms");
        }
        
        setTimer(newTimerStart, newTimerDuration, calculatedOffset); // Atualiza o store
        setTimerStartTimestamp(newTimerStart);
        setTimerDurationMs(newTimerDuration);
        setServerOffset(calculatedOffset);
      }
      
      // Notifica o componente que uma nova rodada começou (para sincronizar contador)
      onNewRound?.();
    });

    webSocketService.on("who-am-i:duo:adversary-correct", ({ from, isGiveUp, isImageRole: adversaryIsImageRole }) => {
      console.log("[ADVERSARY_CORRECT] Oponente acertou:", from);
      console.log("[ADVERSARY_CORRECT] isGiveUp:", isGiveUp);
      console.log("[ADVERSARY_CORRECT] adversaryIsImageRole:", adversaryIsImageRole);
      onAdversaryCorrect?.(isGiveUp, adversaryIsImageRole);
    });

    webSocketService.on("who-am-i:duo:game-ended", ({ from }) => {
      console.log("[GAME_ENDED] Oponente encerrou o jogo:", from);
      console.log("[GAME_ENDED] Notificando componente para encerrar após modais fecharem");
      // Notifica o componente que o jogo deve encerrar
      // O componente vai esperar os modais fecharem antes de encerrar
      onGameEnded?.();
    });

    webSocketService.on("who-am-i:duo:switch-roles", ({ isImageRole: newRole }) => {
      console.log("[ROLES] Recebendo alternância de papéis:", newRole ? "imagem" : "dicas");
      console.log("[ROLES] myCharacter antes da alternância:", myCharacter?.name);
      console.log("[ROLES] myCharacter hints antes:", myCharacter?.hints?.length || 0);
      // Garante que o papel seja sempre oposto ao do adversário
      const oppositeRole = !newRole;
      setIsImageRole(oppositeRole);
      console.log("[ROLES] Definindo papel oposto:", oppositeRole ? "imagem" : "dicas");
      console.log("[ROLES] myCharacter após alternância:", myCharacter?.name);
    });

    webSocketService.on("who-am-i:duo:sync-roles", ({ isImageRole: newRole }) => {
      console.log("[ROLES] ========== RECEBENDO SINCRONIZAÇÃO DE PAPÉIS ==========");
      console.log("[ROLES] Recebendo sincronização de papéis:", newRole ? "imagem" : "dicas");
      console.log("[ROLES] myCharacter antes de sync-roles:", myCharacter?.name);
      console.log("[ROLES] myCharacter hints antes:", myCharacter?.hints?.length || 0);
      
      const oppositeRole = !newRole;
      setIsImageRole(oppositeRole);
      
      console.log("[ROLES] Definindo papel oposto:", oppositeRole ? "imagem" : "dicas");
      console.log("[ROLES] myCharacter após sync-roles:", myCharacter?.name);
      console.log("[ROLES] myCharacter hints após:", myCharacter?.hints?.length || 0);
      console.log("[ROLES] ========== PAPÉIS SINCRONIZADOS ==========");
    });

    webSocketService.onDisconnect(() => {
      endCall();
    });

    return () => {
      webSocketService.off("who-am-i:duo:match-started");
      webSocketService.off("who-am-i:duo:webrtc:offer");
      webSocketService.off("who-am-i:duo:webrtc:answer");
      webSocketService.off("who-am-i:duo:webrtc:ice-candidate");
      webSocketService.off("who-am-i:duo:sync-character");
      webSocketService.off("who-am-i:duo:new-round");
      webSocketService.off("who-am-i:duo:adversary-correct");
      webSocketService.off("who-am-i:duo:game-ended");
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
    notifyGameEnded,

    usedCharacters,
    myCharacterImage: myCharacter?.image || null,
    opponentCharacterImage: opponentCharacter?.image || null,
    generateNewImages: generateNewCharacter,
    isImageRole,
    switchRoles,
    myCharacterHints: myCharacter?.hints || [],
    opponentCharacterHints: opponentCharacter?.hints || [],
    timerStartTimestamp,
    timerDurationMs,
    serverOffset,
  };
};

export default useWhoAmIDuo;
