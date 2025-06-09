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
import { GameLanguage } from 'src/match/entities/game-language.enum';
import { GameMode } from 'src/match/entities/game-mode.enum';
import { GameType } from 'src/match/entities/game-type.enum';
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
      messageDto.gameMode,
      messageDto.gameType,
      messageDto.language
    );
  }

  async handleDisconnect(client: Socket) {
    await this.matchmakingService.handleDisconnect(client.id);
  }

  @OnEvent('match.started')
  handleMatchStarted(payload: {
    users: UserQueue [],
    gameMode: GameMode,
    gameType: GameType,
    language: GameLanguage,
  }) {
    payload.users.forEach(user => {
      const socket = this.server.sockets.sockets.get(user.socketId);

      if (socket) {
        socket.emit('match-started', {
          message: 'starting game',
          gameMode: payload.gameMode,
          gameType: payload.gameType,
          language: payload.language,
        });
      }
    });
  }
}
