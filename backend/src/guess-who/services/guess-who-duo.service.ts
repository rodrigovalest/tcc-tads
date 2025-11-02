import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JustChillingDuoService } from '../../just-chilling/services/just-chilling-duo.service';
import { MatchService } from '../../match/services/match.service';
import { QueueService } from '../../match/services/queue.service';
import { IUserJwtPayload } from 'src/auth/models/user-jwt-payload.interface';
import { MatchFormat } from 'src/match/entities/match-format.enum';
import { MatchLanguage } from 'src/match/entities/match-language.enum';
import { MatchMode } from 'src/match/entities/match-mode.enum';
import { Match } from 'src/match/entities/match.entity';
import { UserQueue } from 'src/match/entities/user-queue.entity';

@Injectable()
export class GuessWhoService {
  constructor(
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
    private readonly matchService: MatchService,
  ) {}

  private readonly logger = new Logger(GuessWhoService.name, {
    timestamp: true,
  });

  async enqueueDuoFormatAndTryStart(
    user: IUserJwtPayload,
    socketId: string,
    language: MatchLanguage,
  ): Promise<void> {
    this.logger.log(
      `Enqueue requested by user ${user.sub} for ${MatchMode.GUESS_WHO}-${MatchFormat.DUO}-${language}`,
    );

    await this.queueService.enqueue(
      user.sub,
      user.username,
      user.nationality,
      socketId,
      MatchMode.GUESS_WHO,
      MatchFormat.DUO,
      language,
    );

    const queueSize = await this.queueService.getQueueSize(
      MatchMode.GUESS_WHO,
      MatchFormat.DUO,
      language,
    );

    if (queueSize >= 2) {
      const users: UserQueue[] = await this.queueService.dequeueUsers(
        MatchMode.GUESS_WHO,
        MatchFormat.DUO,
        language,
        2,
      );

      const match: Match = await this.matchService.createMatch(
        MatchMode.GUESS_WHO,
        MatchFormat.DUO,
        language,
        users,
      );

      this.logger.log(
        `Starting guess-who ${match} with users: ${users.map((u) => `${u.userId}`).join(', ')}`,
      );

      this.eventEmitter.emit('guess-who:duo:match-started', {
        user1: users[0],
        user2: users[1],
        language: language,
        match,
      });
    }
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
