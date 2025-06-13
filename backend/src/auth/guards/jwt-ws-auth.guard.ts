import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class JwtWsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractTokenFromHeader(client);

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      client.data.user = payload;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHeader(client: Socket): string {
    const rawToken =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization;

    if (!rawToken) {
      throw new WsException('Missing Authorization token');
    }

    const [scheme, token] = rawToken.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new WsException('Invalid token format');
    }

    return token;
  }
}
