import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { ChatService } from './chat.service';
import { ConnectionManagerService } from './connection-manager.service';
import { RoomManagerService } from './room-manager.service';
import { Server } from 'socket.io';

describe('NotificationService', () => {
  let service: NotificationService;
  let chatService: ChatService;
  let connectionManager: ConnectionManagerService;
  let roomManager: RoomManagerService;

  const mockChatService = {
    getUserFriends: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockConnectionManager = {
    isUserOnline: jest.fn(),
  };

  const mockRoomManager = {
    getConversationRoomName: jest.fn(),
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as unknown as Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
        {
          provide: ConnectionManagerService,
          useValue: mockConnectionManager,
        },
        {
          provide: RoomManagerService,
          useValue: mockRoomManager,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    chatService = module.get<ChatService>(ChatService);
    connectionManager = module.get<ConnectionManagerService>(ConnectionManagerService);
    roomManager = module.get<RoomManagerService>(RoomManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifyFriendsOnline', () => {
    const mockFriends = [
      { id: 2, username: 'friend1' },
      { id: 3, username: 'friend2' },
      { id: 4, username: 'friend3' },
    ];

    const mockUser = {
      id: 1,
      username: 'testuser',
    };

    it('should notify online friends when user comes online', async () => {
      mockChatService.getUserFriends.mockResolvedValue(mockFriends);
      mockChatService.getUserById.mockResolvedValue(mockUser);
      mockConnectionManager.isUserOnline
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      
      mockRoomManager.getConversationRoomName
        .mockReturnValueOnce('conversation:1:2')
        .mockReturnValueOnce('conversation:1:4');

      await service.notifyFriendsOnline(mockServer, 1);

      expect(mockChatService.getUserFriends).toHaveBeenCalledWith(1);
      expect(mockConnectionManager.isUserOnline).toHaveBeenCalledTimes(3);
      expect(mockRoomManager.getConversationRoomName).toHaveBeenCalledTimes(2);
      expect(mockServer.to).toHaveBeenCalledWith('conversation:1:2');
      expect(mockServer.to).toHaveBeenCalledWith('conversation:1:4');
      expect(mockServer.emit).toHaveBeenCalledTimes(2);
      expect(mockServer.emit).toHaveBeenCalledWith('friend-online', {
        userId: 1,
        username: 'testuser'
      });
    });

    it('should not notify offline friends', async () => {
      mockChatService.getUserFriends.mockResolvedValue(mockFriends);
      mockChatService.getUserById.mockResolvedValue(mockUser);
      mockConnectionManager.isUserOnline.mockReturnValue(false);

      await service.notifyFriendsOnline(mockServer, 1);

      expect(mockServer.to).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
    });

    it('should handle user with no friends', async () => {
      mockChatService.getUserFriends.mockResolvedValue([]);
      mockChatService.getUserById.mockResolvedValue(mockUser);

      await service.notifyFriendsOnline(mockServer, 1);

      expect(mockConnectionManager.isUserOnline).not.toHaveBeenCalled();
      expect(mockServer.to).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockChatService.getUserFriends.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(service.notifyFriendsOnline(mockServer, 1)).resolves.toBeUndefined();

      expect(mockServer.to).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
    });
  });

  describe('notifyFriendsOffline', () => {
    const mockFriends = [
      { id: 2, username: 'friend1' },
      { id: 3, username: 'friend2' },
    ];

    const mockUser = {
      id: 1,
      username: 'testuser',
    };

    it('should notify online friends when user goes offline', async () => {
      mockChatService.getUserFriends.mockResolvedValue(mockFriends);
      mockChatService.getUserById.mockResolvedValue(mockUser);
      mockConnectionManager.isUserOnline
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      mockRoomManager.getConversationRoomName.mockReturnValueOnce('conversation:1:2');

      await service.notifyFriendsOffline(mockServer, 1);

      expect(mockServer.to).toHaveBeenCalledWith('conversation:1:2');
      expect(mockServer.emit).toHaveBeenCalledWith('friend-offline', {
        userId: 1,
        username: 'testuser'
      });
    });

    it('should handle errors gracefully', async () => {
      mockChatService.getUserFriends.mockRejectedValue(new Error('Database error'));

      await expect(service.notifyFriendsOffline(mockServer, 1)).resolves.toBeUndefined();

      expect(mockServer.to).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
    });
  });

  describe('getUsername (private method)', () => {
    it('should return username when user exists', async () => {
      const mockUser = { username: 'testuser' };
      mockChatService.getUserById.mockResolvedValue(mockUser);

      const username = await (service as any).getUsername(1);

      expect(username).toBe('testuser');
    });

    it('should return "Unknown" when user not found', async () => {
      mockChatService.getUserById.mockResolvedValue(null);

      const username = await (service as any).getUsername(1);

      expect(username).toBe('Unknown');
    });

    it('should return "Unknown" when error occurs', async () => {
      mockChatService.getUserById.mockRejectedValue(new Error('Database error'));

      const username = await (service as any).getUsername(1);

      expect(username).toBe('Unknown');
    });
  });
});