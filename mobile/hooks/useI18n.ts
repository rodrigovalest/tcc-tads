import { useTranslation } from 'react-i18next';
import useLanguageStore from '../store/language-store';
import type { AppLanguage } from '../lib/i18n';

export const useI18n = () => {
  const { t, i18n } = useTranslation();
  const { 
    currentLanguage, 
    setLanguage, 
    isLoading, 
    isInitialized,
    getAvailableLanguages,
    resetLanguage 
  } = useLanguageStore();

  const changeLanguage = async (language: AppLanguage) => {
    await setLanguage(language);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    isLoading,
    isInitialized,
    resetLanguage,
    availableLanguages: getAvailableLanguages(),
    isRTL: false, // Para futuro suporte a idiomas RTL
  };
};

export default useI18n;
