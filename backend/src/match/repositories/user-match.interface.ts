import { User } from "src/user/entities/user.entity";
import { UserMatch } from "../entities/user-match.entity";
import { Match } from "../entities/match.entity";

export interface IUserMatchRepository {
  create(userMatch: Partial<UserMatch>): UserMatch;
  saveOne(user: User, match: Match): Promise<UserMatch>
  saveAll(userMatches: UserMatch[]): Promise<UserMatch[]>;
  findBySocketId(socketId: string): Promise<UserMatch | null>;
}
