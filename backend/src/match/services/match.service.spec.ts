import { In, Repository } from "typeorm";
import { Match } from "../entities/match.entity";
import { MatchService } from "./match.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

const createQueryBuilderMock = {
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockMatchRepository = () => ({
  createQueryBuilder: jest.fn(() => createQueryBuilderMock),
  find: jest.fn(),
});

describe('MatchService', () => {
  let service: MatchService;
  let matchRepository: jest.Mocked<Repository<Match>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: getRepositoryToken(Match),
          useValue: {
            createQueryBuilder: jest.fn(() => createQueryBuilderMock),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    matchRepository = module.get(getRepositoryToken(Match));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('findAllMatchesByUserId_WithUserId_ReturnsAListOfMatches', async () => {
    // Arrange
    const userId = 1;

    const qbMatches = [
      { id: 'match1' } as Match,
      { id: 'match2' } as Match,
    ];
    createQueryBuilderMock.getMany.mockResolvedValue(qbMatches);

    const expectedMatches = [
      { id: 'match1', users: [{ id: userId }] } as Match,
      { id: 'match2', users: [{ id: userId }] } as Match,
    ];
    (matchRepository.find as jest.Mock).mockResolvedValue(expectedMatches);

    // Act
    const result = await service.findAllMatchesByUserId(userId);

    // Assert
    expect(createQueryBuilderMock.innerJoin).toHaveBeenCalledWith('match.users', 'user');
    expect(createQueryBuilderMock.where).toHaveBeenCalledWith('user.id = :userId', { userId });
    expect(matchRepository.find).toHaveBeenCalledWith({
      where: { id: In(['match1', 'match2']) },
      relations: ['users'],
    });
    expect(result).toEqual(expectedMatches);
  });
});
