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
    const qb = this.repository
      .createQueryBuilder('match')
      .innerJoin('match.userMatches', 'userMatch', 'userMatch.userId = :userId', { userId })
      .leftJoinAndSelect('match.userMatches', 'allUserMatches')
      .leftJoinAndSelect('allUserMatches.user', 'user')
      .leftJoin(
        MatchRate,
        'rate',
        'rate.matchId = match.id AND rate.reviewedId = :userId',
        { userId },
      )
      .addSelect('AVG(rate.fluencyScore)', 'averageFluencyScore')
      .groupBy('match.id')
      .addGroupBy('allUserMatches.id')
      .addGroupBy('user.id')
      .orderBy('match.startTime', 'DESC');

    // Paginação
    qb.skip((page - 1) * limit).take(limit);

    // Total de matches (sem paginação)
    const total = await this.repository
      .createQueryBuilder('match')
      .innerJoin('match.userMatches', 'userMatch', 'userMatch.userId = :userId', { userId })
      .getCount();

    const rawResults = await qb.getRawAndEntities();

    const data = rawResults.entities.map((match, idx) => ({
      match,
      averageFluencyScore:
        rawResults.raw[idx].averageFluencyScore !== null
          ? parseFloat(rawResults.raw[idx].averageFluencyScore)
          : null,
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
