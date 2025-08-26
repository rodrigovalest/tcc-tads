import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MatchService } from './match.service';
import { Match } from '../entities/match.entity';
import { UserMatch } from '../entities/user-match.entity';
import { User } from 'src/user/entities/user.entity';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchFormat } from '../entities/match-format.enum';
import { MatchLanguage } from '../entities/match-language.enum';
import { MatchStatus } from '../entities/match-status.enum';
import { UserQueue } from '../entities/user-queue.entity';

const mockMatchRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

const mockUserMatchRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('MatchService', () => {
  let service: MatchService;
  let matchRepository: jest.Mocked<Repository<Match>>;
  let userMatchRepository: jest.Mocked<Repository<UserMatch>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: getRepositoryToken(Match), useFactory: mockMatchRepository },
        { provide: getRepositoryToken(UserMatch), useFactory: mockUserMatchRepository },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    matchRepository = module.get(getRepositoryToken(Match));
    userMatchRepository = module.get(getRepositoryToken(UserMatch));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createMatch_ShouldCreateMatchAndUserMatches', async () => {
    // Arrange
    const mode = MatchMode.JUST_CHILLING;
    const format = MatchFormat.DUO;
    const language = MatchLanguage.EN;
    const users = [
      { userId: 1, socketId: 'socket1' },
      { userId: 2, socketId: 'socket2' },
    ] as UserQueue[];

    const matchEntity = { id: 'match1' } as Match;
    matchRepository.create.mockReturnValue(matchEntity);
    matchRepository.save.mockResolvedValue(matchEntity);

    userMatchRepository.create.mockImplementation(um => um as UserMatch);

    // Act
    const result = await service.createMatch(
      mode,
      format,
      language,
      users,
    );

    // Assert
    expect(matchRepository.create).toHaveBeenCalledWith({
      mode: MatchMode.JUST_CHILLING,
      format: MatchFormat.DUO,
      language: MatchLanguage.EN,
      status: MatchStatus.IN_PROGRESS,
      startTime: expect.any(Date),
    });
    expect(matchRepository.save).toHaveBeenCalledWith(matchEntity);

    expect(userMatchRepository.create).toHaveBeenCalledTimes(users.length);
    expect(userMatchRepository.create).toHaveBeenCalledWith({
      user: { id: 1 } as User,
      socketId: 'socket1',
      match: matchEntity,
    });
    expect(userMatchRepository.create).toHaveBeenCalledWith({
      user: { id: 2 } as User,
      socketId: 'socket2',
      match: matchEntity,
    });

    expect(userMatchRepository.save).toHaveBeenCalledWith(expect.any(Array));
    expect(result).toEqual(matchEntity);
  });

  it('completeMatch_WithValidSocketId_ShouldCompleteMatchIfFound', async () => {
    // Arrange
    const socketId = 'socket1';
    const match = { id: 'match1', status: MatchStatus.IN_PROGRESS } as Match;
    const user = { id: 1 } as User;
    const userMatch = { match, user } as UserMatch;

    userMatchRepository.findOne.mockResolvedValue(userMatch);
    matchRepository.save.mockResolvedValue(match);

    // Act
    await service.completeMatch(socketId);

    // Assert
    expect(userMatchRepository.findOne).toHaveBeenCalledWith({
      where: { socketId },
      relations: ['match', 'user'],
    });
    expect(matchRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      status: MatchStatus.COMPLETED,
      endTime: expect.any(Date),
    }));
  });

  it('completeMatch_WithInexistentSocketId_ShouldDoNothing', async () => {
    // Arrange
    const socketId = 'socket1';

    userMatchRepository.findOne.mockResolvedValue(null);

    // Act
    await service.completeMatch(socketId);

    // Assert
    expect(userMatchRepository.findOne).toHaveBeenCalledWith({
      where: { socketId },
      relations: ['match', 'user'],
    });
    expect(matchRepository.save).not.toHaveBeenCalled();
  });

  it('findAllMatchesByUserId_ShouldReturnMatches', async () => {
    // Arrange
    const userId = 1;
    const match1 = { id: 'm1' } as Match;
    const match2 = { id: 'm2' } as Match;

    const userMatches = [
      { match: match1 } as UserMatch,
      { match: match2 } as UserMatch,
    ];

    userMatchRepository.find.mockResolvedValue(userMatches);

    // Act
    const result = await service.findAllMatchesByUserId(userId);

    // Assert
    expect(userMatchRepository.find).toHaveBeenCalledWith({
      where: { user: { id: userId } },
      relations: ['match', 'match.userMatches', 'match.userMatches.user'],
    });
    expect(result).toEqual([match1, match2]);
  });
});
