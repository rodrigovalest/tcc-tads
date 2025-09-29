import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtWsAuthGuard } from './guards/jwt-ws-auth.guard';
import { JwtHttpAuthGuard } from './guards/jwt-http-auth.guard';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', '123mudar'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    JwtStrategy,
    JwtWsAuthGuard,
    JwtHttpAuthGuard,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    JwtWsAuthGuard,
    JwtHttpAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}
