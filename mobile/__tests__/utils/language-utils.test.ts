import {
  getSupportedLanguages,
  getLanguageInfo,
  getCurrentLanguageInfo,
  formatLanguageDisplay,
  getDeviceLanguage,
} from '@/utils/language-utils';
import { i18n } from '@/lib/i18n';

// Mock the i18n module
jest.mock('@/lib/i18n', () => ({
  i18n: {
    language: 'en',
  },
}));

const mockI18n = i18n as jest.Mocked<typeof i18n>;

describe('language-utils', () => {
  describe('getSupportedLanguages', () => {
    it('should return all supported languages with correct structure', () => {
      const languages = getSupportedLanguages();

      expect(languages).toHaveLength(3);
      expect(languages).toEqual([
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
      ]);
    });

    it('should return consistent data on multiple calls', () => {
      const languages1 = getSupportedLanguages();
      const languages2 = getSupportedLanguages();

      expect(languages1).toEqual(languages2);
    });
  });

  describe('getLanguageInfo', () => {
    it('should return correct language info for English', () => {
      const info = getLanguageInfo('en');

      expect(info).toEqual({
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
      });
    });

    it('should return correct language info for Portuguese', () => {
      const info = getLanguageInfo('pt');

      expect(info).toEqual({
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        flag: '🇧🇷',
      });
    });

    it('should return correct language info for Spanish', () => {
      const info = getLanguageInfo('es');

      expect(info).toEqual({
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
      });
    });

    it('should return undefined for unsupported language', () => {
      const info = getLanguageInfo('fr' as any);

      expect(info).toBeUndefined();
    });
  });

  describe('getCurrentLanguageInfo', () => {
    it('should return info for current language from i18n', () => {
      mockI18n.language = 'en';
      const info = getCurrentLanguageInfo();

      expect(info).toEqual({
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
      });
    });

    it('should return correct info when language changes', () => {
      mockI18n.language = 'pt';
      const info = getCurrentLanguageInfo();

      expect(info).toEqual({
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        flag: '🇧🇷',
      });
    });

    it('should return undefined when current language is unsupported', () => {
      mockI18n.language = 'fr';
      const info = getCurrentLanguageInfo();

      expect(info).toBeUndefined();
    });
  });

  describe('formatLanguageDisplay', () => {
    it('should return English name by default', () => {
      const display = formatLanguageDisplay('pt');
      expect(display).toBe('Portuguese');
    });

    it('should return native name when useNativeName is true', () => {
      const display = formatLanguageDisplay('pt', true);
      expect(display).toBe('Português');
    });

    it('should return English name when useNativeName is false', () => {
      const display = formatLanguageDisplay('es', false);
      expect(display).toBe('Spanish');
    });

    it('should return language code for unsupported language', () => {
      const display = formatLanguageDisplay('fr' as any);
      expect(display).toBe('fr');
    });

    it('should handle all supported languages correctly', () => {
      expect(formatLanguageDisplay('en')).toBe('English');
      expect(formatLanguageDisplay('pt')).toBe('Portuguese');
      expect(formatLanguageDisplay('es')).toBe('Spanish');
    });

    it('should handle native names for all supported languages', () => {
      expect(formatLanguageDisplay('en', true)).toBe('English');
      expect(formatLanguageDisplay('pt', true)).toBe('Português');
      expect(formatLanguageDisplay('es', true)).toBe('Español');
    });
  });

  describe('getDeviceLanguage', () => {
    it('should return default language', () => {
      const deviceLang = getDeviceLanguage();
      expect(deviceLang).toBe('en');
    });

    it('should always return a supported language', () => {
      const deviceLang = getDeviceLanguage();
      const supportedCodes = getSupportedLanguages().map(lang => lang.code);
      expect(supportedCodes).toContain(deviceLang);
    });
  });

  describe('data consistency', () => {
    it('should have consistent language codes across functions', () => {
      const supportedLanguages = getSupportedLanguages();
      
      supportedLanguages.forEach(lang => {
        const info = getLanguageInfo(lang.code);
        expect(info).toBeDefined();
        expect(info?.code).toBe(lang.code);
      });
    });

    it('should have all required properties for each language', () => {
      const supportedLanguages = getSupportedLanguages();
      
      supportedLanguages.forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('nativeName');
        expect(lang).toHaveProperty('flag');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
        expect(typeof lang.nativeName).toBe('string');
        expect(typeof lang.flag).toBe('string');
      });
    });
  });
});
