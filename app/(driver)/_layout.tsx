import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="accept-job" />
      <Stack.Screen name="arrive" />
      <Stack.Screen name="trunk-photo" />
      <Stack.Screen name="drive" />
      <Stack.Screen name="end-trip" />
      <Stack.Screen name="gear-upload" />
    </Stack>
  );
}

