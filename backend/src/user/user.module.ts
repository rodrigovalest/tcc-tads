import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { FriendshipController } from './controllers/friendship.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserLanguage } from './entities/user-language.entity';
import { UserInterestTopic } from './entities/user-interest-topic.entity';
import { FriendshipRequest } from './entities/friendship-request.entity';
import { Friendship } from './entities/friendship.entity';
import { FileUploadService } from './services/file-upload.service';
import { PasswordService } from './services/password.service';
import { UserLanguageService } from './services/user-language.service';
import { UserInterestTopicService } from './services/user-interest-topic.service';
import { PhotoUploadService } from './services/photo-upload.service';
import { FriendshipRequestService } from './services/friendship-request.service';
import { FriendshipService } from './services/friendship.service';
import { UserRepositoryImpl } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLanguage, UserInterestTopic, FriendshipRequest, Friendship])
  ],
  controllers: [UserController, FriendshipController],
  providers: [
    UserService,
    PasswordService,
    UserLanguageService,
    UserInterestTopicService,
    PhotoUploadService,
    FileUploadService,
    FriendshipRequestService,
    FriendshipService,
    UserRepositoryImpl,
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [
    UserService, 
    FriendshipService, 
    FriendshipRequestService
  ],
})
export class UserModule {}
