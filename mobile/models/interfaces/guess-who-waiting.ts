import { GuessWhoGameStatus } from "../types/guess-who-game-status.type";

export default interface IGuessWhoWaiting {
  message: string;
  timestamp: string;
  status: GuessWhoGameStatus;
  startTime: string;
  endTime: string;
}
