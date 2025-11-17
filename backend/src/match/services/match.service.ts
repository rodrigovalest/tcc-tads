import { Inject, Injectable, Logger } from '@nestjs/common';
import { Match } from '../entities/match.entity';
import { User } from 'src/user/entities/user.entity';
import { MatchFormat } from '../entities/match-format.enum';
import { MatchLanguage } from '../entities/match-language.enum';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchStatus } from '../entities/match-status.enum';
import { UserQueue } from '../entities/user-queue.entity';
import { IMatchRepository } from '../repositories/match.interface';
import { IUserMatchRepository } from '../repositories/user-match.interface';
import { UserMatch } from '../entities/user-match.entity';

@Injectable()
export class MatchService {
  constructor(
    @Inject('IMatchRepository')
    private readonly matchRepository: IMatchRepository,
    @Inject('IUserMatchRepository')
    private readonly userMatchRepository: IUserMatchRepository,
  ) {}

  private readonly logger = new Logger(MatchService.name, { timestamp: true });

  async createMatch(
    mode: MatchMode,
    format: MatchFormat,
    language: MatchLanguage,
    users: UserQueue[],
  ): Promise<Match> {
    const match = await this.matchRepository.create(
      mode,
      format,
      language,
      MatchStatus.IN_PROGRESS,
      new Date(),
    );

    const userMatches = users.map((userQueue: UserQueue) =>
      this.userMatchRepository.create({
        user: { id: userQueue.userId } as User,
        socketId: userQueue.socketId,
        match,
      }),
    );
    await this.userMatchRepository.saveAll(userMatches);

    return match;
  }

  async createSoloMatch(
    mode: MatchMode,
    language: MatchLanguage,
    userId: number,
  ): Promise<Match> {
    const match = await this.matchRepository.create(
      mode,
      MatchFormat.SOLO,
      language,
      MatchStatus.IN_PROGRESS,
      new Date(),
    );

    await this.userMatchRepository.saveOne(
      { id: userId } as User,
      match,
    );

    return match;
  }

  async completeSoloMatch(matchId: string): Promise<void> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      this.logger.warn(`No match found with id ${matchId}`);
      return;
    }

    if (match.status !== MatchStatus.COMPLETED) {
      match.status = MatchStatus.COMPLETED;
      match.endTime = new Date();
      await this.matchRepository.save(match);
      this.logger.log(`Solo match ${match.id} completed`);
    }
  }

  async completeMatch(socketId: string): Promise<void> {
    const userMatch = await this.userMatchRepository.findBySocketId(socketId);

    if (!userMatch) {
      this.logger.warn(`No active match found for socketId ${socketId}`);
      return;
    }

    const match = userMatch.match;

    if (match.status !== MatchStatus.COMPLETED) {
      match.status = MatchStatus.COMPLETED;
      match.endTime = new Date();
      await this.matchRepository.save(match);
      this.logger.log(
        `Match ${match.id} completed due to disconnection of user ${userMatch.user.id}`,
      );
    }
  }

  async findAllMatchesWithAverageScore(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Array<{ match: Match; averageFluencyScore: number | null }>;
    total: number;
    page: number;
    limit: number;
  }> {
    return this.matchRepository.findAllMatchesWithAverageScore(userId, page, limit);
  }

  async findUserMatchesByMatchId(
    matchId: string,
  ): Promise<UserMatch[]> {
    return this.userMatchRepository.findUserMatchesByMatchId(matchId);
  }
}
