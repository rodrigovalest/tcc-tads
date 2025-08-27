import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLanguage } from '../entities/user-language.entity';
import { User } from '../entities/user.entity';
import { VALIDATION_CONSTANTS } from '../constants/validation.constants';

export interface LanguageData {
  languageCode: string;
  fluencyLevel: number;
}

@Injectable()
export class UserLanguageService {
  constructor(
    @InjectRepository(UserLanguage)
    private readonly userLanguageRepository: Repository<UserLanguage>,
  ) {}

  async createUserLanguages(user: User, languagesData: LanguageData[]): Promise<UserLanguage[]> {
    if (!Array.isArray(languagesData) || languagesData.length === 0) {
      return [];
    }

    const validLanguages = this.validateAndFilterLanguages(languagesData);
    
    const userLanguages = validLanguages.map(lang => {
      const userLanguage = new UserLanguage();
      userLanguage.userId = user.id;
      userLanguage.user = user;
      userLanguage.languageCode = lang.languageCode;
      userLanguage.fluencyLevel = lang.fluencyLevel;
      return userLanguage;
    });

    return this.userLanguageRepository.save(userLanguages);
  }

  async updateUserLanguages(userId: number, languagesData: LanguageData[]): Promise<UserLanguage[]> {
    await this.userLanguageRepository.delete({ userId });
    
    if (!Array.isArray(languagesData) || languagesData.length === 0) {
      return [];
    }

    const validLanguages = this.validateAndFilterLanguages(languagesData);
    
    const userLanguages = validLanguages.map(lang => {
      const ul = new UserLanguage();
      ul.userId = userId;
      ul.languageCode = lang.languageCode;
      ul.fluencyLevel = lang.fluencyLevel;
      return ul;
    });

    return userLanguages.length > 0 ? this.userLanguageRepository.save(userLanguages) : [];
  }

  parseLanguagesData(languages: any): LanguageData[] {
    if (typeof languages === 'string') {
      try {
        return JSON.parse(languages);
      } catch (error) {
        console.error('Failed to parse languages JSON:', error);
        return [];
      }
    }
    return Array.isArray(languages) ? languages : [];
  }

  private validateAndFilterLanguages(languages: LanguageData[]): LanguageData[] {
    return languages.filter(lang => 
      lang && 
      typeof lang.languageCode === 'string' && 
      lang.languageCode.trim() !== '' &&
      typeof lang.fluencyLevel === 'number' &&
      lang.fluencyLevel >= VALIDATION_CONSTANTS.FLUENCY_LEVEL.MIN &&
      lang.fluencyLevel <= VALIDATION_CONSTANTS.FLUENCY_LEVEL.MAX
    );
  }
}
