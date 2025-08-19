import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Req, Param, ParseIntPipe, NotFoundException, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserRequestDto } from '../dtos/requests/create-user.request-dto';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dtos/responses/user-response.dto';
import { Request } from 'express';
import { UpdateUserRequestDto } from '../dtos/requests/update-user.request-dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() createUserDto: CreateUserRequestDto,
    @UploadedFile() photo: Express.Multer.File,
    @Req() request: Request
  ): Promise<void> {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    return this.userService.createWithPhoto(createUserDto, photo, baseUrl);
  }
  
  @Get()
  findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.userService.findByIdWithDto(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserRequestDto,
    @UploadedFile() photo: Express.Multer.File,
    @Req() request: Request
  ): Promise<UserResponseDto> {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    return this.userService.update(id, updateDto, photo, baseUrl);
  }
}
