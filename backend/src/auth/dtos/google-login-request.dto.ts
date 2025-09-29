import { IsString, IsEmail, IsOptional } from 'class-validator';

export class GoogleLoginRequestDto {
  @IsString()
  idToken: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  photo?: string;
}
