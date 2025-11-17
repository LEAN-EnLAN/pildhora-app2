import { Stack, Link } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/tokens';

export default function MedicationsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => (
            <Link href="/patient/home" asChild>
              <Pressable 
                style={{ height: 44, width: 44, alignItems: 'center', justifyContent: 'center' }}
                accessibilityLabel="Volver"
                accessibilityHint="Regresa a la pantalla anterior"
                accessibilityRole="button"
              >
                <Ionicons name="chevron-back" size={24} color={colors.gray[900]} />
              </Pressable>
            </Link>
          ),
          headerRight: () => (
            <Link href="/patient/medications/add" asChild>
              <Pressable 
                style={{ height: 44, width: 44, alignItems: 'center', justifyContent: 'center' }}
                accessibilityLabel="Agregar medicamento"
                accessibilityHint="Navega a la pantalla para agregar un nuevo medicamento"
                accessibilityRole="button"
              >
                <Ionicons name="add" size={24} color={colors.primary[500]} />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
