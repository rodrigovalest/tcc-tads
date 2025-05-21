import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateUserRequestDto } from '../dtos/requests/create-user.request-dto';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserRequestDto): Promise<void> {
    return this.userService.create(
      createUserDto.username,
      createUserDto.email,
      createUserDto.password,
      createUserDto.nationality
    );
  }
}
