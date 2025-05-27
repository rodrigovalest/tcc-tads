import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import LoginForm from "../../components/LoginForm";

const mockHandleLogin = jest.fn();

jest.mock("../../hooks/useLoginForm", () => ({
  useLoginForm: () => ({
    email: "test@example.com",
    password: "password123",
    setEmail: jest.fn(),
    setPassword: jest.fn(),
    emailError: "",
    passwordError: "",
    isLoading: false,
    apiError: "",
    handleEmailBlur: jest.fn(),
    handlePasswordBlur: jest.fn(),
    handleLogin: mockHandleLogin,
    handleGoogleLogin: jest.fn(),
    handleSignUp: jest.fn(),
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all components correctly", () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <LoginForm />
    );
    expect(getByText("Calle")).toBeTruthy();
    expect(getByText("Log in or sign up")).toBeTruthy();
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(getByTestId("login-button")).toBeTruthy();
    expect(getByTestId("google-login-button")).toBeTruthy();
  });

  it("calls handleLogin when the login button is pressed", async () => {
    const { getByTestId } = render(<LoginForm />);
    await act(async () => {
      fireEvent.press(getByTestId("login-button"));
    });
    expect(mockHandleLogin).toHaveBeenCalled();
  });
});
