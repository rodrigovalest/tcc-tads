import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserQueue } from '../entities/user-queue.entity';
import { Repository } from 'typeorm';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';

const mockUserQueueRepository = () => ({
  delete: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
});

describe('QueueService', () => {
  let service: QueueService;
  let userQueueRepository: jest.Mocked<Repository<UserQueue>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getRepositoryToken(UserQueue),
          useFactory: mockUserQueueRepository,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    userQueueRepository = module.get(getRepositoryToken(UserQueue));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('enqueue_WithValidInput_ShouldDeletePreviousAndSaveNewEntry', async () => {
    // Arrange
    const userId = 1;
    const socketId = 'socket-123';
    const matchMode = MatchMode.JUST_CHILLING;
    const matchFormat = MatchFormat.SOLO;
    const matchLanguage = MatchLanguage.EN;
    const mockEntry = { userId, socketId, matchMode, matchFormat, matchLanguage } as UserQueue;

    userQueueRepository.create.mockReturnValue(mockEntry);

    // Act
    await service.enqueue(userId, socketId, matchMode, matchFormat, matchLanguage);

    // Assert
    expect(userQueueRepository.delete).toHaveBeenCalledWith({ userId });
    expect(userQueueRepository.create).toHaveBeenCalledWith(mockEntry);
    expect(userQueueRepository.save).toHaveBeenCalledWith(mockEntry);
  });

  it('removeUserBySocketId_WithValidSocketId_ShouldCallDelete', async () => {
    // Arrange
    const socketId = 'socket-456';

    // Act
    await service.removeUserBySocketId(socketId);

    // Assert
    expect(userQueueRepository.delete).toHaveBeenCalledWith({ socketId });
  });

  it('getQueueSize_WithValidParams_ShouldReturnCount', async () => {
    // Arrange
    const matchMode = MatchMode.JUST_CHILLING;
    const matchFormat = MatchFormat.SOLO;
    const matchLanguage = MatchLanguage.EN;
    userQueueRepository.count.mockResolvedValue(3);

    // Act
    const result = await service.getQueueSize(matchMode, matchFormat, matchLanguage);

    // Assert
    expect(userQueueRepository.count).toHaveBeenCalledWith({
      where: { matchMode, matchFormat, matchLanguage },
    });
    expect(result).toBe(3);
  });

  it('getAllFromQueue_WithValidParams_ShouldReturnOrderedList', async () => {
    // Arrange
    const matchMode = MatchMode.JUST_CHILLING;
    const matchFormat = MatchFormat.SOLO;
    const matchLanguage = MatchLanguage.EN;
    const expected = [{ userId: 1 }, { userId: 2 }];
    userQueueRepository.find.mockResolvedValue(expected as UserQueue[]);

    // Act
    const result = await service.getAllFromQueue(matchMode, matchFormat, matchLanguage);

    // Assert
    expect(userQueueRepository.find).toHaveBeenCalledWith({
      where: { matchMode, matchFormat, matchLanguage },
      order: { joinedAt: 'ASC' },
    });
    expect(result).toBe(expected);
  });

  it('dequeueUsers_WhenUsersFound_ShouldRemoveAndReturnThem', async () => {
    // Arrange
    const matchMode = MatchMode.JUST_CHILLING;
    const matchFormat = MatchFormat.SOLO;
    const matchLanguage = MatchLanguage.EN;
    const count = 2;
    const users = [{ userId: 1 }, { userId: 2 }];
    userQueueRepository.find.mockResolvedValue(users as UserQueue[]);

    // Act
    const result = await service.dequeueUsers(matchMode, matchFormat, matchLanguage, count);

    // Assert
    expect(userQueueRepository.find).toHaveBeenCalledWith({
      where: { matchMode, matchFormat, matchLanguage },
      order: { joinedAt: 'ASC' },
      take: count,
    });
    expect(userQueueRepository.remove).toHaveBeenCalledWith(users);
    expect(result).toBe(users);
  });

  it('dequeueUsers_WhenNoUsersFound_ShouldReturnEmptyArray', async () => {
    // Arrange
    const matchMode = MatchMode.JUST_CHILLING;
    const matchFormat = MatchFormat.SOLO;
    const matchLanguage = MatchLanguage.EN;
    const count = 2;
    userQueueRepository.find.mockResolvedValue([]);

    // Act
    const result = await service.dequeueUsers(matchMode, matchFormat, matchLanguage, count);

    // Assert
    expect(userQueueRepository.find).toHaveBeenCalledWith({
      where: { matchMode, matchFormat, matchLanguage },
      order: { joinedAt: 'ASC' },
      take: count,
    });
    expect(userQueueRepository.remove).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
