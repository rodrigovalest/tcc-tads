import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { CurrentWsUser } from 'src/auth/decorators/current-ws-user.decorator';
import { JwtWsAuthGuard } from 'src/auth/guards/jwt-ws-auth.guard';
import { IUserJwtPayload } from 'src/auth/models/user-jwt-payload.interface';
import { WsExceptionFilter } from 'src/shared/filters/ws-exception.filter';
import { MatchmakingService } from '../services/matchmaking.service';
import { EnqueueMessageDto } from '../dto/messages/enqueue-message.dto';
import { WsValidationPipe } from 'src/shared/pipes/WsValidationPipe';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { MatchLanguage } from 'src/match/entities/match-language.enum';
import { MatchMode } from 'src/match/entities/match-mode.enum';
import { MatchFormat } from 'src/match/entities/match-format.enum';
import { UserQueue } from '../entities/user-queue.entity';

@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionFilter())
@WebSocketGateway()
export class MatchmakingGateway implements OnGatewayDisconnect {

  constructor (
    private readonly matchmakingService: MatchmakingService
  ) {}

  @WebSocketServer() server: Server;

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('enqueue')
  async enqueue(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() messageDto: EnqueueMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.matchmakingService.enqueueAndTryStart(
      user.sub,
      client.id,
      messageDto.matchMode,
      messageDto.matchFormat,
      messageDto.matchLanguage
    );
  }

  async handleDisconnect(client: Socket) {
    await this.matchmakingService.handleDisconnect(client.id);
  }

  @OnEvent('match.started')
  handleMatchStarted(payload: {
    users: UserQueue [],
    matchMode: MatchMode,
    matchFormat: MatchFormat,
    language: MatchLanguage,
  }) {
    payload.users.forEach(user => {
      const socket = this.server.sockets.sockets.get(user.socketId);

      if (socket) {
        socket.emit('match-started', {
          message: 'starting game',
          gameMode: payload.matchMode,
          gameType: payload.matchFormat,
          language: payload.language,
        });
      }
    });
  }
}
