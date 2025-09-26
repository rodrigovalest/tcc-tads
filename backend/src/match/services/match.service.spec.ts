import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { Match } from '../entities/match.entity';
import { UserMatch } from '../entities/user-match.entity';
import { User } from 'src/user/entities/user.entity';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchFormat } from '../entities/match-format.enum';
import { MatchLanguage } from '../entities/match-language.enum';
import { MatchStatus } from '../entities/match-status.enum';
import { UserQueue } from '../entities/user-queue.entity';
import { IMatchRepository } from '../repositories/match.interface';
import { IUserMatchRepository } from '../repositories/user-match.interface';

const mockMatchRepository = (): jest.Mocked<IMatchRepository> => ({
  create: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
  findAllMatchesWithAverageScore: jest.fn(),
});

const mockUserMatchRepository = (): jest.Mocked<IUserMatchRepository> => ({
  create: jest.fn(),
  saveAll: jest.fn(),
  saveOne: jest.fn(),
  findBySocketId: jest.fn(),
});

describe('MatchService', () => {
  let service: MatchService;
  let matchRepository: jest.Mocked<IMatchRepository>;
  let userMatchRepository: jest.Mocked<IUserMatchRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: 'IMatchRepository', useFactory: mockMatchRepository },
        { provide: 'IUserMatchRepository', useFactory: mockUserMatchRepository },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    matchRepository = module.get('IMatchRepository');
    userMatchRepository = module.get('IUserMatchRepository');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Group match methods', () => {
    it('createMatch_ShouldCreateMatchAndUserMatches', async () => {
      const mode = MatchMode.JUST_CHILLING;
      const format = MatchFormat.DUO;
      const language = MatchLanguage.EN;
      const users = [
        { userId: 1, socketId: 'socket1' },
        { userId: 2, socketId: 'socket2' },
      ] as UserQueue[];

      const matchEntity = { id: 'match1' } as Match;
      matchRepository.create.mockResolvedValue(matchEntity);
      matchRepository.save.mockResolvedValue(matchEntity);
      userMatchRepository.create.mockImplementation((um) => um as UserMatch);

      const result = await service.createMatch(mode, format, language, users);

      expect(matchRepository.create).toHaveBeenCalledWith(
        mode,
        format,
        language,
        MatchStatus.IN_PROGRESS,
        expect.any(Date),
      );

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

      expect(userMatchRepository.saveAll).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toEqual(matchEntity);
    });

    it('completeMatch_WithValidSocketId_ShouldCompleteMatchIfFound', async () => {
      const socketId = 'socket1';
      const match = { id: 'match1', status: MatchStatus.IN_PROGRESS } as Match;
      const userMatch = { match, user: { id: 1 } as User } as UserMatch;

      userMatchRepository.findBySocketId.mockResolvedValue(userMatch);
      matchRepository.save.mockResolvedValue(match);

      await service.completeMatch(socketId);

      expect(userMatchRepository.findBySocketId).toHaveBeenCalledWith(socketId);
      expect(matchRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MatchStatus.COMPLETED,
          endTime: expect.any(Date),
        }),
      );
    });

    it('completeMatch_WithInexistentSocketId_ShouldDoNothing', async () => {
      const socketId = 'socket1';
      userMatchRepository.findBySocketId.mockResolvedValue(null);

      await service.completeMatch(socketId);

      expect(userMatchRepository.findBySocketId).toHaveBeenCalledWith(socketId);
      expect(matchRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Solo match methods', () => {
    it('createSoloMatch_ShouldCreateSoloMatchSuccessfully', async () => {
      // Arrange
      const userId = 1;
      const mode = MatchMode.WORD_BUILDER;
      const language = MatchLanguage.EN;

      const mockMatch = {
        id: 'solo-match-123',
        mode,
        format: MatchFormat.SOLO,
        language,
        status: MatchStatus.IN_PROGRESS,
        startTime: new Date(),
      } as Match;

      const mockUserMatch = {
        user: { id: userId } as User,
        socketId: 'solo-match',
        match: mockMatch,
      } as UserMatch;

      matchRepository.create.mockResolvedValue(mockMatch);
      matchRepository.save.mockResolvedValue(mockMatch);
      userMatchRepository.create.mockReturnValue(mockUserMatch);
      userMatchRepository.saveOne.mockResolvedValue(mockUserMatch);

      // Act
      const result = await service.createSoloMatch(mode, language, userId);

      // Assert
      expect(matchRepository.create).toHaveBeenCalledWith(
        mode,
        MatchFormat.SOLO,
        language,
        MatchStatus.IN_PROGRESS,
        expect.any(Date),
      );
      expect(userMatchRepository.saveOne).toHaveBeenCalledWith(
        { id: userId } as User,
        mockMatch,
      );
      expect(result).toEqual(mockMatch);
    });

    it('completeSoloMatch_ShouldCompleteMatchSuccessfully', async () => {
      const matchId = 'solo-match-123';
      const mockMatch = {
        id: matchId,
        status: MatchStatus.IN_PROGRESS,
      } as Match;

      matchRepository.findById.mockResolvedValue(mockMatch);

      await service.completeSoloMatch(matchId);

      expect(matchRepository.findById).toHaveBeenCalledWith(matchId);
      expect(mockMatch.status).toBe(MatchStatus.COMPLETED);
      expect(mockMatch.endTime).toBeInstanceOf(Date);
      expect(matchRepository.save).toHaveBeenCalledWith(mockMatch);
    });

    it('completeSoloMatch_ShouldReturnEarlyWhenMatchNotFound', async () => {
      const matchId = 'non-existent-match';
      matchRepository.findById.mockResolvedValue(null);

      await service.completeSoloMatch(matchId);

      expect(matchRepository.findById).toHaveBeenCalledWith(matchId);
      expect(matchRepository.save).not.toHaveBeenCalled();
    });

    it('completeSoloMatch_ShouldNotUpdateWhenMatchAlreadyCompleted', async () => {
      const matchId = 'completed-match-123';
      const mockMatch = {
        id: matchId,
        status: MatchStatus.COMPLETED,
      } as Match;

      matchRepository.findById.mockResolvedValue(mockMatch);

      await service.completeSoloMatch(matchId);

      expect(matchRepository.findById).toHaveBeenCalledWith(matchId);
      expect(matchRepository.save).not.toHaveBeenCalled();
    });
  });

  it('findAllMatchesWithAverageScore_ShouldReturnMatchesWithScores', async () => {
    // Arrange
    const userId = 1;
    const mockResults = [
      { match: { id: 'match1' } as Match, averageFluencyScore: 85 },
      { match: { id: 'match2' } as Match, averageFluencyScore: null },
    ];

    matchRepository.findAllMatchesWithAverageScore.mockResolvedValue(mockResults);

    // Act
    const results = await service.findAllMatchesWithAverageScore(userId);

    // Assert
    expect(matchRepository.findAllMatchesWithAverageScore).toHaveBeenCalledWith(userId);
    expect(results).toEqual(mockResults);
  });
});
