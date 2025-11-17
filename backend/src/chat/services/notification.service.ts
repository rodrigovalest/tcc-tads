import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { ConnectionManagerService } from './connection-manager.service';
import { RoomManagerService } from './room-manager.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly connectionManager: ConnectionManagerService,
    private readonly roomManager: RoomManagerService
  ) {}

  async notifyFriendsOnline(server: Server, userId: number): Promise<void> {
    try {
      const friends = await this.chatService.getUserFriends(userId);
      const username = await this.getUsername(userId);

      for (const friend of friends) {
        if (this.connectionManager.isUserOnline(friend.id)) {
          const roomName = this.roomManager.getConversationRoomName(userId, friend.id);
          server.to(roomName).emit('friend-online', {
            userId,
            username
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error notifying friends online for user ${userId}: ${error.message}`);
    }
  }

  async notifyFriendsOffline(server: Server, userId: number): Promise<void> {
    try {
      const friends = await this.chatService.getUserFriends(userId);
      const username = await this.getUsername(userId);

      for (const friend of friends) {
        if (this.connectionManager.isUserOnline(friend.id)) {
          const roomName = this.roomManager.getConversationRoomName(userId, friend.id);
          server.to(roomName).emit('friend-offline', {
            userId,
            username
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error notifying friends offline for user ${userId}: ${error.message}`);
    }
  }

  private async getUsername(userId: number): Promise<string> {
    try {
      const user = await this.chatService.getUserById(userId);
      return user?.username || 'Unknown';
    } catch (error) {
      this.logger.error(`Error getting username for user ${userId}: ${error.message}`);
      return 'Unknown';
    }
  }
}