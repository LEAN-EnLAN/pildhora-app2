import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../src/store';
import MedicationForm from '../../../src/components/patient/MedicationForm';
import { deleteMedication } from '../../../src/store/slices/medicationsSlice';

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams();
  const medId = Array.isArray(id) ? id[0] : id;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const medication = useSelector((state: RootState) => state.medications.medications.find(m => m.id === medId));

  const handleDelete = async () => {
    if (!medId) return;
    await dispatch(deleteMedication(medId));
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <MedicationForm mode="edit" medication={medication} />
        <TouchableOpacity className="bg-red-500 px-4 py-2 rounded-lg mt-4" onPress={handleDelete}>
          <Text className="text-white font-semibold text-center">Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}