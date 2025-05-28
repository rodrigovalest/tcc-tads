import { Stack, Redirect } from "expo-router";
import useAuthStore from "@/store/auth-store";
import { ActivityIndicator, View } from "react-native";

export default function PrivateLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authStoreIsLoading = useAuthStore((state) => state.isLoading);

  if (authStoreIsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log(
      "PrivateLayout: User is not authenticated, redirecting to login."
    );
    return <Redirect href="/(public)/(auth)/login" />;
  }

  console.log(
    "PrivateLayout: User is authenticated, rendering private routes."
  );
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
