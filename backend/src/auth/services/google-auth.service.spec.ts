import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthService } from './google-auth.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

jest.mock('google-auth-library');
const MockedOAuth2Client = OAuth2Client as jest.MockedClass<
  typeof OAuth2Client
>;

describe('GoogleAuthService', () => {
  let googleAuthService: GoogleAuthService;
  let configService: ConfigService;
  let mockOAuth2Client: any;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    MockedOAuth2Client.mockClear();
    mockOAuth2Client = {
      verifyIdToken: jest.fn(),
    };
    MockedOAuth2Client.mockImplementation(() => mockOAuth2Client);

    mockConfigService.get.mockReturnValue('mock-google-client-id');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAuthService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    googleAuthService = module.get<GoogleAuthService>(GoogleAuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('constructor', () => {
    it('should create OAuth2Client with correct client ID', () => {
      expect(MockedOAuth2Client).toHaveBeenCalledWith('mock-google-client-id');
      expect(mockConfigService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
    });

    it('should throw error if GOOGLE_CLIENT_ID is not defined', () => {
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => {
        new GoogleAuthService(configService);
      }).toThrow('GOOGLE_CLIENT_ID must be defined in environment variables');
    });
  });

  describe('verifyIdToken', () => {
    const idToken = 'mock-id-token';
    const validPayload = {
      sub: 'google-user-id',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/photo.jpg',
      email_verified: true,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully verify valid Google ID token', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(validPayload),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      const result = await googleAuthService.verifyIdToken(idToken);

      expect(result).toEqual({
        sub: validPayload.sub,
        email: validPayload.email,
        name: validPayload.name,
        picture: validPayload.picture,
        email_verified: validPayload.email_verified,
      });

      expect(mockOAuth2Client.verifyIdToken).toHaveBeenCalledWith({
        idToken,
        audience: 'mock-google-client-id',
      });
    });

    it('should throw BadRequestException if payload is null', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(null),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      await expect(googleAuthService.verifyIdToken(idToken)).rejects.toThrow(
        BadRequestException,
      );
      await expect(googleAuthService.verifyIdToken(idToken)).rejects.toThrow(
        'Invalid Google token payload',
      );
    });

    it('should throw BadRequestException if email is missing', async () => {
      const invalidPayload = { ...validPayload, email: undefined };
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(invalidPayload),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      await expect(googleAuthService.verifyIdToken(idToken)).rejects.toThrow(
        BadRequestException,
      );
      await expect(googleAuthService.verifyIdToken(idToken)).rejects.toThrow(
        'Invalid Google token payload',
      );
    });

    it('should throw BadRequestException if sub is missing', async () => {
      const invalidPayload = { ...validPayload, sub: undefined };
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(invalidPayload),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      await expect(googleAuthService.verifyIdToken(idToken)).rejects.toThrow(
        BadRequestException,
      );
      await expect(googleAuthService.verifyIdToken(idToken)).rejects.toThrow(
        'Invalid Google token payload',
      );
    });

    it('should throw BadRequestException if email is not verified', async () => {
      const invalidPayload = { ...validPayload, email_verified: false };
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(invalidPayload),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      await expect(googleAuthService.verifyIdToken(idToken)).rejects.toThrow(
        BadRequestException,
      );
      await expect(googleAuthService.verifyIdToken(idToken)).rejects.toThrow(
        'Google email not verified',
      );
    });

    it('should use email as name fallback if name is not provided', async () => {
      const payloadWithoutName = { ...validPayload, name: undefined };
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(payloadWithoutName),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      const result = await googleAuthService.verifyIdToken(idToken);

      expect(result.name).toBe(validPayload.email);
    });

    it('should handle OAuth2Client errors', async () => {
      const error = new Error('Token verification failed');
      mockOAuth2Client.verifyIdToken.mockRejectedValue(error);

      await expect(googleAuthService.verifyIdToken(idToken)).rejects.toThrow(
        'Invalid Google token',
      );
    });
  });
});
