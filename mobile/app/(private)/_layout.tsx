import { Stack, Redirect } from "expo-router";
import useAuthStore from "@/store/auth-store";
import { ActivityIndicator, View } from "react-native";

export default function PrivateLayout() {
  const authUser = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!authUser) {
    return <Redirect href="/(public)/(auth)/login" />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
