import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { User } from 'src/user/entities/user.entity';
import { MatchFormat } from '../entities/match-format.enum';
import { MatchLanguage } from '../entities/match-language.enum';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchStatus } from '../entities/match-status.enum';
import { UserMatch } from '../entities/user-match.entity';
import { UserQueue } from '../entities/user-queue.entity';

@Injectable()
export class MatchService {

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(UserMatch)
    private readonly userMatchRepository: Repository<UserMatch>,
  ) {}

  private readonly logger = new Logger(MatchService.name, { timestamp: true });

  async createMatch(
    mode: MatchMode,
    format: MatchFormat,
    language: MatchLanguage,
    users: UserQueue[],
  ): Promise<Match> {
    const match = this.matchRepository.create({
      mode,
      format,
      language,
      status: MatchStatus.IN_PROGRESS,
      startTime: new Date(),
    });
    await this.matchRepository.save(match);

    const userMatches = users.map((userQueue: UserQueue) =>
      this.userMatchRepository.create({
        user: { id: userQueue.userId } as User,
        socketId: userQueue.socketId,
        match,
      }),
    );

    await this.userMatchRepository.save(userMatches);

    return match;
  }

  async completeMatch(socketId: string): Promise<void> {
    const userMatch = await this.userMatchRepository.findOne({
      where: { socketId },
      relations: ['match', 'user'],
    });

    if (!userMatch) {
      this.logger.warn(`No active match found for socketId ${socketId}`);
      return;
    }

    const match = userMatch.match;

    if (match.status !== MatchStatus.COMPLETED) {
      match.status = MatchStatus.COMPLETED;
      match.endTime = new Date();
      await this.matchRepository.save(match);
      this.logger.log(`Match ${match.id} completed due to disconnection of user ${userMatch.user.id}`);
    }
  }

  async findAllMatchesByUserId(userId: number): Promise<Match[]> {
    const userMatches = await this.userMatchRepository.find({
      where: { user: { id: userId } },
      relations: ['match', 'match.userMatches', 'match.userMatches.user'],
    });

    return userMatches.map(um => um.match);
  }
}
