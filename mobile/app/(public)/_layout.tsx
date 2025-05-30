import { Stack, Redirect } from "expo-router";
import useAuthStore from "@/store/auth-store";
import { ActivityIndicator, View } from "react-native";

export default function PublicLayout() {
  const authUser = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (authUser) {
    return <Redirect href="/(private)/(tabs)/matches" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
    </Stack>
  );
}
