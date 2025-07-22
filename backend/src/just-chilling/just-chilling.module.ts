import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JustChillingDuoService } from './services/just-chilling-duo.service';
import { MatchModule } from 'src/match/match.module';
import { JustChillingDuoGateway } from './gateways/just-chilling-duo.gateway';

@Module({
  imports: [
    AuthModule,
    MatchModule
  ],
  providers: [
    JustChillingDuoService,
    JustChillingDuoGateway
  ],
})
export class JustChillingModule {}
