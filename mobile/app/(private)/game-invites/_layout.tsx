import { Stack } from 'expo-router';

export default function GameInvitesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="send" />
      <Stack.Screen name="waiting" />
    </Stack>
  );
}

