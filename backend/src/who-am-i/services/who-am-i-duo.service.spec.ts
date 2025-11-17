import { Test, TestingModule } from '@nestjs/testing';
import { WhoAmIDuoService } from './who-am-i-duo.service';
import { QueueService } from '../../match/services/queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { CountryCode } from '../../user/entities/country-code.enum';
import { MatchService } from '../../match/services/match.service';
import { Match } from '../../match/entities/match.entity';
import { MatchStatus } from '../../match/entities/match-status.enum';

describe('WhoAmIDuoService', () => {
  let service: WhoAmIDuoService;
  let queueService: jest.Mocked<QueueService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let matchService: jest.Mocked<MatchService>;

  const mockUser: IUserJwtPayload = {
    sub: 1,
    email: 'test@example.com',
    username: 'testuser',
    nationality: CountryCode.Brazil,
  };

  const mockUserQueue: UserQueue = {
    id: 1,
    userId: 1,
    username: 'testuser',
    nationality: CountryCode.Brazil,
    socketId: 'socket-id',
    matchMode: MatchMode.WHO_AM_I,
    matchFormat: MatchFormat.DUO,
    matchLanguage: MatchLanguage.EN,
    joinedAt: new Date(),
  };

  const mockMatch: Match = {
    id: 'match-id',
    mode: MatchMode.WHO_AM_I,
    format: MatchFormat.DUO,
    language: MatchLanguage.EN,
    status: MatchStatus.IN_PROGRESS,
    startTime: new Date(),
    endTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    userMatches: [],
  };

  beforeEach(async () => {
    const mockQueueService = {
      enqueue: jest.fn(),
      getQueueSize: jest.fn(),
      dequeueUsers: jest.fn(),
      findUserBySocketId: jest.fn(),
      removeUser: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const mockMatchService = {
      createMatch: jest.fn(),
      completeMatch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhoAmIDuoService,
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: MatchService,
          useValue: mockMatchService,
        },
      ],
    }).compile();

    service = module.get<WhoAmIDuoService>(WhoAmIDuoService);
    queueService = module.get(QueueService);
    eventEmitter = module.get(EventEmitter2);
    matchService = module.get(MatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enqueueDuoFormatAndTryStart', () => {
    it('should enqueue user and start match when queue has 2 users', async () => {
      queueService.getQueueSize.mockResolvedValue(2);
      queueService.dequeueUsers.mockResolvedValue([mockUserQueue, mockUserQueue]);
      matchService.createMatch.mockResolvedValue(mockMatch);

      await service.enqueueDuoFormatAndTryStart(mockUser, 'socket-id', MatchLanguage.EN);

      expect(queueService.enqueue).toHaveBeenCalledWith(
        mockUser.sub,
        mockUser.username,
        mockUser.nationality,
        'socket-id',
        MatchMode.WHO_AM_I,
        MatchFormat.DUO,
        MatchLanguage.EN
      );
      expect(queueService.getQueueSize).toHaveBeenCalledWith(
        MatchMode.WHO_AM_I,
        MatchFormat.DUO,
        MatchLanguage.EN
      );
      expect(queueService.dequeueUsers).toHaveBeenCalledWith(
        MatchMode.WHO_AM_I,
        MatchFormat.DUO,
        MatchLanguage.EN,
        2
      );
      expect(matchService.createMatch).toHaveBeenCalledWith(
        MatchMode.WHO_AM_I,
        MatchFormat.DUO,
        MatchLanguage.EN,
        [mockUserQueue, mockUserQueue]
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('who-am-i:duo:match-started', {
        user1: mockUserQueue,
        user2: mockUserQueue,
        language: MatchLanguage.EN,
        match: mockMatch,
      });
    });

    it('should not start match when queue has less than 2 users', async () => {
      queueService.getQueueSize.mockResolvedValue(1);

      await service.enqueueDuoFormatAndTryStart(mockUser, 'socket-id', MatchLanguage.EN);

      expect(queueService.enqueue).toHaveBeenCalled();
      expect(queueService.getQueueSize).toHaveBeenCalled();
      expect(queueService.dequeueUsers).not.toHaveBeenCalled();
      expect(matchService.createMatch).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove user from queue if found', async () => {
      queueService.findUserBySocketId.mockResolvedValue(mockUserQueue);

      await service.handleDisconnect('socket-id');

      expect(queueService.findUserBySocketId).toHaveBeenCalledWith('socket-id');
      expect(queueService.removeUser).toHaveBeenCalledWith(mockUserQueue);
      expect(matchService.completeMatch).not.toHaveBeenCalled();
    });

    it('should complete match if user not found in queue', async () => {
      queueService.findUserBySocketId.mockResolvedValue(null);

      await service.handleDisconnect('socket-id');

      expect(queueService.findUserBySocketId).toHaveBeenCalledWith('socket-id');
      expect(queueService.removeUser).not.toHaveBeenCalled();
      expect(matchService.completeMatch).toHaveBeenCalledWith('socket-id');
    });
  });
});
