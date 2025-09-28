import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MatchRate } from "../entities/match-rate.entity";
import { Repository } from "typeorm";
import { IMatchRateRepository } from "./match-rate.interface";

@Injectable()
export class MatchRateRepositoryImpl implements IMatchRateRepository {

  constructor(
    @InjectRepository(MatchRate)
    private readonly repository: Repository<MatchRate>,
  ) {}

  async save(matchRate: MatchRate): Promise<MatchRate> {
    return this.repository.save(matchRate);
  }

  async existsByMatchAndUsers(
    matchId: string,
    reviewerId: number,
    reviewedId: number,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        match: { id: matchId },
        reviewer: { id: reviewerId },
        reviewed: { id: reviewedId },
      },
    });
    return count > 0;
  }
}
