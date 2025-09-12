import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { IUserJwtPayload } from '../models/user-jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
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
    };

    return this.jwtService.sign(payload);
  }
}
