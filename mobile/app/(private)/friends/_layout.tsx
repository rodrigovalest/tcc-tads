import { Stack } from 'expo-router';

export default function FriendsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="requests-received" />
      <Stack.Screen name="requests-sent" />
      <Stack.Screen name="list" />
      <Stack.Screen name="conversations" />
      <Stack.Screen name="chat/[friendId]" />
    </Stack>
  );
}