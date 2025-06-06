import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { GameLanguage } from "src/match/entities/game-language.enum";
import { GameMode } from "src/match/entities/game-mode.enum";
import { GameType } from "src/match/entities/game-type.enum";

@Injectable()
export class QueueService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private getQueueKey(gameMode: GameMode, gameType: GameType, language: GameLanguage): string {
    return `queue:${gameMode}:${gameType}:${language}`;
  }

  private getUserKey(userId: number): string {
    return `queue:user:${userId}`;
  }

  async enqueue(
    userId: number, 
    gameMode: GameMode,
    gameType: GameType, 
    language: GameLanguage
  ): Promise<void> {
    const userKey = this.getUserKey(userId);

    if (await this.redis.get(userKey)) {
      await this.removeUser(userId);
    }

    const queueKey = this.getQueueKey(gameMode, gameType, language);
    const score = Date.now();

    await Promise.all([
      this.redis.zadd(queueKey, score, userId.toString()),
      this.redis.set(this.getUserKey(userId), queueKey),
    ]);
  }

  async removeUser(userId: number): Promise<void> {
    const userKey = this.getUserKey(userId);
    const queueKey = await this.redis.get(userKey);

    if (queueKey) {
      await Promise.all([
        this.redis.zrem(queueKey, userId.toString()),
        this.redis.del(userKey),
      ]);
    }
  }

  async getQueueSize(gameMode: GameMode, gameType: GameType, language: GameLanguage): Promise<number> {
    const queueKey = this.getQueueKey(gameMode, gameType, language);
    return await this.redis.zcard(queueKey);
  }

  async getAllFromQueue(
    gameMode: GameMode,
    gameType: GameType,
    language: GameLanguage
  ): Promise<number[]> {
    const queueKey = this.getQueueKey(gameMode, gameType, language);
    const members = await this.redis.zrange(queueKey, 0, -1);

    return members.map(Number);
  }

  async dequeueUsers(
    gameMode: GameMode,
    gameType: GameType,
    language: GameLanguage,
    count: number,
  ): Promise<number[]> {
    const queueKey = this.getQueueKey(gameMode, gameType, language);
    const users = await this.redis.zrange(queueKey, 0, count - 1);

    if (users.length > 0) {
      await Promise.all([
        this.redis.zrem(queueKey, ...users),
        ...users.map((id) => this.redis.del(this.getUserKey(Number(id)))),
      ]);
    }

    return users.map((id) => parseInt(id, 10));
  }
}
