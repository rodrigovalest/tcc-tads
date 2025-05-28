import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginForm from "../../components/LoginForm";

// Mock the useLoginForm hook
const mockHandleSubmit = jest.fn();
const mockHandleGoogleLogin = jest.fn();
const mockHandleSignUp = jest.fn();

jest.mock("../../hooks/useLoginForm", () => ({
  useLoginForm: () => ({
    control: {
      // Mock control object as needed for react-hook-form Controller
      // This might need more specific mocking depending on Controller's usage
      register: jest.fn(),
      unregister: jest.fn(),
      getFieldState: jest.fn(() => ({})),
      getValues: jest.fn(() => ({ email: "", password: "" })),
      setValue: jest.fn(),
      trigger: jest.fn(),
      formState: { errors: {}, isDirty: false, isValid: false },
      reset: jest.fn(),
      handleSubmit: (fn: any) => fn, // Important for handleSubmit(onSubmit) pattern
      watch: jest.fn(),
    },
    handleSubmit: mockHandleSubmit,
    errors: {},
    isLoading: false,
    apiError: null,
    handleGoogleLogin: mockHandleGoogleLogin,
    handleSignUp: mockHandleSignUp,
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockHandleSubmit.mockClear();
    mockHandleGoogleLogin.mockClear();
    mockHandleSignUp.mockClear();
    // Reset useLoginForm mock for different scenarios if needed by re-mocking or changing the return value
    jest.clearAllMocks(); // Clears all mocks, useful if the mock implementation changes between tests
    jest.mock("../../hooks/useLoginForm", () => ({
      useLoginForm: () => ({
        control: {
          register: jest.fn(),
          unregister: jest.fn(),
          getFieldState: jest.fn(() => ({})),
          getValues: jest.fn(() => ({ email: "", password: "" })),
          setValue: jest.fn(),
          trigger: jest.fn(),
          formState: { errors: {}, isDirty: false, isValid: false },
          reset: jest.fn(),
          handleSubmit: (fn: any) => fn,
          watch: jest.fn(),
        },
        handleSubmit: mockHandleSubmit,
        errors: {},
        isLoading: false,
        apiError: null,
        handleGoogleLogin: mockHandleGoogleLogin,
        handleSignUp: mockHandleSignUp,
      }),
    }));
  });

  it("renders correctly", () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <LoginForm />
    );

    expect(getByText("Calle")).toBeTruthy();
    expect(getByText("Log in or sign up")).toBeTruthy();
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(getByTestId("login-button")).toBeTruthy();
    expect(getByTestId("google-login-button")).toBeTruthy();
    expect(getByText("Create an account")).toBeTruthy();
  });

  it("calls handleSubmit on login button press", async () => {
    const { getByTestId, getByPlaceholderText } = render(<LoginForm />);
    const emailInput = getByPlaceholderText("Enter your email");
    const passwordInput = getByPlaceholderText("Enter your password");
    const loginButton = getByTestId("login-button");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    // The actual submit logic is within useLoginForm, which calls the function passed to handleSubmit
    // So we check if the mockHandleSubmit (which is the one returned by useLoginForm) was called.
    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('calls handleGoogleLogin on "Login with Google" button press', () => {
    const { getByTestId } = render(<LoginForm />);
    const googleLoginButton = getByTestId("google-login-button");

    fireEvent.press(googleLoginButton);
    expect(mockHandleGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it('calls handleSignUp on "Create an account" button press', () => {
    const { getByText } = render(<LoginForm />);
    const createAccountButton = getByText("Create an account");

    fireEvent.press(createAccountButton);
    expect(mockHandleSignUp).toHaveBeenCalledTimes(1);
  });

  it("displays API error message when apiError is present", () => {
    // Re-mock useLoginForm to return an apiError
    jest.mock("../../hooks/useLoginForm", () => ({
      useLoginForm: () => ({
        control: {
          register: jest.fn(),
          unregister: jest.fn(),
          getFieldState: jest.fn(() => ({})),
          getValues: jest.fn(() => ({ email: "", password: "" })),
          setValue: jest.fn(),
          trigger: jest.fn(),
          formState: { errors: {}, isDirty: false, isValid: false },
          reset: jest.fn(),
          handleSubmit: (fn: any) => fn,
          watch: jest.fn(),
        },
        handleSubmit: mockHandleSubmit,
        errors: {},
        isLoading: false,
        apiError: "Invalid credentials", // Provide an API error
        handleGoogleLogin: mockHandleGoogleLogin,
        handleSignUp: mockHandleSignUp,
      }),
    }));

    const { getByText } = render(<LoginForm />);
    expect(getByText("Invalid credentials")).toBeTruthy();
  });

  it("disables login button when isLoading is true", () => {
    jest.mock("../../hooks/useLoginForm", () => ({
      useLoginForm: () => ({
        control: {
          register: jest.fn(),
          unregister: jest.fn(),
          getFieldState: jest.fn(() => ({})),
          getValues: jest.fn(() => ({ email: "", password: "" })),
          setValue: jest.fn(),
          trigger: jest.fn(),
          formState: { errors: {}, isDirty: false, isValid: false },
          reset: jest.fn(),
          handleSubmit: (fn: any) => fn,
          watch: jest.fn(),
        },
        handleSubmit: mockHandleSubmit,
        errors: {},
        isLoading: true, // Set isLoading to true
        apiError: null,
        handleGoogleLogin: mockHandleGoogleLogin,
        handleSignUp: mockHandleSignUp,
      }),
    }));

    const { getByTestId } = render(<LoginForm />);
    const loginButton = getByTestId("login-button");
    expect(loginButton.props.accessibilityState.disabled).toBe(true);
  });

  it("disables login button when there are form errors", () => {
    jest.mock("../../hooks/useLoginForm", () => ({
      useLoginForm: () => ({
        control: {
          register: jest.fn(),
          unregister: jest.fn(),
          getFieldState: jest.fn(() => ({})), // Ensure this returns an empty object or valid state
          getValues: jest.fn(() => ({ email: "", password: "" })),
          setValue: jest.fn(),
          trigger: jest.fn(),
          formState: {
            errors: { email: { message: "Email is required" } },
            isDirty: false,
            isValid: false,
          }, // Mock formState with errors
          reset: jest.fn(),
          handleSubmit: (fn: any) => fn,
          watch: jest.fn(),
        },
        handleSubmit: mockHandleSubmit,
        errors: { email: { message: "Email is required" } }, // Provide form errors
        isLoading: false,
        apiError: null,
        handleGoogleLogin: mockHandleGoogleLogin,
        handleSignUp: mockHandleSignUp,
      }),
    }));

    const { getByTestId } = render(<LoginForm />);
    const loginButton = getByTestId("login-button");
    expect(loginButton.props.accessibilityState.disabled).toBe(true);
  });
});
