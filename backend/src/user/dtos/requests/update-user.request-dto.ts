import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, MaxLength, ValidateNested, IsNumber, IsDefined, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CountryCode } from '../../entities/country-code.enum';

export class UpdateUserLanguageDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly languageCode: string;

  @IsDefined()
  @IsNumber()
  readonly fluencyLevel: number;
}

export class UpdateUserRequestDto {
  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsEnum(CountryCode, { message: 'nationality must be a valid country code (e.g., BR, US)' })
  readonly nationality?: CountryCode;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly personalDescription?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserLanguageDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  readonly languages?: UpdateUserLanguageDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  readonly interestTopics?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  readonly removePhoto?: boolean;
}



