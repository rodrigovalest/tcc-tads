import webSocketService from "../services/web-socket-service";
import useMatchStore from "../store/match-store";
import { useState, useRef, useEffect } from "react";

export function useWebRTCConnection() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const { roomId } = useMatchStore();

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setLocalStream(stream);

      const peer = new RTCPeerConnection();
      pc.current = peer;

      stream.getTracks().forEach((track: MediaStreamTrack) => {
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          webSocketService.emit('webrtc:ice-candidate', { roomId, candidate: event.candidate });
        }
      };

      peer.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      if (true) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        webSocketService.emit('webrtc:offer', { roomId, offer });
      }

      const isOfferer = Math.random() < 0.5;
      if (isOfferer) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        webSocketService.emit('webrtc:offer', { roomId, offer });
      }
    };

    const timeout = setTimeout(() => {
      init();
    }, 500)

    webSocketService.on('webrtc:offer', async ({ offer }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      webSocketService.emit('webrtc:answer', { roomId, answer });
    });

    webSocketService.on('webrtc:answer', async ({ answer }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    webSocketService.on('webrtc:ice-candidate', async ({ candidate }) => {
      if (!pc.current) return;
      await pc.current.addIceCandidate(candidate);
    });

    return () => {
      pc.current?.close();
      webSocketService.off('webrtc:offer');
      webSocketService.off('webrtc:answer');
      webSocketService.off('webrtc:ice-candidate');
      clearTimeout(timeout)
    };
  }, [roomId]);

  return { localStream, remoteStream };
}
