import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Register from '@/app/(public)/(auth)/register';
import { router } from 'expo-router';
import useI18n from '@/hooks/useI18n';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@/hooks/useI18n', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/components/MultiStepRegisterForm', () => {
  const { View, Text } = require('react-native');
  return function MockMultiStepRegisterForm() {
    return (
      <View testID="multi-step-register-form">
        <Text>Mock Multi Step Register Form</Text>
      </View>
    );
  };
});

jest.mock('@/components/LanguageSelector', () => {
  const { View, Text } = require('react-native');
  return function MockLanguageSelector() {
    return (
      <View testID="language-selector">
        <Text>Language Selector</Text>
      </View>
    );
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{name}</Text>;
  },
}));

const mockT = jest.fn((key: string) => {
  const translations: { [key: string]: string } = {
    'auth.createAccount': 'Create account',
  };
  return translations[key] || key;
});

const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;

describe('Register screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseI18n.mockReturnValue({
      t: mockT as any,
      currentLanguage: 'en' as any,
      changeLanguage: jest.fn(),
      isLoading: false,
      isInitialized: true,
      isRTL: false,
      resetLanguage: jest.fn(),
      availableLanguages: [],
    });
  });

  it('renders logo, texts and components', () => {
    const { getByText, getByTestId } = render(<Register />);

    expect(getByTestId('register-screen-safe-area-view')).toBeTruthy();
    expect(getByText('Calle')).toBeTruthy();
    expect(getByText('Create account')).toBeTruthy();
    expect(getByTestId('multi-step-register-form')).toBeTruthy();
    expect(getByTestId('language-selector')).toBeTruthy();
  });

  it('navigates to login screen when pressing back button', async () => {
    const { getByTestId } = render(<Register />);
    const backButton = getByTestId('go-to-login-button');

    fireEvent.press(backButton);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(public)/(auth)/login');
    });
  });

  it('should display translated text for create account', () => {
    render(<Register />);

    expect(mockT).toHaveBeenCalledWith('auth.createAccount');
  });

  it('should render with correct styling classes', () => {
    const { getByTestId } = render(<Register />);
    
    const safeAreaView = getByTestId('register-screen-safe-area-view');
    expect(safeAreaView.props.className).toBe('flex-1 bg-appBgWhite');
  });

  it('should have proper scroll view configuration', () => {
    const { UNSAFE_getByType } = render(<Register />);
    
    const scrollView = UNSAFE_getByType(require('react-native').ScrollView);
    expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
  });
});
