import { IsNotEmpty, IsNumber } from 'class-validator';

export class CancelInviteMessageDto {
  @IsNotEmpty()
  @IsNumber()
  friendId: number;
}
