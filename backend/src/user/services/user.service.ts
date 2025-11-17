import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserRequestDto } from '../dtos/requests/create-user.request-dto';
import { UserResponseDto } from '../dtos/responses/user-response.dto';
import { UpdateUserRequestDto } from '../dtos/requests/update-user.request-dto';
import { PasswordService } from './password.service';
import { UserLanguageService, LanguageData } from './user-language.service';
import { UserInterestTopicService } from './user-interest-topic.service';
import { PhotoUploadService } from './photo-upload.service';
import { UserMapper } from '../mappers/user.mapper';
import { UserBuilder } from '../builders/user.builder';
import { IUserRepository } from '../interfaces/user-repository.interface';
import {
  UserUpdatePipeline,
  UpdateUserFieldsStep,
  UpdateUserPhotoStep,
  SaveUserStep,
  UpdateUserRelationsStep,
} from '../pipelines/user-update.pipeline';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
    private readonly userLanguageService: UserLanguageService,
    private readonly userInterestTopicService: UserInterestTopicService,
    private readonly photoUploadService: PhotoUploadService,
  ) {}

  async create(createUserDto: CreateUserRequestDto): Promise<UserResponseDto> {
    await this.validateUniqueFields(
      createUserDto.email,
      createUserDto.username,
    );
    const user = await this.buildUserEntity(createUserDto);
    const savedUser = await this.userRepository.save(user);
    await this.processUserRelations(savedUser, createUserDto);
    const createdUser = await this.findById(savedUser.id);
    return UserMapper.toResponseDto(createdUser!);
  }

  async createWithPhoto(
    createUserDto: CreateUserRequestDto,
    photo: Express.Multer.File | undefined,
    baseUrl: string,
  ): Promise<UserResponseDto> {
    const photoUrl = await this.photoUploadService.processPhotoUpload(
      photo,
      baseUrl,
    );
    const userDataWithPhoto = { ...createUserDto, photo: photoUrl };
    return this.create(userDataWithPhoto);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findByGoogleId(googleId);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByIdWithDto(id: number): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return UserMapper.toResponseDto(user);
  }

  async findByEmailWithDto(email: string): Promise<UserResponseDto | null> {
    const user = await this.findByEmail(email);
    return user ? UserMapper.toResponseDto(user) : null;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      relations: ['languages', 'interestTopics'],
    });
    return UserMapper.toResponseDtoArray(users);
  }

  async searchByUsername(username: string): Promise<UserResponseDto[]> {
    if (!username?.trim()) {
      return [];
    }
    
    const searchTerm = username.trim();
    const users = await this.userRepository.find({
      where: [
        { username: searchTerm },
        { name: searchTerm }
      ],
      relations: ['languages', 'interestTopics']
    });
    
    return UserMapper.toResponseDtoArray(users);
  }
  
  async update(
    id: number,
    updateDto: UpdateUserRequestDto,
    photo: Express.Multer.File | undefined,
    baseUrl: string,
  ): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const pipeline = new UserUpdatePipeline()
      .addStep(new UpdateUserFieldsStep(user, updateDto))
      .addStep(
        new UpdateUserPhotoStep(
          user,
          updateDto,
          photo,
          baseUrl,
          this.photoUploadService,
        ),
      )
      .addStep(new SaveUserStep(user, this.userRepository))
      .addStep(
        new UpdateUserRelationsStep(
          user.id,
          updateDto,
          this.userLanguageService,
          this.userInterestTopicService,
        ),
      );
    await pipeline.execute();

    const updatedUser = await this.findById(user.id);
    return UserMapper.toResponseDto(updatedUser!);
  }

  private async validateUniqueEmail(email: string): Promise<void> {
    this.validateRequiredField(email, 'Email');
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }
  }

  private async validateUniqueUsername(username: string): Promise<void> {
    this.validateRequiredField(username, 'Username');
    const normalizedUsername = username.trim();
    const existingUser =
      await this.userRepository.findByUsername(normalizedUsername);
    if (existingUser) {
      throw new ConflictException('Username is already in use');
    }
  }

  private validateRequiredField(value: string, fieldName: string): void {
    if (!value?.trim()) {
      throw new BadRequestException(`${fieldName} is required`);
    }
  }

  private async validateUniqueFields(
    email: string,
    username: string,
  ): Promise<void> {
    await Promise.all([
      this.validateUniqueEmail(email),
      this.validateUniqueUsername(username),
    ]);
  }

  private async buildUserEntity(
    createUserDto: CreateUserRequestDto,
  ): Promise<User> {
    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    return UserBuilder.fromDto(createUserDto, hashedPassword).build();
  }

  private async processUserRelations(
    user: User,
    createUserDto: CreateUserRequestDto,
  ): Promise<void> {
    const languagesData = this.userLanguageService.parseLanguagesData(
      createUserDto.languages,
    );
    const topicsData = this.userInterestTopicService.parseInterestTopicsData(
      createUserDto.interestTopics,
    );
    await Promise.all([
      this.userLanguageService.createUserLanguages(user, languagesData),
      this.userInterestTopicService.createUserInterestTopics(user, topicsData),
    ]);
  }

  async linkGoogleAccount(
    userId: number,
    googleId: string,
    googleEmail: string,
    photo?: string,
  ): Promise<User> {
    const updateData: Partial<User> = {
      googleId,
      googleEmail,
      ...(photo && { photo }),
    };

    await this.userRepository.update(userId, updateData);
    const updatedUser = await this.findById(userId);

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return updatedUser;
  }

  async unlinkGoogleAccount(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      googleId: undefined,
      googleEmail: undefined,
    });
  }
}
