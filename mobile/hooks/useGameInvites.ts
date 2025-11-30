import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { GameInviteService, GameInvite } from '../services/game-invite-service';
import webSocketService from '../services/web-socket-service';
import { MatchMode } from '../models/types/match-mode.type';
import { MatchLanguage } from '../models/types/match-language.type';
import useMatchStore from '../store/match-store';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import useAuthStore from '../store/auth-store';

export const useGameInvites = () => {
  const [pendingInvites, setPendingInvites] = useState<GameInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<GameInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const { setMatchMode, setMatchLanguage, setMatchFormat } = useMatchStore();
  const { token } = useAuthStore();

  const loadInvites = useCallback(async (preserveWebSocketInvites = false) => {
    try {
      const [pending, sent] = await Promise.all([
        GameInviteService.getPendingInvites(),
        GameInviteService.getSentInvites(),
      ]);
      
      if (preserveWebSocketInvites) {
      setPendingInvites((prev) => {
        console.log('[useGameInvites] loadInvites - Merge: prev tem', prev.length, 'convites, API tem', pending.length);
        const merged = [...prev];
        pending.forEach((apiInvite) => {
          if (!merged.some((inv) => inv.id === apiInvite.id)) {
            console.log('[useGameInvites] Adicionando convite da API:', apiInvite.id);
            merged.push(apiInvite);
          } else {
            const index = merged.findIndex((inv) => inv.id === apiInvite.id);
            if (index !== -1) {
              console.log('[useGameInvites] Atualizando convite existente:', apiInvite.id);
              merged[index] = apiInvite;
            }
          }
        });
        const result = merged.filter((inv) => 
          inv.status === 'pending' && (
            pending.some((apiInv) => apiInv.id === inv.id) || 
            !pending.some((apiInv) => apiInv.id === inv.id)
          )
        );
        console.log('[useGameInvites] loadInvites - Resultado do merge:', result.length, 'convites');
        return result;
      });
      } else {
        setPendingInvites(pending);
      }
      
      setSentInvites(sent);
    } catch (error: any) {
      console.error('Error loading invites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendInvite = useCallback(
    async (
      inviteeId: number,
      matchMode: MatchMode,
      matchLanguage: MatchLanguage,
    ): Promise<number | null> => {
      try {
        if (!webSocketService.isConnected()) {
          if (!token) {
            Alert.alert('Erro', 'Você precisa estar logado para enviar convites');
            return null;
          }
          console.log('[useGameInvites] WebSocket não conectado, conectando...');
          webSocketService.connect(token);
          
          let attempts = 0;
          while (!webSocketService.isConnected() && attempts < 30) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (!webSocketService.isConnected()) {
            Alert.alert('Erro', 'Não foi possível conectar ao servidor');
            return null;
          }
        }

        return new Promise((resolve, reject) => {
          const tempId = Date.now();
          const tempInvite: GameInvite = {
            id: tempId,
            inviter: { id: 0, username: '', name: '', photo: '' },
            invitee: { id: inviteeId, username: '', name: '', photo: '' },
            matchMode,
            matchLanguage,
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30000).toISOString(),
          };
          setSentInvites((prev) => [tempInvite, ...prev]);
          console.log('[useGameInvites] 🕐 Convite temporário adicionado:', tempId);
          
          const handleSent = (data: { invite: any }) => {
            webSocketService.off('game-invite:sent', handleSent);
            setSentInvites((prev) => prev.filter((inv) => inv.id !== tempId));
            resolve(data.invite.id);
          };

          webSocketService.on('game-invite:sent', handleSent);

          webSocketService.emit('game-invite:send', {
            inviteeId,
            matchMode,
            matchLanguage,
          });
          setTimeout(() => {
            webSocketService.off('game-invite:sent', handleSent);
            reject(new Error('Timeout ao enviar convite'));
          }, 5000);
        });
      } catch (error: any) {
        console.error('Error sending invite:', error);
        Alert.alert('Erro', error.message || 'Falha ao enviar convite');
        return null;
      }
    },
    [token],
  );

  const acceptInvite = useCallback(
    async (inviteId: number) => {
      try {
        webSocketService.emit('game-invite:accept', { inviteId });
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to accept invite');
      }
    },
    [],
  );

  const rejectInvite = useCallback(
    async (inviteId: number) => {
      try {
        webSocketService.emit('game-invite:reject', { inviteId });
        setPendingInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to reject invite');
      }
    },
    [],
  );

  const cancelInvite = useCallback(
    async (inviteId: number) => {
      try {
        // Garante que está conectado
        if (!webSocketService.isConnected()) {
          if (!token) {
            Alert.alert('Erro', 'Você precisa estar logado para cancelar convites');
            return;
          }
          console.log('[useGameInvites] WebSocket não conectado, conectando...');
          webSocketService.connect(token);
          
          // Aguarda conexão
          let attempts = 0;
          while (!webSocketService.isConnected() && attempts < 30) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (!webSocketService.isConnected()) {
            Alert.alert('Erro', 'Não foi possível conectar ao servidor');
            return;
          }
        }

        webSocketService.emit('game-invite:cancel', { inviteId });
      } catch (error: any) {
        console.error('Error cancelling invite:', error);
        Alert.alert('Erro', error.message || 'Falha ao cancelar convite');
      }
    },
    [token],
  );

  useEffect(() => {
    console.log('[useGameInvites] 🚀 Hook montado');
    
    const initialLoad = async () => {
      await loadInvites(false);
    };
    initialLoad();

    // Conecta o WebSocket se não estiver conectado (apenas uma vez)
    if (!webSocketService.isConnected() && token) {
      console.log('[useGameInvites] 🔌 Primeira conexão do WebSocket...');
      webSocketService.connect(token);
    }
    
    // NÃO faz cleanup - os listeners devem permanecer ativos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // useEffect SEPARADO para registrar os listeners (executa apenas uma vez)
  useEffect(() => {
    console.log('[useGameInvites] 📝 Registrando listeners (apenas uma vez)...');
    
    // ====== DEFINE TODOS OS HANDLERS ======
    const handleInviteReceived = (data: { invite: any }) => {
      console.log('[useGameInvites] 🎯🎯🎯 CONVITE RECEBIDO!!!', data.invite.id);
      const fullInvite: GameInvite = {
        id: data.invite.id,
        inviter: {
          id: data.invite.inviter.id,
          username: data.invite.inviter.username,
          name: data.invite.inviter.name || data.invite.inviter.username,
          photo: data.invite.inviter.photo || null,
        },
        invitee: {
          id: 0,
          username: '',
          name: '',
          photo: undefined,
        },
        matchMode: data.invite.matchMode,
        matchLanguage: data.invite.matchLanguage,
        status: data.invite.status || 'pending',
        createdAt: data.invite.createdAt || new Date().toISOString(),
        expiresAt: data.invite.expiresAt || new Date(Date.now() + 30000).toISOString(),
      };

      setPendingInvites((prev) => {
        if (prev.some((inv) => inv.id === fullInvite.id)) {
          console.log('[useGameInvites] Convite já existe na lista, ignorando duplicata');
          return prev;
        }
        console.log('[useGameInvites] Adicionando novo convite à lista:', fullInvite.id);
        console.log('[useGameInvites] Lista antes:', prev.length, 'convites');
        const newList = [fullInvite, ...prev];
        console.log('[useGameInvites] Lista depois:', newList.length, 'convites');
        return newList;
      });

      // Configura timer para remover convite expirado
      const expiresAt = new Date(fullInvite.expiresAt).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry > 0) {
        console.log(`[useGameInvites] ⏰ Convite recebido ${fullInvite.id} expira em ${Math.round(timeUntilExpiry / 1000)}s`);
        setTimeout(() => {
          console.log(`[useGameInvites] ⌛ Convite recebido ${fullInvite.id} EXPIROU`);
          setPendingInvites((prev) => prev.filter((inv) => inv.id !== fullInvite.id));
        }, timeUntilExpiry);
      }

      Toast.show({
        type: 'info',
        text1: 'Novo convite!',
        text2: `${data.invite.inviter.username} te convidou para jogar`,
        position: 'top',
      });
    };

    const handleInviteSent = (data: { invite: any }) => {
      console.log('[useGameInvites] 📤 Convite ENVIADO:', data.invite.id);
      const fullInvite: GameInvite = {
        id: data.invite.id,
        inviter: {
          id: 0,
          username: '',
          name: '',
          photo: '',
        },
        invitee: {
          id: data.invite.invitee?.id || 0,
          username: data.invite.invitee?.username || '',
          name: data.invite.invitee?.name || '',
          photo: data.invite.invitee?.photo || '',
        },
        matchMode: data.invite.matchMode,
        matchLanguage: data.invite.matchLanguage,
        status: data.invite.status || 'pending',
        createdAt: data.invite.createdAt || new Date().toISOString(),
        expiresAt: data.invite.expiresAt || new Date(Date.now() + 30000).toISOString(),
      };

      setSentInvites((prev) => {
        if (prev.some((inv) => inv.id === fullInvite.id)) {
          console.log('[useGameInvites] Convite enviado já existe, ignorando duplicata');
          return prev;
        }
        console.log('[useGameInvites] ✅ Adicionando convite enviado à lista:', fullInvite.id);
        return [fullInvite, ...prev];
      });
      
      // Configura timer para remover convite expirado
      const expiresAt = new Date(fullInvite.expiresAt).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry > 0) {
        console.log(`[useGameInvites] ⏰ Convite ${fullInvite.id} expira em ${Math.round(timeUntilExpiry / 1000)}s`);
        setTimeout(() => {
          console.log(`[useGameInvites] ⌛ Convite ${fullInvite.id} EXPIROU`);
          setSentInvites((prev) => prev.filter((inv) => inv.id !== fullInvite.id));
          Toast.show({
            type: 'info',
            text1: 'Convite expirado',
            text2: 'O convite não foi aceito a tempo',
            position: 'top',
          });
        }, timeUntilExpiry);
      }
      
      // NÃO chama loadInvites aqui - o convite já foi adicionado manualmente ao estado
      // loadInvites causava um merge que podia remover o convite recém-enviado
    };
    const handleInviteAccepted = (data: {
      inviteId: number;
      matchMode: MatchMode;
      matchLanguage: MatchLanguage;
    }) => {
      setSentInvites((prev) =>
        prev.filter((inv) => inv.id !== data.inviteId),
      );
      setMatchMode(data.matchMode);
      setMatchLanguage(data.matchLanguage);
      setMatchFormat('duo');
      if (!webSocketService.isConnected() && token) {
        webSocketService.connect(token);
      }
    };
    const handleInviteRejected = (data: { inviteId: number }) => {
      console.log('[useGameInvites] 🚫 Convite REJEITADO:', data.inviteId);
      setSentInvites((prev) =>
        prev.filter((inv) => inv.id !== data.inviteId),
      );
      Toast.show({
        type: 'error',
        text1: 'Convite rejeitado',
        text2: 'Seu amigo rejeitou o convite',
        position: 'top',
      });
    };
    const handleCancelSuccess = (data: { inviteId: number }) => {
      setSentInvites((prev) =>
        prev.filter((inv) => inv.id !== data.inviteId),
      );
      Toast.show({
        type: 'success',
        text1: 'Convite cancelado',
        text2: 'O convite foi cancelado com sucesso',
        position: 'top',
      });
    };
    const handleInviteCancelled = (data: { inviteId: number }) => {
      setPendingInvites((prev) =>
        prev.filter((inv) => inv.id !== data.inviteId),
      );
      Toast.show({
        type: 'info',
        text1: 'Convite cancelado',
        text2: 'O remetente cancelou o convite',
        position: 'top',
      });
    };
    const handleAcceptSuccess = (data: {
      inviteId: number;
      matchMode: MatchMode;
      matchLanguage: MatchLanguage;
    }) => {
      setPendingInvites((prev) =>
        prev.filter((inv) => inv.id !== data.inviteId),
      );
      setMatchMode(data.matchMode);
      setMatchLanguage(data.matchLanguage);
      setMatchFormat('duo');
      if (!webSocketService.isConnected() && token) {
        webSocketService.connect(token);
      }
    };
    // ====== REGISTRA TODOS OS LISTENERS (uma vez apenas) ======
    webSocketService.on('game-invite:received', handleInviteReceived);
    webSocketService.on('game-invite:sent', handleInviteSent);
    webSocketService.on('game-invite:accepted', handleInviteAccepted);
    webSocketService.on('game-invite:rejected', handleInviteRejected);
    webSocketService.on('game-invite:accept-success', handleAcceptSuccess);
    webSocketService.on('game-invite:cancel-success', handleCancelSuccess);
    webSocketService.on('game-invite:cancelled', handleInviteCancelled);
    console.log('[useGameInvites] ✅ Listeners registrados permanentemente!');
    
    // NÃO remove os listeners no cleanup
    // Os listeners devem permanecer ativos durante toda a sessão do app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    pendingInvites,
    sentInvites,
    loading,
    sendInvite,
    acceptInvite,
    rejectInvite,
    cancelInvite,
    refreshInvites: loadInvites,
  };
};

