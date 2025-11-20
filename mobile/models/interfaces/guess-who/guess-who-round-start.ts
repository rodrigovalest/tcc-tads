export default interface IGuessWhoRoundStart {
  message: string;
  timestamp: string;
  status: "questioning" | "answering";
  startTime: string;
  endTime: string;
}
