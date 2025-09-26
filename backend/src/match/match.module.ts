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

@Module({
  imports: [
    TypeOrmModule.forFeature([UserQueue, Match, UserMatch]),
  ],
  controllers: [
    MatchController
  ],
  providers: [
    MatchService,
    QueueService,
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
    QueueService
  ]
})
export class MatchModule { }
