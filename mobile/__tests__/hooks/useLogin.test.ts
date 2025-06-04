import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLogin } from "@/hooks/useLogin";
import authService from "@/services/auth-service";
import useAuthStore from "@/store/auth-store";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import React from "react";

// Mock dependencies
jest.mock("@/services/auth-service");
jest.mock("@/store/auth-store");

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedToast = Toast as jest.Mocked<typeof Toast>;

describe("useLogin", () => {
  let queryClient: QueryClient;
  let mockLogin: jest.Mock;
  let mockReplace: jest.Mock;

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockLogin = jest.fn();
    mockReplace = jest.fn();

    mockedUseAuthStore.mockReturnValue(mockLogin);
    mockedUseRouter.mockReturnValue({ replace: mockReplace } as any);

    jest.clearAllMocks();
  });

  it("should login successfully", async () => {
    const mockResponse = {
      access_token: "test-token",
      token_type: "Bearer",
      expires_in: 3600,
    };
    mockedAuthService.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: "test@test.com", password: "password" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedAuthService.login).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password",
    });
    expect(mockLogin).toHaveBeenCalledWith("test-token");
    expect(mockReplace).toHaveBeenCalledWith("/(private)/(tabs)/matches");
    expect(mockedToast.show).toHaveBeenCalledWith({
      type: "success",
      text1: "Login success",
      position: "top",
    });
  });

  it("should handle login error", async () => {
    const mockError = { status: 401, message: "Invalid credentials" };
    mockedAuthService.login.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({
      email: "test@test.com",
      password: "wrong-password",
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockedToast.show).toHaveBeenCalledWith({
      type: "error",
      text1: "Login error",
      text2: "Invalid credentials",
      position: "top",
    });
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should handle network error", async () => {
    const mockError = { status: 500, message: null };
    mockedAuthService.login.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: "test@test.com", password: "password" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockedToast.show).toHaveBeenCalledWith({
      type: "error",
      text1: "Login error",
      text2: "Something went wrong. Try again",
      position: "top",
    });
  });
});
