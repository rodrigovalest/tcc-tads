import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InputModeSelector from '@/components/InputModeSelector';
import { InputMode } from '@/models/types/input-mode.type';

// Mock useI18n hook
jest.mock('@/hooks/useI18n', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'wordBuilder.inputMode': 'Input Mode',
        'wordBuilder.typing': 'Typing',
        'wordBuilder.voice': 'Voice',
      };
      return translations[key] || key;
    },
  })),
}));

describe('InputModeSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render correctly with no selection', () => {
      const { getByText } = render(
        <InputModeSelector
          selected={null}
          onSelect={mockOnSelect}
        />
      );
      
      expect(getByText('Input Mode')).toBeTruthy();
      expect(getByText('Typing')).toBeTruthy();
      expect(getByText('Voice')).toBeTruthy();
    });

    it('should render correctly with typing selected', () => {
      const { getByText } = render(
        <InputModeSelector
          selected="typing"
          onSelect={mockOnSelect}
        />
      );
      
      expect(getByText('Input Mode')).toBeTruthy();
      expect(getByText('Typing')).toBeTruthy();
      expect(getByText('Voice')).toBeTruthy();
    });

    it('should render correctly with voice selected', () => {
      const { getByText } = render(
        <InputModeSelector
          selected="voice"
          onSelect={mockOnSelect}
        />
      );
      
      expect(getByText('Input Mode')).toBeTruthy();
      expect(getByText('Typing')).toBeTruthy();
      expect(getByText('Voice')).toBeTruthy();
    });

    it('should render correctly when disabled', () => {
      const { getByText } = render(
        <InputModeSelector
          selected={null}
          onSelect={mockOnSelect}
          disabled={true}
        />
      );
      
      expect(getByText('Input Mode')).toBeTruthy();
      expect(getByText('Typing')).toBeTruthy();
      expect(getByText('Voice')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onSelect when typing button is pressed', () => {
      const { getByText } = render(
        <InputModeSelector
          selected={null}
          onSelect={mockOnSelect}
        />
      );
      
      const typingButton = getByText('Typing').parent;
      fireEvent.press(typingButton);
      
      expect(mockOnSelect).toHaveBeenCalledWith('typing');
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect when voice button is pressed', () => {
      const { getByText } = render(
        <InputModeSelector
          selected={null}
          onSelect={mockOnSelect}
        />
      );
      
      const voiceButton = getByText('Voice').parent;
      fireEvent.press(voiceButton);
      
      expect(mockOnSelect).toHaveBeenCalledWith('voice');
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should not call onSelect when disabled and button is pressed', () => {
      const { getByText } = render(
        <InputModeSelector
          selected={null}
          onSelect={mockOnSelect}
          disabled={true}
        />
      );
      
      const typingButton = getByText('Typing').parent;
      fireEvent.press(typingButton);
      
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should allow changing selection from typing to voice', () => {
      const { getByText, rerender } = render(
        <InputModeSelector
          selected="typing"
          onSelect={mockOnSelect}
        />
      );
      
      const voiceButton = getByText('Voice').parent;
      fireEvent.press(voiceButton);
      
      expect(mockOnSelect).toHaveBeenCalledWith('voice');
      
      // Simulate parent component updating the selection
      rerender(
        <InputModeSelector
          selected="voice"
          onSelect={mockOnSelect}
        />
      );
      
      expect(getByText('Voice')).toBeTruthy();
    });

    it('should allow changing selection from voice to typing', () => {
      const { getByText, rerender } = render(
        <InputModeSelector
          selected="voice"
          onSelect={mockOnSelect}
        />
      );
      
      const typingButton = getByText('Typing').parent;
      fireEvent.press(typingButton);
      
      expect(mockOnSelect).toHaveBeenCalledWith('typing');
      
      // Simulate parent component updating the selection
      rerender(
        <InputModeSelector
          selected="typing"
          onSelect={mockOnSelect}
        />
      );
      
      expect(getByText('Typing')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility properties', () => {
      const { getByText } = render(
        <InputModeSelector
          selected={null}
          onSelect={mockOnSelect}
        />
      );
      
      const typingButton = getByText('Typing').parent;
      const voiceButton = getByText('Voice').parent;
      
      // Buttons should be touchable
      expect(typingButton).toBeTruthy();
      expect(voiceButton).toBeTruthy();
    });

    it('should handle disabled state properly', () => {
      const { getByText } = render(
        <InputModeSelector
          selected={null}
          onSelect={mockOnSelect}
          disabled={true}
        />
      );
      
      // Try to press the button - it shouldn't call onSelect when disabled
      fireEvent.press(getByText('Typing'));
      expect(mockOnSelect).not.toHaveBeenCalled();
      
      fireEvent.press(getByText('Voice'));
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Visual States', () => {
    it('should handle all possible selection states', () => {
      const modes: (InputMode | null)[] = [null, 'typing', 'voice'];
      
      modes.forEach((mode) => {
        const { getByText } = render(
          <InputModeSelector
            selected={mode}
            onSelect={mockOnSelect}
          />
        );
        
        expect(getByText('Input Mode')).toBeTruthy();
        expect(getByText('Typing')).toBeTruthy();
        expect(getByText('Voice')).toBeTruthy();
      });
    });

    it('should handle disabled state for both buttons', () => {
      const { getByText } = render(
        <InputModeSelector
          selected={null}
          onSelect={mockOnSelect}
          disabled={true}
        />
      );
      
      // Test that clicking buttons when disabled doesn't trigger onSelect
      fireEvent.press(getByText('Typing'));
      fireEvent.press(getByText('Voice'));
      
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });
});
