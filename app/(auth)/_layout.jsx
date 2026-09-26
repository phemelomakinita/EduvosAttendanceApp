import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    // headerShown: false means no top bar on these screens we'll design our own and staff
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}