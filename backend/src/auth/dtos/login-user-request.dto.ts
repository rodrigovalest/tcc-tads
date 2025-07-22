import { IsDefined, IsString, IsNotEmpty, IsEmail, MinLength } from "class-validator";

export class LoginUserRequestDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}