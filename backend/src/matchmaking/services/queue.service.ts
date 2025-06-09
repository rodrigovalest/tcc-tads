import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameLanguage } from 'src/match/entities/game-language.enum';
import { GameMode } from 'src/match/entities/game-mode.enum';
import { GameType } from 'src/match/entities/game-type.enum';
import { UserQueue } from '../entities/user-queue.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(UserQueue)
    private readonly userQueueRepository: Repository<UserQueue>,
  ) {}

  async enqueue(
    userId: number,
    socketId: string,
    gameMode: GameMode,
    gameType: GameType,
    gameLanguage: GameLanguage,
  ): Promise<void> {
    await this.userQueueRepository.delete({ userId });

    const entry = this.userQueueRepository.create({
      userId,
      socketId,
      gameMode,
      gameType,
      gameLanguage,
    });

    await this.userQueueRepository.save(entry);
  }

  async removeUserBySocketId(
    socketId: string
  ): Promise<void> {
    await this.userQueueRepository.delete({ socketId });
  }

  async getQueueSize(
    gameMode: GameMode,
    gameType: GameType,
    gameLanguage: GameLanguage,
  ): Promise<number> {
    return this.userQueueRepository.count({
      where: { gameMode, gameType, gameLanguage },
    });
  }

  async getAllFromQueue(
    gameMode: GameMode,
    gameType: GameType,
    gameLanguage: GameLanguage,
  ): Promise<UserQueue[]> {
    return await this.userQueueRepository.find({
      where: { gameMode, gameType, gameLanguage },
      order: { joinedAt: 'ASC' },
    });
  }

  async dequeueUsers(
    gameMode: GameMode,
    gameType: GameType,
    gameLanguage: GameLanguage,
    count: number,
  ): Promise<UserQueue[]> {
    const users = await this.userQueueRepository.find({
      where: { gameMode, gameType, gameLanguage },
      order: { joinedAt: 'ASC' },
      take: count,
    });

    if (users.length > 0) {
      await this.userQueueRepository.remove(users);
    }

    return users;
  }
}
