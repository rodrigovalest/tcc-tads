import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Login from "@/app/(public)/(auth)/login";
import { router } from "expo-router";
import useI18n from "@/hooks/useI18n";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock("@/hooks/useI18n", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/components/LoginForm", () => () => {
  const { View, Text } = require("react-native");
  return (
    <View testID="login-form">
      <Text>Mock Login Form</Text>
    </View>
  );
});

jest.mock("@/components/Button", () => ({ onPress, title, testID, ...props }: any) => {
  const { Text, TouchableOpacity } = require("react-native");
  return (
    <TouchableOpacity onPress={onPress} testID={testID} {...props}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

jest.mock("@/components/LanguageSelector", () => () => {
  const { View, Text } = require("react-native");
  return (
    <View testID="language-selector">
      <Text>Language Selector</Text>
    </View>
  );
});

const mockT = jest.fn((key: string) => {
  const translations: { [key: string]: string } = {
    'auth.loginOrSignUp': 'Log in or sign up',
    'auth.or': 'or',
    'auth.loginWithGoogle': 'Login with Google',
    'auth.createAccount': 'Create account',
  };
  return translations[key] || key;
});

const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;

describe("Login screen", () => {
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

  it("renders logo, texts and buttons", () => {
    const { getByText, getByTestId } = render(<Login />);

    expect(getByTestId("login-screen-safe-area-view")).toBeTruthy();
    expect(getByText("Calle")).toBeTruthy();
    expect(getByText("Log in or sign up")).toBeTruthy();
    expect(getByText("Login with Google")).toBeTruthy();
    expect(getByText("Create account")).toBeTruthy();
    expect(getByTestId("login-form")).toBeTruthy();
    expect(getByTestId("language-selector")).toBeTruthy();
  });

  it('navigates to register screen when pressing "Create account"', async () => {
    const { getByText } = render(<Login />);
    const createAccountButton = getByText("Create account");

    fireEvent.press(createAccountButton);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/(public)/(auth)/register");
    });
  });

  it("shows error when Google login is pressed", () => {
    const { getByTestId } = render(<Login />);
    const googleLoginButton = getByTestId("google-login-button");

    // Mock console.error to suppress error output in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      fireEvent.press(googleLoginButton);
    }).toThrow("Login google not implemented yet");

    consoleSpy.mockRestore();
  });

  it("should display translated texts correctly", () => {
    render(<Login />);

    expect(mockT).toHaveBeenCalledWith('auth.loginOrSignUp');
    expect(mockT).toHaveBeenCalledWith('auth.or');
    expect(mockT).toHaveBeenCalledWith('auth.loginWithGoogle');
    expect(mockT).toHaveBeenCalledWith('auth.createAccount');
  });

  it("should render with correct testID for safe area view", () => {
    const { getByTestId } = render(<Login />);
    
    expect(getByTestId("login-screen-safe-area-view")).toBeTruthy();
  });

  it("should have Google login button with correct testID", () => {
    const { getByTestId } = render(<Login />);
    
    expect(getByTestId("google-login-button")).toBeTruthy();
  });
});
