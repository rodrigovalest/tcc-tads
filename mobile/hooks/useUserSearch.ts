import { useState, useCallback } from 'react';
import { FriendshipService } from '../services/friendship-service';
import { BaseUser } from '../types/user.types';
import { Friendship, FriendshipRequest } from '../types/friendship.types';
import useI18n from './useI18n';

export interface SearchUser extends BaseUser {
  languages?: Array<{
    id: number;
    language: string;
    fluencyLevel: number;
  }>;
  interestTopics?: Array<{
    id: number;
    topic: string;
  }>;
  relationshipStatus?: 'none' | 'friend' | 'pending-sent' | 'pending-received';
}

export const useUserSearch = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<number>>(new Set());

  const checkRelationshipStatus = useCallback(async (user: BaseUser): Promise<SearchUser> => {
    try {
      const friends = await FriendshipService.getFriends();
      const isFriend = friends.some((friendship: Friendship) => friendship.friend.id === user.id);
      
      if (isFriend) {
        return { ...user, relationshipStatus: 'friend' as const };
      }
      const sentRequests = await FriendshipService.getSentRequests();
      const hasPendingSent = sentRequests.some((request: FriendshipRequest) => request.addressee.id === user.id);
      
      if (hasPendingSent) {
        return { ...user, relationshipStatus: 'pending-sent' as const };
      }
      const receivedRequests = await FriendshipService.getReceivedRequests();
      const hasPendingReceived = receivedRequests.some((request: FriendshipRequest) => request.requester.id === user.id);
      
      if (hasPendingReceived) {
        return { ...user, relationshipStatus: 'pending-received' as const };
      }

      return { ...user, relationshipStatus: 'none' as const };
    } catch (error) {
      return { ...user, relationshipStatus: 'none' as const };
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      return;
    }

    setSearching(true);
    setHasSearched(false);
    
    try {
      const results = await FriendshipService.searchUsers(searchTerm.trim());
      const resultsWithStatus = await Promise.all(
        results.map(checkRelationshipStatus)
      );
      
      setSearchResults(resultsWithStatus);
      setHasSearched(true);
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchTerm, checkRelationshipStatus]);

  const sendFriendRequest = useCallback(async (user: SearchUser) => {
    setSendingRequests(prev => new Set([...prev, user.id]));
    
    try {
      await FriendshipService.sendFriendshipRequest(user.username);
      setSearchResults(prev => 
        prev.map(u => 
          u.id === user.id 
            ? { ...u, relationshipStatus: 'pending-sent' as const }
            : u
        )
      );
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || 'Failed to send friendship request';
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  }, []);

  return {
    searchTerm,
    searchResults,
    searching,
    hasSearched,
    sendingRequests,
    setSearchTerm,
    handleSearch,
    sendFriendRequest,
    clearSearch: () => {
      setSearchTerm('');
      setSearchResults([]);
      setHasSearched(false);
    }
  };
};