import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    updateUser: jest.fn(),
    linkGoogleAccount: jest.fn(),
    findById: jest.fn(),
    unlinkGoogleAccount: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockGoogleAuthService = {
    verifyIdToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = 'hashed_password';
    const user = {
      id: 'user-id-1',
      email,
      username: 'username1',
      password: hashedPassword,
      nationality: 'BR',
    };

    it('should return a signed JWT token on successful login', async () => {
      mockUserService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      mockConfigService.get.mockReturnValue('test-secret');
      mockJwtService.sign.mockReturnValue('signed.jwt.token');

      const result = await authService.login(email, password);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        username: user.username,
        nationality: user.nationality,
        photoUri: null,
      });
      expect(result).toBe('signed.jwt.token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUserService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('loginWithGoogle', () => {
    const idToken = 'mock-id-token';
    const email = 'test@example.com';
    const name = 'Test User';
    const photo = 'https://example.com/photo.jpg';

    const googlePayload = {
      sub: 'google-user-id',
      email: email,
      name: name,
      picture: photo,
      email_verified: true,
    };

    const user = {
      id: 1,
      email: email,
      username: 'testuser',
      nationality: 'BR',
      password: 'hashed-password',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should login existing user with Google successfully', async () => {
      const updatedUser = { ...user, googleId: googlePayload.sub };

      mockGoogleAuthService.verifyIdToken.mockResolvedValue(googlePayload);
      mockUserService.findByGoogleId.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(user);
      mockUserService.linkGoogleAccount.mockResolvedValue(updatedUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.loginWithGoogle(
        idToken,
        email,
        name,
        photo,
      );

      expect(result).toEqual({
        token: 'mock-jwt-token',
        isNewUser: false,
      });
      expect(mockGoogleAuthService.verifyIdToken).toHaveBeenCalledWith(idToken);
      expect(mockUserService.findByGoogleId).toHaveBeenCalledWith(
        googlePayload.sub,
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserService.linkGoogleAccount).toHaveBeenCalledWith(
        user.id,
        googlePayload.sub,
        email,
        photo,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        username: user.username,
        nationality: user.nationality,
        photoUri: null,
      });
    });

    it('should require registration for new Google user', async () => {
      mockGoogleAuthService.verifyIdToken.mockResolvedValue(googlePayload);
      mockUserService.findByGoogleId.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await authService.loginWithGoogle(
        idToken,
        email,
        name,
        photo,
      );

      expect(result).toEqual({
        token: '',
        isNewUser: true,
        requiresRegistration: true,
      });
      expect(mockGoogleAuthService.verifyIdToken).toHaveBeenCalledWith(idToken);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw error if Google token verification fails', async () => {
      mockGoogleAuthService.verifyIdToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(
        authService.loginWithGoogle(idToken, email, name, photo),
      ).rejects.toThrow('Invalid token');

      expect(mockGoogleAuthService.verifyIdToken).toHaveBeenCalledWith(idToken);
      expect(mockUserService.findByEmail).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });
});
