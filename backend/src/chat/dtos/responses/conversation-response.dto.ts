import { UserResponseDto } from '../../../user/dtos/responses/user-response.dto';

export class ConversationResponseDto {
  friend: UserResponseDto;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount: number;
}