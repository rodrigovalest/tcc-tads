import { BaseUser, FullUser } from './user.types';

export interface FriendshipRequest {
  id: number;
  requester: FullUser;
  addressee: FullUser;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  id: number;
  user: FullUser;
  friend: FullUser;
  createdAt: string;
}

export interface Message {
  id: number;
  sender: BaseUser;
  receiver: BaseUser;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  friend: BaseUser;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
}