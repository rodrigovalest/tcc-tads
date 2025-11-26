import { Module } from '@nestjs/common';
import { MatchService } from './services/match.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQueue } from './entities/user-queue.entity';
import { QueueService } from './services/queue.service';
import { Match } from './entities/match.entity';
import { MatchController } from './controllers/match.controller';
import { UserMatch } from './entities/user-match.entity';
import { MatchRepositoryImpl } from './repositories/match.repository';
import { UserMatchRepositoryImpl } from './repositories/user-match.repository';
import { GameInvite } from './entities/game-invite.entity';
import { GameInviteService } from './services/game-invite.service';
import { GameInviteGateway } from './gateways/game-invite.gateway';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { GameInviteController } from './controllers/game-invite.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserQueue, Match, UserMatch, GameInvite]),
    UserModule,
    AuthModule,
  ],
  controllers: [
    MatchController,
    GameInviteController,
  ],
  providers: [
    MatchService,
    QueueService,
    GameInviteService,
    GameInviteGateway,
    MatchRepositoryImpl,
    {
      provide: 'IMatchRepository',
      useClass: MatchRepositoryImpl,
    },
    UserMatchRepositoryImpl,
    {
      provide: 'IUserMatchRepository',
      useClass: UserMatchRepositoryImpl,
    },
  ],
  exports: [
    MatchService,
    QueueService,
    GameInviteService,
  ]
})
export class MatchModule { }
