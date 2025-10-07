import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';
import { CountryCode } from '../entities/country-code.enum';

describe('FriendshipService', () => {
  let service: FriendshipService;
  let friendshipRepository: jest.Mocked<Repository<Friendship>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    nationality: CountryCode.Brazil,
    photo: undefined,
    personalDescription: undefined,
    languages: [],
    interestTopics: [],
    userMatches: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    lastLoginAt: new Date(),
  };

  const mockFriend: User = {
    id: 2,
    username: 'frienduser',
    email: 'friend@example.com',
    password: 'hashedpassword',
    nationality: CountryCode.UnitedStates,
    photo: undefined,
    personalDescription: undefined,
    languages: [],
    interestTopics: [],
    userMatches: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    lastLoginAt: new Date(),
  };

  const mockFriendship: Friendship = {
    id: 1,
    userId: 1,
    friendId: 2,
    user: mockUser,
    friend: mockFriend,
    createdAt: new Date(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  } as unknown as jest.Mocked<SelectQueryBuilder<Friendship>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendshipService,
        {
          provide: getRepositoryToken(Friendship),
          useValue: {
            find: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FriendshipService>(FriendshipService);
    friendshipRepository = module.get(getRepositoryToken(Friendship));
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFriends', () => {
    it('should return list of friends', async () => {
      const friendships = [mockFriendship];
      friendshipRepository.find.mockResolvedValue(friendships);

      const result = await service.getFriends(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockFriendship.id,
        user: expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
        }),
        friend: expect.objectContaining({
          id: mockFriend.id,
          username: mockFriend.username,
        }),
        createdAt: mockFriendship.createdAt,
      });

      expect(friendshipRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['user', 'user.languages', 'user.interestTopics', 'friend', 'friend.languages', 'friend.interestTopics'],
        order: { createdAt: 'DESC' }
      });
    });

    it('should filter out friendships without user or friend', async () => {
      const incompleteFriendship = {
        ...mockFriendship,
        friend: null,
      } as any;
      
      const friendships = [mockFriendship, incompleteFriendship];
      friendshipRepository.find.mockResolvedValue(friendships as Friendship[]);

      const result = await service.getFriends(1);

      expect(result).toHaveLength(1);
      expect(result[0].friend.id).toBe(2);
    });

    it('should return empty array when no friends found', async () => {
      friendshipRepository.find.mockResolvedValue([]);

      const result = await service.getFriends(1);

      expect(result).toEqual([]);
    });

    it('should order friends by creation date descending', async () => {
      friendshipRepository.find.mockResolvedValue([mockFriendship]);

      await service.getFriends(1);

      expect(friendshipRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' }
        })
      );
    });
  });

  describe('searchFriends', () => {
    it('should search friends by username', async () => {
      const friendships = [mockFriendship];
      mockQueryBuilder.getMany.mockResolvedValue(friendships);

      const result = await service.searchFriends(1, 'friend');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockFriendship.id,
        user: expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
        }),
        friend: expect.objectContaining({
          id: mockFriend.id,
          username: mockFriend.username,
        }),
        createdAt: mockFriendship.createdAt,
      });

      expect(friendshipRepository.createQueryBuilder).toHaveBeenCalledWith('friendship');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(6);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('friendship.userId = :userId', { userId: 1 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('friend.username ILIKE :searchTerm', { searchTerm: '%friend%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('friendship.createdAt', 'DESC');
    });

    it('should return empty array when no matching friends found', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.searchFriends(1, 'nonexistent');

      expect(result).toEqual([]);
    });

    it('should filter out incomplete friendships in search results', async () => {
      const incompleteFriendship = {
        ...mockFriendship,
        user: null,
      } as any;
      
      mockQueryBuilder.getMany.mockResolvedValue([mockFriendship, incompleteFriendship] as Friendship[]);

      const result = await service.searchFriends(1, 'friend');

      expect(result).toHaveLength(1);
      expect(result[0].user.id).toBe(1);
    });

    it('should perform case-insensitive search', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockFriendship]);

      await service.searchFriends(1, 'FRIEND');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'friend.username ILIKE :searchTerm', 
        { searchTerm: '%FRIEND%' }
      );
    });

    it('should join all necessary relations', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockFriendship]);

      await service.searchFriends(1, 'friend');

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('friendship.user', 'user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('user.languages', 'userLanguages');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('user.interestTopics', 'userInterestTopics');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('friendship.friend', 'friend');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('friend.languages', 'languages');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('friend.interestTopics', 'interestTopics');
    });
  });

  describe('removeFriend', () => {
    it('should remove friendship successfully', async () => {
      const friendships = [
        { ...mockFriendship, userId: 1, friendId: 2 },
        { ...mockFriendship, id: 2, userId: 2, friendId: 1 }
      ];
      friendshipRepository.find.mockResolvedValue(friendships);
      friendshipRepository.remove.mockResolvedValue(friendships as any);

      await service.removeFriend(1, 2);

      expect(friendshipRepository.find).toHaveBeenCalledWith({
        where: [
          { userId: 1, friendId: 2 },
          { userId: 2, friendId: 1 }
        ]
      });
      expect(friendshipRepository.remove).toHaveBeenCalledWith(friendships);
    });

    it('should throw NotFoundException when friendship not found', async () => {
      friendshipRepository.find.mockResolvedValue([]);

      await expect(service.removeFriend(1, 999))
        .rejects.toThrow(NotFoundException);

      expect(friendshipRepository.remove).not.toHaveBeenCalled();
    });

    it('should find both directions of friendship', async () => {
      friendshipRepository.find.mockResolvedValue([]);

      try {
        await service.removeFriend(1, 2);
      } catch (error) {
        // Expected to throw
      }

      expect(friendshipRepository.find).toHaveBeenCalledWith({
        where: [
          { userId: 1, friendId: 2 },
          { userId: 2, friendId: 1 }
        ]
      });
    });

    it('should remove all found friendship records', async () => {
      const friendship1 = { ...mockFriendship, id: 1, userId: 1, friendId: 2 };
      const friendship2 = { ...mockFriendship, id: 2, userId: 2, friendId: 1 };
      const friendships = [friendship1, friendship2];
      
      friendshipRepository.find.mockResolvedValue(friendships);
      friendshipRepository.remove.mockResolvedValue(friendships as any);

      await service.removeFriend(1, 2);

      expect(friendshipRepository.remove).toHaveBeenCalledWith(friendships);
    });

    it('should handle single direction friendship removal', async () => {
      const singleFriendship = [{ ...mockFriendship, userId: 1, friendId: 2 }];
      friendshipRepository.find.mockResolvedValue(singleFriendship);
      friendshipRepository.remove.mockResolvedValue(singleFriendship as any);

      await service.removeFriend(1, 2);

      expect(friendshipRepository.remove).toHaveBeenCalledWith(singleFriendship);
    });
  });
});