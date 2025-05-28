import { renderHook, act } from "@testing-library/react-native";
import { useLoginForm } from "../../hooks/useLoginForm";
import { router } from "expo-router";
import useAuthStore, { AuthState } from "../../store/auth-store";
import * as yup from "yup";
import ILoginRequest from "../../models/requests/login-request";
import { UseFormReturn } from "react-hook-form";

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

const mockAuthStoreLoginFn = jest.fn();
const mockLogoutFn = jest.fn(); // Added for completeness if other tests use it
const mockRestoreSessionFn = jest.fn(); // Added for completeness

// Define the initial state for the mock store
const mockInitialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  userProfile: null,
  isLoading: false,
  error: null,
  login: mockAuthStoreLoginFn,
  logout: mockLogoutFn,
  restoreSession: mockRestoreSessionFn,
};

// Use a mutable variable to hold the current state of the mock store
let mockCurrentAuthState: AuthState = { ...mockInitialAuthState };

jest.mock("../../store/auth-store", () => {
  // This is the mock implementation for the useAuthStore hook
  const mockHook = (selector?: (state: AuthState) => any) => {
    if (selector) {
      return selector(mockCurrentAuthState);
    }
    return mockCurrentAuthState;
  };

  // Mock static methods if your application or other tests use them
  mockHook.getState = () => mockCurrentAuthState;
  mockHook.setState = (
    updater: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)
  ) => {
    const updates =
      typeof updater === "function" ? updater(mockCurrentAuthState) : updater;
    mockCurrentAuthState = { ...mockCurrentAuthState, ...updates };
  };

  return {
    __esModule: true,
    // Ensure the default export is a jest.fn() wrapping our mockHook logic.
    // This allows Jest to track calls to useAuthStore itself if needed.
    default: jest.fn(mockHook),
  };
});

// This will hold the actual onValid handler (handleLogin from the hook)
let capturedOnValidHandler: (data: ILoginRequest) => Promise<void>;

// This is the mock for the function returned by RHF's handleSubmit(onValid)
// e.g., what `result.current.handleSubmit` will be in the tests.
const mockRHFReturnedSubmitFunction = jest.fn(
  async (dataOrEvent?: ILoginRequest | React.BaseSyntheticEvent) => {
    if (capturedOnValidHandler) {
      // If dataOrEvent is ILoginRequest, call handler with it.
      // This simulates RHF calling the onValid handler with form data.
      if (
        dataOrEvent &&
        typeof dataOrEvent === "object" &&
        "email" in dataOrEvent &&
        "password" in dataOrEvent
      ) {
        return capturedOnValidHandler(dataOrEvent as ILoginRequest);
      }
      // If it's an event or undefined, RHF would extract data.
      // This mock doesn't fully simulate that, but our tests will pass data directly.
    }
  }
);

jest.mock("react-hook-form", () => {
  const actualRHF = jest.requireActual("react-hook-form");
  return {
    ...actualRHF,
    useForm: jest.fn(
      (
        options?: any
      ): Partial<UseFormReturn<ILoginRequest, any, undefined>> => ({
        control: {} as any, // Mocked control
        handleSubmit: jest
          .fn()
          .mockImplementation(
            (onValid: (data: ILoginRequest) => Promise<void>) => {
              capturedOnValidHandler = onValid; // Capture the actual handleLogin
              return mockRHFReturnedSubmitFunction; // Return our mock for the (e?) => Promise<void> function
            }
          ),
        formState: { errors: {}, isSubmitting: false } as any, // Mocked formState
        setError: jest.fn(),
        clearErrors: jest.fn(),
        // Add any other methods from useForm that your hook might use
        watch: jest.fn(),
        setValue: jest.fn(),
      })
    ),
  };
});

const loginSchema = yup.object().shape({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .required("Senha é obrigatória"),
});

