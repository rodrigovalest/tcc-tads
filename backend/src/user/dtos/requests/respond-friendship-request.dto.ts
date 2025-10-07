import { IsNotEmpty, IsEnum } from 'class-validator';
import { FriendshipRequestStatus } from '../../entities/friendship-request.entity';

export class RespondFriendshipRequestDto {
  @IsNotEmpty()
  @IsEnum(FriendshipRequestStatus)
  status: FriendshipRequestStatus;
}

