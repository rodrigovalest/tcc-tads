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
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error('languages must be an array');
      }
      return parsed;
    }
    if (Array.isArray(value)) {
      return value;
    }
    return undefined;
  })
  readonly languages?: UpdateUserLanguageDto[];

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
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
      throw new Error('removePhoto must be "true" or "false"');
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return undefined;
  })
  readonly removePhoto?: boolean;
}



