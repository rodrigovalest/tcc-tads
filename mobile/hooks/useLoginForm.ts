import { router } from "expo-router";
import useAuthStore, { AuthState } from "@/store/auth-store";
import ILoginRequest from "@/models/requests/login-request";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";

const loginSchema = yup.object().shape({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .required("Senha é obrigatória"),
});

export const useLoginForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<ILoginRequest>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const storeLogin = useAuthStore((state: AuthState) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleLogin = async (data: ILoginRequest) => {
    setApiError(null);
    clearErrors();
    setIsLoading(true);
    try {
      await storeLogin(data);
      console.log("Login attempt successful via useAuthStore");
    } catch (error: any) {
      console.error("Error during handleLogin:", error);
      const message =
        error.message || "An unexpected error occurred during login.";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setApiError(null);
    setIsLoading(true);
    try {
      console.log("Google login attempt");
      // Implement Google login logic here
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
    console.log("Navigate to sign up");
    router.replace("/(public)/(auth)/register");
  };

  return {
    control,
    handleSubmit: handleSubmit(handleLogin),
    errors,
    isLoading: isLoading || isSubmitting,
    apiError,
    setApiError,
    clearErrors,
    handleGoogleLogin,
    handleSignUp,
  };
};
