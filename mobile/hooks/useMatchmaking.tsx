import useMatchStore from "../store/match-store";
import useAuthStore from "../store/auth-store";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import webSocketService from "../services/web-socket-service";
import Toast from "react-native-toast-message";
import IMatchmakingResponse from "../models/responses/matchmaking-response";

const useMatchmaking = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const {
    matchFormat,
    matchLanguage,
    matchMode,
    setMatchId,
    setIsOfferer,
    resetMatch,
    setUserBuddy,
  } = useMatchStore();

  useEffect(() => {
    if (!token || !matchFormat || !matchLanguage || !matchMode) {
      resetMatch();
      webSocketService.disconnect();
      router.replace("/(private)/(tabs)/matches");
      return;
    }

    webSocketService.connect(token);

    webSocketService.onDisconnect(async () => {
      webSocketService.disconnect();
      resetMatch();
      router.replace("/(private)/(tabs)/matches");
    });

    webSocketService.on("exception", (error) => {
      console.error("[matchmaking exception listener]: ", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Something went wrong!",
        position: "top",
      });

      webSocketService.disconnect();
      resetMatch();
      router.push("/(private)/(tabs)/matches");
    });

    webSocketService.on(
      `${matchMode}:${matchFormat}:match-started`,
      async (data: IMatchmakingResponse) => {
        setMatchId(data.matchId);
        setIsOfferer(data.isOfferer);
        setUserBuddy(data.buddy);
        router.replace(`/(private)/${data.matchMode}/${matchFormat}/game`);
      }
    );

    webSocketService.emit(`${matchMode}:${matchFormat}:enqueue`, {
      matchLanguage: matchLanguage,
    });

    return () => {
      webSocketService.off("disconnect");
      webSocketService.off("exception");
    };
  }, []);
};

export default useMatchmaking;
