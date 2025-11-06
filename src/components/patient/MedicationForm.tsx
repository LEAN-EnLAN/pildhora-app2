import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addMedication, updateMedication } from '../../store/slices/medicationsSlice';
import { Medication } from '../../types';
import { useRouter } from 'expo-router';

type Mode = 'add' | 'edit';

interface Props {
  mode: Mode;
  medication?: Medication | undefined;
}

interface FormState {
  name: string;
  dose: string; // e.g., "½ Tablet" or "500mg"
  amount: string; // arbitrary text/number to combine with dose
  reminder: string; // e.g., "08:00"
  reminderDays: string[]; // e.g., ['Mon','Tue']
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MedicationForm({ mode, medication }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const patientId = user?.id;

  const [form, setForm] = useState<FormState>({
    name: '',
    dose: '',
    amount: '',
    reminder: '08:00',
    reminderDays: ['Mon','Tue','Wed','Thu','Fri'],
  });

  // Prefill when editing
  useEffect(() => {
    if (mode === 'edit' && medication) {
      const firstTime = medication.times?.[0] ?? '08:00';
      setForm({
        name: medication.name || '',
        dose: medication.dosage || '',
        amount: '',
        reminder: typeof firstTime === 'string' ? firstTime : '08:00',
        reminderDays: medication.frequency ? medication.frequency.split(',').map(s => s.trim()) : ['Mon','Tue','Wed','Thu','Fri'],
      });
    }
  }, [mode, medication?.id]);

  const toggleDay = (day: string) => {
    setForm((prev) => {
      const has = prev.reminderDays.includes(day);
      const nextDays = has ? prev.reminderDays.filter(d => d !== day) : [...prev.reminderDays, day];
      return { ...prev, reminderDays: nextDays };
    });
  };

  const submitForm = async () => {
    if (!patientId) {
      // Could show toast/alert, but keep it simple
      return;
    }

    const dosage = form.amount ? `${form.dose}, ${form.amount}` : form.dose;
    const frequency = form.reminderDays.join(', ');
    const times = [form.reminder];

    if (mode === 'add') {
      const newMed: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> = {
        name: form.name,
        dosage,
        frequency,
        times,
        patientId,
        caregiverId: '',
      } as any; // caregiverId may be assigned later by caregiver flow
      await dispatch(addMedication(newMed));
    } else if (mode === 'edit' && medication?.id) {
      const updates: Partial<Medication> = {
        name: form.name,
        dosage,
        frequency,
        times,
      };
      await dispatch(updateMedication({ id: medication.id, updates }));
    }

    router.back();
  };

  return (
    <View className="bg-white rounded-xl p-4">
      <Text className="text-lg font-bold mb-2">Nombre del Medicamento</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="Nombre"
        value={form.name}
        onChangeText={(t) => setForm((s) => ({ ...s, name: t }))}
      />

      <Text className="text-lg font-bold mb-2">Dosis</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="½ Tableta / 500mg"
        value={form.dose}
        onChangeText={(t) => setForm((s) => ({ ...s, dose: t }))}
      />

      <Text className="text-lg font-bold mb-2">Cantidad</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="Opcional"
        value={form.amount}
        onChangeText={(t) => setForm((s) => ({ ...s, amount: t }))}
      />

      <Text className="text-lg font-bold mb-2">Hora de toma</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="08:00"
        value={form.reminder}
        onChangeText={(t) => setForm((s) => ({ ...s, reminder: t }))}
      />

      <Text className="text-lg font-bold mb-2">Días</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d}
            className={`px-3 py-2 rounded-lg ${form.reminderDays.includes(d) ? 'bg-blue-500' : 'bg-gray-200'}`}
            onPress={() => toggleDay(d)}
          >
            <Text className={`${form.reminderDays.includes(d) ? 'text-white' : 'text-gray-800'} font-semibold`}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity className="bg-blue-600 px-4 py-3 rounded-lg" onPress={submitForm}>
        <Text className="text-white font-bold text-center">{mode === 'add' ? 'Guardar' : 'Actualizar'}</Text>
      </TouchableOpacity>
    </View>
  );
}