import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../src/store';
import MedicationForm from '../../../../src/components/patient/MedicationForm';
import { deleteMedication } from '../../../../src/store/slices/medicationsSlice';

export default function CaregiverEditMedicationScreen() {
  const { id, patientId } = useLocalSearchParams();
  const medId = Array.isArray(id) ? id[0] : id;
  const pid = Array.isArray(patientId) ? patientId[0] : patientId;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const medication = useSelector((state: RootState) => state.medications.medications.find(m => m.id === medId));

  const handleDelete = async () => {
    if (!medId) return;
    await dispatch(deleteMedication(medId));
    router.back();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <MedicationForm mode="edit" medication={medication} onDelete={handleDelete} patientIdOverride={pid} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
