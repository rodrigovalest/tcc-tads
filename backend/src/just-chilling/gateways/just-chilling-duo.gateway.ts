import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { CurrentWsUser } from '../../auth/decorators/current-ws-user.decorator';
import { JwtWsAuthGuard } from '../../auth/guards/jwt-ws-auth.guard';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { WsExceptionFilter } from '../../shared/filters/ws-exception.filter';
import { WsValidationPipe } from '../../shared/pipes/WsValidationPipe';
import { GlobalConnectionManagerService } from '../../shared/services/global-connection-manager.service';
import { Server, Socket } from 'socket.io';
import { JustChillingDuoService } from '../services/just-chilling-duo.service';
import { JustChillingInviteService } from '../services/just-chilling-invite.service';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { EnqueueMessageDto } from '../dtos/messages/enqueue-message.dto';
import { SendInviteMessageDto } from '../dtos/messages/send-invite-message.dto';
import { RespondInviteMessageDto } from '../dtos/messages/respond-invite-message.dto';
import { CancelInviteMessageDto } from '../dtos/messages/cancel-invite-message.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { Match } from 'src/match/entities/match.entity';

@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionFilter())
@WebSocketGateway()
export class JustChillingDuoGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly justChillingDuoService: JustChillingDuoService,
    private readonly justChillingInviteService: JustChillingInviteService,
    private readonly globalConnectionManager: GlobalConnectionManagerService,
  ) {}

  private readonly logger = new Logger(JustChillingDuoGateway.name, { timestamp: true });

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected with socket ${client.id} (not yet authenticated)`);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('just-chilling:duo:enqueue')
  async enqueue(
    @CurrentWsUser() loggedUser: IUserJwtPayload,
    @MessageBody() messageDto: EnqueueMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    this.globalConnectionManager.registerConnection(loggedUser.sub, client.id, 'default');
    
    await this.justChillingDuoService.enqueueDuoFormatAndTryStart(
      loggedUser,
      client.id,
      messageDto.matchLanguage
    );
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('just-chilling:duo:webrtc:offer')
  handleOffer(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { matchId: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket
  ) {
    this.logger.log(`[webrtc:offer] User ${user.sub} sent offer for match ${payload.matchId}`);

    client.to(payload.matchId).emit('just-chilling:duo:webrtc:offer', {
      from: client.id,
      offer: payload.offer,
    });
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('just-chilling:duo:webrtc:answer')
  handleAnswer(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { matchId: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket
  ) {
    this.logger.log(`[webrtc:answer] User ${user.sub} sent answer for match ${payload.matchId}`);

    client.to(payload.matchId).emit('just-chilling:duo:webrtc:answer', {
      from: client.id,
      answer: payload.answer,
    });
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('just-chilling:duo:webrtc:ice-candidate')
  handleIceCandidate(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { matchId: string; candidate: RTCIceCandidate },
    @ConnectedSocket() client: Socket
  ) {
    this.logger.log(`[webrtc:ice-candidate] User ${user.sub} sent ICE candidate for match ${payload.matchId}`);

    client.to(payload.matchId).emit('just-chilling:duo:webrtc:ice-candidate', {
      from: client.id,
      candidate: payload.candidate,
    });
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('just-chilling:duo:send-invite')
  async handleSendInvite(
    @CurrentWsUser() loggedUser: IUserJwtPayload,
    @MessageBody() messageDto: SendInviteMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.justChillingInviteService.sendInvite(
      loggedUser.sub,
      loggedUser.username,
      loggedUser.nationality,
      client.id,
      messageDto.friendId,
    );
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('just-chilling:duo:respond-invite')
  async handleRespondInvite(
    @CurrentWsUser() loggedUser: IUserJwtPayload,
    @MessageBody() messageDto: RespondInviteMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.justChillingInviteService.respondToInvite(
      loggedUser.sub,
      loggedUser.username,
      loggedUser.nationality,
      client.id,
      messageDto.inviterId,
      messageDto.accepted,
    );
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('just-chilling:duo:cancel-invite')
  async handleCancelInvite(
    @CurrentWsUser() loggedUser: IUserJwtPayload,
    @MessageBody() messageDto: CancelInviteMessageDto,
  ) {
    await this.justChillingInviteService.cancelInvite(loggedUser.sub, messageDto.friendId);
  }

  async handleDisconnect(client: Socket) {
    const user = (client as any).user as IUserJwtPayload;
    if (user) {
      this.globalConnectionManager.removeConnection(user.sub, client.id);
    }
    await this.justChillingDuoService.handleDisconnect(client.id);
  }

  @OnEvent('just-chilling:duo:match-started')
  handleMatchStarted(payload: {
    user1: UserQueue,
    user2: UserQueue,
    language: MatchLanguage,
    match: Match
  }) {
    const notifyUser = (user: UserQueue, isOfferer: boolean, pair: UserQueue) => {
      const connections = this.globalConnectionManager.getAllSocketsForUser(user.userId);
      
      if (connections.length === 0) {
        return;
      }

      connections.forEach(({ socketId, namespace }) => {
        let socket: Socket | undefined;
        if (namespace === 'chat') {
          socket = this.server.of('/chat').sockets.get(socketId);
        } else {
          socket = this.server.sockets.sockets.get(socketId);
        }

        if (socket) {
          socket.join(payload.match.id);

          socket.emit('just-chilling:duo:match-started', {
            message: 'starting just chilling duo match',
            timestamp: new Date().toISOString(),
            matchMode: MatchMode.JUST_CHILLING,
            matchFormat: MatchFormat.DUO,
            language: payload.language,
            isOfferer: isOfferer,
            matchId: payload.match.id,
            buddy: {
              userId: pair.userId,
              username: pair.username,
              nationality: pair.nationality,
            }
          });
        } else {
          this.logger.warn(`❌ Socket ${socketId} not found in namespace '${namespace}' for user ${user.userId}`);
        }
      });
    };

    notifyUser(payload.user1, true, payload.user2);
    notifyUser(payload.user2, false, payload.user1);
  }

  @OnEvent('just-chilling:invite-received')
  handleInviteReceived(payload: {
    inviterId: number,
    inviterUsername: string,
    inviterNationality: string,
    invitedId: number
  }) {
    const connections = this.globalConnectionManager.getAllSocketsForUser(payload.invitedId);
    
    connections.forEach(({ socketId, namespace }) => {
      let socket: Socket | undefined;
      if (namespace === 'chat') {
        socket = this.server.of('/chat').sockets.get(socketId);
      } else {
        socket = this.server.sockets.sockets.get(socketId);
      }
      
      if (socket) {
        socket.emit('just-chilling:duo:invite-received', {
          inviterId: payload.inviterId,
          inviterUsername: payload.inviterUsername,
          inviterNationality: payload.inviterNationality,
          timestamp: new Date().toISOString(),
        });
      } else {
        this.logger.warn(`❌ Socket ${socketId} not found in namespace '${namespace}'`);
      }
    });
  }

  @OnEvent('just-chilling:invite-declined')
  handleInviteDeclined(payload: { inviterId: number, invitedId: number }) {
    const connections = this.globalConnectionManager.getAllSocketsForUser(payload.inviterId);
    connections.forEach(({ socketId, namespace }) => {
      let socket: Socket | undefined;
      if (namespace === 'chat') {
        socket = this.server.of('/chat').sockets.get(socketId);
      } else {
        socket = this.server.sockets.sockets.get(socketId);
      }
      
      if (socket) {
        socket.emit('just-chilling:duo:invite-declined', {
          invitedId: payload.invitedId,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  @OnEvent('just-chilling:invite-cancelled')
  handleInviteCancelled(payload: { inviterId: number, invitedId: number }) {
    const connections = this.globalConnectionManager.getAllSocketsForUser(payload.invitedId);
    
    connections.forEach(({ socketId, namespace }) => {
      let socket: Socket | undefined;
      if (namespace === 'chat') {
        socket = this.server.of('/chat').sockets.get(socketId);
      } else {
        socket = this.server.sockets.sockets.get(socketId);
      }
      
      if (socket) {
        socket.emit('just-chilling:duo:invite-cancelled', {
          inviterId: payload.inviterId,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  @OnEvent('just-chilling:invite-timeout')
  handleInviteTimeout(payload: { inviterId: number, invitedId: number }) {
    const inviterConnections = this.globalConnectionManager.getAllSocketsForUser(payload.inviterId);
    const invitedConnections = this.globalConnectionManager.getAllSocketsForUser(payload.invitedId);
    const allConnections = [...inviterConnections, ...invitedConnections];
    allConnections.forEach(({ socketId, namespace }) => {
      let socket: Socket | undefined;
      if (namespace === 'chat') {
        socket = this.server.of('/chat').sockets.get(socketId);
      } else {
        socket = this.server.sockets.sockets.get(socketId);
      }
      
      if (socket) {
        socket.emit('just-chilling:duo:invite-timeout', {
          timestamp: new Date().toISOString(),
        });
        const user = (socket as any).user;
        if (user) {
          this.logger.log(`Notified user ${user.sub} that invite timed out`);
        }
      }
    });
  }
}
