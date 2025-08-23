import { Test, TestingModule } from '@nestjs/testing';
import { JustChillingDuoService } from './just-chilling-duo.service';
import { QueueService } from '../../match/services/queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { CountryCode } from '../../user/entities/country-code.enum';
import { MatchService } from '../../match/services/match.service';
import { Match } from 'src/match/entities/match.entity';

const queueServiceMock = {
  enqueue: jest.fn(),
  getQueueSize: jest.fn(),
  dequeueUsers: jest.fn(),
  removeUser: jest.fn(),
  findUserBySocketId: jest.fn(),
};

const matchServiceMock = {
  createMatch: jest.fn(),
  startMatch: jest.fn(),
  completeMatch: jest.fn(),
  findAllMatchesByUserId: jest.fn(),
};

const eventEmitterMock = {
  emit: jest.fn(),
};

describe('JustChillingDuoService', () => {
  let service: JustChillingDuoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JustChillingDuoService,
        { provide: QueueService, useValue: queueServiceMock },
        { provide: MatchService, useValue: matchServiceMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();

    service = module.get<JustChillingDuoService>(JustChillingDuoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('enqueueDuoFormatAndTryStart_WithQueueSize2_ShouldEmitMatchStartedEvent', async () => {
    // Arrange
    const user: IUserJwtPayload = {
      sub: 1,
      email: 'user@email.com',
      username: 'user',
      nationality: CountryCode.Afghanistan
    };
    const socketId = 'socket-abc';
    const language = MatchLanguage.EN;

    const mockUsers: UserQueue[] = [
      { userId: 1, socketId: 's1' } as UserQueue,
      { userId: 2, socketId: 's2' } as UserQueue,
    ];

    queueServiceMock.enqueue.mockResolvedValue(undefined);
    queueServiceMock.getQueueSize.mockResolvedValue(2);
    queueServiceMock.dequeueUsers.mockResolvedValue(mockUsers);
    
    const mockMatch: Match = { id: 'room-123' } as Match;
    matchServiceMock.createMatch.mockResolvedValue(mockMatch);

    // Act
    await service.enqueueDuoFormatAndTryStart(user, socketId, language);

    // Assert
    expect(queueServiceMock.enqueue).toHaveBeenCalledWith(
      user.sub, user.username, user.nationality, socketId, MatchMode.JUST_CHILLING, MatchFormat.DUO, language
    );

    expect(queueServiceMock.getQueueSize).toHaveBeenCalledWith(
      MatchMode.JUST_CHILLING, MatchFormat.DUO, language
    );

    expect(queueServiceMock.dequeueUsers).toHaveBeenCalledWith(
      MatchMode.JUST_CHILLING, MatchFormat.DUO, language, 2
    );

    expect(matchServiceMock.createMatch).toHaveBeenCalledWith(
      MatchMode.JUST_CHILLING,
      MatchFormat.DUO,
      language,
      [{ id: mockUsers[0].userId }, { id: mockUsers[1].userId }]
    );

    expect(eventEmitterMock.emit).toHaveBeenCalledWith(
      'just-chilling:duo:match-started',
      {
        user1: mockUsers[0],
        user2: mockUsers[1],
        language,
        match: mockMatch,
      }
    );
  });

  it('enqueueDuoFormatAndTryStart_WithQueueSizeLessThan2_ShouldNotEmitMatchStartedEvent', async () => {
    // Arrange
    const user: IUserJwtPayload = {
      sub: 1,
      email: 'user@email.com',
      username: 'user',
      nationality: CountryCode.Afghanistan
    };
    const socketId = 'socket-def';
    const language = MatchLanguage.EN;

    queueServiceMock.enqueue.mockResolvedValue(undefined);
    queueServiceMock.getQueueSize.mockResolvedValue(1);

    // Act
    await service.enqueueDuoFormatAndTryStart(user, socketId, language);

    // Assert
    expect(queueServiceMock.enqueue).toHaveBeenCalledWith(
      user.sub, user.username, user.nationality, socketId, MatchMode.JUST_CHILLING, MatchFormat.DUO, language
    );
    expect(queueServiceMock.getQueueSize).toHaveBeenCalledWith(
      MatchMode.JUST_CHILLING, MatchFormat.DUO, language
    );
    expect(queueServiceMock.dequeueUsers).not.toHaveBeenCalled();
    expect(eventEmitterMock.emit).not.toHaveBeenCalled();
    expect(matchServiceMock.createMatch).not.toHaveBeenCalled();
  });

  it('handleDisconnect_WithValidSocketId_ShouldCallRemoveUserBySocketId', async () => {
    // Arrange
    const socketId = 'socket-xyz';
    const mockUser: UserQueue = { userId: 1, socketId } as UserQueue;
    queueServiceMock.findUserBySocketId.mockResolvedValue(mockUser);

    // Act
    await service.handleDisconnect(socketId);

    // Assert
    expect(queueServiceMock.findUserBySocketId).toHaveBeenCalledTimes(1);
    expect(queueServiceMock.findUserBySocketId).toHaveBeenCalledWith(socketId);
    expect(queueServiceMock.removeUser).toHaveBeenCalledWith(mockUser);
  });

  it('handleDisconnect_WithInexistentSocketId_ShouldCallFindUserBySocketIdAndReturn', async () => {
    // Arrange
    const socketId = 'socket-xyz';
    queueServiceMock.findUserBySocketId.mockResolvedValue(null);

    // Act
    await service.handleDisconnect(socketId);

    // Assert
    expect(queueServiceMock.findUserBySocketId).toHaveBeenCalledTimes(1);
    expect(queueServiceMock.findUserBySocketId).toHaveBeenCalledWith(socketId);
    expect(queueServiceMock.removeUser).not.toHaveBeenCalled();
  });
});
