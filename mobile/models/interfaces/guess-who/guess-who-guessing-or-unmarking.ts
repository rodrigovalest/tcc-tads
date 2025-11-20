export default interface IGuessWhoGuessingOrUnmarking {
  message: string;
  answer: boolean;
  timestamp: string;
  status: "guessing_or_unmarking";
  startTime: string;
  endTime: string;
}
