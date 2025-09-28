import { IsNotEmpty, IsString } from 'class-validator';

export class SendFriendshipRequestDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}

