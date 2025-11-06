import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserRequestDto } from '../dtos/requests/create-user.request-dto';
import { UpdateUserRequestDto } from '../dtos/requests/update-user.request-dto';
import { UserResponseDto } from '../dtos/responses/user-response.dto';
import { CountryCode } from '../entities/country-code.enum';
import { User } from '../entities/user.entity';
import { PasswordService } from './password.service';
import { UserLanguageService } from './user-language.service';
import { UserInterestTopicService } from './user-interest-topic.service';
import { PhotoUploadService } from './photo-upload.service';
import { UserMapper } from '../mappers/user.mapper';
import { UserBuilder } from '../builders/user.builder';
import { IUserRepository } from '../interfaces/user-repository.interface';

// Mock implementations
const mockUserRepository = {
  save: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
};

const mockPasswordService = {
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
};

const mockUserLanguageService = {
  parseLanguagesData: jest.fn(),
  createUserLanguages: jest.fn(),
  updateUserLanguages: jest.fn(),
};

const mockUserInterestTopicService = {
  parseInterestTopicsData: jest.fn(),
  createUserInterestTopics: jest.fn(),
  updateUserInterestTopics: jest.fn(),
};

const mockPhotoUploadService = {
  processPhotoUpload: jest.fn(),
  validatePhotoFile: jest.fn(),
};

// Mock static classes
jest.mock('../mappers/user.mapper');
jest.mock('../builders/user.builder');

