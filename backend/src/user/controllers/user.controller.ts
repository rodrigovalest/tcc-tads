import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, BadRequestException, Req, Param, ParseIntPipe, NotFoundException} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserRequestDto } from '../dtos/requests/create-user.request-dto';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dtos/responses/user-response.dto';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() createUserDto: CreateUserRequestDto,
    @UploadedFile() photo: Express.Multer.File,
    @Req() request: Request
  ): Promise<void> {
    let photoUrl: string | null = null;
    if (photo) {
      try {
        this.fileUploadService.validateImageFile(photo);
        const fileName = this.fileUploadService.saveFile(photo);
        const baseUrl = `${request.protocol}://${request.get('host')}`;
        photoUrl = this.fileUploadService.getFileUrl(fileName, baseUrl);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    const userDataWithPhoto = {
      ...createUserDto,
      photo: photoUrl || undefined
    };

    return this.userService.create(userDataWithPhoto);
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
}
