export type AppLanguage = 'pt' | 'en' | 'es';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  flag: string;
  nativeName: string;
}

export interface I18nConfig {
  defaultLanguage: AppLanguage;
  fallbackLanguage: AppLanguage;
  supportedLanguages: AppLanguage[];
  storageKey: string;
}

export type TranslationKeys = 
  | 'common.loading'
  | 'common.error'
  | 'auth.login'
  | 'auth.register'
  | string;
