import { useTranslation } from 'react-i18next';
import useLanguageStore, { AppLanguage } from '../store/language-store';

export const useI18n = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage, setLanguage, isLoading } = useLanguageStore();

  const changeLanguage = async (language: AppLanguage) => {
    await setLanguage(language);
  };

  const getAvailableLanguages = () => [
    { code: 'pt' as AppLanguage, name: t('languages.pt'), flag: '🇧🇷' },
    { code: 'en' as AppLanguage, name: t('languages.en'), flag: '🇺🇸' },
    { code: 'es' as AppLanguage, name: t('languages.es'), flag: '🇪🇸' },
  ];

  return {
    t,
    currentLanguage,
    changeLanguage,
    getAvailableLanguages,
    isLoading,
    isRTL: false,
  };
};

export default useI18n;
