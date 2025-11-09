import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import webSocketService from '../services/web-socket-service';
import { chatWebSocketService } from '../services/chat-websocket.service';
import useAuthStore from '../store/auth-store';
import useMatchStore from '../store/match-store';
import useI18n from '../hooks/useI18n';

interface IncomingInvite {
  inviterId: number;
  inviterUsername: string;
  inviterNationality: string;
}

interface JustChillingInviteContextData {
  isCallingSomeone: boolean;
  callingFriendName: string | null;
  callingFriendPhoto: string | null;
  hasIncomingCall: boolean;
  incomingInvite: IncomingInvite | null;
  sendInvite: (friendId: number, friendName: string, friendPhoto?: string | null) => void;
  acceptInvite: () => void;
  declineInvite: () => void;
  cancelInvite: () => void;
}

const JustChillingInviteContext = createContext<JustChillingInviteContextData | undefined>(undefined);

interface JustChillingInviteProviderProps {
  children: ReactNode;
}

export const JustChillingInviteProvider: React.FC<JustChillingInviteProviderProps> = ({ children }) => {
  const router = useRouter();
  const { t } = useI18n();
  const { token } = useAuthStore();
  const { setMatchId, setIsOfferer, setUserBuddy } = useMatchStore();
  const [isCallingSomeone, setIsCallingSomeone] = useState(false);
  const [callingFriendId, setCallingFriendId] = useState<number | null>(null);
  const [callingFriendName, setCallingFriendName] = useState<string | null>(null);
  const [callingFriendPhoto, setCallingFriendPhoto] = useState<string | null>(null);
  const [hasIncomingCall, setHasIncomingCall] = useState(false);
  const [incomingInvite, setIncomingInvite] = useState<IncomingInvite | null>(null);
  useEffect(() => {
    return () => {
      chatWebSocketService.off('just-chilling:duo:invite-received');
      chatWebSocketService.off('just-chilling:duo:invite-declined');
      chatWebSocketService.off('just-chilling:duo:invite-cancelled');
      chatWebSocketService.off('just-chilling:duo:invite-timeout');
      chatWebSocketService.off('just-chilling:duo:match-started');
      webSocketService.off('just-chilling:duo:match-started');
    };
  }, []);

  const sendInvite = useCallback(
    (friendId: number, friendName: string, friendPhoto?: string | null) => {
      if (!token) {
        Toast.show({
          type: 'error',
          text1: t('errors.notAuthenticated'),
          position: 'top',
        });
        return;
      }

      if (!webSocketService.isConnected()) {
        webSocketService.connect(token);
      }
      setCallingFriendId(friendId);
      setCallingFriendName(friendName);
      setCallingFriendPhoto(friendPhoto || null);
      setIsCallingSomeone(true);
      webSocketService.emit('just-chilling:duo:send-invite', { friendId });
      Toast.show({
        type: 'info',
        text1: t('justChilling.inviteSent'),
        text2: t('justChilling.waitingForFriend', { name: friendName }),
        position: 'top',
      });
    },
    [token, t]
  );

  const acceptInvite = useCallback(() => {
    if (!incomingInvite) return;

    webSocketService.emit('just-chilling:duo:respond-invite', {
      inviterId: incomingInvite.inviterId,
      accepted: true,
    });

    setHasIncomingCall(false);
    setIncomingInvite(null);

    Toast.show({
      type: 'success',
      text1: t('justChilling.callAccepted'),
      position: 'top',
    });
  }, [incomingInvite, t]);

  const declineInvite = useCallback(() => {
    if (!incomingInvite) return;

    webSocketService.emit('just-chilling:duo:respond-invite', {
      inviterId: incomingInvite.inviterId,
      accepted: false,
    });

    setHasIncomingCall(false);
    setIncomingInvite(null);

    Toast.show({
      type: 'info',
      text1: t('justChilling.callDeclined'),
      position: 'top',
    });
  }, [incomingInvite, t]);

  const cancelInvite = useCallback(() => { 
    if (!callingFriendId) return;

    webSocketService.emit('just-chilling:duo:cancel-invite', {
      friendId: callingFriendId,
    });

    setIsCallingSomeone(false);
    setCallingFriendId(null);
    setCallingFriendName(null);
    setCallingFriendPhoto(null);

    Toast.show({
      type: 'info',
      text1: t('justChilling.callCancelled'),
      position: 'top',
    });
  }, [callingFriendId, t]);

  useEffect(() => {
    if (!token) return;
    chatWebSocketService.connect(token);
    if (!webSocketService.isConnected()) {
      webSocketService.connect(token);
    }
    chatWebSocketService.off('just-chilling:duo:invite-received');
    chatWebSocketService.off('just-chilling:duo:invite-declined');
    chatWebSocketService.off('just-chilling:duo:invite-cancelled');
    chatWebSocketService.off('just-chilling:duo:invite-timeout');
    chatWebSocketService.off('just-chilling:duo:match-started');
    webSocketService.off('just-chilling:duo:match-started');
    chatWebSocketService.on('just-chilling:duo:invite-received', (data: IncomingInvite) => {
      setHasIncomingCall(true);
      setIncomingInvite(data);

      Toast.show({
        type: 'info',
        text1: t('justChilling.incomingCall'),
        text2: t('justChilling.fromUser', { name: data.inviterUsername }),
        position: 'top',
        visibilityTime: 60000,
      });
    });

    chatWebSocketService.on('just-chilling:duo:invite-declined', () => {
      setIsCallingSomeone(false);
      setCallingFriendId(null);
      setCallingFriendName(null);
      setCallingFriendPhoto(null);

      Toast.show({
        type: 'error',
        text1: t('justChilling.callDeclined'),
        text2: t('justChilling.friendDeclined'),
        position: 'top',
      });
    });

    chatWebSocketService.on('just-chilling:duo:invite-cancelled', () => {   
      setHasIncomingCall(false);
      setIncomingInvite(null);

      Toast.show({
        type: 'info',
        text1: t('justChilling.callCancelled'),
        text2: t('justChilling.callerCancelled'),
        position: 'top',
      });
    });
    chatWebSocketService.on('just-chilling:duo:invite-timeout', () => {   
      setIsCallingSomeone(false);
      setCallingFriendId(null);
      setCallingFriendName(null);
      setCallingFriendPhoto(null);
      setHasIncomingCall(false);
      setIncomingInvite(null);

      Toast.show({
        type: 'error',
        text1: t('justChilling.callTimeout'),
        text2: t('justChilling.noResponse'),
        position: 'top',
      });
    });

    const handleMatchStarted = (matchData: any) => {
      setIsCallingSomeone(false);
      setCallingFriendId(null);
      setCallingFriendName(null);
      setCallingFriendPhoto(null);
      setHasIncomingCall(false);
      setIncomingInvite(null);
      setMatchId(matchData.matchId);
      setIsOfferer(matchData.isOfferer);
      setUserBuddy({
        userId: matchData.buddy.userId,
        name: matchData.buddy.username,
        username: matchData.buddy.username,
        nationality: matchData.buddy.nationality,
      });
      
      useMatchStore.getState().setIsFromInvite(true);
      if (!webSocketService.isConnected() && token) {
        webSocketService.connect(token);
      }
    };
    chatWebSocketService.on('just-chilling:duo:match-started', handleMatchStarted);
    webSocketService.on('just-chilling:duo:match-started', handleMatchStarted);
  }, [token, router, setMatchId, setIsOfferer, setUserBuddy, t]);

  return (
    <JustChillingInviteContext.Provider
      value={{
        isCallingSomeone,
        callingFriendName,
        callingFriendPhoto,
        hasIncomingCall,
        incomingInvite,
        sendInvite,
        acceptInvite,
        declineInvite,
        cancelInvite,
      }}
    >
      {children}
    </JustChillingInviteContext.Provider>
  );
};

export const useJustChillingInviteContext = () => {
  const context = useContext(JustChillingInviteContext);
  if (!context) {
    throw new Error('useJustChillingInviteContext must be used within JustChillingInviteProvider');
  }
  return context;
};
