import { IsDefined, IsEnum } from "class-validator";
import { MatchLanguage } from "src/match/entities/match-language.enum";
import { MatchMode } from "src/match/entities/match-mode.enum";
import { MatchFormat } from "src/match/entities/match-format.enum";

export class EnqueueMessageDto {

  @IsDefined()
  @IsEnum(MatchMode, { message: 'game mode must be valid (e.g., just_chilling)' })
  readonly matchMode: MatchMode;

  @IsDefined()
  @IsEnum(MatchLanguage, { message: 'language must be a valid game language (e.g., en, pt, es)' })
  readonly matchLanguage: MatchLanguage;

  @IsDefined()
  @IsEnum(MatchFormat, { message: 'game type must be a valid type (e.g., solo, duo, group)' })
  readonly matchFormat: MatchFormat;
}
