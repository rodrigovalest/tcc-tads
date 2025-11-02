import { Module } from '@nestjs/common';
import { GuessWhoService } from './services/guess-who-duo.service';
import { GuessWhoGateway } from './gateways/guess-who-duo.gateway';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    AuthModule, 
    MatchModule,
    UserModule
  ],
  providers: [
    GuessWhoGateway, 
    GuessWhoService
  ],
})
export class GuessWhoModule {}
