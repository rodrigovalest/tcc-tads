import { useEffect, useRef, useState } from "react";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
} from "react-native-webrtc";
import webSocketService from "../services/web-socket-service";
import useAuthStore from "../store/auth-store";
import useMatchStore from "../store/match-store";

export function useTestVideoCall() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  const { roomId, setRoomId, resetMatch } = useMatchStore();
  const { token } = useAuthStore();

  const roomIdRef = useRef<string | null>(roomId);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  const startWebRTC = async () => {
    const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
    setLocalStream(stream);

    const peer = new RTCPeerConnection();

    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream);
    });

    (peer as any).ontrack = (event: any) => {
      console.log('[JUST CHILLING] ontrack triggered');

      const stream = event.streams?.[0];
      if (!stream) {
        console.warn('[JUST CHILLING] No stream in ontrack event');
        return;
      }

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      console.log('[JUST CHILLING] Remote stream received');
      console.log('> Video tracks count:', videoTracks.length);
      videoTracks.forEach((t, i) => {
        console.log(`> Video track [${i}]: id=${t.id}, enabled=${t.enabled}, readyState=${t.readyState}`);
      });

      console.log('> Audio tracks count:', audioTracks.length);
      audioTracks.forEach((t, i) => {
        console.log(`> Audio track [${i}]: id=${t.id}, enabled=${t.enabled}, readyState=${t.readyState}`);
      });

      if (videoTracks.length === 0) {
        console.warn('[JUST CHILLING] No video tracks found in remote stream');
      }

      setRemoteStream(stream);
    };

    (peer as any).onicecandidate = (event: any) => {
      if (event.candidate) {
        webSocketService.emit('just-chilling:duo:webrtc:ice-candidate', {
          roomId: roomIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    return peer;
  };

  useEffect(() => {
    if (!token) return;

    console.log('[JUST CHILLING] useTestVideoCall hook initialized', token);

    webSocketService.connect(token);

    webSocketService.on('disconnect', () => {
      console.log('[JUST CHILLING ws disconnect]');
    });

    webSocketService.on('exception', (data) => {
      console.error('[JUST CHILLING exception listener]: ', data);
    });

    webSocketService.on('just-chilling:duo:match-started', async (data) => {
      try {
        console.log('[JUST CHILLING match started]', data);

        await setRoomId(data.roomId);
        roomIdRef.current = data.roomId;
        pc.current = await startWebRTC();

        if (data.isOfferer) {
          const offer = await pc.current.createOffer({});
          await pc.current.setLocalDescription(offer);

          webSocketService.emit('just-chilling:duo:webrtc:offer', {
            roomId: data.roomId,
            offer,
          });
        }
      } catch (error) {
        console.error('[JUST CHILLING] Error match started:', error);
        return;
      }
    });

    webSocketService.on('just-chilling:duo:webrtc:offer', async ({ offer }) => {
      try {
        console.log('[JUST CHILLING] Received offer', offer);

        if (!pc.current) pc.current = await startWebRTC();

        await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);

        webSocketService.emit('just-chilling:duo:webrtc:answer', {
          roomId: roomIdRef.current,
          answer,
        });
      } catch (error) {
        console.error('[JUST CHILLING] Error handling offer:', error);
        return;
      }
    });

    webSocketService.on('just-chilling:duo:webrtc:answer', async ({ answer }) => {
      try {
        console.log('[JUST CHILLING] Received answer', answer);

        await pc.current?.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('[JUST CHILLING] Error handling answer:', error);
        return;
      }
    });

    webSocketService.on('just-chilling:duo:webrtc:ice-candidate', async ({ candidate }) => {
      try {
        console.log('[JUST CHILLING] Received ICE candidate', candidate);

        if (!pc.current) return;
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('[JUST CHILLING] Error handling ICE candidate:', error);
        return;
      }
    });

    webSocketService.emit('just-chilling:duo:enqueue', {
      matchLanguage: 'en',
    });

    return () => {
      pc.current?.close();
      webSocketService.disconnect();
      resetMatch();
    };
  }, [token]);

  return { localStream, remoteStream };
}
