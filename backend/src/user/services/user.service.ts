import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserRequestDto } from '../dtos/requests/create-user.request-dto';
import { UserLanguage } from '../entities/user-language.entity';
import { UserInterestTopic } from '../entities/user-interest-topic.entity';
import { UserResponseDto, UserLanguageResponseDto, UserInterestTopicResponseDto } from '../dtos/responses/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLanguage)
    private readonly userLanguageRepository: Repository<UserLanguage>,
    @InjectRepository(UserInterestTopic)
    private readonly userInterestTopicRepository: Repository<UserInterestTopic>,
  ) { }

  async create(createUserDto: CreateUserRequestDto): Promise<void> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = new User(
      createUserDto.username,
      createUserDto.email,
      hashedPassword,
      createUserDto.nationality
    );

    if (createUserDto.photo) {
      user.photo = createUserDto.photo;
    }
    if (createUserDto.personalDescription) {
      user.personalDescription = createUserDto.personalDescription;
    }

    const savedUser = await this.userRepository.save(user);

    let languages = createUserDto.languages;
    if (typeof languages === 'string') {
      try {
        languages = JSON.parse(languages);
      } catch (error) {
        console.error('Failed to parse languages JSON:', error);
        throw new Error('Invalid languages format');
      }
    }

    if (Array.isArray(languages) && languages.length > 0) {
      const userLanguages = languages.map(lang => {
        const userLanguage = new UserLanguage();
        userLanguage.userId = savedUser.id;
        userLanguage.user = savedUser;
        userLanguage.languageCode = lang.languageCode;
        userLanguage.fluencyLevel = lang.fluencyLevel;
        return userLanguage;
      });
      await this.userLanguageRepository.save(userLanguages);
    }

    let interestTopics = createUserDto.interestTopics;
    if (typeof interestTopics === 'string') {
      try {
        interestTopics = JSON.parse(interestTopics);
      } catch (error) {
        throw new Error('Invalid interestTopics format');
      }
    }

    if (Array.isArray(interestTopics) && interestTopics.length > 0) {
      const userInterestTopics = interestTopics.map(topic => {
        const userInterestTopic = new UserInterestTopic();
        userInterestTopic.userId = savedUser.id;
        userInterestTopic.user = savedUser;
        userInterestTopic.topic = topic;
        return userInterestTopic;
      });
      await this.userInterestTopicRepository.save(userInterestTopics);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['languages', 'interestTopics']
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['languages', 'interestTopics']
    });
  }
  
  private mapToResponseDto(user: User): UserResponseDto {
    const languagesDto: UserLanguageResponseDto[] = user.languages?.map(lang => ({
      id: lang.id,
      languageCode: lang.languageCode,
      fluencyLevel: lang.fluencyLevel,
      createdAt: lang.createdAt
    })) || [];

    const interestTopicsDto: UserInterestTopicResponseDto[] = user.interestTopics?.map(topic => ({
      id: topic.id,
      topic: topic.topic,
      createdAt: topic.createdAt
    })) || [];

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nationality: user.nationality,
      personalDescription: user.personalDescription,
      photoUri: user.photo,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      languages: languagesDto,
      interestTopics: interestTopicsDto
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      relations: ['languages', 'interestTopics']
    });
    return users.map(user => this.mapToResponseDto(user));
  }
}
