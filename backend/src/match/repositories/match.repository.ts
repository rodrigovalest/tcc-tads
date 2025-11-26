import { Injectable } from "@nestjs/common";
import { IMatchRepository } from "./match.interface";
import { Match } from "../entities/match.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MatchFormat } from "../entities/match-format.enum";
import { MatchLanguage } from "../entities/match-language.enum";
import { MatchMode } from "../entities/match-mode.enum";
import { MatchStatus } from "../entities/match-status.enum";
import { MatchRate } from "../../match-rate/entities/match-rate.entity";

@Injectable()
export class MatchRepositoryImpl implements IMatchRepository {
  constructor(
    @InjectRepository(Match)
    private readonly repository: Repository<Match>,
  ) { }

  async create(
    mode: MatchMode,
    format: MatchFormat,
    language: MatchLanguage,
    status: MatchStatus,
    startTime: Date,
  ): Promise<Match> {
    const match = this.repository.create({
      mode,
      format,
      language,
      status,
      startTime,
    });
    return this.repository.save(match);
  }

  async save(match: Match): Promise<Match> {
    return this.repository.save(match);
  }

  async findById(id: string): Promise<Match | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAllMatchesWithAverageScore(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{
    data: Array<{ match: Match; averageFluencyScore: number | null }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const matchIdsQuery = this.repository
      .createQueryBuilder('match')
      .select('match.id')
      .innerJoin('match.userMatches', 'userMatch', 'userMatch.userId = :userId', { userId })
      .orderBy('match.startTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const matchIds = (await matchIdsQuery.getRawMany()).map(row => row.match_id);

    if (matchIds.length === 0) {
      const total = await this.repository
        .createQueryBuilder('match')
        .innerJoin('match.userMatches', 'userMatch', 'userMatch.userId = :userId', { userId })
        .getCount();

      return { data: [], total, page, limit };
    }

    const matches = await this.repository
      .createQueryBuilder('match')
      .where('match.id IN (:...matchIds)', { matchIds })
      .leftJoinAndSelect('match.userMatches', 'allUserMatches')
      .leftJoinAndSelect('allUserMatches.user', 'user')
      .orderBy('match.startTime', 'DESC')
      .getMany();
    const matchRates = await this.repository.manager
      .createQueryBuilder(MatchRate, 'rate')
      .innerJoin('rate.match', 'match')
      .innerJoin('rate.reviewed', 'reviewed')
      .select('match.id', 'matchId')
      .addSelect('AVG(rate.fluencyScore)', 'averageFluencyScore')
      .where('match.id IN (:...matchIds)', { matchIds })
      .andWhere('reviewed.id = :userId', { userId })
      .groupBy('match.id')
      .getRawMany();
    const rateMap = new Map<string, number>();
    matchRates.forEach((rate) => {
      if (rate.averageFluencyScore !== null) {
        rateMap.set(rate.matchId, parseFloat(rate.averageFluencyScore));
      }
    });

    const total = await this.repository
      .createQueryBuilder('match')
      .innerJoin('match.userMatches', 'userMatch', 'userMatch.userId = :userId', { userId })
      .getCount();

    const data = matches.map((match) => ({
      match,
      averageFluencyScore: rateMap.get(match.id) || null,
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
