import { useEffect, useRef, useState } from "react";
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

const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  audio: true,
  video: true,
};

const PEER_CONSTRAINTS = {
  iceServers: [
    {
      urls: ["turn:192.168.0.101:3478"],
      username: "webrtcuser",
      credential: "webrctpass",
    },
  ],
};

const SESSION_CONSTRAINTS: RTCOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const useJustChillingDuo = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const { roomId, isOfferer } = useMatchStore();

  const initializeConnection = async () => {
    if (!roomId || isOfferer === null) {
      console.warn("[WebRTC] ⚠️ roomId ou isOfferer ausente. Abortando.");
      return;
    }

    console.log("[WebRTC] 🟡 Inicializando conexão...");

    const pc = new RTCPeerConnection(PEER_CONSTRAINTS);

    peerConnection.current = pc;

    await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)
      .then((localMediaStream) => {
        setLocalStream(localMediaStream);
        console.log("[WebRTC] ✅ Mídia local capturada com sucesso.", localMediaStream);
        pc.addStream(localMediaStream);
        console.log("[WebRTC] ✅ Tracks locais adicionadas ao peer connection.");
      });

    pc.onaddstream = (event: EventOnAddStream) => {
      console.log("[WebRTC] onaddstream acionado. Stream remota recebida.", event, event.stream);
      setRemoteStream(event.stream);

      const videoTracks = event.stream.getVideoTracks();
      console.log("[WebRTC] Tracks de vídeo remotas:", videoTracks);

      if (videoTracks.length === 0) {
        console.warn("[WebRTC] ⚠️ Nenhuma track de vídeo presente na stream remota.");
      } else {
        console.log("[WebRTC] ✅ Track de vídeo detectada:", videoTracks[0]);
      }
    }

    pc.onicecandidate = (event: EventOnCandidate) => {
      if (event.candidate) {
        console.log("[WebRTC] ICE candidate:", event.candidate);
        console.log(
          "[WebRTC] Tipo do candidato:",
          event.candidate.candidate?.includes("typ relay")
            ? "RELAY (via TURN)"
            : event.candidate.candidate?.includes("typ srflx")
            ? "STUN (reflexivo)"
            : "HOST (local)"
        );

        webSocketService.emit("just-chilling:duo:webrtc:ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[ICE] Estado ICE:", pc.connectionState);
    };

    if (isOfferer) {
      try {
        const offer = await pc.createOffer(SESSION_CONSTRAINTS);
        await pc.setLocalDescription(offer);
        console.log("[WebRTC] ✅ Offer criado e setado localmente.", offer);

        webSocketService.emit("just-chilling:duo:webrtc:offer", {
          roomId,
          offer,
        });
        console.log("[WebRTC] 📤 Offer enviado via WebSocket.");
      } catch (err) {
        console.error("[WebRTC] ❌ Erro ao criar offer", err);
      }
    }
  };

  useEffect(() => {
    if (!roomId) return;

    webSocketService.on("just-chilling:duo:webrtc:offer", async ({ offer }) => {
      try {
        console.log("[WebRTC] Offer recebido:", offer);

        if (!peerConnection.current) {
          console.log("[WebRTC] ⚠️ peerConnection inexistente. Chamando initializeConnection.");
          await initializeConnection();
        }

        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("[WebRTC] ✅ Offer remoto aplicado.");

        const answer = await peerConnection.current?.createAnswer();
        if (answer) {
          await peerConnection.current?.setLocalDescription(answer);
          console.log("[WebRTC] ✅ Answer criado e setado localmente.");

          webSocketService.emit("just-chilling:duo:webrtc:answer", {
            roomId,
            answer,
          });
          console.log("[WebRTC] 📤 Answer enviado via WebSocket.");
        } else {
          console.error("[WebRTC] ❌ Falha ao criar answer: answer indefinido.");
        }
      } catch (err) {
        console.error("[WebRTC] ❌ Erro ao responder offer", err);
      }
    });

    webSocketService.on("just-chilling:duo:webrtc:answer", async ({ answer }) => {
      try {
        console.log("[WebRTC] Answer recebido:", answer);
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("[WebRTC] ✅ Answer remoto aplicado.");
      } catch (err) {
        console.error("[WebRTC] ❌ Erro ao aplicar answer", err);
      }
    });

    webSocketService.on("just-chilling:duo:webrtc:ice-candidate", async ({ candidate }) => {
      try {
        console.log("[WebRTC] ICE candidate recebido:", candidate);
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("[WebRTC] ✅ ICE candidate remoto adicionado.");
      } catch (err) {
        console.error("[WebRTC] ❌ Erro ao adicionar ICE candidate", err);
      }
    });

    return () => {
      webSocketService.off("just-chilling:duo:webrtc:offer");
      webSocketService.off("just-chilling:duo:webrtc:answer");
      webSocketService.off("just-chilling:duo:webrtc:ice-candidate");
      peerConnection.current?.close();
      console.log("[WebRTC] 🔴 Conexão finalizada e listeners removidos.");
    };
  }, [roomId]);

  useEffect(() => {
    let statsInterval: NodeJS.Timeout | null = null;

    if (peerConnection.current) {
      statsInterval = setInterval(() => {
        peerConnection.current?.getStats().then(stats => {
          stats.forEach(report => {
            if (report.type === "inbound-rtp" && report.kind === "video") {
              console.log("[WebRTC][STATS] 📦 Bytes recebidos (vídeo):", report.bytesReceived);
              console.log("[WebRTC][STATS] 🎞️ Frames decodificados:", report.framesDecoded);
              console.log("[WebRTC][STATS] 📈 Packets recebidos:", report.packetsReceived);
            }

            if (report.type === "track" && report.kind === "video") {
              console.log("[WebRTC][STATS] 🧩 Track stats:", {
                framesDecoded: report.framesDecoded,
                framesDropped: report.framesDropped,
                framesReceived: report.framesReceived,
                frameWidth: report.frameWidth,
                frameHeight: report.frameHeight,
              });
            }
          });
        }).catch(err => {
          console.warn("[WebRTC][STATS] ❌ Erro ao obter stats:", err);
        });
      }, 5000); // a cada 2s
    }

    return () => {
      if (statsInterval) clearInterval(statsInterval);
    };
  }, [remoteStream]);


  return {
    localStream,
    remoteStream,
    start: initializeConnection,
  };
};

export default useJustChillingDuo;
