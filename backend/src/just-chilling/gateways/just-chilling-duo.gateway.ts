import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { CurrentWsUser } from 'src/auth/decorators/current-ws-user.decorator';
import { JwtWsAuthGuard } from 'src/auth/guards/jwt-ws-auth.guard';
import { IUserJwtPayload } from 'src/auth/models/user-jwt-payload.interface';
import { WsExceptionFilter } from 'src/shared/filters/ws-exception.filter';
import { WsValidationPipe } from 'src/shared/pipes/WsValidationPipe';
import { Server, Socket } from 'socket.io';
import { JustChillingDuoService } from '../services/just-chilling-duo.service';
import { MatchFormat } from 'src/match/entities/match-format.enum';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { EnqueueMessageDto } from '../dtos/messages/enqueue-message.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';

@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionFilter())
@WebSocketGateway()
export class JustChillingDuoGateway implements OnGatewayDisconnect {

  constructor(
    private readonly justChillingDuoService: JustChillingDuoService
  ) {}

  @WebSocketServer() server: Server;

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('just-chilling:duo:enqueue')
  async enqueue(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() messageDto: EnqueueMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.justChillingDuoService.enqueueDuoFormatAndTryStart(
      user.sub,
      client.id,
      messageDto.matchLanguage
    );
  }

  @SubscribeMessage('just-chilling:duo:webrtc:offer')
  handleOffer(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { roomId: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket
  ) {
    console.log('[webrtc:offer]', user, payload.offer);

    client.to(payload.roomId).emit('just-chilling:duo:webrtc:offer', {
      from: client.id,
      offer: payload.offer,
    });
  }

  @SubscribeMessage('just-chilling:duo:webrtc:answer')
  handleAnswer(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { roomId: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket
  ) {
    console.log('[webrtc:answer]', user, payload.answer);

    client.to(payload.roomId).emit('just-chilling:duo:webrtc:answer', {
      from: client.id,
      answer: payload.answer,
    });
  }

  @SubscribeMessage('just-chilling:duo:webrtc:ice-candidate')
  handleIceCandidate(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { roomId: string; candidate: RTCIceCandidate },
    @ConnectedSocket() client: Socket
  ) {
    console.log('[webrtc:ice-candidate]', user, payload.candidate);

    client.to(payload.roomId).emit('just-chilling:duo:webrtc:ice-candidate', {
      from: client.id,
      candidate: payload.candidate,
    });
  }

  async handleDisconnect(client: Socket) {
    await this.justChillingDuoService.handleDisconnect(client.id);
  }

  @OnEvent('just-chilling:duo:match-started')
  handleMatchStarted(payload: {
    user1: UserQueue,
    user2: UserQueue,
    language: MatchLanguage,
  }) {
    const roomId = `match-${randomUUID()}`;

    const notifyUser = (user: UserQueue, isOfferer: boolean) => {
      const socket = this.server.sockets.sockets.get(user.socketId);

      if (socket) {
        socket.join(roomId);

        socket.emit('just-chilling:duo:match-started', {
          message: 'starting just chilling duo match',
          matchMode: MatchMode.JUST_CHILLING,
          matchFormat: MatchFormat.DUO,
          language: payload.language,
          roomId: roomId,
          isOfferer: isOfferer,
        });
      }
    };

    notifyUser(payload.user1, true);
    notifyUser(payload.user2, false);
  }
}
