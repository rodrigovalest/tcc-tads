import { Module } from '@nestjs/common';
import { MatchmakingService } from './services/matchmaking.service';
import { MatchmakingGateway } from './gateways/matchmaking.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { QueueService } from './services/queue.service';

@Module({
  imports: [
    AuthModule
  ],
  providers: [
    MatchmakingGateway, 
    MatchmakingService,
    QueueService
  ],
})
export class MatchmakingModule {}
