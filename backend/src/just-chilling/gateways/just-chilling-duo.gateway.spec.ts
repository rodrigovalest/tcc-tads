import { INestApplication, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createServer, Server } from 'http';
import * as io from 'socket.io-client';

import { JustChillingDuoGateway } from './just-chilling-duo.gateway';
import { JustChillingDuoService } from '../services/just-chilling-duo.service';
import { JwtWsAuthGuard } from '../../auth/guards/jwt-ws-auth.guard';
import { WsExceptionFilter } from '../../shared/filters/ws-exception.filter';
import { WsValidationPipe } from '../../shared/pipes/WsValidationPipe';

describe('JustChillingDuoGateway (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let clientSocket: io.Socket;

  const mockUser = {
    sub: 42,
    username: 'test_user',
    email: 'test@example.com',
  };

  const mockJustChillingDuoService = {
    enqueueDuoFormatAndTryStart: jest.fn(),
    handleDisconnect: jest.fn(),
  };

  const mockJwtWsGuard = {
    canActivate: (context) => {
      const client = context.switchToWs().getClient();
      client.data = { user: mockUser }
      return true;
    },
  };

  @Module({
    providers: [
      JustChillingDuoGateway,
      { provide: JustChillingDuoService, useValue: mockJustChillingDuoService },
    ],
  })
  class TestWsModule {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestWsModule],
    })
      .overrideProvider(JwtWsAuthGuard)
      .useValue(mockJwtWsGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new (require('@nestjs/platform-socket.io')).IoAdapter(app));
    app.useGlobalPipes(new WsValidationPipe());
    app.useGlobalFilters(new WsExceptionFilter());

    await app.init();

    httpServer = createServer(app.getHttpAdapter().getInstance());
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));

    const port = (httpServer.address() as any).port;
    clientSocket = io.connect(`http://localhost:${port}`, {
      transports: ['websocket'],
      reconnection: false,
      auth: {
        token: 'Bearer test-token',
      },
    });

    await new Promise<void>((resolve) => clientSocket.on('connect', () => resolve()));
  });

  afterAll(async () => {
    clientSocket.close();
    httpServer.close();
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call enqueueDuoFormatAndTryStart on "just-chilling:duo:enqueue"', async () => {
    const payload = { matchLanguage: 'EN' };
    clientSocket.emit('just-chilling:duo:enqueue', payload);
    await new Promise((r) => setTimeout(r, 50));

    expect(mockJustChillingDuoService.enqueueDuoFormatAndTryStart).toHaveBeenCalledWith(
      mockUser.sub,
      expect.any(String),
      'EN'
    );
  });

  it('should call handleDisconnect on disconnect', async () => {
    const socketId = clientSocket.id;
    clientSocket.disconnect();
    await new Promise((r) => setTimeout(r, 50));

    expect(mockJustChillingDuoService.handleDisconnect).toHaveBeenCalledWith(socketId);
  });
});
