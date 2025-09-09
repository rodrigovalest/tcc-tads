import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LanguageSelection from '@/app/(private)/language-selection';
import useMatchStore from '@/store/match-store';
import { useRouter } from 'expo-router';
import { useI18n } from '@/hooks/useI18n';

// Mock dependencies
jest.mock('@/store/match-store');
jest.mock('expo-router');
jest.mock('@/hooks/useI18n');
jest.mock('@/components/MatchFormatSelector', () => () => <></>);
jest.mock('@/components/MatchLanguageSelector', () => () => <></>);
jest.mock('react-native-toast-message', () => ({
  default: {
    show: jest.fn(),
  },
}));

// Mock constants
jest.mock('@/constants/available-match-modes', () => ({
  AVALIABLE_MATCH_MODES: {
    'just-chilling': {
      title: 'Just Chilling',
      matchFormat: ['duo'],
    },
    'conversation': {
      title: 'Conversation',
      matchFormat: ['duo'],
    },
  },
}));

const mockUseMatchStore = useMatchStore as jest.MockedFunction<typeof useMatchStore>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;

describe('LanguageSelection screen', () => {
  const mockReplace = jest.fn();
  const mockResetMatch = jest.fn();
  const mockSetMatchLanguage = jest.fn();
  const mockSetMatchFormat = jest.fn();
  const mockT = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      replace: mockReplace,
    } as any);

    mockUseI18n.mockReturnValue({
      t: mockT,
    } as any);

    mockT.mockImplementation((key) => {
      const translations: Record<string, string> = {
        'common.back': 'Back',
        'common.play': 'Play',
        'match.selectLanguage': 'Select language',
        'match.selectGameMode': 'Select game mode',
      };
      return translations[key] || key;
    });
  });

  it('should redirect to matches when no matchMode is selected', () => {
    mockUseMatchStore.mockReturnValue({
      matchMode: null,
      matchFormat: null,
      matchLanguage: null,
      resetMatch: mockResetMatch,
      setMatchLanguage: mockSetMatchLanguage,
      setMatchFormat: mockSetMatchFormat,
    } as any);

    render(<LanguageSelection />);

    expect(mockReplace).toHaveBeenCalledWith('/(private)/(tabs)/matches');
  });

  it('should render correctly with matchMode selected', () => {
    mockUseMatchStore.mockReturnValue({
      matchMode: 'just-chilling',
      matchFormat: null,
      matchLanguage: null,
      resetMatch: mockResetMatch,
      setMatchLanguage: mockSetMatchLanguage,
      setMatchFormat: mockSetMatchFormat,
    } as any);

    const { getByTestId } = render(<LanguageSelection />);

    expect(getByTestId('language-selection-screen')).toBeTruthy();
  });

  it('should handle back navigation correctly', async () => {
    mockUseMatchStore.mockReturnValue({
      matchMode: 'just-chilling',
      matchFormat: null,
      matchLanguage: null,
      resetMatch: mockResetMatch,
      setMatchLanguage: mockSetMatchLanguage,
      setMatchFormat: mockSetMatchFormat,
    } as any);

    const { getByTestId } = render(<LanguageSelection />);
    const backButton = getByTestId('back-button');

    fireEvent.press(backButton);

    await waitFor(() => {
      expect(mockResetMatch).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/(private)/(tabs)/matches');
    });
  });

  it('should handle play navigation when all required fields are selected', () => {
    mockUseMatchStore.mockReturnValue({
      matchMode: 'just-chilling',
      matchFormat: 'duo',
      matchLanguage: 'en',
      resetMatch: mockResetMatch,
      setMatchLanguage: mockSetMatchLanguage,
      setMatchFormat: mockSetMatchFormat,
    } as any);

    const { getByText } = render(<LanguageSelection />);
    const playButton = getByText('Play');

    fireEvent.press(playButton);

    expect(mockReplace).toHaveBeenCalledWith('/(private)/just-chilling/duo/waiting');
  });

  it('should not navigate to play when required fields are missing', () => {
    mockUseMatchStore.mockReturnValue({
      matchMode: 'just-chilling',
      matchFormat: null, // Missing format
      matchLanguage: 'en',
      resetMatch: mockResetMatch,
      setMatchLanguage: mockSetMatchLanguage,
      setMatchFormat: mockSetMatchFormat,
    } as any);

    const { getByText } = render(<LanguageSelection />);
    const playButton = getByText('Play');

    fireEvent.press(playButton);

    // Should not navigate when required fields are missing
    expect(mockReplace).not.toHaveBeenCalledWith(expect.stringContaining('/waiting'));
  });

  it('should disable play button when matchLanguage is missing', () => {
    mockUseMatchStore.mockReturnValue({
      matchMode: 'just-chilling',
      matchFormat: 'duo',
      matchLanguage: null, // Missing language
      resetMatch: mockResetMatch,
      setMatchLanguage: mockSetMatchLanguage,
      setMatchFormat: mockSetMatchFormat,
    } as any);

    const { getByText } = render(<LanguageSelection />);
    const playButton = getByText('Play');

    fireEvent.press(playButton);

    // Should not navigate when required fields are missing
    expect(mockReplace).not.toHaveBeenCalledWith(expect.stringContaining('/waiting'));
  });

  describe('Different match modes', () => {
    it('should handle conversation match mode', () => {
      mockUseMatchStore.mockReturnValue({
        matchMode: 'conversation',
        matchFormat: 'duo',
        matchLanguage: 'pt',
        resetMatch: mockResetMatch,
        setMatchLanguage: mockSetMatchLanguage,
        setMatchFormat: mockSetMatchFormat,
      } as any);

      const { getByText } = render(<LanguageSelection />);
      const playButton = getByText('Play');

      fireEvent.press(playButton);

      // Conversation mode is not implemented yet, so it redirects to matches
      expect(mockReplace).toHaveBeenCalledWith('/(private)/(tabs)/matches');
    });
  });
});
