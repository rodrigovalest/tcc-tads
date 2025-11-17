import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";

// Google Sign-in configuration - configure it once when the app starts
let isConfigured = false;

export const configureGoogleSignin = () => {
  if (isConfigured) {
    return;
  }

  const webClientId =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  if (!webClientId) {
    console.error(
      "Google Web Client ID is not defined in environment variables"
    );
    return;
  }

  try {
    GoogleSignin.configure({
      webClientId,
      iosClientId,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      profileImageSize: 120,
      scopes: ["openid", "profile", "email"],
    });

    isConfigured = true;
  } catch (error) {
    console.error("Error configuring Google Sign-in:", error);
  }
};

export { GoogleSignin };
