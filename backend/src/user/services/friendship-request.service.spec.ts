import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FriendshipRequestService } from './friendship-request.service';
import { FriendshipRequest, FriendshipRequestStatus } from '../entities/friendship-request.entity';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';
import { SendFriendshipRequestDto } from '../dtos/requests/send-friendship-request.dto';
import { RespondFriendshipRequestDto } from '../dtos/requests/respond-friendship-request.dto';
import { CountryCode } from '../entities/country-code.enum';

describe('FriendshipRequestService', () => {
  let service: FriendshipRequestService;
  let friendshipRequestRepository: jest.Mocked<Repository<FriendshipRequest>>;
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

  const mockAddressee: User = {
    id: 2,
    username: 'addressee',
    email: 'addressee@example.com',
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

  const mockFriendshipRequest: FriendshipRequest = {
    id: 1,
    requesterId: 1,
    addresseeId: 2,
    requester: mockUser,
    addressee: mockAddressee,
    status: FriendshipRequestStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendshipRequestService,
        {
          provide: getRepositoryToken(FriendshipRequest),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Friendship),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
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

    service = module.get<FriendshipRequestService>(FriendshipRequestService);
    friendshipRequestRepository = module.get(getRepositoryToken(FriendshipRequest));
    friendshipRepository = module.get(getRepositoryToken(Friendship));
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendFriendshipRequest', () => {
    const sendRequestDto: SendFriendshipRequestDto = {
      username: 'addressee',
    };

    it('should send friendship request successfully', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(mockAddressee) // addressee
        .mockResolvedValueOnce(mockUser); // requester

      friendshipRequestRepository.findOne.mockResolvedValue(null);
      friendshipRepository.findOne.mockResolvedValue(null);
      friendshipRequestRepository.save.mockResolvedValue(mockFriendshipRequest);

      const result = await service.sendFriendshipRequest(1, sendRequestDto);

      expect(result).toEqual({
        id: mockFriendshipRequest.id,
        requester: expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
        }),
        addressee: expect.objectContaining({
          id: mockAddressee.id,
          username: mockAddressee.username,
        }),
        status: FriendshipRequestStatus.PENDING,
        createdAt: mockFriendshipRequest.createdAt,
        updatedAt: mockFriendshipRequest.updatedAt,
      });

      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(friendshipRequestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterId: 1,
          addresseeId: 2,
        })
      );
    });

    it('should throw NotFoundException when addressee not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.sendFriendshipRequest(1, sendRequestDto))
        .rejects.toThrow(NotFoundException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'addressee' },
        relations: ['languages', 'interestTopics']
      });
    });

    it('should throw BadRequestException when sending request to yourself', async () => {
      const selfUser = { ...mockUser, id: 1, username: 'testuser' };
      userRepository.findOne.mockResolvedValue(selfUser);

      await expect(service.sendFriendshipRequest(1, { username: 'testuser' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when friendship request already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockAddressee);
      friendshipRequestRepository.findOne.mockResolvedValue(mockFriendshipRequest);

      await expect(service.sendFriendshipRequest(1, sendRequestDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when users are already friends', async () => {
      userRepository.findOne.mockResolvedValue(mockAddressee);
      friendshipRequestRepository.findOne.mockResolvedValue(null);
      friendshipRepository.findOne.mockResolvedValue({} as Friendship);

      await expect(service.sendFriendshipRequest(1, sendRequestDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when requester not found', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(mockAddressee) // addressee found
        .mockResolvedValueOnce(null); // requester not found

      friendshipRequestRepository.findOne.mockResolvedValue(null);
      friendshipRepository.findOne.mockResolvedValue(null);

      await expect(service.sendFriendshipRequest(1, sendRequestDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getReceivedRequests', () => {
    it('should return received friendship requests', async () => {
      const requests = [mockFriendshipRequest];
      friendshipRequestRepository.find.mockResolvedValue(requests);

      const result = await service.getReceivedRequests(2);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockFriendshipRequest.id,
        requester: expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
        }),
        addressee: expect.objectContaining({
          id: mockAddressee.id,
          username: mockAddressee.username,
        }),
        status: FriendshipRequestStatus.PENDING,
        createdAt: mockFriendshipRequest.createdAt,
        updatedAt: mockFriendshipRequest.updatedAt,
      });

      expect(friendshipRequestRepository.find).toHaveBeenCalledWith({
        where: { addresseeId: 2, status: FriendshipRequestStatus.PENDING },
        relations: ['requester', 'requester.languages', 'requester.interestTopics', 'addressee', 'addressee.languages', 'addressee.interestTopics'],
        order: { createdAt: 'DESC' }
      });
    });

    it('should return empty array when no requests found', async () => {
      friendshipRequestRepository.find.mockResolvedValue([]);

      const result = await service.getReceivedRequests(2);

      expect(result).toEqual([]);
    });
  });

  describe('getSentRequests', () => {
    it('should return sent friendship requests', async () => {
      const requests = [mockFriendshipRequest];
      friendshipRequestRepository.find.mockResolvedValue(requests);

      const result = await service.getSentRequests(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockFriendshipRequest.id,
        requester: expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
        }),
        addressee: expect.objectContaining({
          id: mockAddressee.id,
          username: mockAddressee.username,
        }),
        status: FriendshipRequestStatus.PENDING,
        createdAt: mockFriendshipRequest.createdAt,
        updatedAt: mockFriendshipRequest.updatedAt,
      });

      expect(friendshipRequestRepository.find).toHaveBeenCalledWith({
        where: { requesterId: 1, status: FriendshipRequestStatus.PENDING },
        relations: ['addressee', 'addressee.languages', 'addressee.interestTopics', 'requester', 'requester.languages', 'requester.interestTopics'],
        order: { createdAt: 'DESC' }
      });
    });

    it('should return empty array when no requests found', async () => {
      friendshipRequestRepository.find.mockResolvedValue([]);

      const result = await service.getSentRequests(1);

      expect(result).toEqual([]);
    });
  });

  describe('respondToRequest', () => {
    const respondDto: RespondFriendshipRequestDto = {
      status: FriendshipRequestStatus.ACCEPTED,
    };

    it('should accept friendship request and create friendship', async () => {
      friendshipRequestRepository.findOne.mockResolvedValue(mockFriendshipRequest);
      friendshipRepository.save.mockResolvedValue([{} as Friendship, {} as Friendship] as any);
      friendshipRequestRepository.remove.mockResolvedValue({} as FriendshipRequest);

      await service.respondToRequest(2, 1, respondDto);

      expect(friendshipRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ userId: 1, friendId: 2 }),
        expect.objectContaining({ userId: 2, friendId: 1 }),
      ]);
      expect(friendshipRequestRepository.remove).toHaveBeenCalledWith(mockFriendshipRequest);
    });

    it('should reject friendship request and remove it', async () => {
      const rejectDto: RespondFriendshipRequestDto = {
        status: FriendshipRequestStatus.REJECTED,
      };

      friendshipRequestRepository.findOne.mockResolvedValue(mockFriendshipRequest);
      friendshipRequestRepository.remove.mockResolvedValue({} as FriendshipRequest);

      await service.respondToRequest(2, 1, rejectDto);

      expect(friendshipRepository.save).not.toHaveBeenCalled();
      expect(friendshipRequestRepository.remove).toHaveBeenCalledWith(mockFriendshipRequest);
    });

    it('should throw NotFoundException when request not found', async () => {
      friendshipRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.respondToRequest(2, 1, respondDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should find request with correct parameters', async () => {
      friendshipRequestRepository.findOne.mockResolvedValue(mockFriendshipRequest);
      friendshipRepository.save.mockResolvedValue([{} as Friendship, {} as Friendship] as any);

      await service.respondToRequest(2, 1, respondDto);

      expect(friendshipRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, addresseeId: 2, status: FriendshipRequestStatus.PENDING },
        relations: ['requester', 'addressee']
      });
    });
  });

  describe('cancelRequest', () => {
    it('should cancel friendship request successfully', async () => {
      friendshipRequestRepository.findOne.mockResolvedValue(mockFriendshipRequest);
      friendshipRequestRepository.remove.mockResolvedValue({} as FriendshipRequest);

      await service.cancelRequest(1, 1);

      expect(friendshipRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, requesterId: 1, status: FriendshipRequestStatus.PENDING }
      });
      expect(friendshipRequestRepository.remove).toHaveBeenCalledWith(mockFriendshipRequest);
    });

    it('should throw NotFoundException when request not found', async () => {
      friendshipRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelRequest(1, 1))
        .rejects.toThrow(NotFoundException);
    });

    it('should only allow requester to cancel their own request', async () => {
      friendshipRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelRequest(2, 1)) // Different user trying to cancel
        .rejects.toThrow(NotFoundException);

      expect(friendshipRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, requesterId: 2, status: FriendshipRequestStatus.PENDING }
      });
    });
  });
});