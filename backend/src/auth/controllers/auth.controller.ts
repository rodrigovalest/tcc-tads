
import { Controller, Post, Request, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../models/AuthRequest';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { IsPublic } from '../decorators/is-public.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @IsPublic()
  async login(@Request() req: AuthRequest): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }
}