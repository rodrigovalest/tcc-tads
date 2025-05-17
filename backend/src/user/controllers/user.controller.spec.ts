import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { Module } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { QueryFailedErrorFilter } from '../../shared/filters/query-failed-error.filter';
import { HttpExceptionFilter } from '../../shared/filters/http-exception.filter';

describe('UserController', () => {
  let app: INestApplication;
  let userService: jest.Mocked<UserService>;

  const mockUserService = {
    create: jest.fn(),
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
      username: 'tralalero',
      email: 'tralalero@example.com',
      password: '123456',
    };

    // Act
    await request(app.getHttpServer())
      .post('/user')
      .send(dto)
      .expect(201);

    // Assert
    expect(userService.create).toHaveBeenCalledWith(
      dto.username,
      dto.email,
      dto.password,
    );
    expect(userService.create).toHaveBeenCalledTimes(1);
  });

  it('createUser_WithInvalidEmailAndPassword_Returns400BadRequest', async () => {
    // Arrange    
    const dto = {
      username: 'lirili',
      email: 'email-invalido',
      password: '123',
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
          ]),
        );
      });

    expect(userService.create).not.toHaveBeenCalled();
  });

  it('createUser_WhenUserAlreadyExists_Throws409Conflict', async () => {
    // Arrange
    const dto = {
      username: 'existinguser',
      email: 'existing@example.com',
      password: '123456',
    };

    const error = new QueryFailedError('mock query', [], new Error());
    (error as any).driverError = {
      code: '23505',
      constraint: 'UQ_78a916df40e02a9deb1c4b75edb',
    };

    userService.create.mockRejectedValue(error);

    // Act & Assert
    await request(app.getHttpServer())
      .post('/user')
      .send(dto)
      .expect(409);

    expect(userService.create).toHaveBeenCalledWith(
      dto.username,
      dto.email,
      dto.password,
    );
    expect(userService.create).toHaveBeenCalledTimes(1);
  });
});
