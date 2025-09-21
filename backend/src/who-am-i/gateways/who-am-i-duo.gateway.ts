import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { CurrentWsUser } from '../../auth/decorators/current-ws-user.decorator';
import { JwtWsAuthGuard } from '../../auth/guards/jwt-ws-auth.guard';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { WsExceptionFilter } from '../../shared/filters/ws-exception.filter';
import { WsValidationPipe } from '../../shared/pipes/WsValidationPipe';
import { Server, Socket } from 'socket.io';
import { WhoAmIDuoService } from '../services/who-am-i-duo.service';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { EnqueueMessageDto } from '../dtos/messages/enqueue-message.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { Match } from 'src/match/entities/match.entity';

@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionFilter())
@WebSocketGateway()
export class WhoAmIDuoGateway implements OnGatewayDisconnect {

  constructor(
    private readonly whoAmIDuoService: WhoAmIDuoService
  ) {}

  private readonly logger = new Logger(WhoAmIDuoGateway.name, { timestamp: true });

  @WebSocketServer() server: Server;

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('who-am-i:duo:enqueue')
  async enqueue(
    @CurrentWsUser() loggedUser: IUserJwtPayload,
    @MessageBody() messageDto: EnqueueMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.whoAmIDuoService.enqueueDuoFormatAndTryStart(
      loggedUser,
      client.id,
      messageDto.matchLanguage
    );
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('who-am-i:duo:webrtc:offer')
  handleOffer(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { matchId: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket
  ) {
    this.logger.log(`[webrtc:offer] User ${user.sub} sent offer for match ${payload.matchId}`);

    client.to(payload.matchId).emit('who-am-i:duo:webrtc:offer', {
      from: client.id,
      offer: payload.offer,
    });
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('who-am-i:duo:webrtc:answer')
  handleAnswer(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { matchId: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket
  ) {
    this.logger.log(`[webrtc:answer] User ${user.sub} sent answer for match ${payload.matchId}`);

    client.to(payload.matchId).emit('who-am-i:duo:webrtc:answer', {
      from: client.id,
      answer: payload.answer,
    });
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('who-am-i:duo:webrtc:ice-candidate')
  handleIceCandidate(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { matchId: string; candidate: RTCIceCandidate },
    @ConnectedSocket() client: Socket
  ) {
    this.logger.log(`[webrtc:ice-candidate] User ${user.sub} sent ICE candidate for match ${payload.matchId}`);

    client.to(payload.matchId).emit('who-am-i:duo:webrtc:ice-candidate', {
      from: client.id,
      candidate: payload.candidate,
    });
  }

  async handleDisconnect(client: Socket) {
    await this.whoAmIDuoService.handleDisconnect(client.id);
  }

  @OnEvent('who-am-i:duo:match-started')
  handleMatchStarted(payload: {
    user1: UserQueue,
    user2: UserQueue,
    language: MatchLanguage,
    match: Match
  }) {
    const notifyUser = (user: UserQueue, isOfferer: boolean, pair: UserQueue) => {
      const socket = this.server.sockets.sockets.get(user.socketId);

      if (socket) {
        socket.join(payload.match.id);

        socket.emit('who-am-i:duo:match-started', {
          message: 'starting just chilling duo match',
          timestamp: new Date().toISOString(),
          matchMode: MatchMode.WHO_AM_I,
          matchFormat: MatchFormat.DUO,
          language: payload.language,
          isOfferer: isOfferer,
          matchId: payload.match.id,
          buddy: {
            username: pair.username,
            nationality: pair.nationality,
          }
        });
      }
    };

    notifyUser(payload.user1, true, payload.user2);
    notifyUser(payload.user2, false, payload.user1);
  }
}
