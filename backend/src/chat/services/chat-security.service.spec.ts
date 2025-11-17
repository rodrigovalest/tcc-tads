import { Test, TestingModule } from '@nestjs/testing';
import { ChatSecurityService, MessageSecurityContext } from './chat-security.service';

describe('ChatSecurityService', () => {
  let service: ChatSecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatSecurityService],
    }).compile();

    service = module.get<ChatSecurityService>(ChatSecurityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sanitizeMessageContent', () => {
    it('should remove script tags', () => {
      const maliciousContent = '<script>alert("hack")</script>Hello world';
      const result = service.sanitizeMessageContent(maliciousContent);
      expect(result).toBe('Hello world');
    });

    it('should remove iframe tags', () => {
      const maliciousContent = '<iframe src="evil.com"></iframe>Hello world';
      const result = service.sanitizeMessageContent(maliciousContent);
      expect(result).toBe('Hello world');
    });

    it('should remove javascript: protocols', () => {
      const maliciousContent = 'javascript:alert("hack") Hello world';
      const result = service.sanitizeMessageContent(maliciousContent);
      expect(result).toBe('Hello world');
    });

    it('should truncate long messages', () => {
      const longContent = 'a'.repeat(5000);
      const result = service.sanitizeMessageContent(longContent);
      expect(result).toHaveLength(4003); // 4000 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should return empty string for non-string input', () => {
      expect(service.sanitizeMessageContent(null as any)).toBe('');
      expect(service.sanitizeMessageContent(undefined as any)).toBe('');
      expect(service.sanitizeMessageContent(123 as any)).toBe('');
    });

    it('should trim whitespace', () => {
      const content = '  Hello world  ';
      const result = service.sanitizeMessageContent(content);
      expect(result).toBe('Hello world');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', () => {
      const identifier = 'user:1';
      
      for (let i = 0; i < 60; i++) {
        const result = service.checkRateLimit(identifier, 60, 60000);
        expect(result).toBe(true);
      }
    });

    it('should block requests exceeding rate limit', () => {
      const identifier = 'user:2';
      
      for (let i = 0; i < 60; i++) {
        service.checkRateLimit(identifier, 60, 60000);
      }
      
      const result = service.checkRateLimit(identifier, 60, 60000);
      expect(result).toBe(false);
    });

    it('should reset rate limit after time window', (done) => {
      const identifier = 'user:3';

      for (let i = 0; i < 5; i++) {
        service.checkRateLimit(identifier, 5, 100);
      }
      
      expect(service.checkRateLimit(identifier, 5, 100)).toBe(false);
      
      setTimeout(() => {
        const result = service.checkRateLimit(identifier, 5, 100);
        expect(result).toBe(true);
        done();
      }, 150);
    });
  });

  describe('validateMessageStructure', () => {
    it('should validate correct message structure', () => {
      const validMessage = {
        receiverId: 2,
        content: 'Hello world'
      };
      
      const result = service.validateMessageStructure(validMessage);
      expect(result).toBe(true);
    });

    it('should reject message without receiverId', () => {
      const invalidMessage = {
        content: 'Hello world'
      };
      
      const result = service.validateMessageStructure(invalidMessage);
      expect(result).toBe(false);
    });

    it('should reject message without content', () => {
      const invalidMessage = {
        receiverId: 2
      };
      
      const result = service.validateMessageStructure(invalidMessage);
      expect(result).toBe(false);
    });

    it('should reject message with invalid receiverId', () => {
      const invalidMessage = {
        receiverId: 'invalid',
        content: 'Hello world'
      };
      
      const result = service.validateMessageStructure(invalidMessage);
      expect(result).toBe(false);
    });

    it('should reject message with empty content', () => {
      const invalidMessage = {
        receiverId: 2,
        content: '   '
      };
      
      const result = service.validateMessageStructure(invalidMessage);
      expect(result).toBe(false);
    });

    it('should reject non-object input', () => {
      expect(service.validateMessageStructure(null)).toBe(false);
      expect(service.validateMessageStructure(undefined)).toBe(false);
      expect(service.validateMessageStructure('string')).toBe(false);
      expect(service.validateMessageStructure(123)).toBe(false);
    });
  });

  describe('detectSuspiciousPatterns', () => {
    it('should detect suspicious URL patterns', () => {
      const suspiciousContent = 'Click here: bit.ly/suspicious';
      const result = service.detectSuspiciousPatterns(suspiciousContent);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.reasons).toContain('Suspicious URL pattern detected');
    });

    it('should detect IP addresses', () => {
      const suspiciousContent = 'Visit 192.168.1.1 for more info';
      const result = service.detectSuspiciousPatterns(suspiciousContent);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.reasons).toContain('Suspicious URL pattern detected');
    });

    it('should detect spam patterns', () => {
      const spamContent = 'URGENT!!! WINNER!!! Click here to claim your prize!!!';
      const result = service.detectSuspiciousPatterns(spamContent);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.reasons).toContain('Spam pattern detected');
    });

    it('should detect excessive character repetition', () => {
      const spamContent = 'Hellooooooooooooo world';
      const result = service.detectSuspiciousPatterns(spamContent);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.reasons).toContain('Spam pattern detected');
    });

    it('should detect messages that are too long', () => {
      const longContent = 'a'.repeat(2500);
      const result = service.detectSuspiciousPatterns(longContent);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.reasons).toContain('Message too long');
    });

    it('should not flag normal messages as suspicious', () => {
      const normalContent = 'Hello, how are you doing today?';
      const result = service.detectSuspiciousPatterns(normalContent);
      
      expect(result.isSuspicious).toBe(false);
      expect(result.reasons).toHaveLength(0);
    });
  });

  describe('processMessageSecurity', () => {
    it('should process valid message successfully', async () => {
      const context: MessageSecurityContext = {
        senderId: 1,
        receiverId: 2,
        content: 'Hello world',
        ipAddress: '127.0.0.1'
      };

      const result = await service.processMessageSecurity(context);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent).toBe('Hello world');
      expect(result.securityIssues).toHaveLength(0);
    });

    it('should reject invalid message structure', async () => {
      const context: any = {
        senderId: 1,
        content: 'Hello world'
      };

      const result = await service.processMessageSecurity(context);

      expect(result.isValid).toBe(false);
      expect(result.securityIssues).toContain('Invalid message structure');
    });

    it('should sanitize malicious content but allow message', async () => {
      const context: MessageSecurityContext = {
        senderId: 1,
        receiverId: 2,
        content: '<script>alert("hack")</script>Hello world',
        ipAddress: '127.0.0.1'
      };

      const result = await service.processMessageSecurity(context);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent).toBe('Hello world');
    });

    it('should detect and log suspicious patterns but not block', async () => {
      const context: MessageSecurityContext = {
        senderId: 1,
        receiverId: 2,
        content: 'a'.repeat(2500),
        ipAddress: '127.0.0.1'
      };

      const result = await service.processMessageSecurity(context);

      expect(result.isValid).toBe(true);
      expect(result.securityIssues).toContain('Message too long');
    });
  });
});