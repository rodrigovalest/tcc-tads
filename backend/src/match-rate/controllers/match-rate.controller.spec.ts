import { INestApplication, Module, ValidationPipe } from "@nestjs/common";
import { MatchRateService } from "../services/match-rate.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MatchRateController } from "./match-rate.controller";
import { MatchRate } from "../entities/match-rate.entity";
import { JwtStrategy } from "../../auth/strategies/jwt.strategy";
import { HttpExceptionFilter } from "../../shared/filters/http-exception.filter";
import { Test, TestingModule } from "@nestjs/testing";
import { IUserJwtPayload } from "../../auth/models/user-jwt-payload.interface";
import { CountryCode } from "../../user/entities/country-code.enum";
import { CreateMatchRateRequestDto } from "../dtos/create-match-rate-request.dto";
import * as request from 'supertest';

describe('AuthController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let matchService: jest.Mocked<MatchRateService>;

  const mockMatchRateService = {
    createMatchRate: jest.fn(),
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
    controllers: [MatchRateController],
    providers: [
      { provide: MatchRateService, useValue: mockMatchRateService },
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
    matchService = moduleRef.get<MatchRateService>(MatchRateService) as jest.Mocked<MatchRateService>;

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create', () => {
    it('should create a match rate successfully', async () => {
      // Arrange
      const mockedLoggedJwtPayload: IUserJwtPayload = {
        sub: 1,
        email: 'testuser@example.com',
        username: 'testuser',
        nationality: CountryCode.Afghanistan,
        photoUri: 'http://example.com/photo.jpg',
      }
      const mockedJwtToken = jwtService.sign(mockedLoggedJwtPayload);

      const mockedCreateMatchRateDto: CreateMatchRateRequestDto = {
        matchId: 'df7623ab-6eaf-4fb7-832c-4a7fa5381c55',
        reviewedId: 2,
        fluencyScore: 4,
      };

      matchService.createMatchRate.mockResolvedValue({} as MatchRate);

      // Act
      await request(app.getHttpServer())
        .post('/match-rate')
        .set('Authorization', `Bearer ${mockedJwtToken}`)
        .send(mockedCreateMatchRateDto)
        .expect(201);      

      // Assert
      expect(matchService.createMatchRate).toHaveBeenCalledWith(
        mockedCreateMatchRateDto.matchId,
        mockedLoggedJwtPayload.sub,
        mockedCreateMatchRateDto.reviewedId,
        mockedCreateMatchRateDto.fluencyScore,
      );
      expect(matchService.createMatchRate).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if no JWT token is provided', async () => {
      // Arrange
      const mockedCreateMatchRateDto: CreateMatchRateRequestDto = {
        matchId: 'df7623ab-6eaf-4fb7-832c-4a7fa5381c55',
        reviewedId: 2,
        fluencyScore: 4,
      };

      // Act
      await request(app.getHttpServer())
        .post('/match-rate')
        .send(mockedCreateMatchRateDto)
        .expect(401);

      // Assert
      expect(matchService.createMatchRate).toHaveBeenCalledTimes(0);
    });
  });
});
