import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { IMessageRepository } from '../repositories/message.repository';
import { ChatService } from './chat.service';
import { Message } from '../entities/message.entity';
import { SendMessageDto } from '../dtos/requests/send-message.dto';
import { MessageResponseDto } from '../dtos/responses/message-response.dto';
import { ConversationResponseDto } from '../dtos/responses/conversation-response.dto';
import { UserMapper } from '../../user/mappers/user.mapper';

@Injectable()
export class MessageService {
  constructor(
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
    private readonly chatService: ChatService,
  ) {}

  async sendMessage(senderId: number, dto: SendMessageDto): Promise<MessageResponseDto> {
    const validation = await this.chatService.validateChatParticipants(senderId, dto.receiverId);
    if (!validation.isValid) {
      throw new BadRequestException(validation.reason);
    }
    const [sender, receiver] = await Promise.all([
      this.chatService.getUserById(senderId),
      this.chatService.getUserById(dto.receiverId)
    ]);

    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }

    const message = new Message(senderId, dto.receiverId, dto.content);
    const savedMessage = await this.messageRepository.save(message);

    return {
      id: savedMessage.id,
      sender: UserMapper.toResponseDto(sender),
      receiver: UserMapper.toResponseDto(receiver),
      content: savedMessage.content,
      isRead: savedMessage.isRead,
      createdAt: savedMessage.createdAt,
    };
  }

  async getConversation(userId: number, friendId: number): Promise<MessageResponseDto[]> {
    const validation = await this.chatService.validateChatParticipants(userId, friendId);
    if (!validation.isValid) {
      throw new BadRequestException(validation.reason);
    }

    const messages = await this.messageRepository.findConversation(userId, friendId);

    return messages.map(message => ({
      id: message.id,
      sender: UserMapper.toResponseDto(message.sender),
      receiver: UserMapper.toResponseDto(message.receiver),
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
    }));
  }

  async getConversations(userId: number): Promise<ConversationResponseDto[]> {
    const conversations = await this.messageRepository.findUserConversations(userId);

    const conversationMap = new Map<number, ConversationResponseDto>();

    for (const message of conversations) {
      const friendId = message.senderId === userId ? message.receiverId : message.senderId;
      const friend = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationMap.has(friendId)) {
        conversationMap.set(friendId, {
          friend: UserMapper.toResponseDto(friend),
          lastMessage: message.content,
          lastMessageDate: message.createdAt,
          unreadCount: 0,
        });
      }

      if (message.receiverId === userId && !message.isRead) {
        const conversation = conversationMap.get(friendId);
        if (conversation) {
          conversation.unreadCount++;
        }
      }
    }

    return Array.from(conversationMap.values()).sort((a, b) => {
      const dateA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
      const dateB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
      return dateB - dateA;
    });
  }

  async markAsRead(userId: number, friendId: number): Promise<void> {
    const validation = await this.chatService.validateChatParticipants(userId, friendId);
    if (!validation.isValid) {
      throw new BadRequestException(validation.reason);
    }

    await this.messageRepository.markAsRead(friendId, userId);
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return await this.messageRepository.countUnreadMessages(userId);
  }

  async deleteMessage(messageId: number, userId: number): Promise<void> {
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new BadRequestException('You can only delete your own messages');
    }

    await this.messageRepository.deleteMessage(messageId);
  }
}