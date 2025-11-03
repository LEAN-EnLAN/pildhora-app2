import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  const handleRoleSelect = (role: 'patient' | 'caregiver') => {
    // For now, navigate to respective screens
    if (role === 'patient') {
      router.push('/patient/home');
    } else {
      router.push('/caregiver/dashboard');
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-background">
      <Text className="text-3xl font-bold text-text mb-2">Welcome to Pildhora</Text>
      <Text className="text-base text-textSecondary mb-10">Smart Pillbox Management</Text>

      <View className="w-full max-w-xs">
        <TouchableOpacity
          className="bg-success p-4 rounded-xl mb-4 items-center"
          onPress={() => handleRoleSelect('patient')}
        >
          <Text className="text-white text-lg font-semibold">I'm a Patient</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary p-4 rounded-xl mb-4 items-center"
          onPress={() => handleRoleSelect('caregiver')}
        >
          <Text className="text-white text-lg font-semibold">I'm a Caregiver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}