const mockUserMapper = UserMapper as jest.Mocked<typeof UserMapper>;
const mockUserBuilder = UserBuilder as jest.Mocked<typeof UserBuilder>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let userLanguageService: jest.Mocked<UserLanguageService>;
  let userInterestTopicService: jest.Mocked<UserInterestTopicService>;
  let photoUploadService: jest.Mocked<PhotoUploadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: UserLanguageService,
          useValue: mockUserLanguageService,
        },
        {
          provide: UserInterestTopicService,
          useValue: mockUserInterestTopicService,
        },
        {
          provide: PhotoUploadService,
          useValue: mockPhotoUploadService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get('IUserRepository');
    passwordService = module.get(PasswordService);
    userLanguageService = module.get(UserLanguageService);
    userInterestTopicService = module.get(UserInterestTopicService);
    photoUploadService = module.get(PhotoUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create test user
  const createTestUser = (): User => {
    const user = new User('Test User', 'testuser', 'test@example.com', 'hashedPassword', CountryCode.Brazil);
    user.id = 1;
    return user;
  };

  // Helper function to create test user DTO
  const createTestUserDto = (): CreateUserRequestDto => ({
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    nationality: CountryCode.Brazil,
    languages: [{ languageCode: 'pt', fluencyLevel: 5 }],
    interestTopics: ['technology', 'sports'],
    personalDescription: 'Test description',
  });

  // Helper function to create test response DTO
  const createTestResponseDto = (): UserResponseDto => ({
    id: 1,
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    nationality: CountryCode.Brazil,
    personalDescription: 'Test description',
    photoUri: undefined,
    isActive: true,
    lastLoginAt: undefined,
    languages: [],
    interestTopics: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createUserDto = createTestUserDto();
      const testUser = createTestUser();
      const expectedResponse = createTestResponseDto();

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      
      const mockBuilder = {
        build: jest.fn().mockReturnValue(testUser)
      };
      mockUserBuilder.fromDto.mockReturnValue(mockBuilder as any);
      
      userRepository.save.mockResolvedValue(testUser);
      userLanguageService.parseLanguagesData.mockReturnValue(createUserDto.languages);
      userInterestTopicService.parseInterestTopicsData.mockReturnValue(createUserDto.interestTopics!);
      userLanguageService.createUserLanguages.mockResolvedValue([]);
      userInterestTopicService.createUserInterestTopics.mockResolvedValue([]);
      userRepository.findById.mockResolvedValue(testUser);
      mockUserMapper.toResponseDto.mockReturnValue(expectedResponse);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(passwordService.hashPassword).toHaveBeenCalledWith('password123');
      expect(userRepository.save).toHaveBeenCalledWith(testUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const createUserDto = createTestUserDto();
      const existingUser = createTestUser();
      
      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw ConflictException when username already exists', async () => {
      // Arrange
      const createUserDto = createTestUserDto();
      const existingUser = createTestUser();
      
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should throw BadRequestException when email is empty', async () => {
      // Arrange
      const createUserDto = { ...createTestUserDto(), email: '' };

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createWithPhoto', () => {
    it('should create user with photo successfully', async () => {
      // Arrange
      const createUserDto = createTestUserDto();
      const photo: Express.Multer.File = {
        buffer: Buffer.from('fake image'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      } as Express.Multer.File;
      const baseUrl = 'http://localhost:3000';
      const photoUrl = 'http://localhost:3000/uploads/photo.jpg';
      const expectedResponse = createTestResponseDto();

      photoUploadService.processPhotoUpload.mockResolvedValue(photoUrl);
      
      // Mock the entire create method
      jest.spyOn(service, 'create').mockResolvedValue(expectedResponse);

      // Act
      const result = await service.createWithPhoto(createUserDto, photo, baseUrl);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(photoUploadService.processPhotoUpload).toHaveBeenCalledWith(photo, baseUrl);
      expect(service.create).toHaveBeenCalledWith({
        ...createUserDto,
        photo: photoUrl
      });
    });

    it('should create user without photo when photo is undefined', async () => {
      // Arrange
      const createUserDto = createTestUserDto();
      const baseUrl = 'http://localhost:3000';
      const expectedResponse = createTestResponseDto();

      photoUploadService.processPhotoUpload.mockResolvedValue(undefined);
      jest.spyOn(service, 'create').mockResolvedValue(expectedResponse);

      // Act
      const result = await service.createWithPhoto(createUserDto, undefined, baseUrl);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(photoUploadService.processPhotoUpload).toHaveBeenCalledWith(undefined, baseUrl);
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      // Arrange
      const testUser = createTestUser();
      userRepository.findByEmail.mockResolvedValue(testUser);

      // Act
      const result = await service.findByEmail('test@example.com');

      // Assert
      expect(result).toEqual(testUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when email does not exist', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('missing@example.com');

      // Assert
      expect(result).toBeNull();
      expect(userRepository.findByEmail).toHaveBeenCalledWith('missing@example.com');
    });
  });

  describe('findById', () => {
    it('should return user when id exists', async () => {
      // Arrange
      const testUser = createTestUser();
      userRepository.findById.mockResolvedValue(testUser);

      // Act
      const result = await service.findById(1);

      // Assert
      expect(result).toEqual(testUser);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return null when id does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.findById(999);

      // Assert
      expect(result).toBeNull();
      expect(userRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findByIdWithDto', () => {
    it('should return user response DTO when user exists', async () => {
      // Arrange
      const testUser = createTestUser();
      const expectedResponse = createTestResponseDto();
      
      userRepository.findById.mockResolvedValue(testUser);
      mockUserMapper.toResponseDto.mockReturnValue(expectedResponse);

      // Act
      const result = await service.findByIdWithDto(1);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserMapper.toResponseDto).toHaveBeenCalledWith(testUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByIdWithDto(999)).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findByEmailWithDto', () => {
    it('should return user response DTO when user exists', async () => {
      // Arrange
      const testUser = createTestUser();
      const expectedResponse = createTestResponseDto();
      
      userRepository.findByEmail.mockResolvedValue(testUser);
      mockUserMapper.toResponseDto.mockReturnValue(expectedResponse);

      // Act
      const result = await service.findByEmailWithDto('test@example.com');

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserMapper.toResponseDto).toHaveBeenCalledWith(testUser);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.findByEmailWithDto('missing@example.com');

      // Assert
      expect(result).toBeNull();
      expect(userRepository.findByEmail).toHaveBeenCalledWith('missing@example.com');
    });
  });

  describe('findAll', () => {
    it('should return all users as response DTOs', async () => {
      // Arrange
      const users = [createTestUser(), createTestUser()];
      const expectedResponse = [createTestResponseDto(), createTestResponseDto()];
      
      userRepository.find.mockResolvedValue(users);
      mockUserMapper.toResponseDtoArray.mockReturnValue(expectedResponse);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(userRepository.find).toHaveBeenCalledWith({
        relations: ['languages', 'interestTopics']
      });
      expect(mockUserMapper.toResponseDtoArray).toHaveBeenCalledWith(users);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const updateDto: UpdateUserRequestDto = {
        username: 'updateduser',
        personalDescription: 'Updated description'
      };
      const testUser = createTestUser();
      const updatedUser = { ...testUser, username: 'updateduser' };
      const expectedResponse = createTestResponseDto();
      const photo: Express.Multer.File = {
        buffer: Buffer.from('fake image'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      } as Express.Multer.File;
      const baseUrl = 'http://localhost:3000';

      userRepository.findById.mockResolvedValueOnce(testUser);
      userRepository.findById.mockResolvedValueOnce(updatedUser);
      mockUserMapper.toResponseDto.mockReturnValue(expectedResponse);

      // Act
      const result = await service.update(1, updateDto, photo, baseUrl);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const updateDto: UpdateUserRequestDto = {
        username: 'updateduser'
      };
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, updateDto, undefined, 'http://localhost:3000')).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith(999);
    });
  });
});
