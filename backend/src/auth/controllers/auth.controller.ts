
import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginUserRequestDto } from '../dtos/login-user-request.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() requestDto: LoginUserRequestDto): Promise<AuthResponseDto> {
    const token = await this.authService.login(
      requestDto.email,
      requestDto.password
    );

    return {
      access_token: token,
      token_type: 'Bearer'
    }
  }
}