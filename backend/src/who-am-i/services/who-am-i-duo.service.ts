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
export class WhoAmIDuoService {

  constructor (
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
    private readonly matchService: MatchService
  ) {}

  private readonly logger = new Logger(WhoAmIDuoService.name, { timestamp: true });

  async enqueueDuoFormatAndTryStart(
    user: IUserJwtPayload, 
    socketId: string,
    language: MatchLanguage
  ): Promise<void> {
    this.logger.log(`Enqueue requested by user ${user.sub} for ${MatchMode.WHO_AM_I}-${MatchFormat.DUO}-${language}`);

    await this.queueService.enqueue(
      user.sub, user.username, user.nationality, socketId, MatchMode.WHO_AM_I, MatchFormat.DUO, language
    );

    const queueSize = await this.queueService.getQueueSize(MatchMode.WHO_AM_I, MatchFormat.DUO, language);

    if (queueSize >= 2) {
      const users: UserQueue[] = await this.queueService.dequeueUsers(MatchMode.WHO_AM_I, MatchFormat.DUO, language, 2);

      const match: Match = await this.matchService.createMatch(
        MatchMode.WHO_AM_I,
        MatchFormat.DUO,
        language,
        users
      );

      this.logger.log(`Starting who-am-i ${match} with users: ${users.map(u => `${u.userId}`).join(', ')}`);

      this.eventEmitter.emit('who-am-i:duo:match-started', {
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
