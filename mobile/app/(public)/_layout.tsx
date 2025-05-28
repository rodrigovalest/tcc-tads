import { Stack, Redirect } from "expo-router";
import useAuthStore from "@/store/auth-store";
import { ActivityIndicator, View } from "react-native";

export default function PublicLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authStoreIsLoading = useAuthStore((state) => state.isLoading);

  if (authStoreIsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    console.log(
      "PublicLayout: User is authenticated, redirecting to private area."
    );
    return <Redirect href="/(private)/(tabs)/matches" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
    </Stack>
  );
}
