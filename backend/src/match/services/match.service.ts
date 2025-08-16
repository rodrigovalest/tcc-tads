import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { User } from 'src/user/entities/user.entity';
import { MatchFormat } from '../entities/match-format.enum';
import { MatchLanguage } from '../entities/match-language.enum';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchStatus } from '../entities/match-status.enum';

@Injectable()
export class MatchService {

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  async createMatch(
    mode: MatchMode,
    format: MatchFormat,
    language: MatchLanguage,
    users: Pick<User, 'id'>[],
  ): Promise<Match> {
    const match = this.matchRepository.create({
      mode,
      format,
      language,
      users,
      status: MatchStatus.NOT_STARTED,
    });

    return this.matchRepository.save(match);
  }

  async startMatch(
    matchId: string
  ): Promise<void> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');

    if (match.status !== MatchStatus.NOT_STARTED) {
      throw new Error('Match cannot be started: invalid status');
    }

    match.status = MatchStatus.IN_PROGRESS;
    match.startTime = new Date();

    await this.matchRepository.save(match);
  }

  async completeMatch(
    userId: number
  ): Promise<void> {
    const match = await this.matchRepository.findOne({
      where: { status: MatchStatus.IN_PROGRESS },
      relations: ['users'],
    });

    if (!match) throw new Error('No active match found for user');

    const userInMatch = match.users.some(user => user.id === userId);
    if (!userInMatch) throw new Error('User is not in the match');

    match.status = MatchStatus.COMPLETED;
    match.endTime = new Date();

    await this.matchRepository.save(match);
  }

  async findAllMatchesByUserId(
    userId: number
  ): Promise<Match[]> {
    const matchIds = await this.matchRepository
      .createQueryBuilder('match')
      .innerJoin('match.users', 'user')
      .where('user.id = :userId', { userId })
      .select('match.id')
      .getMany();

    const ids = matchIds.map(m => m.id);

    return this.matchRepository.find({
      where: { id: In(ids) },
      relations: ['users'],
    });
  }
}
