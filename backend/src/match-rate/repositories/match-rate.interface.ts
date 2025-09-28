import { MatchRate } from "../entities/match-rate.entity";

export interface IMatchRateRepository {
  existsByMatchAndUsers(matchId: string, reviewerId: number, reviewedId: number): Promise<boolean>;
  save(matchRate: MatchRate): Promise<MatchRate>;
}
