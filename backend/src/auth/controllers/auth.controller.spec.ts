import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { HttpExceptionFilter } from '../../shared/filters/http-exception.filter';

const mockAuthService = {
  login: jest.fn(),
};

class MockLocalAuthGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();

    if (!req.body.email || !req.body.password) {
      throw new BadRequestException('Email and password are required');
    }
    if (req.body.email === 'invalid@example.com' || req.body.password === 'wrongpassword') {
      throw new UnauthorizedException('Email address or password provided is incorrect.');
    }
    req.user = { id: 1, email: req.body.email, username: 'testuser' };
    return true;
  }
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(LocalAuthGuard)
      .useClass(MockLocalAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/login (POST) - sucesso com credenciais válidas', async () => {
    const loginDto = { email: 'test@example.com', password: 'validPassword' };
    const expectedResponse = {
      access_token: 'jwt-token',
      token_type: 'bearer',
      expires_in: 86400,
    };

    mockAuthService.login.mockResolvedValue(expectedResponse);

    const response = await request(app.getHttpServer())
      .post('/login')
      .send(loginDto)
      .expect(200);

    expect(response.body).toEqual(expectedResponse);
    expect(mockAuthService.login).toHaveBeenCalledWith({
      id: 1,
      email: loginDto.email,
      username: 'testuser',
    });
  });

  it('/login (POST) - falha por credenciais inválidas', async () => {
    const loginDto = { email: 'invalid@example.com', password: 'wrongpassword' };

    const response = await request(app.getHttpServer())
      .post('/login')
      .send(loginDto)
      .expect(401);

    expect(response.body.message).toBe('Email address or password provided is incorrect.');
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('/login (POST) - falha por falta de credenciais', async () => {
    const loginDto = {};

    const response = await request(app.getHttpServer())
      .post('/login')
      .send(loginDto)
      .expect(400);

    expect(response.body.message).toBe('Email and password are required');
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});
