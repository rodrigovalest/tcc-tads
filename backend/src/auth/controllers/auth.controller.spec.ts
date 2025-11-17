import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from '../../shared/filters/http-exception.filter';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    linkGoogleAccount: jest.fn(),
    unlinkGoogleAccount: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: 1, email: 'test@example.com' };
      return true;
    },
  };

  @Module({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: mockAuthService },
      { provide: JwtService, useValue: mockJwtService },
      Reflector,
    ],
  })
  class TestModule {}

  const mockJwtAuthGuardFactory = {
    provide: JwtAuthGuard,
    useValue: mockJwtAuthGuard,
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());

    authService = moduleRef.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/login (POST) - successful login returns token', async () => {
    const dto = {
      email: 'user@example.com',
      password: 'password123',
    };

    const token = 'mocked.jwt.token';
    authService.login.mockResolvedValue(token);

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
    const dto = {
      email: 'invalid-email',
      password: '',
    };

    await request(app.getHttpServer()).post('/login').send(dto).expect(400);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('/login (POST) - failed login returns 401', async () => {
    const dto = {
      email: 'user@example.com',
      password: 'wrongpassword',
    };

    authService.login.mockRejectedValue(
      new UnauthorizedException('Unauthorized'),
    );

    await request(app.getHttpServer()).post('/login').send(dto).expect(401);

    expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
  });

  describe('Google Auth', () => {
    describe('/auth/google/login (POST)', () => {
      it('should login with Google successfully', async () => {
        const dto = {
          idToken: 'mock-id-token',
          email: 'test@gmail.com',
          name: 'Test User',
          photo: 'https://example.com/photo.jpg',
        };

        const mockServiceResponse = {
          token: 'mock-jwt-token',
          isNewUser: false,
        };

        const mockResponse = {
          access_token: 'mock-jwt-token',
          token_type: 'Bearer',
          isNewUser: false,
        };

        authService.loginWithGoogle.mockResolvedValue(mockServiceResponse);

        const response = await request(app.getHttpServer())
          .post('/auth/google/login')
          .send(dto)
          .expect(200);

        expect(response.body).toEqual(mockResponse);
        expect(authService.loginWithGoogle).toHaveBeenCalledWith(
          dto.idToken,
          dto.email,
          dto.name,
          dto.photo,
        );
      });

      it('should return registration required for new user', async () => {
        const dto = {
          idToken: 'mock-id-token',
          email: 'newuser@gmail.com',
          name: 'New User',
        };

        const mockServiceResponse = {
          token: '',
          isNewUser: true,
          requiresRegistration: true,
        };

        const mockResponse = {
          access_token: '',
          token_type: 'Bearer',
          isNewUser: true,
          requiresRegistration: true,
        };

        authService.loginWithGoogle.mockResolvedValue(mockServiceResponse);

        const response = await request(app.getHttpServer())
          .post('/auth/google/login')
          .send(dto)
          .expect(200);

        expect(response.body).toEqual(mockResponse);
        expect(authService.loginWithGoogle).toHaveBeenCalledWith(
          dto.idToken,
          dto.email,
          dto.name,
          undefined,
        );
      });

      it('should return 400 for invalid request data', async () => {
        const invalidDto = {};

        await request(app.getHttpServer())
          .post('/auth/google/login')
          .send(invalidDto)
          .expect(400);

        expect(authService.loginWithGoogle).not.toHaveBeenCalled();
      });
    });

    describe('/auth/google/link (POST)', () => {
      it('should link Google account successfully', async () => {
        const dto = {
          idToken: 'mock-id-token',
          email: 'test@gmail.com',
          name: 'Test User',
        };

        authService.linkGoogleAccount.mockResolvedValue(undefined);

        mockJwtService.verify.mockReturnValue({
          sub: 1,
          email: 'test@example.com',
        });

        await request(app.getHttpServer())
          .post('/auth/google/link')
          .set('Authorization', 'Bearer mock-jwt-token')
          .send(dto)
          .expect(200);
      });
    });

    describe('/auth/google/unlink (DELETE)', () => {
      it('should unlink Google account successfully', async () => {
        authService.unlinkGoogleAccount.mockResolvedValue(undefined);

        mockJwtService.verify.mockReturnValue({
          sub: 1,
          email: 'test@example.com',
        });

        await request(app.getHttpServer())
          .delete('/auth/google/unlink')
          .set('Authorization', 'Bearer mock-jwt-token')
          .expect(200);
      });
    });
  });
});
