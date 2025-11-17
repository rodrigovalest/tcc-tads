import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class ConnectionManagerService {
  private readonly logger = new Logger(ConnectionManagerService.name);
  private readonly connectedUsers = new Map<number, Set<string>>();
  private readonly userSockets = new Map<string, number>();

  addConnection(userId: number, socketId: string): void {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socketId);
    this.userSockets.set(socketId, userId);
    
    this.logger.log(`User ${userId} connected with socket ${socketId}`);
  }

  removeConnection(socketId: string): number | null {
    const userId = this.userSockets.get(socketId);
    if (!userId) return null;

    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
    
    this.userSockets.delete(socketId);
    this.logger.log(`User ${userId} disconnected from socket ${socketId}`);
    
    return userId;
  }

  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  getUserConnections(userId: number): Set<string> {
    return this.connectedUsers.get(userId) || new Set();
  }

  getUserIdBySocket(socketId: string): number | undefined {
    return this.userSockets.get(socketId);
  }

  getOnlineUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }
}