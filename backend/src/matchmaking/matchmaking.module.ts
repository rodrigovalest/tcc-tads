import { Module } from '@nestjs/common';
import { MatchmakingService } from './services/matchmaking.service';
import { MatchmakingGateway } from './gateways/matchmaking.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { QueueService } from './services/queue.service';
import { UserQueue } from './entities/user-queue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([UserQueue])
  ],
  providers: [
    MatchmakingGateway, 
    MatchmakingService,
    QueueService
  ],
})
export class MatchmakingModule {}
