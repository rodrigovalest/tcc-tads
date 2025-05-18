import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from '../../shared/filters/http-exception.filter';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
  };

  @Module({
    controllers: [AuthController],
    providers: [{ provide: AuthService, useValue: mockAuthService }],
  })
  class TestModule {}

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());

    authService = moduleRef.get<AuthService>(AuthService) as jest.Mocked<AuthService>;

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/login (POST) - successful login returns token', async () => {
    // Arrange
    const dto = {
      email: 'user@example.com',
      password: 'password123',
    };

    const token = 'mocked.jwt.token';
    authService.login.mockResolvedValue(token);

    // Act & Assert
    const response = await request(app.getHttpServer())
      .post('/login')
      .send(dto)
      .expect(200);

    expect(response.body).toEqual({
      access_token: token,
      token_type: 'Bearer',
    });

    expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  it('/login (POST) - invalid data returns 400', async () => {
    // Arrange
    const dto = {
      email: 'invalid-email',
      password: '',
    };

    // Act & Assert
    await request(app.getHttpServer())
      .post('/login')
      .send(dto)
      .expect(400);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('/login (POST) - failed login returns 401', async () => {
    // Arrange
    const dto = {
      email: 'user@example.com',
      password: 'wrongpassword',
    };

    authService.login.mockRejectedValue(new UnauthorizedException('Unauthorized'));

    // Act & Assert
    await request(app.getHttpServer())
      .post('/login')
      .send(dto)
      .expect(401);

    expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
  });
});
