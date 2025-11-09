import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import useMatchStore from '../store/match-store';

const useJustChillingInviteNavigation = () => {
  const router = useRouter();
  const { matchId, buddy } = useMatchStore();
  const previousMatchId = useRef<string | null>(null);

  useEffect(() => {
    if (matchId && buddy && matchId !== previousMatchId.current) {
      previousMatchId.current = matchId;
      const timeoutId = setTimeout(() => {
        try {
          router.replace('/(private)/just-chilling/duo/game');
        } catch (error) {
          setTimeout(() => {
            previousMatchId.current = null;
          }, 1000);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [matchId, buddy, router]);
  useEffect(() => {
    if (!matchId) {
      previousMatchId.current = null;
    }
  }, [matchId]);
};

export default useJustChillingInviteNavigation;
