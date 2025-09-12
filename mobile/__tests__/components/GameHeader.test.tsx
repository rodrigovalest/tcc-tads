import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GameHeader from '@/components/GameHeader';
import { MatchLanguage } from '@/models/types/match-language.type';

// Mock useI18n hook
jest.mock('@/hooks/useI18n', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));

describe('GameHeader', () => {
  const defaultProps = {
    timeLeft: 60,
    currentLetter: 'A',
    gameLanguage: 'en' as MatchLanguage,
    onExit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render correctly with default props', () => {
      const { getByText } = render(<GameHeader {...defaultProps} />);
      
      expect(getByText(/wordBuilder.letter/)).toBeTruthy();
      expect(getByText(/A/)).toBeTruthy();
    });

    it('should display formatted time correctly', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} timeLeft={59.5} />
      );
      
      // Should format time as MM:SS:CS
      expect(getByText(/00:59:50/)).toBeTruthy();
    });

    it('should handle zero time correctly', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} timeLeft={0} />
      );
      
      expect(getByText(/00:00:00/)).toBeTruthy();
    });

    it('should handle negative time by showing zero', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} timeLeft={-5} />
      );
      
      expect(getByText(/00:00:00/)).toBeTruthy();
    });

    it('should display correct language flag for English', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} gameLanguage="en" />
      );
      
      expect(getByText('🇺🇸')).toBeTruthy();
    });

    it('should display correct language flag for Portuguese', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} gameLanguage="pt" />
      );
      
      expect(getByText('🇧🇷')).toBeTruthy();
    });

    it('should display correct language flag for Spanish', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} gameLanguage="es" />
      );
      
      expect(getByText('🇪🇸')).toBeTruthy();
    });

    it('should display current letter in uppercase', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} currentLetter="b" />
      );
      
      expect(getByText(/B/)).toBeTruthy();
    });
  });

  describe('Time Formatting', () => {
    it('should format full minute correctly', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} timeLeft={60} />
      );
      
      expect(getByText(/01:00:00/)).toBeTruthy();
    });

    it('should format half minute correctly', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} timeLeft={30} />
      );
      
      expect(getByText(/00:30:00/)).toBeTruthy();
    });

    it('should format centiseconds correctly', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} timeLeft={10.55} />
      );
      
      expect(getByText(/00:10:55/)).toBeTruthy();
    });

    it('should handle very small time values', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} timeLeft={0.01} />
      );
      
      expect(getByText(/00:00:01/)).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onExit when exit button is pressed', () => {
      const onExitMock = jest.fn();
      const { getByTestId } = render(
        <GameHeader {...defaultProps} onExit={onExitMock} />
      );
      
      const exitButton = getByTestId('exit-game-button');
      fireEvent.press(exitButton);
      
      expect(onExitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large time values', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} timeLeft={3661} />
      );
      
      // Should handle over an hour
      expect(getByText(/61:01:00/)).toBeTruthy();
    });

    it('should handle decimal precision correctly', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} timeLeft={45.999} />
      );
      
      expect(getByText(/00:45:99/)).toBeTruthy();
    });

    it('should handle empty string letter gracefully', () => {
      const { getByText } = render(
        <GameHeader {...defaultProps} currentLetter="" />
      );
      
      // Should still render without crashing
      expect(getByText(/wordBuilder.letter/)).toBeTruthy();
    });
  });
});
