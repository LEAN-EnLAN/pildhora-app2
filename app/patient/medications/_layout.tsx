import { Stack, Link } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MedicationsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Mis Medicamentos',
          headerLeft: () => (
            <Link href="/patient/home" asChild>
              <Pressable style={{ height: 44, width: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="chevron-back" size={24} color="#3B82F6" />
              </Pressable>
            </Link>
          ),
          headerRight: () => (
            <Link href="/patient/medications/add" asChild>
              <Pressable style={{ height: 44, width: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="add" size={24} color="#3B82F6" />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen name="add" options={{ title: 'Añadir Medicamento' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar Medicamento' }} />
    </Stack>
  );
}
