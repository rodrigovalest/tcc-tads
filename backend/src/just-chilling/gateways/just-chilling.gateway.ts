import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { CurrentWsUser } from 'src/auth/decorators/current-ws-user.decorator';
import { JwtWsAuthGuard } from 'src/auth/guards/jwt-ws-auth.guard';
import { IUserJwtPayload } from 'src/auth/models/user-jwt-payload.interface';
import { WsExceptionFilter } from 'src/shared/filters/ws-exception.filter';
import { WsValidationPipe } from 'src/shared/pipes/WsValidationPipe';
import { Server, Socket } from 'socket.io';
import { JustChillingService } from '../services/just-chilling.service';
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
export class JustChillingGateway implements OnGatewayDisconnect {

  constructor (
    private readonly justChillingService: JustChillingService
  ) {}

  @WebSocketServer() server: Server;

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('just-chilling:enqueue')
  async enqueue(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() messageDto: EnqueueMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.justChillingService.enqueueAndTryStart(
      user.sub,
      client.id,
      messageDto.matchFormat,
      messageDto.matchLanguage
    );
  }

  @SubscribeMessage('webrtc:offer')
  handleOffer(
    @MessageBody() payload: { roomId: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket
  ) {
    client.to(payload.roomId).emit('webrtc:offer', {
      from: client.id,
      offer: payload.offer,
    });
  }

  @SubscribeMessage('webrtc:answer')
  handleAnswer(
    @MessageBody() payload: { roomId: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket
  ) {
    client.to(payload.roomId).emit('webrtc:answer', {
      from: client.id,
      answer: payload.answer,
    });
  }

  @SubscribeMessage('webrtc:ice-candidate')
  handleIceCandidate(
    @MessageBody() payload: { roomId: string; candidate: RTCIceCandidate },
    @ConnectedSocket() client: Socket
  ) {
    client.to(payload.roomId).emit('webrtc:ice-candidate', {
      from: client.id,
      candidate: payload.candidate,
    });
  }

  async handleDisconnect(client: Socket) {
    await this.justChillingService.handleDisconnect(client.id);
  }

  @OnEvent('just-chilling:match-started')
  handleMatchStarted(payload: {
    users: UserQueue [],
    matchMode: MatchMode,
    matchFormat: MatchFormat,
    language: MatchLanguage,
  }) {
    const roomId = `match-${randomUUID()}`;

    payload.users.forEach(user => {
      const socket = this.server.sockets.sockets.get(user.socketId);

      if (socket) {
        socket.join(roomId);

        socket.emit('just-chilling:match-started', {
          message: 'starting game',
          gameType: payload.matchFormat,
          language: payload.language,
          roomId: roomId,
        });
      }
    });
  }
}
