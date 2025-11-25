import { Injectable } from '@nestjs/common';
import { IGuessWhoMatchRepository } from './guess-who-match.interface';
import { GuessWhoMatch } from '../entities/guess-who-match.entity';
import { GuessWhoCharacter } from '../entities/guess-who-character.entity';

@Injectable()
export class GuessWhoMatchRepositoryImpl implements IGuessWhoMatchRepository {
  private matches = new Map<string, GuessWhoMatch>();

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
  ): void {
    const match = new GuessWhoMatch(
      matchId,
      user1Id,
      user2Id,
      user1SocketId,
      user2SocketId,
      characters,
      user1Character,
      user2Character,
      userIdTurn,
    );
    this.matches.set(matchId, match);
  }

  findByMatchId(matchId: string): GuessWhoMatch | null {
    return this.matches.get(matchId) || null;
  }

  update(matchId: string, data: Partial<GuessWhoMatch>): GuessWhoMatch | null {
    const existing = this.matches.get(matchId);
    if (!existing) return null;

    const updated = Object.assign(existing, data);
    this.matches.set(matchId, updated);
    return updated;
  }

  deleteById(matchId: string): void {
    this.matches.delete(matchId);
  }
}
