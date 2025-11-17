import { UserResponseDto } from './user-response.dto';
import { FriendshipRequestStatus } from '../../entities/friendship-request.entity';

export class FriendshipRequestResponseDto {
  id: number;
  requester: UserResponseDto;
  addressee: UserResponseDto;
  status: FriendshipRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

