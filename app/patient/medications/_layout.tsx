import { Stack } from 'expo-router';
import React from 'react';

export default function MedicationsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mis Medicamentos' }} />
      <Stack.Screen name="add" options={{ title: 'Añadir Medicamento' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar Medicamento' }} />
    </Stack>
  );
}