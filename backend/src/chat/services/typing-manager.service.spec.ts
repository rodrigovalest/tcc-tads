import { Test, TestingModule } from '@nestjs/testing';
import { TypingManagerService } from './typing-manager.service';

describe('TypingManagerService', () => {
  let service: TypingManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypingManagerService],
    }).compile();

    service = module.get<TypingManagerService>(TypingManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startTyping', () => {
    it('should start typing for user in conversation', () => {
      const conversationId = '1:2';
      const userId = 1;

      const wasNotTyping = service.startTyping(conversationId, userId);

      expect(wasNotTyping).toBe(true);
      expect(service.isUserTyping(conversationId, userId)).toBe(true);
      expect(service.getTypingUsers(conversationId)).toContain(userId);
    });

    it('should return false if user was already typing', () => {
      const conversationId = '1:2';
      const userId = 1;

      service.startTyping(conversationId, userId);
      const wasNotTyping = service.startTyping(conversationId, userId);

      expect(wasNotTyping).toBe(false);
    });

    it('should handle multiple users typing in same conversation', () => {
      const conversationId = '1:2';
      
      service.startTyping(conversationId, 1);
      service.startTyping(conversationId, 2);

      const typingUsers = service.getTypingUsers(conversationId);
      expect(typingUsers).toHaveLength(2);
      expect(typingUsers).toContain(1);
      expect(typingUsers).toContain(2);
    });

    it('should set timeout to automatically stop typing', () => {
      jest.useFakeTimers();
      
      const conversationId = '1:2';
      const userId = 1;

      service.startTyping(conversationId, userId);
      expect(service.isUserTyping(conversationId, userId)).toBe(true);

      jest.advanceTimersByTime(11000);

      expect(service.isUserTyping(conversationId, userId)).toBe(false);
      
      jest.useRealTimers();
    });

    it('should reset timeout if user starts typing again', () => {
      jest.useFakeTimers();
      
      const conversationId = '1:2';
      const userId = 1;

      service.startTyping(conversationId, userId);
      expect(service.isUserTyping(conversationId, userId)).toBe(true);  
      jest.advanceTimersByTime(5000);
      service.startTyping(conversationId, userId);
      jest.advanceTimersByTime(8000);
      expect(service.isUserTyping(conversationId, userId)).toBe(true);
      jest.advanceTimersByTime(3000);   
      expect(service.isUserTyping(conversationId, userId)).toBe(false);
      jest.useRealTimers();
    });
  });

  describe('stopTyping', () => {
    it('should stop typing for user in conversation', () => {
      const conversationId = '1:2';
      const userId = 1;

      service.startTyping(conversationId, userId);
      const wasTyping = service.stopTyping(conversationId, userId);

      expect(wasTyping).toBe(true);
      expect(service.isUserTyping(conversationId, userId)).toBe(false);
      expect(service.getTypingUsers(conversationId)).not.toContain(userId);
    });

    it('should return false if user was not typing', () => {
      const conversationId = '1:2';
      const userId = 1;

      const wasTyping = service.stopTyping(conversationId, userId);

      expect(wasTyping).toBe(false);
    });

    it('should clear timeout when manually stopping typing', () => {
      jest.useFakeTimers();
      
      const conversationId = '1:2';
      const userId = 1;

      service.startTyping(conversationId, userId);
      service.stopTyping(conversationId, userId);

      jest.advanceTimersByTime(15000);

      expect(service.isUserTyping(conversationId, userId)).toBe(false);
      
      jest.useRealTimers();
    });

    it('should remove conversation from tracking when no users typing', () => {
      const conversationId = '1:2';

      service.startTyping(conversationId, 1);
      service.startTyping(conversationId, 2);
      
      service.stopTyping(conversationId, 1);
      expect(service.getTypingUsers(conversationId)).toHaveLength(1);
      
      service.stopTyping(conversationId, 2);
      expect(service.getTypingUsers(conversationId)).toHaveLength(0);
    });
  });

  describe('getTypingUsers', () => {
    it('should return typing users for conversation', () => {
      const conversationId = '1:2';
      
      service.startTyping(conversationId, 1);
      service.startTyping(conversationId, 2);

      const typingUsers = service.getTypingUsers(conversationId);
      expect(typingUsers).toHaveLength(2);
      expect(typingUsers).toContain(1);
      expect(typingUsers).toContain(2);
    });

    it('should return empty array for conversation with no typing users', () => {
      const typingUsers = service.getTypingUsers('nonexistent');
      expect(typingUsers).toHaveLength(0);
    });
  });

  describe('isUserTyping', () => {
    it('should return true when user is typing', () => {
      const conversationId = '1:2';
      const userId = 1;

      service.startTyping(conversationId, userId);
      expect(service.isUserTyping(conversationId, userId)).toBe(true);
    });

    it('should return false when user is not typing', () => {
      expect(service.isUserTyping('1:2', 1)).toBe(false);
    });
  });

  describe('clearUserTyping', () => {
    it('should clear typing status for user across all conversations', () => {
      const userId = 1;

      service.startTyping('1:2', userId);
      service.startTyping('1:3', userId);
      service.startTyping('2:3', 2);

      service.clearUserTyping(userId);

      expect(service.isUserTyping('1:2', userId)).toBe(false);
      expect(service.isUserTyping('1:3', userId)).toBe(false);
      expect(service.isUserTyping('2:3', 2)).toBe(true);
    });

    it('should handle clearing typing for user not typing anywhere', () => {
      expect(() => service.clearUserTyping(999)).not.toThrow();
    });
  });
});