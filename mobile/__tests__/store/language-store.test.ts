import AsyncStorage from '@react-native-async-storage/async-storage';
import useLanguageStore from '@/store/language-store';
import { i18n, i18nConfig } from '@/lib/i18n';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@/lib/i18n', () => ({
  i18n: {
    changeLanguage: jest.fn(),
  },
  i18nConfig: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'pt', 'es'],
    storageKey: 'app-language',
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockI18n = i18n as jest.Mocked<typeof i18n>;

describe('useLanguageStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useLanguageStore.setState({
      currentLanguage: i18nConfig.defaultLanguage,
      isLoading: true,
      isInitialized: false,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('setLanguage', () => {
    it('should set language successfully', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce();
      mockI18n.changeLanguage.mockResolvedValueOnce(undefined as any);

      const { setLanguage } = useLanguageStore.getState();
      await setLanguage('pt');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('app-language', 'pt');
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('pt');
      expect(useLanguageStore.getState().currentLanguage).toBe('pt');
    });

    it('should handle error when setting language', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Storage error');
      mockAsyncStorage.setItem.mockRejectedValueOnce(error);

      const { setLanguage } = useLanguageStore.getState();
      await setLanguage('es');

      expect(consoleSpy).toHaveBeenCalledWith('Error saving language:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('initializeLanguage', () => {
    it('should initialize with stored language', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('pt');
      mockI18n.changeLanguage.mockResolvedValueOnce(undefined as any);

      const { initializeLanguage } = useLanguageStore.getState();
      await initializeLanguage();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('app-language');
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('pt');
      expect(useLanguageStore.getState().currentLanguage).toBe('pt');
      expect(useLanguageStore.getState().isLoading).toBe(false);
      expect(useLanguageStore.getState().isInitialized).toBe(true);
    });

    it('should initialize with default language when no stored language', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      mockAsyncStorage.setItem.mockResolvedValueOnce();
      mockI18n.changeLanguage.mockResolvedValueOnce(undefined as any);

      const { initializeLanguage } = useLanguageStore.getState();
      await initializeLanguage();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('app-language', 'en');
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
      expect(useLanguageStore.getState().currentLanguage).toBe('en');
      expect(useLanguageStore.getState().isLoading).toBe(false);
      expect(useLanguageStore.getState().isInitialized).toBe(true);
    });

    it('should initialize with default language when stored language is not supported', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('fr'); // Unsupported language
      mockAsyncStorage.setItem.mockResolvedValueOnce();
      mockI18n.changeLanguage.mockResolvedValueOnce(undefined as any);

      const { initializeLanguage } = useLanguageStore.getState();
      await initializeLanguage();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('app-language', 'en');
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
      expect(useLanguageStore.getState().currentLanguage).toBe('en');
    });

    it('should handle error during initialization', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Storage error');
      mockAsyncStorage.getItem.mockRejectedValueOnce(error);

      const { initializeLanguage } = useLanguageStore.getState();
      await initializeLanguage();

      expect(consoleSpy).toHaveBeenCalledWith('Error initializing language:', error);
      expect(useLanguageStore.getState().currentLanguage).toBe('en'); // Default language
      expect(useLanguageStore.getState().isLoading).toBe(false);
      expect(useLanguageStore.getState().isInitialized).toBe(true);
      
      consoleSpy.mockRestore();
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return available languages', () => {
      const { getAvailableLanguages } = useLanguageStore.getState();
      const languages = getAvailableLanguages();

      // Verificar que tem 3 idiomas
      expect(languages).toHaveLength(3);
      
      // Verificar que tem os códigos corretos
      const codes = languages.map(lang => lang.code);
      expect(codes).toContain('en');
      expect(codes).toContain('pt');
      expect(codes).toContain('es');
      
      // Verificar estrutura de cada idioma
      languages.forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('flag');
        expect(lang).toHaveProperty('nativeName');
      });
    });
  });

  describe('resetLanguage', () => {
    it('should reset to default language', async () => {
      // Set to non-default language first
      useLanguageStore.setState({ currentLanguage: 'pt' });
      
      mockAsyncStorage.removeItem.mockResolvedValueOnce();
      mockI18n.changeLanguage.mockResolvedValueOnce(undefined as any);

      const { resetLanguage } = useLanguageStore.getState();
      await resetLanguage();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('app-language');
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
      expect(useLanguageStore.getState().currentLanguage).toBe('en');
    });

    it('should handle error when resetting language', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Storage error');
      mockAsyncStorage.removeItem.mockRejectedValueOnce(error);

      const { resetLanguage } = useLanguageStore.getState();
      await resetLanguage();

      expect(consoleSpy).toHaveBeenCalledWith('Error resetting language:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('state management', () => {
    it('should update loading state correctly', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('pt');
      mockI18n.changeLanguage.mockResolvedValueOnce(undefined as any);

      expect(useLanguageStore.getState().isLoading).toBe(true);

      const { initializeLanguage } = useLanguageStore.getState();
      const initPromise = initializeLanguage();

      // Still loading
      expect(useLanguageStore.getState().isLoading).toBe(true);

      await initPromise;

      // Loading completed
      expect(useLanguageStore.getState().isLoading).toBe(false);
      expect(useLanguageStore.getState().isInitialized).toBe(true);
    });
  });
});
