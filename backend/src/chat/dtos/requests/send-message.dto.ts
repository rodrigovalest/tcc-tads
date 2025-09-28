import { IsNotEmpty, IsString, IsNumber, MinLength, MaxLength, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendMessageDto {
  @IsNotEmpty({ message: 'Receiver ID is required' })
  @IsNumber({}, { message: 'Receiver ID must be a number' })
  @IsPositive({ message: 'Receiver ID must be a positive number' })
  @Transform(({ value }) => parseInt(value))
  receiverId: number;

  @IsNotEmpty({ message: 'Message content is required' })
  @IsString({ message: 'Message content must be a string' })
  @MinLength(1, { message: 'Message content cannot be empty' })
  @MaxLength(1000, { message: 'Message content cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  content: string;
}