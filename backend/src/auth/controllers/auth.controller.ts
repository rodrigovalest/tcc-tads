import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginUserRequestDto } from '../dtos/login-user-request.dto';
import { GoogleLoginRequestDto } from '../dtos/google-login-request.dto';
import { GoogleLoginResponseDto } from '../dtos/google-login-response.dto';
import { GoogleLinkRequestDto } from '../dtos/google-link-request.dto';
import { GoogleLinkResponseDto } from '../dtos/google-link-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() requestDto: LoginUserRequestDto,
  ): Promise<AuthResponseDto> {
    const token = await this.authService.login(
      requestDto.email,
      requestDto.password,
    );

    return {
      access_token: token,
      token_type: 'Bearer',
    };
  }

  @Post('auth/google/login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body() requestDto: GoogleLoginRequestDto,
  ): Promise<GoogleLoginResponseDto> {
    const result = await this.authService.loginWithGoogle(
      requestDto.idToken,
      requestDto.email,
      requestDto.name,
      requestDto.photo,
    );

    return {
      access_token: result.token,
      token_type: 'Bearer',
      isNewUser: result.isNewUser,
      requiresRegistration: result.requiresRegistration,
    };
  }

  @Post('auth/google/link')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async linkGoogleAccount(
    @Body() requestDto: GoogleLinkRequestDto,
    @Request() req: any,
  ): Promise<GoogleLinkResponseDto> {
    await this.authService.linkGoogleAccount(req.user.sub, requestDto.idToken);

    return {
      success: true,
      message: 'Google account linked successfully',
    };
  }

  @Delete('auth/google/unlink')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async unlinkGoogleAccount(
    @Request() req: any,
  ): Promise<GoogleLinkResponseDto> {
    await this.authService.unlinkGoogleAccount(req.user.sub);

    return {
      success: true,
      message: 'Google account unlinked successfully',
    };
  }
}
