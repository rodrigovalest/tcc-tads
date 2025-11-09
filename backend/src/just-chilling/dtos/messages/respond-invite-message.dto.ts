import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class RespondInviteMessageDto {
  @IsNotEmpty()
  @IsNumber()
  inviterId: number;

  @IsNotEmpty()
  @IsBoolean()
  accepted: boolean;
}
