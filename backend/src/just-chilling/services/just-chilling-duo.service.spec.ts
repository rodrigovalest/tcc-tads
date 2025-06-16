import { Test, TestingModule } from '@nestjs/testing';
import { JustChillingDuoService } from './just-chilling-duo.service';
import { QueueService } from '../../match/services/queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { UserQueue } from '../../match/entities/user-queue.entity';

describe('JustChillingDuoService', () => {
  let service: JustChillingDuoService;
  let queueServiceMock: {
    enqueue: jest.Mock;
    getQueueSize: jest.Mock;
    dequeueUsers: jest.Mock;
    removeUserBySocketId: jest.Mock;
  };
  let eventEmitterMock: {
    emit: jest.Mock;
  };

  beforeEach(async () => {
    queueServiceMock = {
      enqueue: jest.fn(),
      getQueueSize: jest.fn(),
      dequeueUsers: jest.fn(),
      removeUserBySocketId: jest.fn(),
    };

    eventEmitterMock = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JustChillingDuoService,
        { provide: QueueService, useValue: queueServiceMock },
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
    const userId = 42;
    const socketId = 'socket-abc';
    const language = MatchLanguage.EN;

    const mockUsers: UserQueue[] = [
      { userId: 1, socketId: 's1' } as UserQueue,
      { userId: 2, socketId: 's2' } as UserQueue,
    ];

    queueServiceMock.enqueue.mockResolvedValue(undefined);
    queueServiceMock.getQueueSize.mockResolvedValue(2);
    queueServiceMock.dequeueUsers.mockResolvedValue(mockUsers);

    // Act
    await service.enqueueDuoFormatAndTryStart(userId, socketId, language);

    // Assert
    expect(queueServiceMock.enqueue).toHaveBeenCalledWith(
      userId, socketId, MatchMode.JUST_CHILLING, MatchFormat.DUO, language
    );

    expect(queueServiceMock.getQueueSize).toHaveBeenCalledWith(
      MatchMode.JUST_CHILLING, MatchFormat.DUO, language
    );

    expect(queueServiceMock.dequeueUsers).toHaveBeenCalledWith(
      MatchMode.JUST_CHILLING, MatchFormat.DUO, language, 2
    );

    expect(eventEmitterMock.emit).toHaveBeenCalledWith(
      'just-chilling:duo:match-started',
      {
        user1: mockUsers[0],
        user2: mockUsers[1],
        language,
        roomId: expect.stringMatching(/^room-/),
      }
    );
  });

  it('enqueueDuoFormatAndTryStart_WithQueueSizeLessThan2_ShouldNotEmitMatchStartedEvent', async () => {
    // Arrange
    const userId = 99;
    const socketId = 'socket-def';
    const language = MatchLanguage.EN;

    queueServiceMock.enqueue.mockResolvedValue(undefined);
    queueServiceMock.getQueueSize.mockResolvedValue(1);

    // Act
    await service.enqueueDuoFormatAndTryStart(userId, socketId, language);

    // Assert
    expect(queueServiceMock.enqueue).toHaveBeenCalledWith(
      userId, socketId, MatchMode.JUST_CHILLING, MatchFormat.DUO, language
    );
    expect(queueServiceMock.getQueueSize).toHaveBeenCalledWith(
      MatchMode.JUST_CHILLING, MatchFormat.DUO, language
    );
    expect(queueServiceMock.dequeueUsers).not.toHaveBeenCalled();
    expect(eventEmitterMock.emit).not.toHaveBeenCalled();
  });

  it('handleDisconnect_WithValidSocketId_ShouldCallRemoveUserBySocketId', async () => {
    // Arrange
    const socketId = 'socket-xyz';

    // Act
    await service.handleDisconnect(socketId);

    // Assert
    expect(queueServiceMock.removeUserBySocketId).toHaveBeenCalledWith(socketId);
  });
});
