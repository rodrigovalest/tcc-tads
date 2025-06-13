import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from './queue.service';
import { MatchLanguage } from 'src/match/entities/match-language.enum';
import { MatchMode } from 'src/match/entities/match-mode.enum';
import { MatchFormat } from 'src/match/entities/match-format.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MatchmakingService {

  constructor (
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly logger = new Logger(MatchmakingService.name, { timestamp: true })

  private readonly playersNeeded: Record<MatchFormat, number> = {
    [MatchFormat.SOLO]: 1,
    [MatchFormat.DUO]: 2,
    [MatchFormat.GROUP]: 4,
  };

  async enqueueAndTryStart(
    userId: number, 
    socketId: string,
    matchMode: MatchMode,
    matchFormat: MatchFormat, 
    language: MatchLanguage
  ): Promise<void> {
    this.logger.log(`Enqueue requested by user ${userId} for ${matchMode}-${matchFormat}-${language}`);

    await this.queueService.enqueue(
      userId, socketId, matchMode, matchFormat, language
    );

    const queueSize = await this.queueService.getQueueSize(matchMode, matchFormat, language);
    const requiredPlayers = this.playersNeeded[matchFormat];

    if (queueSize >= requiredPlayers) {
      const users = await this.queueService.dequeueUsers(matchMode, matchFormat, language, requiredPlayers);
      
      this.logger.log(`Starting match with users: ${users.map(u => `${u.userId}`).join(', ')}`);

      // await this.matchService.createMatch(userIds, gameMode, gameType, language);

      this.eventEmitter.emit('match.started', {
        users,
        matchMode,
        matchFormat,
        language,
      });
    }
  }

  async handleDisconnect(socketId: string): Promise<void> {
    this.queueService.removeUserBySocketId(socketId);
  }
}
