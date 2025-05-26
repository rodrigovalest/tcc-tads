import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginForm from "../../components/LoginForm";

const mockUseLoginForm = {
  email: "",
  password: "",
  setEmail: jest.fn(),
  setPassword: jest.fn(),
  handleLogin: jest.fn(),
  handleGoogleLogin: jest.fn(),
  handleSignUp: jest.fn(),
};

jest.mock("../../hooks/useLoginForm", () => ({
  useLoginForm: () => mockUseLoginForm,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockUseLoginForm.email = "";
    mockUseLoginForm.password = "";
    mockUseLoginForm.setEmail.mockClear();
    mockUseLoginForm.setPassword.mockClear();
    mockUseLoginForm.handleLogin.mockClear();
    mockUseLoginForm.handleGoogleLogin.mockClear();
    mockUseLoginForm.handleSignUp.mockClear();
  });

  it("renders email and password inputs and all buttons", () => {
    const { getByPlaceholderText, getByText } = render(<LoginForm />);

    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Login with Google")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });

  it("calls setEmail when email input changes", () => {
    const { getByPlaceholderText } = render(<LoginForm />);
    fireEvent.changeText(
      getByPlaceholderText("Enter your email"),
      "test@example.com"
    );
    expect(mockUseLoginForm.setEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("calls setPassword when password input changes", () => {
    const { getByPlaceholderText } = render(<LoginForm />);
    fireEvent.changeText(
      getByPlaceholderText("Enter your password"),
      "password123"
    );
    expect(mockUseLoginForm.setPassword).toHaveBeenCalledWith("password123");
  });

  it("calls handleLogin when Login button is pressed", () => {
    const { getByText } = render(<LoginForm />);
    fireEvent.press(getByText("Login"));
    expect(mockUseLoginForm.handleLogin).toHaveBeenCalledTimes(1);
  });

  it("calls handleGoogleLogin when Login with Google button is pressed", () => {
    const { getByText } = render(<LoginForm />);
    fireEvent.press(getByText("Login with Google"));
    expect(mockUseLoginForm.handleGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it("calls handleSignUp when Sign Up button is pressed", () => {
    const { getByText } = render(<LoginForm />);
    fireEvent.press(getByText("Sign Up"));
    expect(mockUseLoginForm.handleSignUp).toHaveBeenCalledTimes(1);
  });
});
