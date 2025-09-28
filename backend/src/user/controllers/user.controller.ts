import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Req, Param, ParseIntPipe, Patch, HttpCode, HttpStatus, Query } from '@nestjs/common';
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
  @HttpCode(HttpStatus.CREATED) 
  @UseInterceptors(FileInterceptor('photo', {limits: {fileSize: 10 * 1024 * 1024,},}))
  async create(@Body() createUserDto: CreateUserRequestDto, @UploadedFile() photo: Express.Multer.File, @Req() request: Request): Promise<UserResponseDto> {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    const user = await this.userService.createWithPhoto(createUserDto, photo, baseUrl);
    return user;
  }
  
  @Get()
  findAll(@Query('username') username?: string): Promise<UserResponseDto[]> {
    if (username) {
      return this.userService.searchByUsername(username);
    }
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.findByIdWithDto(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK) 
  @UseInterceptors(FileInterceptor('photo', {limits: {fileSize: 10 * 1024 * 1024,},}))
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateUserRequestDto, @UploadedFile() photo: Express.Multer.File, @Req() request: Request): Promise<UserResponseDto> {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    return this.userService.update(id, updateDto, photo, baseUrl);
  }
}
