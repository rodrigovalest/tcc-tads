import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInterestTopic } from '../entities/user-interest-topic.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserInterestTopicService {
  constructor(
    @InjectRepository(UserInterestTopic)
    private readonly userInterestTopicRepository: Repository<UserInterestTopic>,
  ) {}

  async createUserInterestTopics(user: User, topicsData: string[]): Promise<UserInterestTopic[]> {
    if (!Array.isArray(topicsData) || topicsData.length === 0) {
      return [];
    }

    const validTopics = this.validateAndFilterTopics(topicsData);
    
    const userInterestTopics = validTopics.map(topic => {
      const userInterestTopic = new UserInterestTopic();
      userInterestTopic.userId = user.id;
      userInterestTopic.user = user;
      userInterestTopic.topic = topic;
      return userInterestTopic;
    });

    return this.userInterestTopicRepository.save(userInterestTopics);
  }

  async updateUserInterestTopics(userId: number, topicsData: string[]): Promise<UserInterestTopic[]> {
    await this.userInterestTopicRepository.delete({ userId });
    
    if (!Array.isArray(topicsData) || topicsData.length === 0) {
      return [];
    }

    const validTopics = this.validateAndFilterTopics(topicsData);
    
    const userInterestTopics = validTopics.map(topic => {
      const uit = new UserInterestTopic();
      uit.userId = userId;
      uit.topic = topic;
      return uit;
    });

    return userInterestTopics.length > 0 ? this.userInterestTopicRepository.save(userInterestTopics) : [];
  }

  parseInterestTopicsData(interestTopics: any): string[] {
    if (typeof interestTopics === 'string') {
      try {
        return JSON.parse(interestTopics);
      } catch (error) {
        console.error('Failed to parse interestTopics JSON:', error);
        return [];
      }
    }
    return Array.isArray(interestTopics) ? interestTopics : [];
  }

  private validateAndFilterTopics(topics: string[]): string[] {
    return topics.filter(topic => 
      topic && 
      typeof topic === 'string' && 
      topic.trim() !== ''
    ).map(topic => topic.trim());
  }
}
