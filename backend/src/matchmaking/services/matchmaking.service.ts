import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from './queue.service';
import { GameLanguage } from 'src/match/entities/game-language.enum';
import { GameMode } from 'src/match/entities/game-mode.enum';
import { GameType } from 'src/match/entities/game-type.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MatchmakingService {

  constructor (
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly logger = new Logger(MatchmakingService.name, { timestamp: true })

  private readonly playersNeeded: Record<GameType, number> = {
    [GameType.SOLO]: 1,
    [GameType.DUO]: 2,
    [GameType.GROUP]: 4,
  };

  async enqueueAndTryStart(
    userId: number, 
    gameMode: GameMode,
    gameType: GameType, 
    language: GameLanguage
  ): Promise<void> {
    this.logger.log(`Enqueue requested by user ${userId} for ${gameMode}-${gameType}-${language}`);

    await this.queueService.enqueue(
      userId, gameMode, gameType, language
    );

    const queueSize = await this.queueService.getQueueSize(gameMode, gameType, language);
    const requiredPlayers = this.playersNeeded[gameType];

    console.log(await this.queueService.getAllFromQueue(gameMode, gameType, language));

    if (queueSize >= requiredPlayers) {
      const userIds = await this.queueService.dequeueUsers(gameMode, gameType, language, requiredPlayers);
      
      this.logger.log(`Starting match with users: ${userIds.join(', ')}`);

      // await this.matchService.createMatch(userIds, gameMode, gameType, language);

      this.eventEmitter.emit('match.started', {
        userIds,
        gameMode,
        gameType,
        language,
      });
    }
  }

  async handleDisconnect(userId: number): Promise<void> {
    await this.queueService.removeUser(userId);
  }
}
