import { UserResponseDto } from '../../../user/dtos/responses/user-response.dto';

export class MessageResponseDto {
  id: number;
  sender: UserResponseDto;
  receiver: UserResponseDto;
  content: string;
  isRead: boolean;
  createdAt: Date;
}