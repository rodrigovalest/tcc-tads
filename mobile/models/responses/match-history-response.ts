export default interface IMatchHistoryResponse {
  id: string;
  startTime: string;
  endTime: string;
  mode: string;
  format: string;
  language: string;
  status: string;
  users: {
    username: string;
    nationality: string;
  }[];
}
