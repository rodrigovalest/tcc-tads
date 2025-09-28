import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IMatchRateRepository } from '../repositories/match-rate.interface';
import { Match } from 'src/match/entities/match.entity';
import { User } from 'src/user/entities/user.entity';
import { MatchRate } from '../entities/match-rate.entity';

@Injectable()
export class MatchRateService {

  constructor(
    @Inject('IMatchRateRepository')
    private readonly matchRateRepository: IMatchRateRepository,
  ) {}

  async createMatchRate(
    matchId: string,
    reviewerId: number,
    reviewedId: number,
    fluencyScore: number,
   ) {
    if (reviewerId === reviewedId) {
      throw new BadRequestException("A user cannot rate themselves.");
    }

    if (fluencyScore < 1 || fluencyScore > 5) {
      throw new BadRequestException("Fluency score must be between 1 and 5.");
    }

    if (await this.matchRateRepository.existsByMatchAndUsers(matchId, reviewerId, reviewedId)) {
      throw new BadRequestException("Rating already exists for this pair of users in the match.");
    }

    const matchRate = new MatchRate();
    matchRate.match = { id: matchId } as Match;
    matchRate.reviewer = { id: reviewerId } as User;
    matchRate.reviewed = { id: reviewedId } as User;
    matchRate.fluencyScore = fluencyScore;

    return this.matchRateRepository.save(matchRate);
  }
}
