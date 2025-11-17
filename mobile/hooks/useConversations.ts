import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { FriendshipService } from '../services/friendship-service';
import { Conversation } from '../types/friendship.types';
import useI18n from './useI18n';

export const useConversations = () => {
  const { t } = useI18n();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    try {
      const data = await FriendshipService.getConversations();
      setConversations(data);
    } catch (error: any) {
      Alert.alert(
        t('friends.error'),
        error?.response?.data?.message || t('friends.fetchConversationsError')
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const startChat = (friendId: number) => {
    router.push(`/(private)/friends/chat/${friendId}` as any);
  };

  useEffect(() => {
    const initializeConversations = async () => {
      setLoading(true);
      await loadConversations();
      setLoading(false);
    };

    initializeConversations();
  }, []);

  return {
    conversations,
    loading,
    refreshing,
    handleRefresh,
    startChat,
    loadConversations
  };
};