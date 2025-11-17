import { Stack, Link, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CaregiverPatientMedicationsLayout() {
  const { patientId } = useLocalSearchParams();
  const pid = Array.isArray(patientId) ? patientId[0] : patientId;
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerRight: () => (
            <Link href={`/caregiver/medications/${pid}/add`} asChild>
              <Pressable>
                <Ionicons name="add" size={24} color="#3B82F6" />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen name="add" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
