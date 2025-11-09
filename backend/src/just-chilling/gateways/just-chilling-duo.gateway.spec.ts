import { INestApplication, Module, ValidationPipe } from "@nestjs/common";
import { JustChillingDuoService } from "../services/just-chilling-duo.service";
import { JustChillingInviteService } from "../services/just-chilling-invite.service";
import { GlobalConnectionManagerService } from "../../shared/services/global-connection-manager.service";
import { JustChillingDuoGateway } from "./just-chilling-duo.gateway";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Test, TestingModule } from "@nestjs/testing";
import { io, Socket } from 'socket.io-client';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { IUserJwtPayload } from "../../auth/models/user-jwt-payload.interface";
import { CountryCode } from "../../user/entities/country-code.enum";
import { WsExceptionFilter } from "../../shared/filters/ws-exception.filter";

const mockedJustChillingDuoService = {
  enqueueDuoFormatAndTryStart: jest.fn(),
  confirmStartMatch: jest.fn(),
  handleDisconnect: jest.fn(),
};

const mockedJustChillingInviteService = {
  sendInvite: jest.fn(),
  respondToInvite: jest.fn(),
  cancelInvite: jest.fn(),
};

const mockedGlobalConnectionManagerService = {
  registerConnection: jest.fn(),
  removeConnection: jest.fn(),
  getAllSocketsForUser: jest.fn().mockReturnValue([]),
};

describe('JustChillingDuoGateway (semi E2E)', () => {
  let app: INestApplication;
  let client: Socket;
  let jwtService: JwtService;
  let port: number;

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
    providers: [
      JustChillingDuoGateway,
      { provide: JustChillingDuoService, useValue: mockedJustChillingDuoService },
      { provide: JustChillingInviteService, useValue: mockedJustChillingInviteService },
      { provide: GlobalConnectionManagerService, useValue: mockedGlobalConnectionManagerService },
    ],
  })
  class TestModule { }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new WsExceptionFilter());

    jwtService = moduleRef.get<JwtService>(JwtService);

    const server = await app.listen(0);
    const address = server.address();
    port = typeof address === 'string' ? parseInt(address) : address.port;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (client && client.connected) {
      client.disconnect();
    }
  });

  afterAll(async () => {
    if (client) {
      client.close();
    }
    await app.close();
  });

  it('should be defined', () => {
    const gateway = app.get<JustChillingDuoGateway>(JustChillingDuoGateway);
    expect(gateway).toBeDefined();
  });

  it('just-chilling:duo:enqueue - should call JustChillingDuoService.enqueueDuoFormatAndTryStart', (done) => {
    const mockedLoggedJwtPayload: IUserJwtPayload = { sub: 1, email: 'testuser@example.com', username: 'testuser', nationality: CountryCode.Afghanistan };
    const mockedJwtToken = jwtService.sign(mockedLoggedJwtPayload);
    client = io(`http://localhost:${port}`, { auth: { token: `Bearer ${mockedJwtToken}` } });

    const messageDto = { matchLanguage: 'en' };

    client.on('connect', () => {
      client.emit('just-chilling:duo:enqueue', messageDto);

      setTimeout(() => {
        expect(mockedJustChillingDuoService.enqueueDuoFormatAndTryStart).toHaveBeenCalledWith(
          expect.objectContaining({ sub: 1 }),
          expect.any(String),
          'en',
        );
        done();
      }, 50);
    });

    client.on('connect_error', (err) => {
      done(err);
    });
  });

  it('just-chilling:duo:enqueue - without bearer token authentication - should return error', (done) => {
    client = io(`http://localhost:${port}`);

    const messageDto = { matchLanguage: 'en' };

    client.on('connect', () => {
      client.emit('just-chilling:duo:enqueue', messageDto);

      setTimeout(() => {
        expect(mockedJustChillingDuoService.enqueueDuoFormatAndTryStart).not.toHaveBeenCalled();
        done();
      }, 50);
    });

    client.on('exception', (err) => {
      expect(err).toBeInstanceOf(Object);
      expect(err.message).toBe('Missing Authorization token');
      expect(err.status).toBe('ERROR');
      done();
    });

    client.on('connect_error', (err) => {
      done(err);
    });
  });

  it('just-chilling:duo:enqueue - with invalid bearer token authentication - should return error', (done) => {
    const invalidToken = 'invalid.token.here';

    client = io(`http://localhost:${port}`, {
      auth: {
        token: `Bearer ${invalidToken}`,
      },
    });

    const messageDto = { matchLanguage: 'en' };

    client.on('connect', () => {
      client.emit('just-chilling:duo:enqueue', messageDto);

      setTimeout(() => {
        expect(mockedJustChillingDuoService.enqueueDuoFormatAndTryStart).not.toHaveBeenCalled();
        done();
      }, 50);
    });

    client.on('exception', (err) => {
      expect(err).toBeInstanceOf(Object);
      expect(err.message).toBe('Unauthorized');
      expect(err.status).toBe('ERROR');
      done();
    });

    client.on('connect_error', (err) => {
      done(err);
    });
  });

  it('just-chilling:duo:enqueue - with invalid token format - should return error', (done) => {
    const invalidToken = 'invalid.token.here';

    client = io(`http://localhost:${port}`, {
      auth: {
        token: `${invalidToken}`,
      },
    });

    const messageDto = { matchLanguage: 'en' };

    client.on('connect', () => {
      client.emit('just-chilling:duo:enqueue', messageDto);

      setTimeout(() => {
        expect(mockedJustChillingDuoService.enqueueDuoFormatAndTryStart).not.toHaveBeenCalled();
        done();
      }, 50);
    });

    client.on('exception', (err) => {
      expect(err).toBeInstanceOf(Object);
      expect(err.message).toBe('Invalid token format');
      expect(err.status).toBe('ERROR');
      done();
    });

    client.on('connect_error', (err) => {
      done(err);
    });
  });
});
