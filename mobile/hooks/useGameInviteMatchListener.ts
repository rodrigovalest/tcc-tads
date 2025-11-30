import { useEffect } from 'react';
import { router } from 'expo-router';
import webSocketService from '../services/web-socket-service';
import useMatchStore from '../store/match-store';
import useGuessWhoStore from '../store/guess-who-store';
import IMatchmakingResponse from '../models/responses/matchmaking-response';
import IGuessWhoCharactersSelectedResponse from '../models/interfaces/guess-who/guess-who-characters-selected';
import IGuessWhoRoundStart from '../models/interfaces/guess-who/guess-who-round-start';

export const useGameInviteMatchListener = () => {
  const { matchMode, matchLanguage, setMatchId, setIsOfferer, setUserBuddy } = useMatchStore();
  const { setStatus, setRoundTime, setCharacters, setYourCharacter } = useGuessWhoStore();

  useEffect(() => {
    if (!matchMode || !matchLanguage) return;

    const handleGuessWhoMatchStarted = (data: IMatchmakingResponse) => {
      setMatchId(data.matchId);
      setIsOfferer(data.isOfferer);
      setUserBuddy(data.buddy);
    };
    const handleGuessWhoCharactersSelected = (data: IGuessWhoCharactersSelectedResponse) => {
      setCharacters(data.characters);
      setYourCharacter(data.yourCharacter);
    };
    const handleGuessWhoRoundStart = (data: IGuessWhoRoundStart) => {
      setStatus(data.status);
      setRoundTime(data.startTime, data.endTime);
      router.replace('/(private)/guess-who/duo/game');
    };
    const handleJustChillingMatchStarted = (data: IMatchmakingResponse) => {
      setMatchId(data.matchId);
      setIsOfferer(data.isOfferer);
      setUserBuddy(data.buddy);
      router.replace('/(private)/just-chilling/duo/game');
    };
    const handleWhoAmIMatchStarted = (data: IMatchmakingResponse) => {
      setMatchId(data.matchId);
      setIsOfferer(data.isOfferer);
      setUserBuddy(data.buddy);
      router.replace('/(private)/who-am-i/duo/game');
    };

    if (matchMode === 'guess-who') {
      webSocketService.on('guess-who:duo:match-started', handleGuessWhoMatchStarted);
      webSocketService.on('guess-who:duo:characters-selected', handleGuessWhoCharactersSelected);
      webSocketService.on('guess-who:duo:round-start', handleGuessWhoRoundStart);
    } else if (matchMode === 'just-chilling') {
      webSocketService.on('just-chilling:duo:match-started', handleJustChillingMatchStarted);
    } else if (matchMode === 'who-am-i') {
      webSocketService.on('who-am-i:duo:match-started', handleWhoAmIMatchStarted);
    }

    return () => {
      webSocketService.off('guess-who:duo:match-started');
      webSocketService.off('guess-who:duo:characters-selected');
      webSocketService.off('guess-who:duo:round-start');
      webSocketService.off('just-chilling:duo:match-started');
      webSocketService.off('who-am-i:duo:match-started');
    };
  }, [matchMode, matchLanguage, setMatchId, setIsOfferer, setUserBuddy, setStatus, setRoundTime, setCharacters, setYourCharacter]);
};

