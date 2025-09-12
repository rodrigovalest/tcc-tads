export class ListMatchesResponseDto {
  id: string;
  startTime: string;
  endTime: string;
  mode: string;
  format: string;
  language: string;
  status: string;
  users: Array<{
    id: number;
    username: string;
    nationality: string;
    photoUri: string | null;
  }>;
}
