import { UseGuards } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { CurrentWsUser } from 'src/auth/decorators/current-ws-user.decorator';
import { JwtWsAuthGuard } from 'src/auth/guards/jwt-ws-auth.guard';
import { IUserJwtPayload } from 'src/auth/models/user-jwt-payload.interface';

@WebSocketGateway()
export class MatchmakingGateway {

  @SubscribeMessage('hello')
  hello() {
    console.log('hello')
    return "hello message";
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('user')
  currentUser(
    @CurrentWsUser() user: IUserJwtPayload,
    @ConnectedSocket() client: Socket
  ) {
    return "hello user";
  }
}
