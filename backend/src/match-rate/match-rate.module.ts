import { Module } from '@nestjs/common';
import { MatchRateService } from './services/match-rate.service';
import { MatchRateController } from './controllers/match-rate.controller';
import { MatchRate } from './entities/match-rate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchRateRepositoryImpl } from './repositories/match-rate.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchRate])
  ],
  controllers: [
    MatchRateController
  ],
  providers: [
    MatchRateService,
    MatchRateRepositoryImpl,
    {
      provide: 'IMatchRateRepository',
      useClass: MatchRateRepositoryImpl,
    },
  ],
  exports: [
    MatchRateService
  ],
})  
export class MatchRateModule {}
