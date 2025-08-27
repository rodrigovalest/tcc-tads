import { Test, TestingModule } from '@nestjs/testing';
import { UserInterestTopicService } from './user-interest-topic.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInterestTopic } from '../entities/user-interest-topic.entity';
import { User } from '../entities/user.entity';
import { CountryCode } from '../entities/country-code.enum';

describe('UserInterestTopicService', () => {
  let service: UserInterestTopicService;
  let repository: jest.Mocked<Repository<UserInterestTopic>>;

  const mockRepository = {
    save: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInterestTopicService,
        {
          provide: getRepositoryToken(UserInterestTopic),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserInterestTopicService>(UserInterestTopicService);
    repository = module.get(getRepositoryToken(UserInterestTopic));
    jest.clearAllMocks();
  });

  const createTestUser = (): User => {
    const user = new User('testuser', 'test@example.com', 'hashedPassword', CountryCode.Brazil);
    user.id = 1;
    return user;
  };

  const createTestUserInterestTopic = (topic: string): UserInterestTopic => {
    const userInterestTopic = new UserInterestTopic();
    userInterestTopic.id = 1;
    userInterestTopic.userId = 1;
    userInterestTopic.topic = topic;
    userInterestTopic.createdAt = new Date();
    return userInterestTopic;
  };

  describe('createUserInterestTopics', () => {
    it('should create user interest topics successfully', async () => {
      // Arrange
      const user = createTestUser();
      const topicsData = ['technology', 'sports', 'music'];
      const expectedUserInterestTopics = [
        createTestUserInterestTopic('technology'),
        createTestUserInterestTopic('sports'),
        createTestUserInterestTopic('music'),
      ];

      repository.save.mockResolvedValue(expectedUserInterestTopics as any);

      // Act
      const result = await service.createUserInterestTopics(user, topicsData);

      // Assert
      expect(result).toEqual(expectedUserInterestTopics);
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: user.id,
            user: user,
            topic: 'technology',
          }),
          expect.objectContaining({
            userId: user.id,
            user: user,
            topic: 'sports',
          }),
          expect.objectContaining({
            userId: user.id,
            user: user,
            topic: 'music',
          }),
        ])
      );
    });

    it('should return empty array when topicsData is empty', async () => {
      // Arrange
      const user = createTestUser();
      const topicsData: string[] = [];

      // Act
      const result = await service.createUserInterestTopics(user, topicsData);

      // Assert
      expect(result).toEqual([]);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return empty array when topicsData is not an array', async () => {
      // Arrange
      const user = createTestUser();
      const topicsData = null as any;

      // Act
      const result = await service.createUserInterestTopics(user, topicsData);

      // Assert
      expect(result).toEqual([]);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should filter out invalid topic data', async () => {
      // Arrange
      const user = createTestUser();
      const topicsData = ['technology', '', '   ', 'sports', null, undefined] as any[];
      const expectedUserInterestTopics = [
        createTestUserInterestTopic('technology'),
        createTestUserInterestTopic('sports'),
      ];

      repository.save.mockResolvedValue(expectedUserInterestTopics as any);

      // Act
      const result = await service.createUserInterestTopics(user, topicsData);

      // Assert
      expect(result).toEqual(expectedUserInterestTopics);
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            topic: 'technology',
          }),
          expect.objectContaining({
            topic: 'sports',
          }),
        ])
      );
    });

    it('should trim whitespace from topics', async () => {
      // Arrange
      const user = createTestUser();
      const topicsData = ['  technology  ', ' sports ', 'music'];
      const expectedUserInterestTopics = [
        createTestUserInterestTopic('technology'),
        createTestUserInterestTopic('sports'),
        createTestUserInterestTopic('music'),
      ];

      repository.save.mockResolvedValue(expectedUserInterestTopics as any);

      // Act
      const result = await service.createUserInterestTopics(user, topicsData);

      // Assert
      expect(result).toEqual(expectedUserInterestTopics);
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ topic: 'technology' }),
          expect.objectContaining({ topic: 'sports' }),
          expect.objectContaining({ topic: 'music' }),
        ])
      );
    });
  });

  describe('updateUserInterestTopics', () => {
    it('should update user interest topics successfully', async () => {
      // Arrange
      const userId = 1;
      const topicsData = ['technology', 'sports'];
      const expectedUserInterestTopics = [
        createTestUserInterestTopic('technology'),
        createTestUserInterestTopic('sports'),
      ];

      repository.delete.mockResolvedValue({ affected: 3 } as any);
      repository.save.mockResolvedValue(expectedUserInterestTopics as any);

      // Act
      const result = await service.updateUserInterestTopics(userId, topicsData);

      // Assert
      expect(result).toEqual(expectedUserInterestTopics);
      expect(repository.delete).toHaveBeenCalledWith({ userId });
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId,
            topic: 'technology',
          }),
          expect.objectContaining({
            userId,
            topic: 'sports',
          }),
        ])
      );
    });

    it('should delete existing topics and return empty array when no new topics', async () => {
      // Arrange
      const userId = 1;
      const topicsData: string[] = [];

      repository.delete.mockResolvedValue({ affected: 3 } as any);

      // Act
      const result = await service.updateUserInterestTopics(userId, topicsData);

      // Assert
      expect(result).toEqual([]);
      expect(repository.delete).toHaveBeenCalledWith({ userId });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return empty array when all topics are invalid', async () => {
      // Arrange
      const userId = 1;
      const topicsData = ['', '   ', null, undefined] as any[];

      repository.delete.mockResolvedValue({ affected: 3 } as any);

      // Act
      const result = await service.updateUserInterestTopics(userId, topicsData);

      // Assert
      expect(result).toEqual([]);
      expect(repository.delete).toHaveBeenCalledWith({ userId });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('parseInterestTopicsData', () => {
    it('should parse valid JSON string', () => {
      // Arrange
      const jsonString = '["technology","sports","music"]';
      const expectedData = ['technology', 'sports', 'music'];

      // Act
      const result = service.parseInterestTopicsData(jsonString);

      // Assert
      expect(result).toEqual(expectedData);
    });

    it('should return array when input is already an array', () => {
      // Arrange
      const arrayData = ['technology', 'sports', 'music'];

      // Act
      const result = service.parseInterestTopicsData(arrayData);

      // Assert
      expect(result).toEqual(arrayData);
    });

    it('should return empty array when JSON parsing fails', () => {
      // Arrange
      const invalidJson = 'invalid json string';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = service.parseInterestTopicsData(invalidJson);

      // Assert
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse interestTopics JSON:', expect.any(SyntaxError));
      
      consoleSpy.mockRestore();
    });

    it('should return empty array when input is not string or array', () => {
      // Arrange
      const invalidInput = { someProperty: 'value' };

      // Act
      const result = service.parseInterestTopicsData(invalidInput as any);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when input is null', () => {
      // Act
      const result = service.parseInterestTopicsData(null as any);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when input is undefined', () => {
      // Act
      const result = service.parseInterestTopicsData(undefined as any);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle complex JSON with objects', () => {
      // Arrange
      const jsonString = '[{"name":"technology"},{"name":"sports"}]';
      const expectedData = [{ name: 'technology' }, { name: 'sports' }];

      // Act
      const result = service.parseInterestTopicsData(jsonString);

      // Assert
      expect(result).toEqual(expectedData);
    });
  });
});
