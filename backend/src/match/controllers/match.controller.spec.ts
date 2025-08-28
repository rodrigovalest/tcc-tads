import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from '../../shared/filters/http-exception.filter';
import { MatchController } from './match.controller';
import { MatchService } from '../services/match.service';
import { Match } from '../entities/match.entity';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchFormat } from '../entities/match-format.enum';
import { MatchStatus } from '../entities/match-status.enum';
import { MatchLanguage } from '../entities/match-language.enum';
import { CountryCode } from '../../user/entities/country-code.enum';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import * as request from 'supertest';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ListMatchesResponseDto } from '../dtos/list-matches-response.dto';
import { User } from 'src/user/entities/user.entity';
import { UserMatch } from '../entities/user-match.entity';

describe('AuthController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let matchService: jest.Mocked<MatchService>;

  const mockMatchService = {
    findAllMatchesByUserId: jest.fn(),
  };

  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [() => ({ JWT_SECRET: 'test-secret' })],
      }),
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          secret: config.get('JWT_SECRET'),
          signOptions: { expiresIn: '1h' },
        }),
      }),
    ],
    controllers: [MatchController],
    providers: [
      { provide: MatchService, useValue: mockMatchService },
      JwtStrategy,
    ],
  })
  class TestModule { }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());

    jwtService = moduleRef.get<JwtService>(JwtService);
    matchService = moduleRef.get<MatchService>(MatchService) as jest.Mocked<MatchService>;

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/matches (POST) - successful findAllMatchesByUser returns all matches that logged user played', async () => {
    // Arrange
    const mockedLoggedJwtPayload: IUserJwtPayload = {
      sub: 1,
      email: 'testuser@example.com',
      username: 'testuser',
      nationality: CountryCode.Afghanistan,
    }
    const mockedJwtToken = jwtService.sign(mockedLoggedJwtPayload);

    const userMatches = [{
      id: 1,
      match: undefined as unknown as Match,
      socketId: 'test-socket-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        nationality: CountryCode.Afghanistan,
        isActive: true,
        lastLoginAt: new Date(),
        userMatches: [],
        languages: [],
        interestTopics: [],
      },
    }] as UserMatch[];

    const mockMatches: Match[] = [
      {
        id: '1',
        startTime: new Date(),
        endTime: new Date(),
        mode: MatchMode.JUST_CHILLING,
        format: MatchFormat.SOLO,
        language: MatchLanguage.EN,
        status: MatchStatus.COMPLETED,
        userMatches: userMatches,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    const expectedResponse: ListMatchesResponseDto[] = [
      {
        id: '1',
        startTime: mockMatches[0].startTime.toISOString(),
        endTime: mockMatches[0].endTime.toISOString(),
        mode: mockMatches[0].mode,
        format: mockMatches[0].format,
        language: mockMatches[0].language,
        status: mockMatches[0].status,
        users: [{ id: 1, username: 'testuser', nationality: CountryCode.Afghanistan, photoUri: null }]
      }
    ];

    matchService.findAllMatchesByUserId.mockResolvedValue(mockMatches);

    // Act
    const response = await request(app.getHttpServer())
      .get('/matches')
      .set('Authorization', `Bearer ${mockedJwtToken}`)
      .expect(200);

    // Assert
    expect(matchService.findAllMatchesByUserId).toHaveBeenCalledWith(mockedLoggedJwtPayload.sub);
    expect(response.body).toHaveLength(1);
    expect(response.body).toEqual(expectedResponse);
  });

  it('/matches (GET) - unauthorized access returns 401', async () => {
    await request(app.getHttpServer())
      .get('/matches')
      .expect(401);

    expect(matchService.findAllMatchesByUserId).toHaveBeenCalledTimes(0);
  });
});
