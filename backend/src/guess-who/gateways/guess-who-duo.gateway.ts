import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GuessWhoService } from '../services/guess-who-duo.service';
import { UsePipes, UseFilters, Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { CurrentWsUser } from '../../auth/decorators/current-ws-user.decorator';
import { JwtWsAuthGuard } from '../../auth/guards/jwt-ws-auth.guard';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { EnqueueMessageDto } from '../../guess-who/dtos/messages/enqueue-message.dto';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { Match } from '../../match/entities/match.entity';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { WsExceptionFilter } from '../../shared/filters/ws-exception.filter';
import { WsValidationPipe } from '../../shared/pipes/WsValidationPipe';
import { Character } from '../entities/character.entity';
import { UserMatch } from 'src/match/entities/user-match.entity';

@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionFilter())
@WebSocketGateway()
export class GuessWhoGateway implements OnGatewayDisconnect {
  constructor(private readonly guessWhoService: GuessWhoService) {}

  private readonly logger = new Logger(GuessWhoGateway.name, {
    timestamp: true,
  });

  @WebSocketServer() server: Server;

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('guess-who:duo:enqueue')
  async enqueue(
    @CurrentWsUser() loggedUser: IUserJwtPayload,
    @MessageBody() messageDto: EnqueueMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    await this.guessWhoService.enqueueDuoFormatAndTryStart(
      loggedUser,
      client.id,
      messageDto.matchLanguage,
    );
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('guess-who:duo:webrtc:offer')
  handleOffer(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody()
    payload: { matchId: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `[webrtc:offer] User ${user.sub} sent offer for match ${payload.matchId}`,
    );

    client.to(payload.matchId).emit('guess-who:duo:webrtc:offer', {
      from: client.id,
      offer: payload.offer,
    });
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('guess-who:duo:webrtc:answer')
  handleAnswer(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody()
    payload: { matchId: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `[webrtc:answer] User ${user.sub} sent answer for match ${payload.matchId}`,
    );

    client.to(payload.matchId).emit('guess-who:duo:webrtc:answer', {
      from: client.id,
      answer: payload.answer,
    });
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('guess-who:duo:webrtc:ice-candidate')
  handleIceCandidate(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { matchId: string; candidate: RTCIceCandidate },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `[webrtc:ice-candidate] User ${user.sub} sent ICE candidate for match ${payload.matchId}`,
    );

    client.to(payload.matchId).emit('guess-who:duo:webrtc:ice-candidate', {
      from: client.id,
      candidate: payload.candidate,
    });
  }

  async handleDisconnect(client: Socket) {
    await this.guessWhoService.handleDisconnect(client.id);
  }

  @OnEvent('guess-who:duo:match-started')
  handleDuoMatchStarted(payload: {
    userQueue1: UserQueue;
    userQueue2: UserQueue;
    user1PhotoUri: string | null;
    user2PhotoUri: string | null;
    language: MatchLanguage;
    match: Match;
    characters: Character[];
    characterUser1: Character;
    characterUser2: Character;
  }) {
    const notifyUser = (
      user: UserQueue,
      isOfferer: boolean,
      pair: UserQueue,
      pairPhotoUri: string | null,
    ) => {
      const socket = this.server.sockets.sockets.get(user.socketId);

      if (socket) {
        socket.join(payload.match.id);

        socket.emit('guess-who:duo:match-started', {
          message: 'starting guess who duo match',
          timestamp: new Date().toISOString(),
          matchMode: MatchMode.GUESS_WHO,
          matchFormat: MatchFormat.DUO,
          language: payload.language,
          isOfferer: isOfferer,
          matchId: payload.match.id,
          buddy: {
            userId: pair.userId,
            username: pair.username,
            nationality: pair.nationality,
            photoUri: pairPhotoUri,
          },
        });
      }
    };

    notifyUser(payload.userQueue1, true, payload.userQueue2, payload.user2PhotoUri);
    notifyUser(payload.userQueue2, false, payload.userQueue1, payload.user1PhotoUri);
  }

  @OnEvent('guess-who:duo:characters-selected')
  handleDuoCharactersSelected(payload: {
    userQueue1: UserQueue;
    userQueue2: UserQueue;
    characters: Character[];
    characterUser1: Character;
    characterUser2: Character;
  }) {
    const notifyUser = (
      userSocketId: string,
      characters: Character[],
      pairCharacter: Character,
    ) => {
      const socket = this.server.sockets.sockets.get(userSocketId);

      if (socket) {
        socket.emit('guess-who:duo:characters-selected', {
          message: 'characters selected for guess who duo match',
          timestamp: new Date().toISOString(),
          characters: characters,
          pairCharacter: pairCharacter,
        });
      }
    };

    notifyUser(payload.userQueue1.socketId, payload.characters, payload.characterUser2);
    notifyUser(payload.userQueue2.socketId, payload.characters, payload.characterUser1);
  }
}
