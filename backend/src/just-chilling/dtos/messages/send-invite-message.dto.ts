import { IsNotEmpty, IsNumber } from 'class-validator';

export class SendInviteMessageDto {
  @IsNotEmpty()
  @IsNumber()
  friendId: number;
}
