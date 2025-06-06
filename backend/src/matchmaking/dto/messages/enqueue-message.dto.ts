import { IsDefined, IsEnum } from "class-validator";
import { GameLanguage } from "src/match/entities/game-language.enum";
import { GameMode } from "src/match/entities/game-mode.enum";
import { GameType } from "src/match/entities/game-type.enum";

export class EnqueueMessageDto {

  @IsDefined()
  @IsEnum(GameMode, { message: 'game mode must be valid (e.g., JUST_CHILLING)' })
  readonly gameMode: GameMode;

  @IsDefined()
  @IsEnum(GameLanguage, { message: 'language must be a valid game language (e.g., EN, PT, ES)' })
  readonly language: GameLanguage;

  @IsDefined()
  @IsEnum(GameType, { message: 'game type must be a valid type (e.g., SOLO, DUO, GROUP)' })
  readonly gameType: GameType;
}
