import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { locales } from './locales';
import type { I18nConfig } from './types';

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'pt',
  supportedLanguages: ['pt', 'en', 'es'],
  storageKey: 'app_language',
};

const resources = {
  pt: { translation: locales.pt },
  en: { translation: locales.en },
  es: { translation: locales.es },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: i18nConfig.defaultLanguage,
    fallbackLng: i18nConfig.fallbackLanguage,
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
    debug: __DEV__,
  });

export { i18n };
export default i18n;
