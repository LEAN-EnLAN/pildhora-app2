import { Stack } from 'expo-router';

export default function CaregiverLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: 'Caregiver Dashboard' }} />
    </Stack>
  );
}