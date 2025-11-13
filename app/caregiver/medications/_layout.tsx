import { Stack } from 'expo-router';
export default function CaregiverMedicationsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Seleccionar Paciente' }} />
    </Stack>
  );
}
