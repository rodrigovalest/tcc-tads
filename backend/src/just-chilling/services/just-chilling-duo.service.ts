import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../../match/services/queue.service';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserQueue } from '../../match/entities/user-queue.entity';

@Injectable()
export class JustChillingDuoService {

  constructor (
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly logger = new Logger(JustChillingDuoService.name, { timestamp: true });

  async enqueueDuoFormatAndTryStart(
    userId: number, 
    socketId: string,
    language: MatchLanguage
  ): Promise<void> {
    this.logger.log(`Enqueue requested by user ${userId} for ${MatchMode.JUST_CHILLING}-${MatchFormat.DUO}-${language}`);

    await this.queueService.enqueue(userId, socketId, MatchMode.JUST_CHILLING, MatchFormat.DUO, language);

    const queueSize = await this.queueService.getQueueSize(MatchMode.JUST_CHILLING, MatchFormat.DUO, language);

    if (queueSize >= 2) {
      const users: UserQueue[] = await this.queueService.dequeueUsers(MatchMode.JUST_CHILLING, MatchFormat.DUO, language, 2);

      this.logger.log(`Starting just-chilling with users: ${users.map(u => `${u.userId}`).join(', ')}`);

      this.eventEmitter.emit('just-chilling:duo:match-started', {
        user1: users[0],
        user2: users[1],
        language: language,
      });
    }
  }

  async handleDisconnect(socketId: string): Promise<void> {
    this.queueService.removeUserBySocketId(socketId);
  }
}
