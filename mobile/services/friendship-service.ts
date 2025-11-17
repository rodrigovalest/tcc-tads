import api from '../api';
import { 
  FriendshipRequest, 
  Friendship, 
  Message, 
  Conversation 
} from '../types/friendship.types';
import { BaseUser } from '../types/user.types';

export class FriendshipService {
  static async searchUsers(username: string): Promise<BaseUser[]> {
    const response = await api.get('/user', { params: { username } });
    return response.data;
  }

  static async sendFriendshipRequest(username: string): Promise<FriendshipRequest> {
    const response = await api.post('/friendship/request', { username });
    return response.data;
  }

  static async getReceivedRequests(): Promise<FriendshipRequest[]> {
    const response = await api.get('/friendship/requests/received');
    return response.data;
  }

  static async getSentRequests(): Promise<FriendshipRequest[]> {
    const response = await api.get('/friendship/requests/sent');
    return response.data;
  }

  static async respondToRequest(
    requestId: number,
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    await api.patch(`/friendship/request/${requestId}/respond`, { status });
  }

  static async cancelRequest(requestId: number): Promise<void> {
    const response = await api.delete(`/friendship/request/${requestId}`);
    return response.data;
  }

  static async getFriends(searchTerm?: string): Promise<Friendship[]> {
    const params = searchTerm ? { search: searchTerm } : {};
    const response = await api.get('/friendship/friends', { params });
    return response.data;
  }

  static async removeFriend(friendId: number): Promise<void> {
    const response = await api.delete(`/friendship/friends/${friendId}`);
    return response.data;
  }

  static async sendMessage(receiverId: number, content: string): Promise<Message> {
    const response = await api.post('/chat/messages', { receiverId, content });
    return response.data;
  }

  static async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/chat/conversations');
    return response.data;
  }

  static async getConversation(friendId: number): Promise<Message[]> {
    const response = await api.get(`/chat/conversations/${friendId}`);
    return response.data;
  }

  static async markAsRead(friendId: number): Promise<void> {
    await api.patch(`/chat/conversations/${friendId}/read`);
  }
}

