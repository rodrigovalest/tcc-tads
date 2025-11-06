import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { Module } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { QueryFailedErrorFilter } from '../../shared/filters/query-failed-error.filter';
import { HttpExceptionFilter } from '../../shared/filters/http-exception.filter';
import { CountryCode } from '../entities/country-code.enum';
import { UserResponseDto } from '../dtos/responses/user-response.dto';

// Helper function to create test user response
const createTestUserResponse = (overrides: Partial<UserResponseDto> = {}): UserResponseDto => ({
  id: 1,
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  nationality: CountryCode.Brazil,
  personalDescription: undefined,
  photoUri: undefined,
  isActive: true,
  lastLoginAt: undefined,
  languages: [],
  interestTopics: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('UserController', () => {
  let app: INestApplication;
  let userService: jest.Mocked<UserService>;

  const mockUserService = {
    createWithPhoto: jest.fn(),
    findAll: jest.fn(),
    findByIdWithDto: jest.fn(),
    update: jest.fn(),
  };

  @Module({
    controllers: [UserController],
    providers: [{ provide: UserService, useValue: mockUserService }],
  })
  class TestModule { }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(
      new HttpExceptionFilter(),
      new QueryFailedErrorFilter(),
    );

    userService = moduleRef.get<UserService>(UserService) as jest.Mocked<UserService>;

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('createUser_WithValidData_Returns201Created', async () => {
    // Arrange    
    const dto = {
      name: 'Tralalero User',
      username: 'tralalero',
      email: 'tralalero@example.com',
      password: '123456',
      nationality: 'BR'
    };

    const expectedResponse = createTestUserResponse({
      username: 'tralalero',
      email: 'tralalero@example.com',
      nationality: CountryCode.Brazil,
    });

    userService.createWithPhoto.mockResolvedValue(expectedResponse);

    // Act
    await request(app.getHttpServer())
      .post('/user')
      .send(dto)
      .expect(201);

    // Assert
    expect(userService.createWithPhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password: dto.password,
        nationality: CountryCode.Brazil,
      }),
      undefined,
      expect.any(String)
    );
    expect(userService.createWithPhoto).toHaveBeenCalledTimes(1);
  });

  it('createUser_WithInvalidEmailAndPassword_Returns400BadRequest', async () => {
    // Arrange    
    const dto = {
      name: 'Lirili User',
      username: 'lirili',
      email: 'email-invalido',
      password: '123',
      nationality: 'nationality invalid'
    };

    // Act & Assert
    await request(app.getHttpServer())
      .post('/user')
      .send(dto)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'email must be an email',
            'password must be longer than or equal to 6 characters',
            'nationality must be a valid country code (e.g., BR, US)'
          ]),
        );
      });

    expect(userService.createWithPhoto).not.toHaveBeenCalled();
  });

  it('createUser_WhenUserAlreadyExists_Throws409Conflict', async () => {
    // Arrange
    const dto = {
      name: 'Existing User',
      username: 'existinguser',
      email: 'existing@example.com',
      password: '123456',
      nationality: 'BR'
    };

    const error = new QueryFailedError('mock query', [], new Error());
    (error as any).driverError = {
      code: '23505',
      constraint: 'UQ_78a916df40e02a9deb1c4b75edb',
    };

    userService.createWithPhoto.mockRejectedValue(error);

    // Act & Assert
    await request(app.getHttpServer())
      .post('/user')
      .send(dto)
      .expect(409);

    expect(userService.createWithPhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password: dto.password,
        nationality: CountryCode.Brazil,
      }),
      undefined,
      expect.any(String)
    );
    expect(userService.createWithPhoto).toHaveBeenCalledTimes(1);
  });
});
