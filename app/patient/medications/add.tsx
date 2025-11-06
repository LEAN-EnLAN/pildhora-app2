import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import MedicationForm from '../../../src/components/patient/MedicationForm';

export default function AddMedicationScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <Text className="text-xl font-bold mb-4">Añadir Medicamento</Text>
        <MedicationForm mode="add" />
      </View>
    </ScrollView>
  );
}