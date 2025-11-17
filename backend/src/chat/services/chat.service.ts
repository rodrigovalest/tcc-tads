import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Friendship } from '../../user/entities/friendship.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
  ) {}

  async validateFriendship(userId: number, friendId: number): Promise<boolean> {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    });

    return !!friendship;
  }

  async getUserFriends(userId: number): Promise<{ id: number; username: string }[]> {
    const friendships = await this.friendshipRepository.find({
      where: [
        { userId },
        { friendId: userId }
      ],
      relations: ['user', 'friend']
    });

    return friendships.map(friendship => {
      const friend = friendship.userId === userId ? friendship.friend : friendship.user;
      return {
        id: friend.id,
        username: friend.username
      };
    });
  }

  async getUserById(userId: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['languages', 'interestTopics']
    });
  }

  async userExists(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id']
    });
    return !!user;
  }

  async validateChatParticipants(senderId: number, receiverId: number): Promise<{
    isValid: boolean;
    reason?: string;
  }> {
    const [senderExists, receiverExists] = await Promise.all([
      this.userExists(senderId),
      this.userExists(receiverId)
    ]);

    if (!senderExists) {
      return { isValid: false, reason: 'Sender not found' };
    }

    if (!receiverExists) {
      return { isValid: false, reason: 'Receiver not found' };
    }

    const areFriends = await this.validateFriendship(senderId, receiverId);
    if (!areFriends) {
      return { isValid: false, reason: 'Users are not friends' };
    }

    return { isValid: true };
  }
}
