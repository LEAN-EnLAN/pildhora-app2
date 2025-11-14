import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/store';
import MedicationForm from '../../../src/components/patient/MedicationForm';

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams();
  const medId = Array.isArray(id) ? id[0] : id;
  const medication = useSelector((state: RootState) => state.medications.medications.find(m => m.id === medId));

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <MedicationForm mode="edit" medication={medication} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
