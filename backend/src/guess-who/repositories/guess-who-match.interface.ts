import { GuessWhoCharacter } from "../entities/guess-who-character.entity";
import { GuessWhoMatch } from "../entities/guess-who-match.entity";

export interface IGuessWhoMatchRepository {
  create(
    matchId: string,
    user1Id: number,
    user2Id: number,
    user1SocketId: string,
    user2SocketId: string,
    characters: GuessWhoCharacter[],
    user1Character: GuessWhoCharacter,
    user2Character: GuessWhoCharacter,
    userIdTurn: number,
  ): void;

  findByMatchId(matchId: string): GuessWhoMatch | null;

  update(matchId: string, data: Partial<GuessWhoMatch>): GuessWhoMatch | null;

  deleteById(matchId: string): void;
}
