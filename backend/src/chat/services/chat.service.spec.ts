import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Friendship } from '../../user/entities/friendship.entity';
import { CountryCode } from '../../user/entities/country-code.enum';

describe('ChatService', () => {
  let service: ChatService;
  let userRepository: Repository<User>;
  let friendshipRepository: Repository<Friendship>;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockFriendshipRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    nationality: CountryCode.UnitedStates,
    personalDescription: undefined,
    photo: undefined,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    languages: [],
    interestTopics: [],
    userMatches: [],
  };

  const mockFriendship = {
    id: 1,
    userId: 1,
    friendId: 2,
    user: mockUser,
    friend: { ...mockUser, id: 2, username: 'friend' },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Friendship),
          useValue: mockFriendshipRepository,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    friendshipRepository = module.get<Repository<Friendship>>(getRepositoryToken(Friendship));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateFriendship', () => {
    it('should return true when friendship exists', async () => {
      mockFriendshipRepository.findOne.mockResolvedValue(mockFriendship);

      const result = await service.validateFriendship(1, 2);

      expect(result).toBe(true);
      expect(mockFriendshipRepository.findOne).toHaveBeenCalledWith({
        where: [
          { userId: 1, friendId: 2 },
          { userId: 2, friendId: 1 }
        ]
      });
    });

    it('should return false when friendship does not exist', async () => {
      mockFriendshipRepository.findOne.mockResolvedValue(null);

      const result = await service.validateFriendship(1, 2);

      expect(result).toBe(false);
    });
  });

  describe('getUserFriends', () => {
    it('should return user friends list', async () => {
      const mockFriendships = [
        { ...mockFriendship, userId: 1, friendId: 2 },
        { ...mockFriendship, id: 2, userId: 3, friendId: 1 },
      ];

      mockFriendshipRepository.find.mockResolvedValue(mockFriendships);

      const result = await service.getUserFriends(1);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 2,
        username: 'friend'
      });
      expect(mockFriendshipRepository.find).toHaveBeenCalledWith({
        where: [
          { userId: 1 },
          { friendId: 1 }
        ],
        relations: ['user', 'friend']
      });
    });

    it('should return empty array when user has no friends', async () => {
      mockFriendshipRepository.find.mockResolvedValue([]);

      const result = await service.getUserFriends(1);

      expect(result).toHaveLength(0);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['languages', 'interestTopics']
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });

      const result = await service.userExists(1);

      expect(result).toBe(true);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id']
      });
    });

    it('should return false when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.userExists(999);

      expect(result).toBe(false);
    });
  });

  describe('validateChatParticipants', () => {
    it('should return valid when both users exist and are friends', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });
      mockFriendshipRepository.findOne.mockResolvedValue(mockFriendship);

      const result = await service.validateChatParticipants(1, 2);

      expect(result).toEqual({ isValid: true });
    });

    it('should return invalid when sender does not exist', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 2 });

      const result = await service.validateChatParticipants(999, 2);

      expect(result).toEqual({
        isValid: false,
        reason: 'Sender not found'
      });
    });

    it('should return invalid when receiver does not exist', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce(null);

      const result = await service.validateChatParticipants(1, 999);

      expect(result).toEqual({
        isValid: false,
        reason: 'Receiver not found'
      });
    });

    it('should return invalid when users are not friends', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });
      mockFriendshipRepository.findOne.mockResolvedValue(null);

      const result = await service.validateChatParticipants(1, 2);

      expect(result).toEqual({
        isValid: false,
        reason: 'Users are not friends'
      });
    });
  });
});