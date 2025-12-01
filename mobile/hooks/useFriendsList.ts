import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { FriendshipService } from '../services/friendship-service';
import { Friendship } from '../types/friendship.types';
import useI18n from './useI18n';

export const useFriendsList = () => {
  const { t } = useI18n();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  const loadFriends = useCallback(async (search?: string) => {
    try {
      const data = await FriendshipService.getFriends(search);
      setFriends(data);
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  }, [loadFriends]);

  const handleSearch = useCallback(async () => {
    setSearching(true);
    await loadFriends(searchTerm);
    setSearching(false);
  }, [searchTerm, loadFriends]);

  const removeFriend = useCallback(async (friendId: number, friendName: string) => {
    setRemoving(friendId);
    try {
      await FriendshipService.removeFriend(friendId);
      await loadFriends();
    } catch (error: any) {
    } finally {
      setRemoving(null);
    }
  }, [loadFriends]);

  const startChat = useCallback((friendId: number) => {
    router.push(`/(private)/friends/chat/${friendId}`);
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  return {
    friends,
    loading,
    refreshing,
    searchTerm,
    searching,
    removing,
    setSearchTerm,
    handleRefresh,
    handleSearch,
    removeFriend,
    startChat,
    loadFriends
  };
};