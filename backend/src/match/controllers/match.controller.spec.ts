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
import { UserMatch } from '../entities/user-match.entity';

describe('AuthController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let matchService: jest.Mocked<MatchService>;

  const mockMatchService = {
    findAllMatchesWithAverageScore: jest.fn(),
    createSoloMatch: jest.fn(),
    completeSoloMatch: jest.fn(),
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
  class TestModule {}

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

  describe('findAllMatchesByUser', () => {
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
          name: 'Test User',
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

      const mockMatchesWithAverageScore: Array<{ match: Match; averageFluencyScore: number | null }> = [
        {
          match: {
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
          },
          averageFluencyScore: 1,
        }
      ];

      matchService.findAllMatchesWithAverageScore.mockResolvedValue(mockMatchesWithAverageScore);

      // Act
      const response = await request(app.getHttpServer())
        .get('/matches')
        .set('Authorization', `Bearer ${mockedJwtToken}`)
        .expect(200);

      // Assert
      expect(matchService.findAllMatchesWithAverageScore).toHaveBeenCalledWith(mockedLoggedJwtPayload.sub);
      expect(response.body).toHaveLength(1);

      const expectedResponse: ListMatchesResponseDto[] = [
        {
          id: '1',
          startTime: mockMatchesWithAverageScore[0].match.startTime.toISOString(),
          endTime: mockMatchesWithAverageScore[0].match.endTime.toISOString(),
          mode: mockMatchesWithAverageScore[0].match.mode,
          format: mockMatchesWithAverageScore[0].match.format,
          language: mockMatchesWithAverageScore[0].match.language,
          status: mockMatchesWithAverageScore[0].match.status,
          averageFluencyScore: mockMatchesWithAverageScore[0].averageFluencyScore,
          users: [{ id: 1, username: 'testuser', nationality: CountryCode.Afghanistan, photoUri: null }]
        }
      ];
      expect(response.body).toEqual(expectedResponse);
    });

    it('/matches (GET) - unauthorized access returns 401', async () => {
      await request(app.getHttpServer())
        .get('/matches')
        .expect(401);

      expect(matchService.findAllMatchesWithAverageScore).toHaveBeenCalledTimes(0);
    });
  });

  describe('createSoloMatch', () => {
    it('/matches/solo (POST) - successful createSoloMatch returns matchId', async () => {
      // Arrange
      const mockedLoggedJwtPayload: IUserJwtPayload = {
        sub: 1,
        email: 'testuser@example.com',
        username: 'testuser',
        nationality: CountryCode.Afghanistan,
      }
      const mockedJwtToken = jwtService.sign(mockedLoggedJwtPayload); 

      const mockedNewSoloMatch: Match = { id: 'mocked-match-id' } as Match;
      const matchMode = MatchMode.JUST_CHILLING;
      const matchLanguage = MatchLanguage.EN;

      matchService.createSoloMatch.mockResolvedValue(mockedNewSoloMatch);

      // Act
      const response = await request(app.getHttpServer())
        .post('/matches/solo')
        .set('Authorization', `Bearer ${mockedJwtToken}`)
        .send({ mode: matchMode, language: matchLanguage })
        .expect(201);

      // Assert
      expect(matchService.createSoloMatch).toHaveBeenCalledWith(matchMode, matchLanguage, mockedLoggedJwtPayload.sub);
      expect(response.body).toEqual({ matchId: mockedNewSoloMatch.id });
    });

    it('/matches (GET) - unauthorized access returns 401', async () => {
      await request(app.getHttpServer())
        .post('/matches/solo')
        .send({ mode: MatchMode.JUST_CHILLING, language: MatchLanguage.EN })
        .expect(401);

      expect(matchService.createSoloMatch).toHaveBeenCalledTimes(0);
    });
  });

  describe('completeSoloMatch', () => {
    it('/matches/:matchId/complete (POST) - successful completeSoloMatch returns success true', async () => {
      // Arrange
      const mockedLoggedJwtPayload: IUserJwtPayload = {
        sub: 1,
        email: 'testuser@example.com',
        username: 'testuser',
        nationality: CountryCode.Afghanistan,
      }
      const mockedJwtToken = jwtService.sign(mockedLoggedJwtPayload);

      const matchId = 'mocked-match-id';

      matchService.completeSoloMatch.mockResolvedValue();

      // Act
      const response = await request(app.getHttpServer())
        .post(`/matches/${matchId}/complete`)
        .set('Authorization', `Bearer ${mockedJwtToken}`)
        .expect(200);

      // Assert
      expect(matchService.completeSoloMatch).toHaveBeenCalledWith(matchId);
      expect(matchService.completeSoloMatch).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });

    it('/matches (GET) - unauthorized access returns 401', async () => {
      const matchId = 'mocked-match-id';

      await request(app.getHttpServer())
        .post(`/matches/${matchId}/complete`)
        .expect(401);

      expect(matchService.completeSoloMatch).toHaveBeenCalledTimes(0);
    });
  });
});
