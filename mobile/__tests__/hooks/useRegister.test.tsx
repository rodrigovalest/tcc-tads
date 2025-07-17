import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useRegister } from "../../hooks/useRegister";
import authService from "../../services/auth-service";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

// mocks
const mockReplace = jest.fn();
const mockToastShow = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("react-native-toast-message", () => ({
  show: (...args: any[]) => mockToastShow(...args),
}));

jest.mock("../../services/auth-service", () => ({
  __esModule: true,
  default: {
    register: jest.fn(),
  },
}));

function createQueryWrapper() {
  const client = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}


describe("useRegister", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call register, navigate on success, and show success toast", async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRegister(), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.mutate({
        username: "john",
        email: "john@example.com",
        password: "securepass",
        nationality: "US",
      });
    });

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/(public)/(auth)/login");
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          text1: "Registration successful",
        })
      );
    });
  });

  it("should show error toast on register failure", async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce({
      status: 400,
      message: "Invalid input",
    });

    const { result } = renderHook(() => useRegister(), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.mutate({
        username: "john",
        email: "bad-email",
        password: "pass",
        nationality: "US",
      });
    });

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Registration error",
          text2: "Invalid input",
        })
      );
    });
  });
});
