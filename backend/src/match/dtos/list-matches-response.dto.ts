export class ListMatchesResponseDto {
  id: string;
  startTime: string;
  endTime: string;
  mode: string;
  format: string;
  language: string;
  status: string;
  users: Array<{
    username: string;
    nationality: string;
  }>;
}
