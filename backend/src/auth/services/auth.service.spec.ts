import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../user/services/user.service';
import { User } from '../../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from '../errors/unauthorized.error';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      const user: Partial<User> = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = 'test-token';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(user as User);

      expect(result).toEqual({
        access_token: token,
        token_type: 'bearer',
        expires_in: 86400,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        name: user.username,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      const user = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashedPassword',
        isActive: true,
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.isActive,
      });
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(userService.updateLastLogin).toHaveBeenCalledWith(user.id);
    });

    it('should throw UnauthorizedError when user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedError('Email address or password provided is incorrect.')
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw UnauthorizedError when password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';
      
      const user = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashedPassword',
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedError('Email address or password provided is incorrect.')
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });
  });
});