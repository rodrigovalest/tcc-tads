import { renderHook, act } from "@testing-library/react-native";
import { useLoginForm } from "../../hooks/useLoginForm";
import authService from "../../services/auth-service";
import { router } from "expo-router";

jest.mock("../../services/auth-service");
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe("useLoginForm", () => {
  const mockAuthService = authService as jest.Mocked<typeof authService>;
  const mockRouterReplace = router.replace as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update email and password fields and clear errors", () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail("test");
      result.current.setPassword("123");
    });
    act(() => {
      result.current.handleEmailBlur();
      result.current.handlePasswordBlur();
    });

    expect(result.current.emailError).not.toBe("");
    expect(result.current.passwordError).not.toBe("");

    act(() => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("password123");
    });

    expect(result.current.email).toBe("test@example.com");
    expect(result.current.password).toBe("password123");
    expect(result.current.emailError).toBe("");
    expect(result.current.passwordError).toBe("");
  });

  describe("Validation", () => {
    it("should set emailError for invalid email", () => {
      const { result } = renderHook(() => useLoginForm());
      act(() => result.current.setEmail("invalidemail"));
      act(() => result.current.handleEmailBlur());
      expect(result.current.emailError).toBe("Email inválido");
    });

    it("should set passwordError for short password", () => {
      const { result } = renderHook(() => useLoginForm());
      act(() => result.current.setPassword("123"));
      act(() => result.current.handlePasswordBlur());
      expect(result.current.passwordError).toBe(
        "Senha deve ter pelo menos 6 caracteres"
      );
    });

    it("should not set errors for valid email and password", () => {
      const { result } = renderHook(() => useLoginForm());
      act(() => result.current.setEmail("valid@example.com"));
      act(() => result.current.setPassword("validpassword"));
      act(() => {
        result.current.handleEmailBlur();
        result.current.handlePasswordBlur();
      });
      expect(result.current.emailError).toBe("");
      expect(result.current.passwordError).toBe("");
    });
  });

  describe("handleLogin", () => {
    it("should successfully login and navigate", async () => {
      mockAuthService.login.mockResolvedValueOnce({
        access_token: "fake-access-token",
        token_type: "Bearer",
      });
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setEmail("test@example.com");
        result.current.setPassword("password123");
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockRouterReplace).toHaveBeenCalledWith(
        "/(private)/(tabs)/matches"
      );
      expect(result.current.apiError).toBeNull();
    });

    it("should set apiError on login failure", async () => {
      const errorMessage = "Invalid credentials";
      mockAuthService.login.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setEmail("test@example.com");
        result.current.setPassword("password123");
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(result.current.apiError).toBe(errorMessage);
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    it("should set validation errors and not call API if form is invalid", async () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setEmail("invalid");
        result.current.setPassword("123");
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.emailError).toBe("Email inválido");
      expect(result.current.passwordError).toBe(
        "Senha deve ter pelo menos 6 caracteres"
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });
  });

  describe("handleGoogleLogin", () => {
    it("should attempt Google login and set apiError for not implemented", async () => {
      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleGoogleLogin();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.apiError).toBe(
        "Google login is not implemented yet."
      );
    });
  });

  describe("handleSignUp", () => {
    it("should navigate on handleSignUp", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleSignUp();
      });

      expect(mockRouterReplace).toHaveBeenCalledWith(
        "/(private)/(tabs)/matches"
      );
    });
  });

  describe("Blur Handlers", () => {
    it("handleEmailBlur should validate if formSubmitted or email has value", () => {
      const { result } = renderHook(() => useLoginForm());
      act(() => result.current.handleEmailBlur());
      expect(result.current.emailError).toBe("");

      act(() => result.current.setEmail("invalid"));
      act(() => result.current.handleEmailBlur());
      expect(result.current.emailError).toBe("Email inválido");

      act(() => result.current.setEmail(""));
      act(() => result.current.setPassword("123"));
      act(() => {
        result.current.handleLogin();
      });

      act(() => result.current.handleEmailBlur());
      expect(result.current.emailError).toBe("Email é obrigatório");
    });

    it("handlePasswordBlur should validate if formSubmitted or password has value", () => {
      const { result } = renderHook(() => useLoginForm());
      act(() => result.current.handlePasswordBlur());
      expect(result.current.passwordError).toBe("");

      act(() => result.current.setPassword("123"));
      act(() => result.current.handlePasswordBlur());
      expect(result.current.passwordError).toBe(
        "Senha deve ter pelo menos 6 caracteres"
      );

      act(() => result.current.setEmail("valid@email.com"));
      act(() => result.current.setPassword(""));
      act(() => {
        result.current.handleLogin();
      });

      act(() => result.current.handlePasswordBlur());
      expect(result.current.passwordError).toBe("Senha é obrigatória");
    });
  });
});
