import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/i18n';

export type AppLanguage = 'pt' | 'en' | 'es';

type LanguageState = {
  currentLanguage: AppLanguage;
  isLoading: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
  initializeLanguage: () => Promise<void>;
};

const STORAGE_KEY = 'app_language';

const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: 'pt',
  isLoading: true,

  setLanguage: async (language: AppLanguage) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, language);
      await i18n.changeLanguage(language);
      set({ currentLanguage: language });
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },

  initializeLanguage: async () => {
    try {
      set({ isLoading: true });
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedLanguage && ['pt', 'en', 'es'].includes(storedLanguage)) {
        const language = storedLanguage as AppLanguage;
        await i18n.changeLanguage(language);
        set({ currentLanguage: language });
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, 'pt');
        await i18n.changeLanguage('pt');
        set({ currentLanguage: 'pt' });
      }
    } catch (error) {
      console.error('Error initializing language:', error);
      set({ currentLanguage: 'pt' });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useLanguageStore;
