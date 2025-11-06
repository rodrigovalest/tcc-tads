import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { MessageService } from '../services/message.service';
import { JwtHttpAuthGuard } from '../../auth/guards/jwt-http-auth.guard';
import { SendMessageDto } from '../dtos/requests/send-message.dto';
import { MessageResponseDto } from '../dtos/responses/message-response.dto';
import { ConversationResponseDto } from '../dtos/responses/conversation-response.dto';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { CountryCode } from '../../user/entities/country-code.enum';

describe('ChatController', () => {
  let controller: ChatController;
  let messageService: MessageService;

  const mockMessageService = {
    sendMessage: jest.fn(),
    getConversations: jest.fn(),
    getConversation: jest.fn(),
    markAsRead: jest.fn(),
    getUnreadMessageCount: jest.fn(),
    deleteMessage: jest.fn(),
  };

  const mockUser: IUserJwtPayload = {
    sub: 1,
    username: 'testuser',
    email: 'test@example.com',
    nationality: CountryCode.UnitedStates,
  };

  const mockMessageResponse: MessageResponseDto = {
    id: 1,
    sender: {
      id: 1,
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      nationality: CountryCode.UnitedStates,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      languages: [],
      interestTopics: []
    },
    receiver: {
      id: 2,
      name: 'Receiver User',
      username: 'receiver',
      email: 'receiver@example.com',
      nationality: CountryCode.Brazil,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      languages: [],
      interestTopics: []
    },
    content: 'Test message',
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    })
    .overrideGuard(JwtHttpAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ChatController>(ChatController);
    messageService = module.get<MessageService>(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const sendMessageDto: SendMessageDto = {
        receiverId: 2,
        content: 'Test message'
      };

      mockMessageService.sendMessage.mockResolvedValue(mockMessageResponse);

      const result = await controller.sendMessage(mockUser, sendMessageDto);

      expect(result).toEqual(mockMessageResponse);
      expect(mockMessageService.sendMessage).toHaveBeenCalledWith(mockUser.sub, sendMessageDto);
    });

    it('should handle errors when sending message', async () => {
      const sendMessageDto: SendMessageDto = {
        receiverId: 2,
        content: 'Test message'
      };

      mockMessageService.sendMessage.mockRejectedValue(new Error('Send failed'));

      await expect(controller.sendMessage(mockUser, sendMessageDto))
        .rejects.toThrow('Send failed');
    });
  });

  describe('getConversations', () => {
    it('should return user conversations', async () => {
      const mockConversations: ConversationResponseDto[] = [{
        friend: {
          id: 2,
          name: 'Friend User',
          username: 'friend',
          email: 'friend@example.com',
          nationality: CountryCode.Brazil,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          languages: [],
          interestTopics: []
        },
        lastMessage: 'Last message',
        lastMessageDate: new Date(),
        unreadCount: 2
      }];

      mockMessageService.getConversations.mockResolvedValue(mockConversations);

      const result = await controller.getConversations(mockUser);

      expect(result).toEqual(mockConversations);
      expect(mockMessageService.getConversations).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe('getConversation', () => {
    it('should return conversation messages', async () => {
      const friendId = 2;
      const mockMessages: MessageResponseDto[] = [mockMessageResponse];

      mockMessageService.getConversation.mockResolvedValue(mockMessages);

      const result = await controller.getConversation(mockUser, friendId);

      expect(result).toEqual(mockMessages);
      expect(mockMessageService.getConversation).toHaveBeenCalledWith(mockUser.sub, friendId);
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      const friendId = 2;

      mockMessageService.markAsRead.mockResolvedValue(undefined);

      const result = await controller.markAsRead(mockUser, friendId);

      expect(result).toBeUndefined();
      expect(mockMessageService.markAsRead).toHaveBeenCalledWith(mockUser.sub, friendId);
    });
  });

  describe('getUnreadMessageCount', () => {
    it('should return unread message count', async () => {
      const unreadCount = 5;

      mockMessageService.getUnreadMessageCount.mockResolvedValue(unreadCount);

      const result = await controller.getUnreadMessageCount(mockUser);

      expect(result).toEqual({ unreadCount });
      expect(mockMessageService.getUnreadMessageCount).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const messageId = 1;

      mockMessageService.deleteMessage.mockResolvedValue(undefined);

      const result = await controller.deleteMessage(mockUser, messageId);

      expect(result).toBeUndefined();
      expect(mockMessageService.deleteMessage).toHaveBeenCalledWith(messageId, mockUser.sub);
    });
  });
});