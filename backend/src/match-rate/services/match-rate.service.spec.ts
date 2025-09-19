import { Test, TestingModule } from "@nestjs/testing";
import { MatchRate } from "../entities/match-rate.entity";
import { IMatchRateRepository } from "../repositories/match-rate.interface";
import { MatchRateService } from "./match-rate.service";
import { Match } from "src/match/entities/match.entity";
import { User } from "src/user/entities/user.entity";

const mockMatchRateRepository = (): jest.Mocked<IMatchRateRepository> => ({
  existsByMatchAndUsers: jest.fn(),
  save: jest.fn(),
});

describe('MatchRateService', () => {
  let service: MatchRateService;
  let matchRateRepository: jest.Mocked<IMatchRateRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchRateService,
        { provide: 'IMatchRateRepository', useFactory: mockMatchRateRepository },
      ],
    }).compile();

    service = module.get<MatchRateService>(MatchRateService);
    matchRateRepository = module.get('IMatchRateRepository');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createMatchRate', () => {
    it("should create and save a match rate successfully", async () => {
      // Arrange
      matchRateRepository.existsByMatchAndUsers.mockResolvedValue(false);

      const matchId = "match-123";
      const reviewerId = 1;
      const reviewedId = 2;
      const fluencyScore = 4;

      const savedMatchRate = new MatchRate();
      savedMatchRate.id = 123;
      savedMatchRate.match = { id: matchId } as Match;
      savedMatchRate.reviewer = { id: reviewerId } as User;
      savedMatchRate.reviewed = { id: reviewedId } as User;
      savedMatchRate.fluencyScore = fluencyScore;

      matchRateRepository.save.mockResolvedValue(savedMatchRate);

      // Act
      const result = await service.createMatchRate(
        matchId,
        reviewerId,
        reviewedId,
        fluencyScore,
      );

      // Assert
      expect(matchRateRepository.existsByMatchAndUsers).toHaveBeenCalledWith(
        matchId,
        reviewerId,
        reviewedId,
      );
      expect(matchRateRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          match: { id: matchId },
          reviewer: { id: reviewerId },
          reviewed: { id: reviewedId },
          fluencyScore: 4,
        }),
      );
      expect(result).toEqual(savedMatchRate);
    });

    it("should throw BadRequestException if reviewerId equals reviewedId", async () => {
      await expect(service.createMatchRate(
        "match-123",
        1,
        1,
        4,
      )).rejects.toThrow("A user cannot rate themselves.");
      expect(matchRateRepository.existsByMatchAndUsers).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if fluencyScore is out of range", async () => {
      await expect(service.createMatchRate(
        "match-123",
        1,
        2,
        0,
      )).rejects.toThrow("Fluency score must be between 1 and 5.");
    });

    it("should throw BadRequestException if rating already exists", async () => {
      matchRateRepository.existsByMatchAndUsers.mockResolvedValue(true);
      await expect(service.createMatchRate(
        "match-123",
        1,
        2,
        4,
      )).rejects.toThrow("Rating already exists for this pair of users in the match.");
    });
  });
});