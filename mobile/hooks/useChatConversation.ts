import { useState, useEffect, useRef } from 'react';
import { Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FriendshipService } from '../services/friendship-service';
import { Message } from '../types/friendship.types';
import { useChatWebSocket } from './useChatWebSocket';
import useI18n from './useI18n';
import useAuthStore from '../store/auth-store';

interface ChatConversationState {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  friendName: string;
  friendPhoto: string | null;
  isTyping: boolean;
  typingUser: string | null;
  isOnline: boolean;
}

export const useChatConversation = (friendId: number) => {
  const { t } = useI18n();
  const authUser = useAuthStore((state) => state.user);
  const chatWebSocket = useChatWebSocket();
  const scrollViewRef = useRef<ScrollView>(null);

  const [state, setState] = useState<ChatConversationState>({
    messages: [],
    loading: true,
    sending: false,
    friendName: '',
    friendPhoto: null,
    isTyping: false,
    typingUser: null,
    isOnline: true,
  });

  const loadMessages = async () => {
    try {
      const friends = await FriendshipService.getFriends();
      const friend = friends.find(friendship => friendship.friend.id === friendId);
      
      if (!friend) {
        Alert.alert(
          t('chat.error'),
          t('chat.cannotTalkToUser'),
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      const data = await FriendshipService.getConversation(friendId);
      
      setState(prev => ({
        ...prev,
        messages: data,
        friendName: friend.friend.username,
        friendPhoto: friend.friend.photoUri || null,
        loading: false
      }));
      
      await FriendshipService.markAsRead(friendId);
      scrollToBottom();
      
    } catch (error: any) {
      handleLoadError(error);
    }
  };

  const handleLoadError = (error: any) => {
    if (error.response?.status === 404 || error.response?.data?.message?.includes('not friends')) {
      Alert.alert(
        t('chat.error'),
        t('chat.cannotTalkToUser'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert(t('chat.error'), error.response?.data?.message || t('chat.failedToLoadMessages'));
    }
    setState(prev => ({ ...prev, loading: false }));
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    setState(prev => ({ ...prev, sending: true }));
    
    try {
      const sentMessage = await FriendshipService.sendMessage(friendId, messageText);
      
      setState(prev => ({
        ...prev,
        messages: addMessageIfNotExists(prev.messages, sentMessage),
        sending: false
      }));
      
      chatWebSocket.sendMessage(friendId, messageText);
      scrollToBottom();
      
    } catch (error: any) {
      Alert.alert(t('chat.error'), error.response?.data?.message || t('chat.failedToSendMessage'));
      setState(prev => ({ ...prev, sending: false }));
    }
  };

  const handleTypingStart = () => {
    if (!state.isTyping) {
      setState(prev => ({ ...prev, isTyping: true }));
      chatWebSocket.startTyping(friendId);
    }
  };

  const handleTypingStop = () => {
    if (state.isTyping) {
      setState(prev => ({ ...prev, isTyping: false }));
      chatWebSocket.stopTyping(friendId);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const addMessageIfNotExists = (messages: Message[], newMessage: Message): Message[] => {
    const exists = messages.some(m => m.id === newMessage.id);
    return exists ? messages : [...messages, newMessage];
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    loadMessages();
    chatWebSocket.joinConversation(friendId);

    const handleMessageReceived = (message: Message) => {
      if (message.sender.id === friendId) {
        setState(prev => ({
          ...prev,
          messages: addMessageIfNotExists(prev.messages, message)
        }));
        scrollToBottom();
      }
    };

    const handleTypingStart = (data: { userId: number; username: string }) => {
      if (data.userId === friendId) {
        setState(prev => ({ ...prev, typingUser: data.username }));
      }
    };
    
    const handleTypingStop = (data: { userId: number; username: string }) => {
      if (data.userId === friendId) {
        setState(prev => ({ ...prev, typingUser: null }));
      }
    };

    const handleFriendOnline = (data: { userId: number; username: string }) => {
      if (data.userId === friendId) {
        setState(prev => ({ ...prev, isOnline: true }));
      }
    };

    const handleFriendOffline = (data: { userId: number; username: string }) => {
      if (data.userId === friendId) {
        setState(prev => ({ ...prev, isOnline: false }));
      }
    };

    chatWebSocket.onMessageReceived(handleMessageReceived);
    chatWebSocket.onTypingStart(handleTypingStart);
    chatWebSocket.onTypingStop(handleTypingStop);
    chatWebSocket.onFriendOnline(handleFriendOnline);
    chatWebSocket.onFriendOffline(handleFriendOffline);

    return () => {
      chatWebSocket.leaveConversation(friendId);
      chatWebSocket.removeAllListeners();
    };
  }, [friendId]);

  return {
    ...state,
    scrollViewRef,
    handleSendMessage,
    handleTypingStart,
    handleTypingStop,
    formatMessageTime,
  };
};