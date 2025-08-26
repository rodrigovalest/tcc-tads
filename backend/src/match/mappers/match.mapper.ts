import { ListMatchesResponseDto } from "../dtos/list-matches-response.dto";
import { Match } from "../entities/match.entity";

export class MatchMapper {
  static toListMatchesResponseDto(match: Match): ListMatchesResponseDto {
    return {
      id: match.id,
      startTime: match.startTime?.toISOString() ?? null,
      endTime: match.endTime?.toISOString() ?? null,
      mode: match.mode,
      format: match.format,
      language: match.language,
      status: match.status,
      users: match.userMatches.map(u => (
        {
          username: u.user.username,
          nationality: u.user.nationality
        }
      )) ?? []
    };
  }

  static toListMatchesResponseDtos(matches: Match[]): ListMatchesResponseDto[] {
    return matches.map(match => this.toListMatchesResponseDto(match));
  }
}
