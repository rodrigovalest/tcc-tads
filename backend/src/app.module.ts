import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MatchModule } from './match/match.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JustChillingModule } from './just-chilling/just-chilling.module';
import { WhoAmIModule } from './who-am-i/who-am-i.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    EventEmitterModule.forRoot(),
    
    UserModule,
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: Number(configService.get<number>('POSTGRES_PORT', 14000)),
        username: configService.get<string>('POSTGRES_USERNAME', '123mudar'),
        password: configService.get<string>('POSTGRES_PASSWORD', '123mudar'),
        database: configService.get<string>('POSTGRES_DATABASE', '123mudar'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    
    MatchModule,
    
    JustChillingModule,
    
    WhoAmIModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
