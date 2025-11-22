export default interface IGuessWhoWaiting {
  message: string;
  timestamp: string;
  status: "waiting";
  startTime: string;
  endTime: string;
}
