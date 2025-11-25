import { SplashScreen, Slot } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import useAuthStore from "../store/auth-store";
import useLanguageStore from "../store/language-store";

import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { requestPermissions } from "../utils/request-permissions";
import { Platform } from "react-native";

// Initialize i18n
import "../lib/i18n";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "nunito-extralight": require("../assets/fonts/nunito/Nunito-ExtraLight.ttf"),
    "nunito-light": require("../assets/fonts/nunito/Nunito-Light.ttf"),
    "nunito-regular": require("../assets/fonts/nunito/Nunito-Regular.ttf"),
    "nunito-medium": require("../assets/fonts/nunito/Nunito-Medium.ttf"),
    "nunito-semibold": require("../assets/fonts/nunito/Nunito-SemiBold.ttf"),
    "nunito-bold": require("../assets/fonts/nunito/Nunito-Bold.ttf"),
    "nunito-extrabold": require("../assets/fonts/nunito/Nunito-ExtraBold.ttf"),
    FontAwesome: require("../node_modules/react-native-vector-icons/Fonts/FontAwesome.ttf"),
  });

  const queryClient = new QueryClient();

  const authStoreIsLoading = useAuthStore((state) => state.loading);
  const restoreAuthSession = useAuthStore((state) => state.restore);
  const initializeLanguage = useLanguageStore(
    (state) => state.initializeLanguage
  );
  const languageIsLoading = useLanguageStore((state) => state.isLoading);

  useEffect(() => {
    restoreAuthSession();
    initializeLanguage();
  }, [restoreAuthSession, initializeLanguage]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    requestPermissions().then((granted) => {
      if (!granted) {
        console.warn(
          "Permissions not granted for camera and microphone.",
          Platform.OS,
          Platform.Version
        );
      }
    });
  }, []);

  if (!fontsLoaded || authStoreIsLoading || languageIsLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
      <Toast />
    </QueryClientProvider>
  );
}
