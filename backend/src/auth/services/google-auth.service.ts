import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

@Injectable()
export class GoogleAuthService {
  constructor(private configService: ConfigService) {}

  async verifyIdToken(idToken: string): Promise<GoogleTokenPayload> {
    try {
      // For production, you should use google-auth-library for proper verification
      // This is a simplified implementation for demonstration
      const decoded = jwt.decode(idToken) as any;

      if (!decoded || !decoded.email || !decoded.sub) {
        throw new BadRequestException('Invalid Google token');
      }

      if (!decoded.email_verified) {
        throw new BadRequestException('Google email not verified');
      }

      return {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded.email,
        picture: decoded.picture,
        email_verified: decoded.email_verified,
      };
    } catch (error) {
      throw new BadRequestException('Invalid Google token');
    }
  }
}
