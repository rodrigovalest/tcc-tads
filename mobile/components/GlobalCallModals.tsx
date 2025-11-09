import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { IncomingCallModal } from './IncomingCallModal';
import { OutgoingCallModal } from './OutgoingCallModal';
import { useJustChillingInviteContext } from '../contexts/JustChillingInviteContext';
import useMatchStore from '../store/match-store';

export const GlobalCallModals: React.FC = () => {
  const router = useRouter();
  const { matchId, buddy } = useMatchStore();
  const {
    isCallingSomeone,
    callingFriendName,
    callingFriendPhoto,
    hasIncomingCall,
    incomingInvite,
    acceptInvite,
    declineInvite,
    cancelInvite,
  } = useJustChillingInviteContext();
  const previousMatchIdRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    if (matchId && buddy && matchId !== previousMatchIdRef.current) {
      previousMatchIdRef.current = matchId;  
      const timeoutId = setTimeout(() => {
        try {
          router.push('/(private)/just-chilling/duo/game');
        } catch (error) {
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
    if (!matchId) {
      previousMatchIdRef.current = null;
    }
  }, [matchId, buddy, router]);
  
  return (
    <>
      <OutgoingCallModal
        visible={isCallingSomeone}
        friendName={callingFriendName || ''}
        friendPhoto={callingFriendPhoto}
        onCancel={cancelInvite}
      />
      <IncomingCallModal
        visible={hasIncomingCall}
        callerName={incomingInvite?.inviterUsername || ''}
        callerPhoto={null}
        onAccept={acceptInvite}
        onDecline={declineInvite}
      />
    </>
  );
};
