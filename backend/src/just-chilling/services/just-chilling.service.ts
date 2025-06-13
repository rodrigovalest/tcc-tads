import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { QueueService } from '../../match/services/queue.service';
import { MatchLanguage } from 'src/match/entities/match-language.enum';
import { MatchMode } from 'src/match/entities/match-mode.enum';
import { MatchFormat } from 'src/match/entities/match-format.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MATCH_MODE_CONFIGS, MatchModeConfig } from 'src/match/constants/match-mode-config';

@Injectable()
export class JustChillingService {

  constructor (
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly logger = new Logger(JustChillingService.name, { timestamp: true });

  async enqueueAndTryStart(
    userId: number, 
    socketId: string,
    matchFormat: MatchFormat, 
    language: MatchLanguage
  ): Promise<void> {
    this.logger.log(`Enqueue requested by user ${userId} for ${MatchMode.JUST_CHILLING}-${matchFormat}-${language}`);

    const config: MatchModeConfig = MATCH_MODE_CONFIGS[MatchMode.JUST_CHILLING];

    if (!config.allowedTypes.includes(matchFormat)) {
      this.logger.error(`Format ${matchFormat} not allowed for mode ${MatchMode.JUST_CHILLING}`);
      throw new WsException(`Format ${matchFormat} is not allowed for mode ${MatchMode.JUST_CHILLING}`);
    }

    await this.queueService.enqueue(userId, socketId, MatchMode.JUST_CHILLING, matchFormat, language);

    const queueSize = await this.queueService.getQueueSize(MatchMode.JUST_CHILLING, matchFormat, language);

    if (queueSize >= config.minPlayers) {
      const users = await this.queueService.dequeueUsers(MatchMode.JUST_CHILLING, matchFormat, language, config.minPlayers);

      this.logger.log(`Starting just-chilling with users: ${users.map(u => `${u.userId}`).join(', ')}`);

      this.eventEmitter.emit('just-chilling:match-started', {
        users,
        matchFormat,
        language,
      });
    }
  }

  async handleDisconnect(socketId: string): Promise<void> {
    this.queueService.removeUserBySocketId(socketId);
  }
}
