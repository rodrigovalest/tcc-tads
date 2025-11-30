import { useEffect, useRef, useState } from "react";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  MediaStreamConstraints,
  EventOnAddStream,
  EventOnCandidate,
} from "react-native-webrtc";
import webSocketService from "../services/web-socket-service";
import useMatchStore from "../store/match-store";

const turnServerUrl = process.env.EXPO_PUBLIC_TURN_SERVER_URL ?? "192.168.0.106";
const turnServerPort = process.env.EXPO_PUBLIC_TURN_SERVER_PORT ?? "3478";
const turnServerUsername = process.env.EXPO_PUBLIC_TURN_SERVER_USERNAME ?? "webrtcuser";
const turnServerCredential = process.env.EXPO_PUBLIC_TURN_SERVER_CREDENTIAL ?? "webrtcpass";

const PEER_CONSTRAINTS = {
  iceServers: [
    {
      urls: `turn:${turnServerUrl}:${turnServerPort}?transport=udp`,
      username: turnServerUsername,
      credential: turnServerCredential,
    },
  ],
  iceTransportPolicy: "relay",
};

const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  audio: true,
  video: true,
};

const SESSION_CONSTRAINTS: RTCOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const useJustChillingDuo = (redirectOnEnd: () => void) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const { matchId, isOfferer } = useMatchStore();

  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);

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

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;

    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);

    if (webSocketService.isConnected()) {
      webSocketService.disconnect();
    }

    redirectOnEnd();
  };

  const initializeConnection = async () => {
    if (!matchId || isOfferer === null) return;

    const pc = new RTCPeerConnection(PEER_CONSTRAINTS);
    peerConnection.current = pc;

    await mediaDevices
      .getUserMedia(MEDIA_CONSTRAINTS)
      .then((localMediaStream) => {
        setLocalStream(localMediaStream);
        pc.addStream(localMediaStream);
      });

    pc.onaddstream = (event: EventOnAddStream) => {
      setRemoteStream(event.stream);
    };

    pc.onicecandidate = (event: EventOnCandidate) => {
      if (event.candidate) {
        webSocketService.emit("just-chilling:duo:webrtc:ice-candidate", {
          matchId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        endCall();
      }
    };

    if (isOfferer) {
      const offer = await pc.createOffer(SESSION_CONSTRAINTS);
      await pc.setLocalDescription(offer);

      webSocketService.emit("just-chilling:duo:webrtc:offer", {
        matchId,
        offer,
      });
    }
  };

  useEffect(() => {
    if (!matchId) return;

    webSocketService.on("just-chilling:duo:webrtc:offer", async ({ offer }) => {
      if (!peerConnection.current) await initializeConnection();

      await peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.current?.createAnswer();

      if (answer) {
        await peerConnection.current?.setLocalDescription(answer);

        webSocketService.emit("just-chilling:duo:webrtc:answer", {
          matchId,
          answer,
        });
      }
    });

    webSocketService.on(
      "just-chilling:duo:webrtc:answer",
      async ({ answer }) => {
        await peerConnection.current?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    );

    webSocketService.on(
      "just-chilling:duo:webrtc:ice-candidate",
      async ({ candidate }) => {
        await peerConnection.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    );

    webSocketService.onDisconnect(() => {
      endCall();
    });

    return () => {
      webSocketService.off("just-chilling:duo:webrtc:offer");
      webSocketService.off("just-chilling:duo:webrtc:answer");
      webSocketService.off("just-chilling:duo:webrtc:ice-candidate");
      endCall();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    start: initializeConnection,
    switchAudio,
    switchVideo,
    isMicMuted,
    isVideoMuted,
    endCall,
  };
};

export default useJustChillingDuo;
