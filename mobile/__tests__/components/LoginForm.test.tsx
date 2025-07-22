import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginForm from "@/components/LoginForm";
import { useLogin } from "@/hooks/useLogin";

jest.mock("@/hooks/useLogin");
jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));
jest.mock("@/store/auth-store", () => ({
  __esModule: true,
  default: () => ({
    login: jest.fn(),
  }),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({
  multiSet: jest.fn(),
  multiGet: jest.fn(() =>
    Promise.resolve([
      ["user", null],
      ["token", null],
    ])
  ),
  multiRemove: jest.fn(),
}));

describe("LoginForm", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });
  });

  it("renders inputs and button", () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginForm />);

    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(getByTestId("login-button")).toBeTruthy();
  });

  it("calls mutate with correct values on valid form submission", async () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginForm />);

    fireEvent.changeText(
      getByPlaceholderText("Enter your email"),
      "user@example.com"
    );
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "123456");

    fireEvent.press(getByTestId("login-button"));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "123456",
      });
    });
  });
});
