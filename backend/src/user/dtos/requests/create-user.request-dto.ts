import { IsDefined, IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsOptional, IsArray, IsNumber, MaxLength, ValidateNested } from "class-validator";
import { Type, Transform } from "class-transformer";
import { CountryCode } from "../../entities/country-code.enum";

export class UserLanguageDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly languageCode: string;

  @IsDefined()
  @IsNumber()
  readonly fluencyLevel: number;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserLanguageDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error('languages must be an array');
      }
      return parsed;
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  })
  readonly languages: UserLanguageDto[];

  @IsOptional()
  @IsString()
  readonly photo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error('interestTopics must be an array');
      }
      return parsed;
    }
    if (Array.isArray(value)) {
      return value;
    }
    return undefined;
  })
  readonly interestTopics?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly personalDescription?: string;
}
