import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchLanguage } from '../entities/match-language.enum';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchFormat } from '../entities/match-format.enum';
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
    matchMode: MatchMode,
    matchFormat: MatchFormat,
    matchLanguage: MatchLanguage,
  ): Promise<void> {
    await this.userQueueRepository.delete({ userId });

    const entry = this.userQueueRepository.create({
      userId,
      socketId,
      matchMode,
      matchFormat,
      matchLanguage,
    });

    await this.userQueueRepository.save(entry);
  }

  async removeUserBySocketId(
    socketId: string
  ): Promise<void> {
    await this.userQueueRepository.delete({ socketId });
  }

  async getQueueSize(
    matchMode: MatchMode,
    matchFormat: MatchFormat,
    matchLanguage: MatchLanguage,
  ): Promise<number> {
    return this.userQueueRepository.count({
      where: { matchMode, matchFormat, matchLanguage },
    });
  }

  async getAllFromQueue(
    matchMode: MatchMode,
    matchFormat: MatchFormat,
    matchLanguage: MatchLanguage,
  ): Promise<UserQueue[]> {
    return await this.userQueueRepository.find({
      where: { matchMode, matchFormat, matchLanguage },
      order: { joinedAt: 'ASC' },
    });
  }

  async dequeueUsers(
    matchMode: MatchMode,
    matchFormat: MatchFormat,
    matchLanguage: MatchLanguage,
    count: number,
  ): Promise<UserQueue[]> {
    const users = await this.userQueueRepository.find({
      where: { matchMode, matchFormat, matchLanguage },
      order: { joinedAt: 'ASC' },
      take: count,
    });

    if (users.length > 0) {
      await this.userQueueRepository.remove(users);
    }

    return users;
  }
}
