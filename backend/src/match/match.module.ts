import { Module } from '@nestjs/common';
import { MatchService } from './services/match.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQueue } from './entities/user-queue.entity';
import { QueueService } from './services/queue.service';
import { Match } from './entities/match.entity';
import { MatchController } from './controllers/match.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserQueue, Match])
  ],
  controllers: [
    MatchController
  ],
  providers: [
    MatchService,
    QueueService
  ],
  exports: [
    MatchService,
    QueueService
  ]
})
export class MatchModule {}
