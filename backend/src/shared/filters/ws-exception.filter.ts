import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name, { timestamp: true });

  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client: Socket = ctx.getClient<Socket>();
    const message = typeof exception.getError() === 'string'
          ? exception.getError()
          : (exception.getError() as any)?.message ?? exception.getError();

    this.logger.error(
      `WS ERROR - message: ${message} | error: ${exception.getError()}`
    );

    client.emit('exception', {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: message
    });
  }
}
