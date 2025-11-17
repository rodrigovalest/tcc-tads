import { useEffect, useRef } from 'react';
import { chatWebSocketService } from '../services/chat-websocket.service';
import useAuthStore from '../store/auth-store';

export const useChatWebSocket = () => {
  const token = useAuthStore((state) => state.token);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (token && !isConnectedRef.current) {
      chatWebSocketService.connect(token);
      isConnectedRef.current = true;
    }

    return () => {
      if (isConnectedRef.current) {
        chatWebSocketService.disconnect();
        isConnectedRef.current = false;
      }
    };
  }, [token]);

  return {
    sendMessage: chatWebSocketService.sendMessage.bind(chatWebSocketService),
    joinConversation: chatWebSocketService.joinConversation.bind(chatWebSocketService),
    leaveConversation: chatWebSocketService.leaveConversation.bind(chatWebSocketService),
    startTyping: chatWebSocketService.startTyping.bind(chatWebSocketService),
    stopTyping: chatWebSocketService.stopTyping.bind(chatWebSocketService),
    onMessageReceived: chatWebSocketService.onMessageReceived.bind(chatWebSocketService),
    onFriendOnline: chatWebSocketService.onFriendOnline.bind(chatWebSocketService),
    onFriendOffline: chatWebSocketService.onFriendOffline.bind(chatWebSocketService),
    onTypingStart: chatWebSocketService.onTypingStart.bind(chatWebSocketService),
    onTypingStop: chatWebSocketService.onTypingStop.bind(chatWebSocketService),
    onConnect: chatWebSocketService.onConnect.bind(chatWebSocketService),
    onDisconnect: chatWebSocketService.onDisconnect.bind(chatWebSocketService),
    removeAllListeners: chatWebSocketService.removeAllListeners.bind(chatWebSocketService),
  };
};

