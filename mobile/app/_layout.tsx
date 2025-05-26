// app/_layout.tsx
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";

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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
