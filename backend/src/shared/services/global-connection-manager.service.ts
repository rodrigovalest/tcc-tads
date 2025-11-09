import { Injectable, Logger } from '@nestjs/common';

interface UserConnection {
  userId: number;
  socketIds: string[];
  namespace: string;
}

@Injectable()
export class GlobalConnectionManagerService {
  private readonly logger = new Logger(GlobalConnectionManagerService.name);
  private userConnections: Map<number, UserConnection[]> = new Map();

  registerConnection(userId: number, socketId: string, namespace: string): void {
    const connections = this.userConnections.get(userId) || [];
    const existingConnection = connections.find(c => c.namespace === namespace);
    
    if (existingConnection) {
      if (!existingConnection.socketIds.includes(socketId)) {
        existingConnection.socketIds.push(socketId);
      }
    } else {
      connections.push({
        userId,
        socketIds: [socketId],
        namespace,
      });
    }
    
    this.userConnections.set(userId, connections);
    this.logger.log(`User ${userId} registered socket ${socketId} in namespace ${namespace}`);
  }

  removeConnection(userId: number, socketId: string): void {
    const connections = this.userConnections.get(userId);
    
    if (!connections) return;

    connections.forEach(connection => {
      connection.socketIds = connection.socketIds.filter(id => id !== socketId);
    });
    const filteredConnections = connections.filter(c => c.socketIds.length > 0);
    
    if (filteredConnections.length === 0) {
      this.userConnections.delete(userId);
    } else {
      this.userConnections.set(userId, filteredConnections);
    }

    this.logger.log(`User ${userId} removed socket ${socketId}`);
  }

  getUserConnections(userId: number): UserConnection[] {
    return this.userConnections.get(userId) || [];
  }

  getAllSocketsForUser(userId: number): Array<{ socketId: string; namespace: string }> {
    const connections = this.userConnections.get(userId) || [];
    const sockets: Array<{ socketId: string; namespace: string }> = [];

    connections.forEach(connection => {
      connection.socketIds.forEach(socketId => {
        sockets.push({ socketId, namespace: connection.namespace });
      });
    });

    return sockets;
  }

  isUserConnected(userId: number): boolean {
    const connections = this.userConnections.get(userId);
    return connections !== undefined && connections.length > 0;
  }
}
