import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { JustChillingDuoService } from './services/just-chilling-duo.service';
import { JustChillingInviteService } from './services/just-chilling-invite.service';
import { MatchModule } from 'src/match/match.module';
import { JustChillingDuoGateway } from './gateways/just-chilling-duo.gateway';
import { Friendship } from 'src/user/entities/friendship.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friendship, User]),
    AuthModule,
    MatchModule
  ],
  providers: [
    JustChillingDuoService,
    JustChillingInviteService,
    JustChillingDuoGateway
  ],
})
export class JustChillingModule {}
