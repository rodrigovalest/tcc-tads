import { IsDefined, IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { CountryCode } from "../../entities/country-code.enum";

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
  @IsEnum(CountryCode, { message: 'nationality must be a valid country code (e.g., BR, US)' })
  readonly nationality: CountryCode;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
