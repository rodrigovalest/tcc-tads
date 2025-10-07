import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  WebSocketServer 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CurrentWsUser } from '../../auth/decorators/current-ws-user.decorator';
import { JwtWsAuthGuard } from '../../auth/guards/jwt-ws-auth.guard';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { WsExceptionFilter } from '../../shared/filters/ws-exception.filter';
import { ChatGatewayHandlerService } from '../services/chat-gateway-handler.service';
import { SendMessageDto } from '../dtos/requests/send-message.dto';
import { MessageResponseDto } from '../dtos/responses/message-response.dto';

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({ 
  namespace: '/chat',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatGatewayHandler: ChatGatewayHandlerService
  ) {}

  async handleConnection(client: Socket) {
    await this.chatGatewayHandler.handleConnection(this.server, client);
  }

  async handleDisconnect(client: Socket) {
    await this.chatGatewayHandler.handleDisconnect(this.server, client);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chat:join')
  async handleJoin(
    @CurrentWsUser() user: IUserJwtPayload,
    @ConnectedSocket() client: Socket
  ) {
    return await this.chatGatewayHandler.handleJoin(this.server, client, user);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chat:join-conversation')
  async handleJoinConversation(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() data: { friendId: number },
    @ConnectedSocket() client: Socket
  ) {
    return await this.chatGatewayHandler.handleJoinConversation(client, user, data.friendId);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chat:leave-conversation')
  async handleLeaveConversation(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() data: { friendId: number },
    @ConnectedSocket() client: Socket
  ) {
    return await this.chatGatewayHandler.handleLeaveConversation(client, user, data.friendId);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chat:send-message')
  async handleSendMessage(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    return await this.chatGatewayHandler.handleSendMessage(this.server, client, user, dto);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chat:typing-start')
  async handleTypingStart(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() data: { friendId: number }
  ) {
    await this.chatGatewayHandler.handleTypingStart(this.server, user, data.friendId);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chat:typing-stop')
  async handleTypingStop(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() data: { friendId: number }
  ) {
    await this.chatGatewayHandler.handleTypingStop(this.server, user, data.friendId);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chat:mark-read')
  async handleMarkAsRead(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() data: { friendId: number }
  ) {
    return await this.chatGatewayHandler.handleMarkAsRead(user, data.friendId);
  }

  public emitMessageToConversation(senderId: number, receiverId: number, message: MessageResponseDto) {
    this.chatGatewayHandler.emitMessageToConversation(this.server, senderId, receiverId, message);
  }

  public emitTypingToConversation(userId: number, friendId: number, isTyping: boolean) {
    this.chatGatewayHandler.emitTypingToConversation(this.server, userId, friendId, isTyping);
  }
} 
