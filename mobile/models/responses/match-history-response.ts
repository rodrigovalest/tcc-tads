import { CountryCode } from "../types/country-code.type";
import { MatchFormat } from "../types/match-format.type";
import { MatchLanguage } from "../types/match-language.type";
import { MatchMode } from "../types/match-mode.type";
import { MatchStatus } from "../types/match-status.type";

export default interface IMatchHistoryResponse {
  id: string;
  startTime: string;
  endTime: string;
  mode: MatchMode;
  format: MatchFormat;
  language: MatchLanguage;
  status: MatchStatus;
  users: {
    id: number;
    username: string;
    nationality: CountryCode;
    photoUri: null | string;
  }[];
}
