import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="request-rescue" />
      <Stack.Screen name="vehicles" />
      <Stack.Screen name="trip-tracking" />
      <Stack.Screen name="trip-complete" />
      <Stack.Screen name="claim-damage" />
    </Stack>
  );
}

