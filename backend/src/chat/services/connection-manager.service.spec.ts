import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerService } from './connection-manager.service';

describe('ConnectionManagerService', () => {
  let service: ConnectionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionManagerService],
    }).compile();

    service = module.get<ConnectionManagerService>(ConnectionManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addConnection', () => {
    it('should add new connection for user', () => {
      service.addConnection(1, 'socket1');

      expect(service.isUserOnline(1)).toBe(true);
      expect(service.getUserConnections(1)).toContain('socket1');
      expect(service.getUserIdBySocket('socket1')).toBe(1);
    });

    it('should add multiple connections for same user', () => {
      service.addConnection(1, 'socket1');
      service.addConnection(1, 'socket2');

      const connections = service.getUserConnections(1);
      expect(connections.size).toBe(2);
      expect(connections).toContain('socket1');
      expect(connections).toContain('socket2');
    });
  });

  describe('removeConnection', () => {
    it('should remove connection and return userId', () => {
      service.addConnection(1, 'socket1');
      
      const userId = service.removeConnection('socket1');

      expect(userId).toBe(1);
      expect(service.isUserOnline(1)).toBe(false);
      expect(service.getUserIdBySocket('socket1')).toBeUndefined();
    });

    it('should return null for non-existent socket', () => {
      const userId = service.removeConnection('nonexistent');
      expect(userId).toBeNull();
    });

    it('should keep user online if they have other connections', () => {
      service.addConnection(1, 'socket1');
      service.addConnection(1, 'socket2');
      
      service.removeConnection('socket1');

      expect(service.isUserOnline(1)).toBe(true);
      expect(service.getUserConnections(1)).toContain('socket2');
      expect(service.getUserConnections(1)).not.toContain('socket1');
    });

    it('should mark user offline when removing last connection', () => {
      service.addConnection(1, 'socket1');
      service.addConnection(1, 'socket2');
      
      service.removeConnection('socket1');
      service.removeConnection('socket2');

      expect(service.isUserOnline(1)).toBe(false);
      expect(service.getUserConnections(1).size).toBe(0);
    });
  });

  describe('isUserOnline', () => {
    it('should return true for online user', () => {
      service.addConnection(1, 'socket1');
      expect(service.isUserOnline(1)).toBe(true);
    });

    it('should return false for offline user', () => {
      expect(service.isUserOnline(999)).toBe(false);
    });
  });

  describe('getUserConnections', () => {
    it('should return user connections', () => {
      service.addConnection(1, 'socket1');
      service.addConnection(1, 'socket2');

      const connections = service.getUserConnections(1);
      expect(connections.size).toBe(2);
      expect(connections).toContain('socket1');
      expect(connections).toContain('socket2');
    });

    it('should return empty set for user with no connections', () => {
      const connections = service.getUserConnections(999);
      expect(connections.size).toBe(0);
    });
  });

  describe('getUserIdBySocket', () => {
    it('should return userId for existing socket', () => {
      service.addConnection(1, 'socket1');
      expect(service.getUserIdBySocket('socket1')).toBe(1);
    });

    it('should return undefined for non-existent socket', () => {
      expect(service.getUserIdBySocket('nonexistent')).toBeUndefined();
    });
  });

  describe('getOnlineUsers', () => {
    it('should return list of online users', () => {
      service.addConnection(1, 'socket1');
      service.addConnection(2, 'socket2');
      service.addConnection(3, 'socket3');

      const onlineUsers = service.getOnlineUsers();
      expect(onlineUsers).toHaveLength(3);
      expect(onlineUsers).toContain(1);
      expect(onlineUsers).toContain(2);
      expect(onlineUsers).toContain(3);
    });

    it('should return empty array when no users online', () => {
      const onlineUsers = service.getOnlineUsers();
      expect(onlineUsers).toHaveLength(0);
    });

    it('should not duplicate users with multiple connections', () => {
      service.addConnection(1, 'socket1');
      service.addConnection(1, 'socket2');
      service.addConnection(2, 'socket3');

      const onlineUsers = service.getOnlineUsers();
      expect(onlineUsers).toHaveLength(2);
      expect(onlineUsers).toContain(1);
      expect(onlineUsers).toContain(2);
    });
  });
});