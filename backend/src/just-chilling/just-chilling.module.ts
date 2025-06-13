import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JustChillingService } from './services/just-chilling.service';
import { MatchModule } from 'src/match/match.module';
import { JustChillingGateway } from './gateways/just-chilling.gateway';

@Module({
  imports: [
    AuthModule,
    MatchModule
  ],
  providers: [
    JustChillingService,
    JustChillingGateway
  ],
})
export class JustChillingModule {}
