import { MatchFormat } from "../types/match-format.type";
import { MatchLanguage } from "../types/match-language.type";
import { MatchMode } from "../types/match-mode.type";

export default interface IMatchmakingResponse {
  message: string;
  matchMode: MatchMode;
  matchFormat: MatchFormat;
  language: MatchLanguage;
  roomId: string;
  isOfferer: boolean;
  buddy: {
    username: string;
    nationality: string;
  }
}
