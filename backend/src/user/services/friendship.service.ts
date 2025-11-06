import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';
import { FriendshipResponseDto } from '../dtos/responses/friendship-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getFriends(userId: number): Promise<FriendshipResponseDto[]> {
    const friendships = await this.friendshipRepository.find({
      where: { userId },
      relations: ['user', 'user.languages', 'user.interestTopics', 'friend', 'friend.languages', 'friend.interestTopics'],
      order: { createdAt: 'DESC' }
    });

    return friendships
      .filter(friendship => friendship.friend && friendship.user)
      .map(friendship => ({
        id: friendship.id,
        user: UserMapper.toResponseDto(friendship.user),
        friend: UserMapper.toResponseDto(friendship.friend),
        createdAt: friendship.createdAt,
      }));
  }

  async searchFriends(userId: number, searchTerm: string): Promise<FriendshipResponseDto[]> {
    const friendships = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.user', 'user')
      .leftJoinAndSelect('user.languages', 'userLanguages')
      .leftJoinAndSelect('user.interestTopics', 'userInterestTopics')
      .leftJoinAndSelect('friendship.friend', 'friend')
      .leftJoinAndSelect('friend.languages', 'languages')
      .leftJoinAndSelect('friend.interestTopics', 'interestTopics')
      .where('friendship.userId = :userId', { userId })
      .andWhere('(friend.username ILIKE :searchTerm OR friend.name ILIKE :searchTerm)', { searchTerm: `%${searchTerm}%` })
      .orderBy('friendship.createdAt', 'DESC')
      .getMany();

    return friendships
      .filter(friendship => friendship.friend && friendship.user)
      .map(friendship => ({
        id: friendship.id,
        user: UserMapper.toResponseDto(friendship.user),
        friend: UserMapper.toResponseDto(friendship.friend),
        createdAt: friendship.createdAt,
      }));
  }

  async removeFriend(userId: number, friendId: number): Promise<void> {
    const friendships = await this.friendshipRepository.find({
      where: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    });

    if (friendships.length === 0) {
      throw new NotFoundException('Friendship not found');
    }
    await this.friendshipRepository.remove(friendships);
  }
}

