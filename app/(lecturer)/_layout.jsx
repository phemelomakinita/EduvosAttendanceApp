import { Stack } from 'expo-router';

export default function LecturerLayout() {
  return (
    // Same forced-order pattern as the student side
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="my-sessions" />
      <Stack.Screen name="create-session" />
      <Stack.Screen name="live-attendance" />
    </Stack>
  );
}