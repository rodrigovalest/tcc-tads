import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { CurrentHttpUser } from '../../auth/decorators/current-http-user.decorator';
import { JwtHttpAuthGuard } from '../../auth/guards/jwt-http-auth.guard';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { GameInviteService } from '../services/game-invite.service';

@Controller('game-invites')
@UseGuards(JwtHttpAuthGuard)
export class GameInviteController {
  constructor(private readonly gameInviteService: GameInviteService) {}

  @Get('pending')
  async getPendingInvites(@CurrentHttpUser() user: IUserJwtPayload) {
    return this.gameInviteService.getPendingInvites(user.sub);
  }

  @Get('sent')
  async getSentInvites(@CurrentHttpUser() user: IUserJwtPayload) {
    return this.gameInviteService.getSentInvites(user.sub);
  }
}


