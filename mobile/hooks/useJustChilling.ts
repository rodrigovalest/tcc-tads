import webSocketService from "../services/web-socket-service";
import useAuthStore from "../store/auth-store";
import useMatchStore from "../store/match-store";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const useJustChilling = () => {
  const { token } = useAuthStore();
  const { matchMode, matchFormat, matchLanguage, setRoomId, resetMatch } = useMatchStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || !matchMode || !matchFormat || !matchLanguage) {
      router.replace('/(private)/(tabs)/matches');
      resetMatch();
      return;
    }

    webSocketService.connect(token);

    webSocketService.on('disconnect', () => {
      console.warn('[JUST CHILLING disconnect]');
      router.replace('/(private)/(tabs)/matches');
    });

    webSocketService.on('exception', (data) => {
      console.error('[JUST CHILLING exception listener]: ', data);
    });

    webSocketService.on('just-chilling:match-started', (data) => {
      console.log('Match started: ', data);

      setRoomId(data.roomId);

      router.replace('/(private)/just-chilling/game');
    });

    webSocketService.emit('just-chilling:enqueue', {
      matchFormat: 'duo',
      matchLanguage: 'en'
    });

    return () => {
      // webSocketService.off('disconnect');
      // webSocketService.disconnect();
    };
  }, []);
}

export default useJustChilling;
