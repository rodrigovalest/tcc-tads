import { useMutation } from "@tanstack/react-query";
import authService from "../services/auth-service";
import { useRouter } from "expo-router";
import type { ApiError } from "../api";
import Toast from "react-native-toast-message";
import IRegisterRequest from "../models/requests/register-request";
import useI18n from "./useI18n";

export function useRegister() {
  const router = useRouter();
  const { t } = useI18n();

  return useMutation<void, ApiError, IRegisterRequest>({
    mutationFn: async (data) => {
      await authService.register(data);
    },

    onSuccess: async () => {
      router.replace("/(public)/(auth)/login");
      Toast.show({
        type: "success",
        text1: t('register.success.title'),
        text2: t('register.success.message'),
        position: "top",
      });
    },

    onError: (error: ApiError) => {
      Toast.show({
        type: "error",
        text1: t('register.error.title'),
        text2: error.message || t('register.error.message'),
        position: "top",
      });
    },
  });
}