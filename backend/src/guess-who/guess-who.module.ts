import { Module } from '@nestjs/common';
import { GuessWhoDuoService } from './services/guess-who-duo.service';
import { GuessWhoDuoGateway } from './gateways/guess-who-duo.gateway';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';
import { UserModule } from '../user/user.module';
import { GuessWhoMatchRepositoryImpl } from './repositories/guess-who-match.repository';

@Module({
  imports: [
    AuthModule, 
    MatchModule,
    UserModule
  ],
  providers: [
    GuessWhoDuoService, 
    GuessWhoDuoGateway,
    {
      provide: 'IGuessWhoMatchRepository',
      useClass: GuessWhoMatchRepositoryImpl,
    },
  ],
})
export class GuessWhoModule {}
