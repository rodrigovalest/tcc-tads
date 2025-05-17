import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

const mockUserRepository = () => ({
  save: jest.fn(),
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

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

    // Act
    await service.create(username, email, password);

    // Assert
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        username,
        email,
        password: 'hashedPassword',
      }),
    );
  });

  it('createUser_WhenQueryFails_ShouldThrowQueryFailedError', async () => {
    // Arrange
    const username = 'duplicated';
    const email = 'duplicate@example.com';
    const password = 'securepass';

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

    const error = new QueryFailedError('INSERT INTO...', [], new Error());
    userRepository.save.mockRejectedValue(error);

    // Act & Assert
    await expect(
      service.create(username, email, password)
    ).rejects.toThrow(QueryFailedError);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });
});
