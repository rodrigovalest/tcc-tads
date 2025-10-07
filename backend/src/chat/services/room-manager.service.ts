import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomManagerService {
  
  getConversationRoomName(userId1: number, userId2: number): string {
    const sortedIds = [userId1, userId2].sort((a, b) => a - b);
    return `conversation:${sortedIds[0]}:${sortedIds[1]}`;
  }

  getConversationId(userId1: number, userId2: number): string {
    const sortedIds = [userId1, userId2].sort((a, b) => a - b);
    return `${sortedIds[0]}:${sortedIds[1]}`;
  }

  getUserRoomName(userId: number): string {
    return `user:${userId}`;
  }

  getFriendsRoomName(userId: number): string {
    return `friends:${userId}`;
  }

  getNotificationRoomName(userId: number): string {
    return `notifications:${userId}`;
  }
}