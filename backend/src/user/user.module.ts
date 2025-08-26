import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserLanguage } from './entities/user-language.entity';
import { UserInterestTopic } from './entities/user-interest-topic.entity';
import { FileUploadService } from './services/file-upload.service';
import { PasswordService } from './services/password.service';
import { UserLanguageService } from './services/user-language.service';
import { UserInterestTopicService } from './services/user-interest-topic.service';
import { PhotoUploadService } from './services/photo-upload.service';
import { UserRepositoryImpl } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLanguage, UserInterestTopic])
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PasswordService,
    UserLanguageService,
    UserInterestTopicService,
    PhotoUploadService,
    FileUploadService,
    UserRepositoryImpl,
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
