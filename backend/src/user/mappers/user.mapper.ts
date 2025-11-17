import { User } from '../entities/user.entity';
import { UserLanguage } from '../entities/user-language.entity';
import { UserInterestTopic } from '../entities/user-interest-topic.entity';
import { UserResponseDto, UserLanguageResponseDto, UserInterestTopicResponseDto } from '../dtos/responses/user-response.dto';

export class UserMapper {
  
  static toResponseDto(user: User): UserResponseDto {
    if (!user) {
      throw new Error('User object is null or undefined');
    }
    
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      nationality: user.nationality,
      personalDescription: user.personalDescription,
      photoUri: user.photo,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      languages: this.mapLanguages(user.languages),
      interestTopics: this.mapInterestTopics(user.interestTopics)
    };
  }

  static toResponseDtoArray(users: User[]): UserResponseDto[] {
    return users.map(user => this.toResponseDto(user));
  }

  private static mapLanguages(languages?: UserLanguage[]): UserLanguageResponseDto[] {
    return languages?.map(lang => ({
      id: lang.id,
      languageCode: lang.languageCode,
      fluencyLevel: lang.fluencyLevel,
      createdAt: lang.createdAt
    })) || [];
  }

  private static mapInterestTopics(interestTopics?: UserInterestTopic[]): UserInterestTopicResponseDto[] {
    return interestTopics?.map(topic => ({
      id: topic.id,
      topic: topic.topic,
      createdAt: topic.createdAt
    })) || [];
  }
}
