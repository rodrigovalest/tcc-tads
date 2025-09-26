import { MatchFormat } from "../entities/match-format.enum";
import { MatchLanguage } from "../entities/match-language.enum";
import { MatchMode } from "../entities/match-mode.enum";
import { MatchStatus } from "../entities/match-status.enum";
import { Match } from "../entities/match.entity";

export interface IMatchRepository {
  create(
    mode: MatchMode,
    format: MatchFormat,
    language: MatchLanguage,
    status: MatchStatus,
    startTime: Date,
  ): Promise<Match>;

  save(match: Match): Promise<Match>;
  findById(id: string): Promise<Match | null>;
  findAllMatchesWithAverageScore(userId: number): Promise<Array<{ match: Match; averageFluencyScore: number | null }>>;
}
