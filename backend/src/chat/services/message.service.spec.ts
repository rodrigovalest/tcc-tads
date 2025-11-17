import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { ChatService } from './chat.service';
import { IMessageRepository } from '../repositories/message.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { SendMessageDto } from '../dtos/requests/send-message.dto';
import { CountryCode } from '../../user/entities/country-code.enum';
import { User } from '../../user/entities/user.entity';

describe('MessageService', () => {
  let service: MessageService;
  let messageRepository: IMessageRepository;
  let chatService: ChatService;

  const mockMessageRepository = {
    save: jest.fn(),
    findConversation: jest.fn(),
    findUserConversations: jest.fn(),
    markAsRead: jest.fn(),
    countUnreadMessages: jest.fn(),
    findById: jest.fn(),
    deleteMessage: jest.fn(),
  };

  const mockChatService = {
    validateChatParticipants: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    nationality: CountryCode.UnitedStates,
    personalDescription: undefined,
    photo: undefined,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    languages: [],
    interestTopics: [],
    userMatches: [],
  };

  const mockReceiver: User = {
    id: 2,
    name: 'Receiver User',
    username: 'receiver',
    email: 'receiver@example.com',
    password: 'hashedpassword',
    nationality: CountryCode.Brazil,
    personalDescription: undefined,
    photo: undefined,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    languages: [],
    interestTopics: [],
    userMatches: [],
  };

  const mockMessage: Message = {
    id: 1,
    senderId: 1,
    receiverId: 2,
    content: 'Test message',
    isRead: false,
    createdAt: new Date(),
    sender: mockUser,
    receiver: mockReceiver,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: 'IMessageRepository',
          useValue: mockMessageRepository,
        },
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageRepository = module.get<IMessageRepository>('IMessageRepository');
    chatService = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const sendMessageDto: SendMessageDto = {
        receiverId: 2,
        content: 'Test message'
      };

      mockChatService.validateChatParticipants.mockResolvedValue({ isValid: true });
      mockChatService.getUserById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockReceiver);
      mockMessageRepository.save.mockResolvedValue(mockMessage);

      const result = await service.sendMessage(1, sendMessageDto);

      expect(result).toMatchObject({
        id: 1,
        content: 'Test message',
        isRead: false,
      });
      expect(mockChatService.validateChatParticipants).toHaveBeenCalledWith(1, 2);
      expect(mockMessageRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when validation fails', async () => {
      const sendMessageDto: SendMessageDto = {
        receiverId: 2,
        content: 'Test message'
      };

      mockChatService.validateChatParticipants.mockResolvedValue({
        isValid: false,
        reason: 'Users are not friends'
      });

      await expect(service.sendMessage(1, sendMessageDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      const sendMessageDto: SendMessageDto = {
        receiverId: 2,
        content: 'Test message'
      };

      mockChatService.validateChatParticipants.mockResolvedValue({ isValid: true });
      mockChatService.getUserById
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockReceiver);

      await expect(service.sendMessage(1, sendMessageDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getConversation', () => {
    it('should return conversation messages', async () => {
      mockChatService.validateChatParticipants.mockResolvedValue({ isValid: true });
      mockMessageRepository.findConversation.mockResolvedValue([mockMessage]);

      const result = await service.getConversation(1, 2);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        content: 'Test message',
      });
    });

    it('should throw BadRequestException when validation fails', async () => {
      mockChatService.validateChatParticipants.mockResolvedValue({
        isValid: false,
        reason: 'Users are not friends'
      });

      await expect(service.getConversation(1, 2))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getConversations', () => {
    it('should return user conversations with unread count', async () => {
      const mockConversations = [
        { ...mockMessage, receiverId: 1, senderId: 2, isRead: false },
        { ...mockMessage, id: 2, receiverId: 1, senderId: 2, isRead: false },
      ];

      mockMessageRepository.findUserConversations.mockResolvedValue(mockConversations);

      const result = await service.getConversations(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        unreadCount: 2,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      mockChatService.validateChatParticipants.mockResolvedValue({ isValid: true });
      mockMessageRepository.markAsRead.mockResolvedValue(undefined);

      await service.markAsRead(1, 2);

      expect(mockMessageRepository.markAsRead).toHaveBeenCalledWith(2, 1);
    });

    it('should throw BadRequestException when validation fails', async () => {
      mockChatService.validateChatParticipants.mockResolvedValue({
        isValid: false,
        reason: 'Users are not friends'
      });

      await expect(service.markAsRead(1, 2))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getUnreadMessageCount', () => {
    it('should return unread message count', async () => {
      mockMessageRepository.countUnreadMessages.mockResolvedValue(5);

      const result = await service.getUnreadMessageCount(1);

      expect(result).toBe(5);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      mockMessageRepository.findById.mockResolvedValue(mockMessage);
      mockMessageRepository.deleteMessage.mockResolvedValue(undefined);

      await service.deleteMessage(1, 1);

      expect(mockMessageRepository.deleteMessage).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when message not found', async () => {
      mockMessageRepository.findById.mockResolvedValue(null);

      await expect(service.deleteMessage(1, 1))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user is not the sender', async () => {
      mockMessageRepository.findById.mockResolvedValue(mockMessage);

      await expect(service.deleteMessage(1, 2))
        .rejects.toThrow(BadRequestException);
    });
  });
});