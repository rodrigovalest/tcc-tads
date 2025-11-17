import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe, Patch, HttpCode, HttpStatus, Delete, Query } from '@nestjs/common';
import { JwtHttpAuthGuard } from '../../auth/guards/jwt-http-auth.guard';
import { CurrentHttpUser } from '../../auth/decorators/current-http-user.decorator';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { FriendshipRequestService } from '../services/friendship-request.service';
import { FriendshipService } from '../services/friendship.service';
import { SendFriendshipRequestDto } from '../dtos/requests/send-friendship-request.dto';
import { RespondFriendshipRequestDto } from '../dtos/requests/respond-friendship-request.dto';

@Controller('friendship')
@UseGuards(JwtHttpAuthGuard)
export class FriendshipController {
  constructor(
    private readonly friendshipRequestService: FriendshipRequestService,
    private readonly friendshipService: FriendshipService,
  ) {}

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  async sendFriendshipRequest(@CurrentHttpUser() user: IUserJwtPayload,@Body() dto: SendFriendshipRequestDto) {
    return this.friendshipRequestService.sendFriendshipRequest(user.sub, dto);
  }

  @Get('requests/received')
  async getReceivedRequests(@CurrentHttpUser() user: IUserJwtPayload) {
    return this.friendshipRequestService.getReceivedRequests(user.sub);
  }

  @Get('requests/sent')
  async getSentRequests(@CurrentHttpUser() user: IUserJwtPayload) {
    return this.friendshipRequestService.getSentRequests(user.sub);
  }

  @Patch('request/:id/respond')
  @HttpCode(HttpStatus.OK)
  async respondToRequest(@CurrentHttpUser() user: IUserJwtPayload,@Param('id', ParseIntPipe) requestId: number,@Body() dto: RespondFriendshipRequestDto) {
    return this.friendshipRequestService.respondToRequest(user.sub, requestId, dto);
  }

  @Delete('request/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelRequest(
    @CurrentHttpUser() user: IUserJwtPayload,
    @Param('id', ParseIntPipe) requestId: number
  ) {
    return this.friendshipRequestService.cancelRequest(user.sub, requestId);
  }

  @Get('friends')
  async getFriends(
    @CurrentHttpUser() user: IUserJwtPayload,
    @Query('search') searchTerm?: string
  ) {
    if (searchTerm) {
      return this.friendshipService.searchFriends(user.sub, searchTerm);
    }
    return this.friendshipService.getFriends(user.sub);
  }

  @Delete('friends/:friendId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFriend(
    @CurrentHttpUser() user: IUserJwtPayload,
    @Param('friendId', ParseIntPipe) friendId: number
  ) {
    try {
      await this.friendshipService.removeFriend(user.sub, friendId);
    } catch (error) {
      throw error;
    }
  }
}

