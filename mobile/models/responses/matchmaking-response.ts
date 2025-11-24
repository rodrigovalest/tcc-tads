import IUserBuddy from "../interfaces/user-buddy";
import { MatchFormat } from "../types/match-format.type";
import { MatchLanguage } from "../types/match-language.type";
import { MatchMode } from "../types/match-mode.type";

export default interface IMatchmakingResponse {
  message: string;
  matchMode: MatchMode;
  matchFormat: MatchFormat;
  language: MatchLanguage;
  matchId: string;
  isOfferer: boolean;
  buddy: IUserBuddy;
  timerStartTimestamp?: number;
  timerDurationMs?: number;
}
