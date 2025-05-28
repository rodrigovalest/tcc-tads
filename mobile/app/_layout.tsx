import { SplashScreen, Slot } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import useAuthStore from "@/store/auth-store";

import "../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "nunito-extralight": require("../assets/fonts/nunito/Nunito-ExtraLight.ttf"),
    "nunito-light": require("../assets/fonts/nunito/Nunito-Light.ttf"),
    "nunito-regular": require("../assets/fonts/nunito/Nunito-Regular.ttf"),
    "nunito-medium": require("../assets/fonts/nunito/Nunito-Medium.ttf"),
    "nunito-semibold": require("../assets/fonts/nunito/Nunito-SemiBold.ttf"),
    "nunito-bold": require("../assets/fonts/nunito/Nunito-Bold.ttf"),
    "nunito-extrabold": require("../assets/fonts/nunito/Nunito-ExtraBold.ttf"),
  });

  const authStoreIsLoading = useAuthStore((state) => state.isLoading);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession().catch((err) => {
      console.log("RootLayout: Failed to restore session on mount", err);
    });
  }, [restoreSession]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || authStoreIsLoading) {
    return null;
  }

  return <Slot />;
}
