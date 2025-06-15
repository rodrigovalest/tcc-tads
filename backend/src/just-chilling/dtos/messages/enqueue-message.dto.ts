import { IsDefined, IsEnum } from "class-validator";
import { MatchLanguage } from "src/match/entities/match-language.enum";

export class EnqueueMessageDto {

  @IsDefined()
  @IsEnum(MatchLanguage, { message: 'language must be a valid game language (e.g., en, pt, es)' })
  readonly matchLanguage: MatchLanguage;
}
