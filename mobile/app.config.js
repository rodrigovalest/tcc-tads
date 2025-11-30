import "dotenv/config";

export default {
  expo: {
    name: "mobile",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.tcc.mobile",
      googleServicesFile: "./google-services.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "@react-native-voice/voice",
        {
          microphonePermission:
            "CUSTOM: Allow $(PRODUCT_NAME) to access the microphone",
          speechRecognitionPermission:
            "CUSTOM: Allow $(PRODUCT_NAME) to securely recognize user speech",
        },
      ],
      ["@react-native-google-signin/google-signin"],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_WS_API_URL: process.env.EXPO_PUBLIC_WS_API_URL,
      EXPO_PUBLIC_TURN_SERVER_URL: process.env.EXPO_PUBLIC_TURN_SERVER_URL,
      EXPO_PUBLIC_TURN_SERVER_USERNAME: process.env.EXPO_PUBLIC_TURN_SERVER_USERNAME,
      EXPO_PUBLIC_TURN_SERVER_CREDENTIAL: process.env.EXPO_PUBLIC_TURN_SERVER_CREDENTIAL,
      EXPO_PUBLIC_TURN_SERVER_PORT: process.env.EXPO_PUBLIC_TURN_SERVER_PORT,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      EXPO_PUBLIC_APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME,
    },
  },
};
