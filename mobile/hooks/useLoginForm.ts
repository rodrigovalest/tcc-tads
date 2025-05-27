import { useState } from "react";
import { router } from "expo-router";
import authService from "../services/auth-service";
import ILoginRequest from "../models/requests/login-request";

export const useLoginForm = () => {
  const [email, _setEmail] = useState("");
  const [password, _setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const setEmail = (text: string) => {
    _setEmail(text);
    if (emailError) {
      setEmailError("");
    }
  };

  const setPassword = (text: string) => {
    _setPassword(text);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email é obrigatório");
      return false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Email inválido");
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!password.trim()) {
      setPasswordError("Senha é obrigatória");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  };

  const validateForm = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    return isEmailValid && isPasswordValid;
  };

  const handleLogin = async () => {
    setFormSubmitted(true);
    setApiError(null);

    if (validateForm()) {
      setIsLoading(true);
      try {
        const loginData: ILoginRequest = { email: email, password: password };
        const response = await authService.login(loginData);
        console.log("Login successful:", response);

        /// TODO: Update global auth state (e.g., using Zustand)
        // e.g., authStore.setAuth(response.token, response.user);
        router.replace("/(private)/(tabs)/matches");
      } catch (error: any) {
        console.error("Login failed:", error);
        const message =
          error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials and try again.";
        setApiError(message);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Form has validation errors");
    }
  };

  const handleGoogleLogin = async () => {
    setApiError(null);
    setIsLoading(true);
    try {
      console.log("Google login attempt");
      throw new Error("Google login is not implemented yet.");
    } catch (error: any) {
      console.error("Google login failed:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Google login failed. Please try again later.";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    // Sign up navigation logic will be implemented later
    console.log("Navigate to sign up");
    router.replace("/(private)/(tabs)/matches");
  };

  const handleEmailBlur = () => {
    if (formSubmitted || email.trim()) {
      validateEmail();
    }
  };

  const handlePasswordBlur = () => {
    if (formSubmitted || password.trim()) {
      validatePassword();
    }
  };

  return {
    email,
    password,
    setEmail,
    setPassword,
    emailError,
    passwordError,
    isLoading,
    apiError,
    handleEmailBlur,
    handlePasswordBlur,
    handleLogin,
    handleGoogleLogin,
    handleSignUp,
  };
};
