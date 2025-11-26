import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../../match/services/queue.service';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { MatchService } from '../../match/services/match.service';
import { Match } from 'src/match/entities/match.entity';

@Injectable()
export class JustChillingDuoService {

  constructor (
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
    private readonly matchService: MatchService
  ) {}

  private readonly logger = new Logger(JustChillingDuoService.name, { timestamp: true });

  async enqueueDuoFormatAndTryStart(
    user: IUserJwtPayload, 
    socketId: string,
    language: MatchLanguage
  ): Promise<void> {
    this.logger.log(`Enqueue requested by user ${user.sub} for ${MatchMode.JUST_CHILLING}-${MatchFormat.DUO}-${language}`);

    await this.queueService.enqueue(
      user.sub, user.username, user.nationality, socketId, MatchMode.JUST_CHILLING, MatchFormat.DUO, language
    );

    const queueSize = await this.queueService.getQueueSize(MatchMode.JUST_CHILLING, MatchFormat.DUO, language);

    if (queueSize >= 2) {
      const users: UserQueue[] = await this.queueService.dequeueUsers(MatchMode.JUST_CHILLING, MatchFormat.DUO, language, 2);

      const match: Match = await this.matchService.createMatch(
        MatchMode.JUST_CHILLING,
        MatchFormat.DUO,
        language,
        users
      );

      this.logger.log(`Starting just-chilling ${match} with users: ${users.map(u => `${u.userId}`).join(', ')}`);

      this.eventEmitter.emit('just-chilling:duo:match-started', {
        user1: users[0],
        user2: users[1],
        language: language,
        match,
      });
    }
  }

  async startDirectMatch(
    user1Id: number,
    user2Id: number,
    user1SocketId: string,
    user2SocketId: string,
    user1Username: string,
    user2Username: string,
    user1Nationality: string,
    user2Nationality: string,
    language: MatchLanguage,
  ): Promise<void> {
    this.logger.log(
      `Starting direct just-chilling match between users ${user1Id} and ${user2Id}`,
    );

    const userQueue1 = new UserQueue(
      user1Id,
      user1Username,
      user1Nationality as any,
      user1SocketId,
      MatchMode.JUST_CHILLING,
      MatchFormat.DUO,
      language,
    );

    const userQueue2 = new UserQueue(
      user2Id,
      user2Username,
      user2Nationality as any,
      user2SocketId,
      MatchMode.JUST_CHILLING,
      MatchFormat.DUO,
      language,
    );

    const match: Match = await this.matchService.createMatch(
      MatchMode.JUST_CHILLING,
      MatchFormat.DUO,
      language,
      [userQueue1, userQueue2],
    );

    this.eventEmitter.emit('just-chilling:duo:match-started', {
      user1: userQueue1,
      user2: userQueue2,
      language: language,
      match,
    });
  }
  
  async handleDisconnect(socketId: string): Promise<void> {
    const userQueue = await this.queueService.findUserBySocketId(socketId);
    
    if (userQueue) {
      await this.queueService.removeUser(userQueue);
      return;
    }

    await this.matchService.completeMatch(socketId);
  }
}
