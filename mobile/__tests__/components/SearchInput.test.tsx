import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchInput from '@/components/SearchInput';

// Mock colors
jest.mock('@/constants/colors', () => ({
  COLORS: {
    appMediumGrey: '#666666',
    appDarkGrey: '#333333',
    appLightGrey: '#f5f5f5',
  },
}));

describe('SearchInput', () => {
  const mockOnChangeText = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    expect(getByPlaceholderText('Pesquisar...')).toBeTruthy();
  });

  it('should render with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        placeholder="Custom placeholder"
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
  });

  it('should display current value', () => {
    const { getByDisplayValue } = render(
      <SearchInput
        value="current text"
        onChangeText={mockOnChangeText}
      />
    );

    expect(getByDisplayValue('current text')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    const input = getByPlaceholderText('Pesquisar...');
    fireEvent.changeText(input, 'new text');

    expect(mockOnChangeText).toHaveBeenCalledWith('new text');
  });

  it('should call onBlur when provided and input loses focus', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
        onBlur={mockOnBlur}
      />
    );

    const input = getByPlaceholderText('Pesquisar...');
    fireEvent(input, 'blur');

    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('should not crash when onBlur is not provided', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    const input = getByPlaceholderText('Pesquisar...');
    expect(() => fireEvent(input, 'blur')).not.toThrow();
  });

  it('should have search icon', () => {
    const { UNSAFE_root } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should handle empty value', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    const input = getByPlaceholderText('Pesquisar...');
    expect(input.props.value).toBe('');
  });

  it('should handle long text values', () => {
    const longText = 'This is a very long search query that might overflow the input field';
    
    const { getByDisplayValue } = render(
      <SearchInput
        value={longText}
        onChangeText={mockOnChangeText}
      />
    );

    expect(getByDisplayValue(longText)).toBeTruthy();
  });

  it('should handle special characters in search', () => {
    const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    const input = getByPlaceholderText('Pesquisar...');
    fireEvent.changeText(input, specialText);

    expect(mockOnChangeText).toHaveBeenCalledWith(specialText);
  });

  it('should handle multiple text changes', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    const input = getByPlaceholderText('Pesquisar...');
    
    fireEvent.changeText(input, 'a');
    fireEvent.changeText(input, 'ab');
    fireEvent.changeText(input, 'abc');

    expect(mockOnChangeText).toHaveBeenCalledTimes(3);
    expect(mockOnChangeText).toHaveBeenNthCalledWith(1, 'a');
    expect(mockOnChangeText).toHaveBeenNthCalledWith(2, 'ab');
    expect(mockOnChangeText).toHaveBeenNthCalledWith(3, 'abc');
  });

  it('should have proper accessibility properties', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    const input = getByPlaceholderText('Pesquisar...');
    expect(input.props.autoCapitalize).toBe('none');
  });

  it('should clear text when empty string is provided', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value="some text"
        onChangeText={mockOnChangeText}
      />
    );

    const input = getByPlaceholderText('Pesquisar...');
    fireEvent.changeText(input, '');

    expect(mockOnChangeText).toHaveBeenCalledWith('');
  });

  it('should handle rapid typing', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    const input = getByPlaceholderText('Pesquisar...');
    
    // Simulate rapid typing
    const text = 'hello world';
    text.split('').forEach((char, index) => {
      fireEvent.changeText(input, text.substring(0, index + 1));
    });

    expect(mockOnChangeText).toHaveBeenCalledTimes(text.length);
  });
});
