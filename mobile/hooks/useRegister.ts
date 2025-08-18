import { useMutation } from "@tanstack/react-query";
import authService from "../services/auth-service";
import { useRouter } from "expo-router";
import type { ApiError } from "../api";
import Toast from "react-native-toast-message";
import IRegisterRequest from "../models/requests/register-request";

export function useRegister() {
  const router = useRouter();

  return useMutation<void, ApiError, IRegisterRequest>({
    mutationFn: async (data) => {
      return await authService.register(data);
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
      Toast.show({
        type: "error",
        text1: "Registration error",
        text2: error.message || "Something went wrong. Try again.",
        position: "top",
      });
    },
  });
}