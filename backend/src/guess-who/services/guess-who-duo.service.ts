import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchService } from '../../match/services/match.service';
import { QueueService } from '../../match/services/queue.service';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { Match } from '../../match/entities/match.entity';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { UserService } from '../../user/services/user.service';
import { CHARACTERS } from '../constants/characters';
import { UserMatch } from 'src/match/entities/user-match.entity';

@Injectable()
export class GuessWhoService {
  constructor(
    private readonly userService: UserService,
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
      const usersQueue: UserQueue[] = await this.queueService.dequeueUsers(
        MatchMode.GUESS_WHO,
        MatchFormat.DUO,
        language,
        2,
      );

      const user1 = await this.userService.findById(usersQueue[0].userId);
      const user2 = await this.userService.findById(usersQueue[1].userId);

      const match: Match = await this.matchService.createMatch(
        MatchMode.GUESS_WHO,
        MatchFormat.DUO,
        language,
        usersQueue,
      );

      this.logger.log(
        `Starting guess-who ${match} with users: ${usersQueue.map((u) => `${u.userId}`).join(', ')}`,
      );

      this.eventEmitter.emit('guess-who:duo:match-started', {
        userQueue1: usersQueue[0],
        userQueue2: usersQueue[1],
        user1PhotoUri: user1!.photo ?? null,
        user2PhotoUri: user2!.photo ?? null,
        language: language,
        match,
      });

      const shuffled = this.shuffle([...CHARACTERS]);
      const characters = shuffled.slice(0, 16);
      const characterUser1 = this.pickRandom(characters);
      const characterUser2 = this.pickRandom(characters);

      this.eventEmitter.emit('guess-who:duo:characters-selected', {
        userQueue1: usersQueue[0],
        userQueue2: usersQueue[1],
        characters,
        characterUser1,
        characterUser2,
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

  
  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private pickRandom<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
  }
}
