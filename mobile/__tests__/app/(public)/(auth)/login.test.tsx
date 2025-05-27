import React from "react";
import { render, screen } from "@testing-library/react-native";
import Login from "../../../../app/(public)/(auth)/login";

jest.mock("@/components/LoginForm", () => {
  const { Text } = require("react-native");
  const MockLoginForm = () => (
    <Text testID="mocked-login-form">Mocked LoginForm</Text>
  );
  return MockLoginForm;
});

describe("Login Screen", () => {
  it("should render SafeAreaView and the LoginForm", () => {
    render(<Login />);

    const safeAreaView = screen.getByTestId("login-screen-safe-area-view");
    expect(safeAreaView).toBeTruthy();

    const mockedLoginForm = screen.getByTestId("mocked-login-form");
    expect(mockedLoginForm).toBeTruthy();
    expect(screen.getByText("Mocked LoginForm")).toBeTruthy();
  });
});
