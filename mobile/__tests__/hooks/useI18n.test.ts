import { renderHook, act } from '@testing-library/react-native';
import { useI18n } from '@/hooks/useI18n';
import useLanguageStore from '@/store/language-store';
import { useTranslation } from 'react-i18next';

// Mock dependencies
jest.mock('@/store/language-store');
jest.mock('react-i18next');

const mockLanguageStore = useLanguageStore as jest.MockedFunction<typeof useLanguageStore>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('useI18n hook', () => {
  const mockSetLanguage = jest.fn();
  const mockResetLanguage = jest.fn();
  const mockGetAvailableLanguages = jest.fn();
  const mockT = jest.fn();
  const mockI18n = { changeLanguage: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockLanguageStore.mockReturnValue({
      currentLanguage: 'en',
      setLanguage: mockSetLanguage,
      isLoading: false,
      isInitialized: true,
      getAvailableLanguages: mockGetAvailableLanguages,
      resetLanguage: mockResetLanguage,
    } as any);

    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: mockI18n,
    } as any);

    mockGetAvailableLanguages.mockReturnValue([
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'pt', name: 'Português', flag: '🇧🇷' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
    ]);
  });

  it('should return correct initial values', () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.currentLanguage).toBe('en');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.isRTL).toBe(false);
    expect(result.current.availableLanguages).toHaveLength(3);
    expect(result.current.t).toBe(mockT);
  });

  it('should change language successfully', async () => {
    const { result } = renderHook(() => useI18n());

    await act(async () => {
      await result.current.changeLanguage('pt');
    });

    expect(mockSetLanguage).toHaveBeenCalledWith('pt');
  });

  it('should return available languages from store', () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.availableLanguages).toEqual([
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'pt', name: 'Português', flag: '🇧🇷' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
    ]);
    expect(mockGetAvailableLanguages).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    mockLanguageStore.mockReturnValue({
      currentLanguage: 'en',
      setLanguage: mockSetLanguage,
      isLoading: true,
      isInitialized: false,
      getAvailableLanguages: mockGetAvailableLanguages,
      resetLanguage: mockResetLanguage,
    } as any);

    const { result } = renderHook(() => useI18n());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isInitialized).toBe(false);
  });

  it('should call resetLanguage', async () => {
    const { result } = renderHook(() => useI18n());

    await act(async () => {
      await result.current.resetLanguage();
    });

    expect(mockResetLanguage).toHaveBeenCalled();
  });
});
