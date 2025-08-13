import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LanguageSelector from '@/components/LanguageSelector';
import { useI18n } from '@/hooks/useI18n';

// Mock the useI18n hook
jest.mock('@/hooks/useI18n');
const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;

describe('LanguageSelector component', () => {
  const mockChangeLanguage = jest.fn();
  const mockT = jest.fn();

  const mockI18nData = {
    t: mockT,
    currentLanguage: 'en' as const,
    changeLanguage: mockChangeLanguage,
    isLoading: false,
    isInitialized: true,
    resetLanguage: jest.fn(),
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'pt', name: 'Português', flag: '🇧🇷' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
    ],
    isRTL: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseI18n.mockReturnValue(mockI18nData as any);
    
    // Mock translations
    mockT.mockImplementation((key) => {
      const translations: Record<string, string> = {
        'settings.selectLanguage': 'Select a language',
        'settings.language': 'Language',
      };
      return translations[key] || key;
    });
  });

  describe('Full variant', () => {
    it('should render with label by default', () => {
      const { getByText } = render(<LanguageSelector />);
      
      expect(getByText('Language')).toBeTruthy();
      expect(getByText('🇺🇸')).toBeTruthy();
      expect(getByText('English')).toBeTruthy();
    });

    it('should render without label when showLabel is false', () => {
      const { queryByText, getByText } = render(
        <LanguageSelector showLabel={false} />
      );
      
      expect(queryByText('Language')).toBeFalsy();
      expect(getByText('🇺🇸')).toBeTruthy();
      expect(getByText('English')).toBeTruthy();
    });

    it('should open modal when pressed', () => {
      const { getByText, getByTestId } = render(<LanguageSelector />);
      
      fireEvent.press(getByTestId('language-selector-trigger'));
      
      expect(getByText('Select a language')).toBeTruthy();
    });

    it('should display all available languages in modal', () => {
      const { getAllByText, getByTestId } = render(<LanguageSelector />);
      
      fireEvent.press(getByTestId('language-selector-trigger'));
      
      expect(getAllByText('English')).toHaveLength(2); // One in trigger, one in modal
      expect(getAllByText('Português')).toHaveLength(1);
      expect(getAllByText('Español')).toHaveLength(1);
    });

    it('should change language when option is selected', async () => {
      const mockOnLanguageChange = jest.fn();
      const { getByText, getByTestId } = render(
        <LanguageSelector onLanguageChange={mockOnLanguageChange} />
      );
      
      fireEvent.press(getByTestId('language-selector-trigger'));
      fireEvent.press(getByTestId('language-option-pt'));
      
      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith('pt');
        expect(mockOnLanguageChange).toHaveBeenCalledWith('pt');
      });
    });

    it('should close modal after language selection', async () => {
      const { getByText, getByTestId, queryByText } = render(<LanguageSelector />);
      
      fireEvent.press(getByTestId('language-selector-trigger'));
      expect(getByText('Select a language')).toBeTruthy();
      
      fireEvent.press(getByTestId('language-option-es'));
      
      await waitFor(() => {
        expect(queryByText('Select a language')).toBeFalsy();
      });
    });

    it('should handle error when changing language fails', async () => {
      mockChangeLanguage.mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const { getByTestId } = render(<LanguageSelector />);
      
      fireEvent.press(getByTestId('language-selector-trigger'));
      fireEvent.press(getByTestId('language-option-pt'));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error changing language:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Compact variant', () => {
    it('should render compact version correctly', () => {
      const { getByText, queryByText } = render(
        <LanguageSelector variant="compact" />
      );
      
      expect(getByText('🇺🇸')).toBeTruthy();
      expect(getByText('EN')).toBeTruthy();
      expect(queryByText('Language')).toBeFalsy(); // Label should not show in compact mode
    });

    it('should render different language in compact mode', () => {
      mockUseI18n.mockReturnValue({
        ...mockI18nData,
        currentLanguage: 'pt',
      } as any);

      const { getByText } = render(
        <LanguageSelector variant="compact" />
      );
      
      expect(getByText('🇧🇷')).toBeTruthy();
      expect(getByText('PT')).toBeTruthy();
    });

    it('should open modal in compact mode', () => {
      const { getByText, getByTestId } = render(
        <LanguageSelector variant="compact" />
      );
      
      fireEvent.press(getByTestId('language-selector-compact-trigger'));
      
      expect(getByText('Select a language')).toBeTruthy();
    });
  });

  describe('Different current languages', () => {
    it('should display Portuguese correctly', () => {
      mockUseI18n.mockReturnValue({
        ...mockI18nData,
        currentLanguage: 'pt',
      } as any);

      const { getByText } = render(<LanguageSelector />);
      
      expect(getByText('🇧🇷')).toBeTruthy();
      expect(getByText('Português')).toBeTruthy();
    });

    it('should display Spanish correctly', () => {
      mockUseI18n.mockReturnValue({
        ...mockI18nData,
        currentLanguage: 'es',
      } as any);

      const { getByText } = render(<LanguageSelector />);
      
      expect(getByText('🇪🇸')).toBeTruthy();
      expect(getByText('Español')).toBeTruthy();
    });
  });

  describe('Modal interactions', () => {
    it('should close modal when close button is pressed', () => {
      const { getByText, getByTestId, queryByText } = render(<LanguageSelector />);
      
      fireEvent.press(getByTestId('language-selector-trigger'));
      expect(getByText('Select a language')).toBeTruthy();
      
      fireEvent.press(getByTestId('language-modal-close'));
      
      expect(queryByText('Select a language')).toBeFalsy();
    });

    it('should close modal when backdrop is pressed', () => {
      const { getByText, getByTestId, queryByText } = render(<LanguageSelector />);
      
      fireEvent.press(getByTestId('language-selector-trigger'));
      expect(getByText('Select a language')).toBeTruthy();
      
      fireEvent.press(getByTestId('language-modal-backdrop'));
      
      expect(queryByText('Select a language')).toBeFalsy();
    });
  });
});
