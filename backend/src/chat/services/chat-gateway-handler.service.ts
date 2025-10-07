import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';
import { ChatSecurityService, MessageSecurityContext } from './chat-security.service';
import { ConnectionManagerService } from './connection-manager.service';
import { TypingManagerService } from './typing-manager.service';
import { RoomManagerService } from './room-manager.service';
import { NotificationService } from './notification.service';
import { SendMessageDto } from '../dtos/requests/send-message.dto';
import { MessageResponseDto } from '../dtos/responses/message-response.dto';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';

@Injectable()
export class ChatGatewayHandlerService {
  private readonly logger = new Logger(ChatGatewayHandlerService.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly chatSecurityService: ChatSecurityService,
    private readonly connectionManager: ConnectionManagerService,
    private readonly typingManager: TypingManagerService,
    private readonly roomManager: RoomManagerService,
    private readonly notificationService: NotificationService
  ) {}

  async handleConnection(server: Server, client: Socket): Promise<void> {
    this.logger.log(`Client attempting to connect: ${client.id}`);
  }

  async handleDisconnect(server: Server, client: Socket): Promise<void> {
    const userId = this.connectionManager.removeConnection(client.id);
    
    if (userId) {
      this.logger.log(`User ${userId} disconnected`);
      
      this.typingManager.clearUserTyping(userId);
      
      if (!this.connectionManager.isUserOnline(userId)) {
        await this.notificationService.notifyFriendsOffline(server, userId);
      }
    }
  }

  async handleJoin(server: Server, client: Socket, user: IUserJwtPayload): Promise<any> {
    this.logger.log(`User ${user.sub} joined chat`);
    
    this.connectionManager.addConnection(user.sub, client.id);
    
    const connections = this.connectionManager.getUserConnections(user.sub);
    if (connections.size === 1) { // First connection
      await this.notificationService.notifyFriendsOnline(server, user.sub);
    }
    
    return { success: true, message: 'Joined chat successfully' };
  }

  async handleJoinConversation(
    client: Socket, 
    user: IUserJwtPayload, 
    friendId: number
  ): Promise<any> {
    const roomName = this.roomManager.getConversationRoomName(user.sub, friendId);
    await client.join(roomName);
    
    this.logger.log(`User ${user.sub} joined conversation with ${friendId}`);
    
    return { success: true, message: 'Joined conversation successfully' };
  }

  async handleLeaveConversation(
    client: Socket, 
    user: IUserJwtPayload, 
    friendId: number
  ): Promise<any> {
    const roomName = this.roomManager.getConversationRoomName(user.sub, friendId);
    await client.leave(roomName);
    
    this.logger.log(`User ${user.sub} left conversation with ${friendId}`);
    
    return { success: true, message: 'Left conversation successfully' };
  }

  async handleSendMessage(
    server: Server,
    client: Socket,
    user: IUserJwtPayload,
    dto: SendMessageDto
  ): Promise<any> {
    try {
      const securityContext: MessageSecurityContext = {
        senderId: user.sub,
        receiverId: dto.receiverId,
        content: dto.content,
        ipAddress: client.handshake.address
      };

      const securityResult = await this.chatSecurityService.processMessageSecurity(securityContext);
      
      if (!securityResult.isValid) {
        this.logger.warn(`Message blocked for user ${user.sub}: ${securityResult.securityIssues.join(', ')}`);
        return { 
          success: false, 
          error: 'Message blocked for security reasons',
          details: securityResult.securityIssues
        };
      }

      const participantValidation = await this.chatService.validateChatParticipants(user.sub, dto.receiverId);
      if (!participantValidation.isValid) {
        this.logger.warn(`Chat validation failed for user ${user.sub}: ${participantValidation.reason}`);
        return { 
          success: false, 
          error: participantValidation.reason
        };
      }

      const message = await this.messageService.sendMessage(user.sub, {
        ...dto,
        content: securityResult.sanitizedContent
      });

      const roomName = this.roomManager.getConversationRoomName(user.sub, dto.receiverId);
      server.to(roomName).emit('chat:message-received', message);
      client.emit('chat:message-sent', message);

      this.logger.log(`Message sent from ${user.sub} to ${dto.receiverId}`);
      
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { success: false, error: 'Failed to send message' };
    }
  }

  async handleTypingStart(
    server: Server,
    user: IUserJwtPayload,
    friendId: number
  ): Promise<void> {
    const conversationId = this.roomManager.getConversationId(user.sub, friendId);
    const wasNotTyping = this.typingManager.startTyping(conversationId, user.sub);
    
    if (wasNotTyping) {
      const roomName = this.roomManager.getConversationRoomName(user.sub, friendId);
      server.to(roomName).emit('chat:typing-start', {
        userId: user.sub,
        username: user.username
      });
    }
  }

  async handleTypingStop(
    server: Server,
    user: IUserJwtPayload,
    friendId: number
  ): Promise<void> {
    const conversationId = this.roomManager.getConversationId(user.sub, friendId);
    const wasTyping = this.typingManager.stopTyping(conversationId, user.sub);
    
    if (wasTyping) {
      const roomName = this.roomManager.getConversationRoomName(user.sub, friendId);
      server.to(roomName).emit('chat:typing-stop', {
        userId: user.sub,
        username: user.username
      });
    }
  }

  async handleMarkAsRead(user: IUserJwtPayload, friendId: number): Promise<any> {
    try {
      await this.messageService.markAsRead(user.sub, friendId);
      return { success: true, message: 'Messages marked as read' };
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
      return { success: false, error: 'Failed to mark messages as read' };
    }
  }

  emitMessageToConversation(
    server: Server,
    senderId: number, 
    receiverId: number, 
    message: MessageResponseDto
  ): void {
    const roomName = this.roomManager.getConversationRoomName(senderId, receiverId);
    server.to(roomName).emit('chat:message-received', message);
  }

  emitTypingToConversation(
    server: Server,
    userId: number, 
    friendId: number, 
    isTyping: boolean
  ): void {
    const roomName = this.roomManager.getConversationRoomName(userId, friendId);
    server.to(roomName).emit(isTyping ? 'chat:typing-start' : 'chat:typing-stop', {
      userId,
      username: 'User'
    });
  }
}