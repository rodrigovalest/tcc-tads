import { Test, TestingModule } from '@nestjs/testing';
import { RoomManagerService } from './room-manager.service';

describe('RoomManagerService', () => {
  let service: RoomManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomManagerService],
    }).compile();

    service = module.get<RoomManagerService>(RoomManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConversationRoomName', () => {
    it('should generate room name with sorted user IDs', () => {
      const roomName1 = service.getConversationRoomName(1, 2);
      const roomName2 = service.getConversationRoomName(2, 1);

      expect(roomName1).toBe('conversation:1:2');
      expect(roomName2).toBe('conversation:1:2');
      expect(roomName1).toEqual(roomName2);
    });

    it('should handle same user ID', () => {
      const roomName = service.getConversationRoomName(1, 1);
      expect(roomName).toBe('conversation:1:1');
    });

    it('should generate consistent room names regardless of parameter order', () => {
      const roomName1 = service.getConversationRoomName(5, 3);
      const roomName2 = service.getConversationRoomName(3, 5);

      expect(roomName1).toBe('conversation:3:5');
      expect(roomName2).toBe('conversation:3:5');
    });
  });

  describe('getConversationId', () => {
    it('should generate conversation ID with sorted user IDs', () => {
      const conversationId1 = service.getConversationId(1, 2);
      const conversationId2 = service.getConversationId(2, 1);

      expect(conversationId1).toBe('1:2');
      expect(conversationId2).toBe('1:2');
      expect(conversationId1).toEqual(conversationId2);
    });

    it('should handle same user ID', () => {
      const conversationId = service.getConversationId(1, 1);
      expect(conversationId).toBe('1:1');
    });

    it('should generate consistent IDs regardless of parameter order', () => {
      const conversationId1 = service.getConversationId(10, 5);
      const conversationId2 = service.getConversationId(5, 10);

      expect(conversationId1).toBe('5:10');
      expect(conversationId2).toBe('5:10');
    });
  });

  describe('getUserRoomName', () => {
    it('should generate user room name', () => {
      const roomName = service.getUserRoomName(123);
      expect(roomName).toBe('user:123');
    });

    it('should handle different user IDs', () => {
      expect(service.getUserRoomName(1)).toBe('user:1');
      expect(service.getUserRoomName(999)).toBe('user:999');
    });
  });

  describe('getFriendsRoomName', () => {
    it('should generate friends room name', () => {
      const roomName = service.getFriendsRoomName(123);
      expect(roomName).toBe('friends:123');
    });

    it('should handle different user IDs', () => {
      expect(service.getFriendsRoomName(1)).toBe('friends:1');
      expect(service.getFriendsRoomName(999)).toBe('friends:999');
    });
  });

  describe('getNotificationRoomName', () => {
    it('should generate notification room name', () => {
      const roomName = service.getNotificationRoomName(123);
      expect(roomName).toBe('notifications:123');
    });

    it('should handle different user IDs', () => {
      expect(service.getNotificationRoomName(1)).toBe('notifications:1');
      expect(service.getNotificationRoomName(999)).toBe('notifications:999');
    });
  });

  describe('room naming consistency', () => {
    it('should generate unique room names for different purposes', () => {
      const userId = 123;
      
      const userRoom = service.getUserRoomName(userId);
      const friendsRoom = service.getFriendsRoomName(userId);
      const notificationRoom = service.getNotificationRoomName(userId);
      const conversationRoom = service.getConversationRoomName(userId, 456);

      const rooms = [userRoom, friendsRoom, notificationRoom, conversationRoom];
      const uniqueRooms = [...new Set(rooms)];

      expect(uniqueRooms).toHaveLength(4);
    });
  });
});