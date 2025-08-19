import { useMutation } from "@tanstack/react-query";
import authService from "../services/auth-service";
import useAuthStore from "../store/auth-store";
import ILoginResponse from "../models/responses/login-response";
import { useRouter } from "expo-router";
import type { ApiError } from "../api";
import Toast from "react-native-toast-message";
import useI18n from "./useI18n";

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const { t } = useI18n();

  return useMutation<
    ILoginResponse,
    ApiError,
    { email: string; password: string }
  >({
    mutationFn: async ({ email, password }) => {
      const data = await authService.login({ email, password });
      await login(data.access_token);
      return data;
    },

    onSuccess: () => {
      router.replace("/(private)/(tabs)/matches");

      Toast.show({
        type: "success",
        text1: t('auth.loginMessages.success.title'),
        position: "top",
      });
    },

    onError: (error: ApiError) => {
      console.warn("[Login error]", error.status, error.message);

      Toast.show({
        type: "error",
        text1: t('auth.loginMessages.error.title'),
        text2: error.message || t('auth.loginMessages.error.message'),
        position: "top",
      });
    },
  });
}
