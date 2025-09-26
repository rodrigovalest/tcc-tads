import { IsInt, IsPositive, Min, Max, IsString, IsDefined, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMatchRateRequestDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  matchId: string;

  @IsInt()
  @IsPositive()
  reviewedId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  fluencyScore: number;
}
