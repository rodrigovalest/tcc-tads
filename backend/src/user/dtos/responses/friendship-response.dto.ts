import { UserResponseDto } from './user-response.dto';

export class FriendshipResponseDto {
  id: number;
  user: UserResponseDto;
  friend: UserResponseDto;
  createdAt: Date;
}

