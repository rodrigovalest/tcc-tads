import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import authService from "../services/auth-service";
import useAuthStore from "../store/auth-store";
import useI18n from "./useI18n";
import type { ApiError } from "../api";
import { GoogleLoginResponse } from "../models/types/google-auth.types";
import { useGoogleRegister } from "./useGoogleRegister";

export function useGoogleLogin() {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const { t } = useI18n();
  const { setGoogleSignInData } = useGoogleRegister();

  return useMutation<GoogleLoginResponse, ApiError, void>({
    mutationFn: async () => {
      return await authService.loginWithGoogle();
    },

    onSuccess: async (data) => {
      if (data.requiresRegistration) {
        const googleUser = await authService.getGoogleUserInfo();
        if (googleUser) {
          setGoogleSignInData(googleUser);
        }

        Toast.show({
          type: "info",
          text1: t("auth.googleLogin.newUser.title"),
          text2: t("auth.googleLogin.newUser.message"),
          position: "top",
        });
        router.replace("/(public)/(auth)/register");
        return;
      }

      await login(data.access_token);
      router.replace("/(private)/(tabs)/matches");

      Toast.show({
        type: "success",
        text1: t("auth.loginMessages.success.title"),
        position: "top",
      });
    },

    onError: (error: ApiError) => {
      console.warn("[Google Login error]", error.status, error.message);

      let errorMessage = t("auth.googleLogin.error.message");

      if (error.message === "Google sign-in was cancelled") {
        return;
      } else if (error.message === "Google Play Services not available") {
        errorMessage = t("auth.googleLogin.error.playServices");
      }

      Toast.show({
        type: "error",
        text1: t("auth.googleLogin.error.title"),
        text2: error.message || errorMessage,
        position: "top",
      });
    },
  });
}

export function useGoogleLink() {
  const { t } = useI18n();

  return useMutation<void, ApiError, string>({
    mutationFn: async (idToken: string) => {
      await authService.linkGoogleAccount(idToken);
    },

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: t("profile.googleLink.success.title"),
        text2: t("profile.googleLink.success.message"),
        position: "top",
      });
    },

    onError: (error: ApiError) => {
      Toast.show({
        type: "error",
        text1: t("profile.googleLink.error.title"),
        text2: error.message || t("profile.googleLink.error.message"),
        position: "top",
      });
    },
  });
}

export function useGoogleUnlink() {
  const { t } = useI18n();

  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await authService.unlinkGoogleAccount();
    },

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: t("profile.googleUnlink.success.title"),
        text2: t("profile.googleUnlink.success.message"),
        position: "top",
      });
    },

    onError: (error: ApiError) => {
      Toast.show({
        type: "error",
        text1: t("profile.googleUnlink.error.title"),
        text2: error.message || t("profile.googleUnlink.error.message"),
        position: "top",
      });
    },
  });
}
