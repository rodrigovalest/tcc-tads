import { useMutation } from "@tanstack/react-query";
import authService from "@/services/auth-service";
import { useRouter } from "expo-router";
import type { ApiError } from "@/api";
import Toast from "react-native-toast-message";

export function useRegister() {
  const router = useRouter();

  return useMutation<void, ApiError, { username: string; email: string; password: string; nationality: string }>({
    mutationFn: async (data) => {
      await authService.register(data);
    },

    onSuccess: () => {
      router.replace("/(public)/(auth)/login");

      Toast.show({
        type: "success",
        text1: "Registration successful",
        text2: "You can now log in with your credentials.",
        position: "top",
      });
    },

    onError: (error: ApiError) => {
      console.warn("[Register error]", error.status, error.message);

      Toast.show({
        type: "error",
        text1: "Registration error",
        text2: error.message || "Something went wrong. Try again.",
        position: "top",
      });
    },
  });
}