import { CountryCode } from "../../entities/country-code.enum";

export class UserLanguageResponseDto {
  readonly id: number;
  readonly languageCode: string;
  readonly fluencyLevel: number;
  readonly createdAt: Date;
}

export class UserInterestTopicResponseDto {
  readonly id: number;
  readonly topic: string;
  readonly createdAt: Date;
}

export class UserResponseDto {
  readonly id: number;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly nationality: CountryCode;
  readonly personalDescription?: string;
  readonly photoUri?: string;
  readonly isActive: boolean;
  readonly lastLoginAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly languages: UserLanguageResponseDto[];
  readonly interestTopics: UserInterestTopicResponseDto[];
} 