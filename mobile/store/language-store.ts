import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n, i18nConfig, type AppLanguage, type LanguageOption } from '../lib/i18n';

type LanguageState = {
  currentLanguage: AppLanguage;
  isLoading: boolean;
  isInitialized: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
  initializeLanguage: () => Promise<void>;
  getAvailableLanguages: () => LanguageOption[];
  resetLanguage: () => Promise<void>;
};

const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: i18nConfig.defaultLanguage,
  isLoading: true,
  isInitialized: false,

  setLanguage: async (language: AppLanguage) => {
    try {
      await AsyncStorage.setItem(i18nConfig.storageKey, language);
      await i18n.changeLanguage(language);
      set({ currentLanguage: language });
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },

  initializeLanguage: async () => {
    try {
      set({ isLoading: true });
      const storedLanguage = await AsyncStorage.getItem(i18nConfig.storageKey);
      
      if (storedLanguage && i18nConfig.supportedLanguages.includes(storedLanguage as AppLanguage)) {
        const language = storedLanguage as AppLanguage;
        await i18n.changeLanguage(language);
        set({ currentLanguage: language });
      } else {
        await AsyncStorage.setItem(i18nConfig.storageKey, i18nConfig.defaultLanguage);
        await i18n.changeLanguage(i18nConfig.defaultLanguage);
        set({ currentLanguage: i18nConfig.defaultLanguage });
      }
    } catch (error) {
      console.error('Error initializing language:', error);
      set({ currentLanguage: i18nConfig.defaultLanguage });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  getAvailableLanguages: () => [
    { code: 'pt', name: 'Português', flag: '🇧🇷', nativeName: 'Português' },
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  ],

  resetLanguage: async () => {
    try {
      await AsyncStorage.removeItem(i18nConfig.storageKey);
      await i18n.changeLanguage(i18nConfig.defaultLanguage);
      set({ 
        currentLanguage: i18nConfig.defaultLanguage,
        isInitialized: false 
      });
    } catch (error) {
      console.error('Error resetting language:', error);
    }
  },
}));

export default useLanguageStore;
