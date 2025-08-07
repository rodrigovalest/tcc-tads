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

// Type-safe translation keys (pode ser expandido futuramente)
export type TranslationKeys = 
  | 'common.loading'
  | 'common.error'
  | 'auth.login'
  | 'auth.register'
  // Add more as needed
  | string;
