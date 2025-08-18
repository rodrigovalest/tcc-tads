import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserLanguage } from './entities/user-language.entity';
import { UserInterestTopic } from './entities/user-interest-topic.entity';
import { FileUploadService } from '../shared/services/file-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserLanguage, UserInterestTopic])],
  controllers: [UserController],
  providers: [UserService, FileUploadService],
  exports: [UserService],
})
export class UserModule {}
