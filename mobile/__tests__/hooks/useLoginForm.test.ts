import { renderHook, act } from "@testing-library/react-native";
import { useLoginForm } from "../../hooks/useLoginForm";

describe("useLoginForm", () => {
  it("should update email and password fields", () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("password123");
    });

    expect(result.current.email).toBe("test@example.com");
    expect(result.current.password).toBe("password123");
  });

  it("should call console.log on handleLogin", () => {
    const consoleSpy = jest.spyOn(console, "log");
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("password123");
      result.current.handleLogin();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Login attempt with:", {
      email: "test@example.com",
      password: "password123",
    });
    consoleSpy.mockRestore();
  });

  it("should call console.log on handleGoogleLogin", () => {
    const consoleSpy = jest.spyOn(console, "log");
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.handleGoogleLogin();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Google login attempt");
    consoleSpy.mockRestore();
  });

  it("should call console.log on handleSignUp", () => {
    const consoleSpy = jest.spyOn(console, "log");
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.handleSignUp();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Navigate to sign up");
    consoleSpy.mockRestore();
  });
});
