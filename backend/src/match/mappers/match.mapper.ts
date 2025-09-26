import { ListMatchesResponseDto } from "../dtos/list-matches-response.dto";
import { Match } from "../entities/match.entity";

export class MatchMapper {
  static toListMatchesResponseDto(
    match: Match,
    averageFluencyScore: number | null,
  ): ListMatchesResponseDto {
    return {
      id: match.id,
      startTime: match.startTime?.toISOString() ?? null,
      endTime: match.endTime?.toISOString() ?? null,
      mode: match.mode,
      format: match.format,
      language: match.language,
      status: match.status,
      averageFluencyScore: averageFluencyScore ?? null,
      users:
        match.userMatches?.map((u) => ({
          id: u.user.id,
          username: u.user.username,
          nationality: u.user.nationality,
          photoUri: u.user.photo ?? null,
        })) ?? [],
    };
  }

  static toListMatchesResponseDtos(
    matchesWithScores: Array<{ match: Match; averageFluencyScore: number | null }>,
  ): ListMatchesResponseDto[] {
    return matchesWithScores.map(({ match, averageFluencyScore }) =>
      this.toListMatchesResponseDto(match, averageFluencyScore),
    );
  }
}
