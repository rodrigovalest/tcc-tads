import { Injectable } from "@nestjs/common";
import { IUserMatchRepository } from "./user-match.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserMatch } from "../entities/user-match.entity";
import { Match } from "../entities/match.entity";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class UserMatchRepositoryImpl implements IUserMatchRepository {

  constructor(
    @InjectRepository(UserMatch)
    private readonly repository: Repository<UserMatch>,
  ) {}

  create(userMatch: Partial<UserMatch>): UserMatch {
    return this.repository.create(userMatch);
  }
  
  async saveOne(user: User, match: Match): Promise<UserMatch> {
    const data = this.repository.create({
      user,
      match,
    });
    return this.repository.save(data);
  }

  async saveAll(userMatches: UserMatch[]): Promise<UserMatch[]> {
    return this.repository.save(userMatches);
  }

  async findBySocketId(socketId: string): Promise<UserMatch | null> {
    return this.repository.findOne({
      where: { socketId },
      relations: ['match', 'user'],
    });
  }
}
