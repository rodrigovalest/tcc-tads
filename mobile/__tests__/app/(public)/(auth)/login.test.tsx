import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Login from "@/app/(public)/(auth)/login";
import { router } from "expo-router";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock("@/components/LoginForm", () => () => {
  return <></>;
});

jest.mock("@/components/Button", () => ({ onPress, title, testID }: any) => {
  const { Text, TouchableOpacity } = require("react-native");
  return (
    <TouchableOpacity onPress={onPress} testID={testID}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

describe("Login screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders logo, texts and buttons", () => {
    const { getByText, getByTestId } = render(<Login />);

    expect(getByTestId("login-screen-safe-area-view")).toBeTruthy();
    expect(getByText("Calle")).toBeTruthy();
    expect(getByText("Log in or sign up")).toBeTruthy();
    expect(getByText("Login with Google")).toBeTruthy();
    expect(getByText("Create account")).toBeTruthy();
  });

  it('navigates to register screen when pressing "Create account"', () => {
    const { getByText } = render(<Login />);
    const createAccountButton = getByText("Create account");

    fireEvent.press(createAccountButton);

    expect(router.replace).toHaveBeenCalledWith("/(public)/(auth)/register");
  });

  it("shows error when Google login is pressed", () => {
    const { getByText } = render(<Login />);
    const googleLoginButton = getByText("Login with Google");

    expect(() => {
      fireEvent.press(googleLoginButton);
    }).toThrow("Login google not implemented yet");
  });
});