describe("useLoginForm", () => {
  const mockRouterReplace = router.replace as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks(); // This will clear mockAuthStoreLoginFn, mockLogoutFn, etc.

    // Reset the mock store state to its initial values before each test
    mockCurrentAuthState = {
      ...mockInitialAuthState,
      // Re-assign mock functions to ensure they are the cleared Jest mocks
      login: mockAuthStoreLoginFn,
      logout: mockLogoutFn,
      restoreSession: mockRestoreSessionFn,
    };

    // The default export of useAuthStore is already a jest.fn() due to the mock structure.
    // Its implementation is set to call mockHook which uses currentMockAuthState.
    // No need to call (useAuthStore as jest.Mock).mockImplementation(...) here
    // unless a specific test needs to override the entire hook's behavior.
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.apiError).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toEqual({}); // from formState
    expect(typeof result.current.control).toBe("object");
    expect(typeof result.current.handleSubmit).toBe("function");
    expect(typeof result.current.handleGoogleLogin).toBe("function");
    expect(typeof result.current.handleSignUp).toBe("function");
  });

  it("handleSignUp should navigate to register screen", () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.handleSignUp();
    });

    expect(mockRouterReplace).toHaveBeenCalledWith("/(public)/(auth)/register");
  });

  it("handleLogin should call storeLogin and handle success", async () => {
    mockAuthStoreLoginFn.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useLoginForm());
    const loginData: ILoginRequest = {
      email: "test@example.com",
      password: "password123",
    };

    await act(async () => {
      await (result.current.handleSubmit as any)(loginData);
    });

    expect(mockAuthStoreLoginFn).toHaveBeenCalledWith(loginData);
    expect(result.current.apiError).toBeNull();
    expect(result.current.isLoading).toBe(false); // Should be false after completion
  });

  it("handleLogin should set apiError on storeLogin failure", async () => {
    const errorMessage = "Invalid credentials";
    mockAuthStoreLoginFn.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useLoginForm());
    const loginData: ILoginRequest = {
      email: "wrong@example.com",
      password: "wrongpassword",
    };

    await act(async () => {
      await (result.current.handleSubmit as any)(loginData);
    });

    expect(mockAuthStoreLoginFn).toHaveBeenCalledWith(loginData);
    expect(result.current.apiError).toBe(errorMessage);
    expect(result.current.isLoading).toBe(false);
  });

  it("handleGoogleLogin should set apiError as it is not implemented", async () => {
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleGoogleLogin();
    });

    expect(result.current.apiError).toBe(
      "Google login is not implemented yet."
    );
    expect(result.current.isLoading).toBe(false);
  });

  // Tests for yup schema validation
  describe("Login Schema Validation", () => {
    it("should require email and password", () => {
      // No async
      try {
        loginSchema.validateSync({}, { abortEarly: false }); // Explicit abortEarly: false
        throw new Error("ValidationError was not thrown for empty object"); // Should not reach here
      } catch (e: any) {
        expect(e.name).toBe("ValidationError");
        expect(e.inner).toBeInstanceOf(Array);
        expect(e.inner.length).toBe(2); // Both fields are required
        const messages = e.inner.map((err: any) => err.message).sort();
        expect(messages).toEqual([
          "Email é obrigatório",
          "Senha é obrigatória",
        ]);
      }
    });

    it("should require a valid email", () => {
      // No async
      try {
        loginSchema.validateSyncAt("email", { email: "invalid" }); // Use validateSyncAt
        throw new Error("ValidationError was not thrown for invalid email"); // Should not reach here
      } catch (e: any) {
        expect(e.name).toBe("ValidationError");
        expect(e.message).toBe("Email inválido");
      }
    });

    it("should require password to be at least 6 characters", () => {
      // No async
      try {
        // Use validateSyncAt for password, providing a valid email to avoid unrelated errors
        loginSchema.validateSyncAt("password", {
          email: "test@example.com",
          password: "123",
        });
        throw new Error("ValidationError was not thrown for short password"); // Should not reach here
      } catch (e: any) {
        expect(e.name).toBe("ValidationError");
        expect(e.message).toBe("Senha deve ter pelo menos 6 caracteres");
      }
    });

    it("should pass with valid data", async () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };
      await expect(loginSchema.validate(validData)).resolves.toEqual(validData);
    });
  });
});
