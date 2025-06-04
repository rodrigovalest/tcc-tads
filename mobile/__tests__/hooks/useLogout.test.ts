import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLogout } from "@/hooks/useLogout";
import authService from "@/services/auth-service";
import useAuthStore from "@/store/auth-store";
import { useRouter } from "expo-router";
import React from "react";

// Mock dependencies
jest.mock("@/services/auth-service");
jest.mock("@/store/auth-store");

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("useLogout", () => {
  let queryClient: QueryClient;
  let mockLogout: jest.Mock;
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

    mockLogout = jest.fn();
    mockReplace = jest.fn();

    mockedUseAuthStore.mockReturnValue(mockLogout);
    mockedUseRouter.mockReturnValue({ replace: mockReplace } as any);

    jest.clearAllMocks();
  });

  it("should logout successfully", async () => {
    mockedAuthService.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedAuthService.logout).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(public)/(auth)/login");
  });

  it("should handle logout error", async () => {
    const mockError = { status: 500, message: "Server error" };
    mockedAuthService.logout.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockedAuthService.logout).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should call logout even when service fails", async () => {
    const mockError = { status: 401, message: "Unauthorized" };
    mockedAuthService.logout.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Should still call store logout even if service fails
    expect(mockLogout).toHaveBeenCalled();
  });
});
