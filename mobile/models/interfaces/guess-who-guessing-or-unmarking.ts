import { GuessWhoGameStatus } from "../types/guess-who-game-status.type";

export default interface IGuessWhoGuessingOrUnmarking {
  message: string;
  answer: boolean;
  timestamp: string;
  status: GuessWhoGameStatus;
  startTime: string;
  endTime: string;
}
