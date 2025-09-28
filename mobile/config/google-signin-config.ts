import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Google Sign-in configuration - configure it once when the app starts
let isConfigured = false;

export const configureGoogleSignin = () => {
  if (isConfigured) {
    return;
  }

  const webClientId =
    "996571940618-fgsm2379mqrortkergti3hb8l1cuj2n2.apps.googleusercontent.com";
  const iosClientId =
    "996571940618-fgsm2379mqrortkergti3hb8l1cuj2n2.apps.googleusercontent.com";

  if (!webClientId) {
    console.error("Google Web Client ID is not defined");
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
