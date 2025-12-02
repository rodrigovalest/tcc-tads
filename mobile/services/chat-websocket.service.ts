import { io, Socket } from 'socket.io-client';
import { Message } from '../types/friendship.types';

type TypingEvent = { userId: number; username: string };
type OnlineStatusEvent = { userId: number; username: string };

export interface ChatWebSocketService {
  connect(token: string): void;
  disconnect(): void;
  sendMessage(receiverId: number, content: string): void;
  onMessageReceived(callback: (message: Message) => void): void;
  joinConversation(friendId: number): void;
  leaveConversation(friendId: number): void;
  startTyping(friendId: number): void;
  stopTyping(friendId: number): void;
  onTypingStart(callback: (data: TypingEvent) => void): void;
  onTypingStop(callback: (data: TypingEvent) => void): void;
  onFriendOnline(callback: (data: OnlineStatusEvent) => void): void;
  onFriendOffline(callback: (data: OnlineStatusEvent) => void): void;
  onConnect(callback: () => void): void;
  onDisconnect(callback: () => void): void;
  removeAllListeners(): void;
}

class ChatWebSocketServiceImpl implements ChatWebSocketService {
  private socket: Socket | null = null;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL;
  }

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(`${this.baseUrl}/chat`, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket']
    });

    this.socket.on('connect', () => console.log('✅ Chat connected'));
    this.socket.on('disconnect', () => console.log('❌ Chat disconnected'));
    this.socket.on('connect_error', (error) => console.error('🚨 Chat error:', error));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  sendMessage(receiverId: number, content: string): void {
    this.socket?.emit('chat:send-message', { receiverId, content });
  }

  onMessageReceived(callback: (message: Message) => void): void {
    this.socket?.off('chat:message-received').on('chat:message-received', callback);
  }

  joinConversation(friendId: number): void {
    this.socket?.emit('chat:join-conversation', { friendId });
  }

  leaveConversation(friendId: number): void {
    this.socket?.emit('chat:leave-conversation', { friendId });
  }

  startTyping(friendId: number): void {
    this.socket?.emit('chat:typing-start', { friendId });
  }

  stopTyping(friendId: number): void {
    this.socket?.emit('chat:typing-stop', { friendId });
  }

  onTypingStart(callback: (data: TypingEvent) => void): void {
    this.socket?.off('chat:typing-start').on('chat:typing-start', callback);
  }

  onTypingStop(callback: (data: TypingEvent) => void): void {
    this.socket?.off('chat:typing-stop').on('chat:typing-stop', callback);
  }

  onFriendOnline(callback: (data: OnlineStatusEvent) => void): void {
    this.socket?.off('friend-online').on('friend-online', callback);
  }

  onFriendOffline(callback: (data: OnlineStatusEvent) => void): void {
    this.socket?.off('friend-offline').on('friend-offline', callback);
  }
  onConnect(callback: () => void): void {
    this.socket?.on('connect', callback);
  }

  onDisconnect(callback: () => void): void {
    this.socket?.on('disconnect', callback);
  }

  removeAllListeners(): void {
    if (!this.socket) return;
    
    const events = [
      'chat:message-received',
      'friend-online', 
      'friend-offline',
      'chat:typing-start', 
      'chat:typing-stop'
    ];
    
    events.forEach(event => this.socket!.off(event));
  }
}
export const chatWebSocketService = new ChatWebSocketServiceImpl();

