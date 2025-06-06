import { Module } from '@nestjs/common';
import { MatchmakingService } from './services/matchmaking.service';
import { MatchmakingGateway } from './gateways/matchmaking.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule
  ],
  providers: [
    MatchmakingGateway, 
    MatchmakingService
  ],
})
export class MatchmakingModule {}
