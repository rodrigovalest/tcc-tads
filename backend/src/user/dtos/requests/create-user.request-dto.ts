import { IsDefined, IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserRequestDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly username: string;

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
