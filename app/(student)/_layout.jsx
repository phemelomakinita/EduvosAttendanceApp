import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    // A Stack means "one screen leads to the next" — no bottom tab bar,
    // matches the forced order: WiFi check → Select class → Confirm
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wifi-check" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="confirm" />
    </Stack>
  );
}