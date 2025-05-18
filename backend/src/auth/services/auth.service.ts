import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { UserPayload } from '../models/UserPayload';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(user: User): Promise<AuthResponseDto> {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'bearer',
      expires_in: 86400 
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      await this.userService.updateLastLogin(user.id);
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }

    throw new UnauthorizedError('Email address or password provided is incorrect.');
  }
}