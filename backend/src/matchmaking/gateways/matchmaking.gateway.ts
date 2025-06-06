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

@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionFilter())
@WebSocketGateway()
export class MatchmakingGateway implements OnGatewayDisconnect {

  constructor (
    private readonly matchmakingService: MatchmakingService
  ) {}

  @WebSocketServer() server: Server;

  private readonly clientIdToUserId = new Map<string, number>();
  private readonly userIdToSocket = new Map<number, Socket>();

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('enqueue')
  async enqueue(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() messageDto: EnqueueMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    this.clientIdToUserId.set(client.id, user.sub);
    this.userIdToSocket.set(user.sub, client);
    
    await this.matchmakingService.enqueueAndTryStart(
      user.sub,
      messageDto.gameMode,
      messageDto.gameType,
      messageDto.language
    );
  }

  async handleDisconnect(client: Socket) {
    const userId = this.clientIdToUserId.get(client.id);
    if (!userId) return;

    this.clientIdToUserId.delete(client.id);
    this.userIdToSocket.delete(userId);

    await this.matchmakingService.handleDisconnect(userId);
  }

  @OnEvent('match.started')
  handleMatchStarted(payload: {
    userIds: number[],
    gameMode: GameMode,
    gameType: GameType,
    language: GameLanguage,
  }) {
    payload.userIds.forEach(userId => {
      const socket = this.userIdToSocket.get(userId);
      if (socket) {
        socket.emit('match-started', payload);
      }
    });
  }
}
