import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { Friendship } from '../user/entities/friendship.entity';
import { Message } from './entities/message.entity';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';
import { ChatSecurityService } from './services/chat-security.service';
import { ChatGatewayHandlerService } from './services/chat-gateway-handler.service';
import { ConnectionManagerService } from './services/connection-manager.service';
import { TypingManagerService } from './services/typing-manager.service';
import { RoomManagerService } from './services/room-manager.service';
import { NotificationService } from './services/notification.service';
import { MessageRepository } from './repositories/message.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship, Message]),
    AuthModule,
    JwtModule
  ],
  controllers: [
    ChatController
  ],
  providers: [
    ChatGateway,
    ChatService,
    MessageService,
    ChatSecurityService,
    ChatGatewayHandlerService,
    ConnectionManagerService,
    TypingManagerService,
    RoomManagerService,
    NotificationService,
    MessageRepository,
    {
      provide: 'IMessageRepository',
      useClass: MessageRepository,
    },
  ],
  exports: [
    ChatService,
    MessageService,
    ChatSecurityService,
    ChatGatewayHandlerService,
    ConnectionManagerService
  ]
})
export class ChatModule {}
