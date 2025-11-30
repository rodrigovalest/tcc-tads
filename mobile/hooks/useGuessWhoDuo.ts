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
import useGuessWhoStore from "../store/guess-who-store";
import IGuessWhoWin from "../models/interfaces/guess-who/guess-who-win";
import IGuessWhoCharacter from "../models/interfaces/guess-who/guess-who-character";
import IGuessWhoGuessingOrUnmarking from "../models/interfaces/guess-who/guess-who-guessing-or-unmarking";
import IGuessWhoLose from "../models/interfaces/guess-who/guess-who-lose";
import IGuessWhoRoundStart from "../models/interfaces/guess-who/guess-who-round-start";
import IGuessWhoWaiting from "../models/interfaces/guess-who/guess-who-waiting";
import IGuessWhoWrongGuess from "../models/interfaces/guess-who/guess-who-wrong-guess";

const turnServerUrl = process.env.EXPO_PUBLIC_TURN_SERVER_URL ?? "192.168.0.101";
const turnServerPort = process.env.EXPO_PUBLIC_TURN_SERVER_PORT ?? "3478";
const turnServerUsername = process.env.EXPO_PUBLIC_TURN_SERVER_USERNAME ?? "webrtcuser";
const turnServerCredential = process.env.EXPO_PUBLIC_TURN_SERVER_CREDENTIAL ?? "webrctpass";

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

const useGuessWhoDuo = (redirectOnEnd: () => void) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);

  const { matchId, isOfferer } = useMatchStore();
  const {
    setStatus,
    setRoundTime,
    setAnswer,
    setBuddyCharacterWhenLose,
    setGuessCharacter,
    resetRound,
  } = useGuessWhoStore();  

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
        webSocketService.emit("guess-who:duo:webrtc:ice-candidate", {
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

      webSocketService.emit("guess-who:duo:webrtc:offer", {
        matchId,
        offer,
      });
    }
  };

  useEffect(() => {
    if (!matchId) return;

    webSocketService.on("guess-who:duo:webrtc:offer", async ({ offer }) => {
      if (!peerConnection.current) await initializeConnection();

      await peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.current?.createAnswer();

      if (answer) {
        await peerConnection.current?.setLocalDescription(answer);

        webSocketService.emit("guess-who:duo:webrtc:answer", {
          matchId,
          answer,
        });
      }
    });

    webSocketService.on("guess-who:duo:webrtc:answer", async ({ answer }) => {
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    webSocketService.on("guess-who:duo:webrtc:ice-candidate", async ({ candidate }) => {
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    webSocketService.on("guess-who:duo:guessing-or-unmarking", async (data: IGuessWhoGuessingOrUnmarking) => {
      console.log(data);

      setAnswer(data.answer);
      setStatus(data.status);
      setRoundTime(data.startTime, data.endTime);
    });

    webSocketService.on("guess-who:duo:waiting", async (data: IGuessWhoWaiting) => {
      console.log(data);

      setStatus(data.status);
      setRoundTime(data.startTime, data.endTime);
    });

    webSocketService.on("guess-who:duo:wrong-guess", async (data: IGuessWhoWrongGuess) => {
      console.log(data);

      setStatus(data.status);
      setGuessCharacter(data.guessCharacter);
    });

    webSocketService.on("guess-who:duo:win", async (data: IGuessWhoWin) => {
      console.log(data);

      setStatus(data.status);

      setTimeout(() => {
        webSocketService.disconnect();
      }, 10000);
    });

    webSocketService.on("guess-who:duo:lose", async (data: IGuessWhoLose) => {
      console.log(data);

      setBuddyCharacterWhenLose(data.buddyCharacter);
      setStatus(data.status);

      setTimeout(() => {
        webSocketService.disconnect();
      }, 10000);
    });

    webSocketService.on("guess-who:duo:round-start", (data: IGuessWhoRoundStart) => {
      console.log(data);

      resetRound();
      setStatus(data.status);
      setRoundTime(data.startTime, data.endTime);
    });

    webSocketService.onDisconnect(() => {
      endCall();
    });

    return () => {
      webSocketService.off("guess-who:duo:webrtc:offer");
      webSocketService.off("guess-who:duo:webrtc:answer");
      webSocketService.off("guess-who:duo:webrtc:ice-candidate");
      endCall();
    };
  }, []);

  const handleAnswer = (answer: boolean) => {
    webSocketService.emit("guess-who:duo:answer", {
      matchId,
      answer,
    });
  }

  const handleGuess = (guessCharacter: IGuessWhoCharacter) => {
    webSocketService.emit("guess-who:duo:guess", {
      matchId,
      guessCharacter,
    });
  };

  return {
    localStream,
    remoteStream,
    start: initializeConnection,
    switchAudio,
    switchVideo,
    isMicMuted,
    isVideoMuted,
    endCall,
    handleAnswer,
    handleGuess,
  };
};

export default useGuessWhoDuo;
