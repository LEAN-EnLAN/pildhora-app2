import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'expo-router';
import { RootState, AppDispatch } from '../../../src/store';
import { fetchMedications } from '../../../src/store/slices/medicationsSlice';

export default function MedicationsIndex() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const patientId = user?.id;
  const { medications, loading } = useSelector((state: RootState) => state.medications);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchMedications(patientId));
    }
  }, [patientId]);

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Mis Medicamentos</Text>
        <Link href="/patient/medications/add" asChild>
          <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold">Añadir</Text>
          </TouchableOpacity>
        </Link>
      </View>
      {loading ? (
        <Text className="text-gray-600">Cargando...</Text>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-px bg-gray-200" />}
          renderItem={({ item }) => (
            <Link href={`/patient/medications/${item.id}`} asChild>
              <TouchableOpacity className="bg-white p-4 rounded-lg">
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-gray-600">{item.dosage}</Text>
                <Text className="text-gray-600">{item.frequency}</Text>
                {item.times?.length ? (
                  <Text className="text-gray-600">Próxima: {item.times[0]}</Text>
                ) : null}
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </View>
  );
}