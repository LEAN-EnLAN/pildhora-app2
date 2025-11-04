import { Stack } from 'expo-router';

export default function PatientLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: 'Patient Home' }} />
    </Stack>
  );
}