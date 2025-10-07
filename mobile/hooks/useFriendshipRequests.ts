import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { FriendshipService } from '../services/friendship-service';
import { FriendshipRequest } from '../types/friendship.types';
import useI18n from './useI18n';

export const useFriendshipRequests = (type: 'sent' | 'received') => {
  const { t } = useI18n();
  const [requests, setRequests] = useState<FriendshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responding, setResponding] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = type === 'sent' 
        ? await FriendshipService.getSentRequests()
        : await FriendshipService.getReceivedRequests();
      setRequests(data);
    } catch (error: any) {
      const errorMessage = type === 'sent' 
        ? t('friends.failedToLoadRequests')
        : 'Failed to load requests';
      Alert.alert(t('common.error'), error?.response?.data?.message || errorMessage);
    } finally {
      setLoading(false);
    }
  }, [type, t]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }, [loadRequests]);

  const cancelRequest = useCallback(async (requestId: number) => {
    setResponding(requestId);
    try {
      await FriendshipService.cancelRequest(requestId);
      await loadRequests();
    } catch (error: any) {
      Alert.alert(t('common.error'), error?.response?.data?.message || t('friends.failedToCancelRequest'));
    } finally {
      setResponding(null);
    }
  }, [loadRequests, t]);

  const respondToRequest = useCallback(async (requestId: number, status: 'accepted' | 'rejected') => {
    setResponding(requestId);
    try {
      await FriendshipService.respondToRequest(requestId, status);
      Alert.alert('Success', `Request ${status} successfully`);
      await loadRequests();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || `Failed to ${status} request`);
    } finally {
      setResponding(null);
    }
  }, [loadRequests]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return {
    requests,
    loading,
    refreshing,
    responding,
    handleRefresh,
    cancelRequest,
    respondToRequest,
    loadRequests
  };
};