import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CreateUserRequestDto } from '../dtos/requests/create-user.request-dto';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: User): Omit<User, 'password'> {
    const { password, ...result } = user;
    return result;
  }

  @Post()
  create(@Body() createUserDto: CreateUserRequestDto): Promise<void> {
    return this.userService.create(
      createUserDto.username,
      createUserDto.email,
      createUserDto.password,
      createUserDto.nationality,
    );
  }
}
