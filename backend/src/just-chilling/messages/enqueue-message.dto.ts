import { IsNotEmpty, IsString } from 'class-validator';
import { MatchLanguage } from '../../match/entities/match-language.enum';

export class EnqueueMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  matchLanguage: MatchLanguage;
}
