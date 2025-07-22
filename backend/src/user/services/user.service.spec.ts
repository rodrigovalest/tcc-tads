import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CountryCode } from '../entities/country-code.enum';

const mockUserRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createUser_WithValidData_ShouldCreateANewUser', async () => {
    // Arrange
    const username = 'testuser';
    const email = 'test@example.com';
    const password = 'securepass';
    const nationality = CountryCode.Brazil;

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

    // Act
    await service.create(username, email, password, nationality);

    // Assert
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        username,
        email,
        password: 'hashedPassword',
        nationality: CountryCode.Brazil
      }),
    );
  });

  it('createUser_WhenQueryFails_ShouldThrowQueryFailedError', async () => {
    // Arrange
    const username = 'duplicated';
    const email = 'duplicate@example.com';
    const password = 'securepass';
    const nationality = CountryCode.Brazil;

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

    const error = new QueryFailedError('INSERT INTO...', [], new Error());
    userRepository.save.mockRejectedValue(error);

    // Act & Assert
    await expect(
      service.create(username, email, password, nationality)
    ).rejects.toThrow(QueryFailedError);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        username,
        email,
        password: 'hashedPassword',
        nationality: CountryCode.Brazil
      }),
    );
  });

  it('findByEmail_WhenUserExists_ShouldReturnUser', async () => {
    // Arrange
    const user = new User('user', 'user@example.com', 'hashed', CountryCode.Brazil);
    userRepository.findOne.mockResolvedValue(user);

    // Act
    const result = await service.findByEmail('user@example.com');

    // Assert
    expect(result).toBe(user);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
  });

  it('findByEmail_WhenUserDoesNotExist_ShouldReturnNull', async () => {
    // Arrange
    userRepository.findOne.mockResolvedValue(null);

    // Act
    const result = await service.findByEmail('missing@example.com');
    
    // Assert
    expect(result).toBeNull();
  });

  it('findById_WhenUserExists_ShouldReturnUser', async () => {
    // Arrange
    const user = new User('user', 'user@example.com', 'hashed', CountryCode.Brazil);
    userRepository.findOne.mockResolvedValue(user);

    // Act
    const result = await service.findById(42);
    
    // Assert
    expect(result).toBe(user);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 42 } });
  });

  it('findById_WhenUserDoesNotExist_ShouldReturnNull', async () => {
    // Arrange
    userRepository.findOne.mockResolvedValue(null);

    // Act
    const result = await service.findById(99);
    
    // Assert
    expect(result).toBeNull();
  });

  it('updateLastLogin_ShouldUpdateUserLastLoginAt', async () => {
    // Arrange
    const now = new Date();
    jest.useFakeTimers().setSystemTime(now);

    // Act
    await service.updateLastLogin(123);

    // Assert
    expect(userRepository.update).toHaveBeenCalledWith(123, { lastLoginAt: now });

    jest.useRealTimers();
  });
});
