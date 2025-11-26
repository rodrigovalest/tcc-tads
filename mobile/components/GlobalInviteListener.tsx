import React, { useEffect, useState } from 'react';
import { useGameInvites } from '../hooks/useGameInvites';
import { InviteReceivedModal } from './game-invites/InviteReceivedModal';

/**
 * Componente global que escuta convites recebidos em qualquer tela
 * Deve ser adicionado no layout principal da aplicação
 */
export const GlobalInviteListener: React.FC = () => {
  const { pendingInvites, acceptInvite, rejectInvite } = useGameInvites();
  const [currentInvite, setCurrentInvite] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [shownInviteIds, setShownInviteIds] = useState<Set<number>>(new Set());
  const [lastPendingCount, setLastPendingCount] = useState(0);

  useEffect(() => {
    
    if (pendingInvites.length > 0) {
      const unseenInvites = pendingInvites.filter(
        (inv) => !shownInviteIds.has(inv.id) && inv.status === 'pending'
      );
      if (unseenInvites.length > 0) {
        const latestInvite = unseenInvites[0];
        console.log('[GlobalInviteListener] ⚡⚡⚡⚡⚡ MOSTRANDO MODAL PARA CONVITE:', latestInvite.id, '⚡⚡⚡⚡⚡');
        setCurrentInvite(latestInvite);
        setShowModal(true);
        setShownInviteIds((prev) => new Set([...prev, latestInvite.id]));
        setLastPendingCount(pendingInvites.length);
      } else if (showModal && currentInvite) {
        const stillExists = pendingInvites.some((inv) => inv.id === currentInvite.id && inv.status === 'pending');
        if (!stillExists) {
          console.log('[GlobalInviteListener] Convite atual não existe mais, fechando modal');
          setShowModal(false);
          setCurrentInvite(null);
        } else {
          const updatedInvite = pendingInvites.find((inv) => inv.id === currentInvite.id);
          if (updatedInvite) {
            setCurrentInvite(updatedInvite);
          }
        }
      }
    } else {
      if (showModal) {
        console.log('[GlobalInviteListener] Fechando modal - sem convites pendentes');
        setShowModal(false);
        setCurrentInvite(null);
      }
      setLastPendingCount(0);
    }
    console.log('[GlobalInviteListener] ════════════════════════════════════');
  }, [pendingInvites, showModal, shownInviteIds, lastPendingCount, currentInvite]);
  useEffect(() => {
    if (pendingInvites.length === 0) {
      setShownInviteIds(new Set());
    }
  }, [pendingInvites]);

  const handleAccept = () => {
    if (currentInvite) {
      acceptInvite(currentInvite.id);
      setShowModal(false);
      setCurrentInvite(null);
    }
  };

  const handleReject = () => {
    if (currentInvite) {
      rejectInvite(currentInvite.id);
      setShowModal(false);
      setCurrentInvite(null);
    }
  };

  return (
    <InviteReceivedModal
      visible={showModal}
      invite={currentInvite}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
};

