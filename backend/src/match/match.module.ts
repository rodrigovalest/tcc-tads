import { Module } from '@nestjs/common';
import { MatchService } from './services/match.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQueue } from './entities/user-queue.entity';
import { QueueService } from './services/queue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserQueue])
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
