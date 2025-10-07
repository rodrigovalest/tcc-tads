import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

export interface IMessageRepository {
  save(message: Message): Promise<Message>;
  findById(id: number): Promise<Message | null>;
  findConversation(userId: number, friendId: number): Promise<Message[]>;
  findUserConversations(userId: number): Promise<Message[]>;
  markAsRead(senderId: number, receiverId: number): Promise<void>;
  countUnreadMessages(userId: number): Promise<number>;
  deleteMessage(messageId: number): Promise<void>;
}

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repository: Repository<Message>,
  ) {}

  async save(message: Message): Promise<Message> {
    return await this.repository.save(message);
  }

  async findById(id: number): Promise<Message | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['sender', 'sender.languages', 'sender.interestTopics', 'receiver', 'receiver.languages', 'receiver.interestTopics']
    });
  }

  async findConversation(userId: number, friendId: number): Promise<Message[]> {
    return await this.repository.find({
      where: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ],
      relations: ['sender', 'sender.languages', 'sender.interestTopics', 'receiver', 'receiver.languages', 'receiver.interestTopics'],
      order: { createdAt: 'ASC' }
    });
  }

  async findUserConversations(userId: number): Promise<Message[]> {
    return await this.repository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .leftJoinAndSelect('sender.languages', 'senderLanguages')
      .leftJoinAndSelect('sender.interestTopics', 'senderTopics')
      .leftJoinAndSelect('receiver.languages', 'receiverLanguages')
      .leftJoinAndSelect('receiver.interestTopics', 'receiverTopics')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  async markAsRead(senderId: number, receiverId: number): Promise<void> {
    await this.repository.update(
      { senderId, receiverId, isRead: false },
      { isRead: true }
    );
  }

  async countUnreadMessages(userId: number): Promise<number> {
    return await this.repository.count({
      where: { receiverId: userId, isRead: false }
    });
  }

  async deleteMessage(messageId: number): Promise<void> {
    await this.repository.delete({ id: messageId });
  }
}