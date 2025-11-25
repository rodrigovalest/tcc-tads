import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { IUserJwtPayload } from '../models/user-jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService, GoogleTokenPayload } from './google-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user: User | null = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Email address or password provided is incorrect.',
      );
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        'Email address or password provided is incorrect.',
      );
    }

    const payload: IUserJwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      nationality: user.nationality,
      photoUri: user.photo ?? null,
    };

    return this.jwtService.sign(payload);
  }

  async loginWithGoogle(
    idToken: string,
    email: string,
    name: string,
    photo?: string,
  ): Promise<{
    token: string;
    isNewUser: boolean;
    requiresRegistration?: boolean;
  }> {
    const googlePayload = await this.googleAuthService.verifyIdToken(idToken);

    if (googlePayload.email !== email) {
      throw new BadRequestException('Email mismatch');
    }

    let user = await this.userService.findByGoogleId(googlePayload.sub);

    if (!user) {
      user = await this.userService.findByEmail(email);

      if (!user) {
        return {
          token: '',
          isNewUser: true,
          requiresRegistration: true,
        };
      }

      if (user.googleId) {
        throw new ConflictException(
          'This email is already linked to another Google account',
        );
      }

      user = await this.userService.linkGoogleAccount(
        user.id,
        googlePayload.sub,
        email,
        photo,
      );
    }

    const payload: IUserJwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      nationality: user.nationality,
      photoUri: user.photo ?? null,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      isNewUser: false,
    };
  }

  async linkGoogleAccount(userId: number, idToken: string): Promise<void> {
    const googlePayload = await this.googleAuthService.verifyIdToken(idToken);
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.googleId) {
      throw new ConflictException('Google account already linked');
    }

    const existingGoogleUser = await this.userService.findByGoogleId(
      googlePayload.sub,
    );
    if (existingGoogleUser) {
      throw new ConflictException(
        'This Google account is already linked to another user',
      );
    }

    await this.userService.linkGoogleAccount(
      user.id,
      googlePayload.sub,
      googlePayload.email,
    );
  }

  async unlinkGoogleAccount(userId: number): Promise<void> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.googleId) {
      throw new BadRequestException('No Google account linked');
    }

    await this.userService.unlinkGoogleAccount(user.id);
  }

  async getGoogleStatus(
    userId: number,
  ): Promise<{ linked: boolean; email?: string }> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      linked: !!user.googleId,
      email: user.googleEmail,
    };
  }
}
