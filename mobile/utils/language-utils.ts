import { AppLanguage } from '../lib/i18n';
import { i18n } from '../lib/i18n';

export const getSupportedLanguages = (): Array<{
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
}> => [
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

export const getLanguageInfo = (code: AppLanguage) => {
  return getSupportedLanguages().find(lang => lang.code === code);
};

export const getCurrentLanguageInfo = () => {
  const currentLang = i18n.language as AppLanguage;
  return getLanguageInfo(currentLang);
};

export const formatLanguageDisplay = (code: AppLanguage, useNativeName = false) => {
  const info = getLanguageInfo(code);
  if (!info) return code;
  
  return useNativeName ? info.nativeName : info.name;
};

export const getDeviceLanguage = (): AppLanguage => {
  return 'en';
};
