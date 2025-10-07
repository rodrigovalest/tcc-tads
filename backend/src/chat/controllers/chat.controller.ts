import { Controller, Get, Post, Body, UseGuards, Param, ParseIntPipe, Patch, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { JwtHttpAuthGuard } from '../../auth/guards/jwt-http-auth.guard';
import { CurrentHttpUser } from '../../auth/decorators/current-http-user.decorator';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { MessageService } from '../services/message.service';
import { SendMessageDto } from '../dtos/requests/send-message.dto';

@Controller('chat')
@UseGuards(JwtHttpAuthGuard)
export class ChatController {
  constructor(
    private readonly messageService: MessageService,
  ) {}

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentHttpUser() user: IUserJwtPayload,
    @Body() dto: SendMessageDto
  ) {
    return this.messageService.sendMessage(user.sub, dto);
  }

  @Get('conversations')
  async getConversations(@CurrentHttpUser() user: IUserJwtPayload) {
    return this.messageService.getConversations(user.sub);
  }

  @Get('conversations/:friendId')
  async getConversation(
    @CurrentHttpUser() user: IUserJwtPayload,
    @Param('friendId', ParseIntPipe) friendId: number
  ) {
    return this.messageService.getConversation(user.sub, friendId);
  }

  @Patch('conversations/:friendId/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @CurrentHttpUser() user: IUserJwtPayload,
    @Param('friendId', ParseIntPipe) friendId: number
  ) {
    return this.messageService.markAsRead(user.sub, friendId);
  }

  @Get('messages/unread-count')
  async getUnreadMessageCount(@CurrentHttpUser() user: IUserJwtPayload) {
    const count = await this.messageService.getUnreadMessageCount(user.sub);
    return { unreadCount: count };
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @CurrentHttpUser() user: IUserJwtPayload,
    @Param('messageId', ParseIntPipe) messageId: number
  ) {
    return this.messageService.deleteMessage(messageId, user.sub);
  }
}