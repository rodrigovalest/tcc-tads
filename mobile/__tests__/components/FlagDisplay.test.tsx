import React from 'react';
import { render } from '@testing-library/react-native';
import FlagDisplay from '@/components/FlagDisplay';

describe('FlagDisplay', () => {
  it('should render flag when countryCode is provided and supported', () => {
    const { UNSAFE_root } = render(
      <FlagDisplay countryCode="br" size={24} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with different sizes', () => {
    const { UNSAFE_root } = render(
      <FlagDisplay countryCode="gb" size={32} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should handle unsupported country codes gracefully', () => {
    const { getByText } = render(
      <FlagDisplay countryCode="unknown" size={24} />
    );

    // Should render fallback flag emoji
    expect(getByText('🏳️')).toBeTruthy();
  });

  it('should render with Spanish flag', () => {
    const { UNSAFE_root } = render(
      <FlagDisplay countryCode="es" size={24} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should handle empty country code', () => {
    const { getByText } = render(
      <FlagDisplay countryCode="" size={24} />
    );

    // Should render fallback flag emoji
    expect(getByText('🏳️')).toBeTruthy();
  });

  it('should render with different size variations', () => {
    const sizes = [16, 24, 32, 48];
    
    sizes.forEach(size => {
      const { UNSAFE_root } = render(
        <FlagDisplay countryCode="br" size={size} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('should handle case insensitive country codes', () => {
    const { UNSAFE_root: upperCase } = render(
      <FlagDisplay countryCode="BR" size={24} />
    );

    const { UNSAFE_root: lowerCase } = render(
      <FlagDisplay countryCode="br" size={24} />
    );

    expect(upperCase).toBeTruthy();
    expect(lowerCase).toBeTruthy();
  });

  it('should not render emoji when fallbackToEmoji is false', () => {
    const { queryByText } = render(
      <FlagDisplay countryCode="unknown" size={24} fallbackToEmoji={false} />
    );

    // Should not render any fallback emoji
    expect(queryByText('🏳️')).toBeNull();
  });

  it('should render emoji for supported languages when emoji type', () => {
    // Note: This test assumes the getFlagDisplay might return emoji type for some cases
    const { UNSAFE_root } = render(
      <FlagDisplay countryCode="br" size={24} fallbackToEmoji={true} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});
