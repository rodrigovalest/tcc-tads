import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { WhoAmIDuoService } from './services/who-am-i-duo.service';
import { MatchModule } from 'src/match/match.module';
import { WhoAmIDuoGateway } from './gateways/who-am-i-duo.gateway';

@Module({
  imports: [
    AuthModule,
    MatchModule
  ],
  providers: [
    WhoAmIDuoService,
    WhoAmIDuoGateway
  ],
})
export class WhoAmIModule {}
