import { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { signUp } from '../../src/store/slices/authSlice';
import { RootState, AppDispatch } from '../../src/store';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const result = await dispatch(signUp({ email, password, name, role })).unwrap();
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (result.role === 'patient') {
              router.replace('/patient/home');
            } else {
              router.replace('/caregiver/dashboard');
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Signup Failed', error as string);
    }
  };

  const navigateToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-background">
      <View className="w-full max-w-sm">
        <Text className="text-3xl font-bold text-text text-center mb-2">Create Account</Text>
        <Text className="text-base text-textSecondary text-center mb-8">Join Pildhora</Text>

        <View className="mb-4">
          <Text className="text-sm font-medium text-text mb-2">Full Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-text mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-text mb-2">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-text mb-2">Confirm Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-text mb-3">I am a:</Text>
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg mr-2 border-2 ${role === 'patient' ? 'border-success bg-success/10' : 'border-gray-300'}`}
              onPress={() => setRole('patient')}
            >
              <Text className={`text-center font-medium ${role === 'patient' ? 'text-success' : 'text-text'}`}>
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg ml-2 border-2 ${role === 'caregiver' ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
              onPress={() => setRole('caregiver')}
            >
              <Text className={`text-center font-medium ${role === 'caregiver' ? 'text-primary' : 'text-text'}`}>
                Caregiver
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary p-4 rounded-xl items-center mb-4"
          onPress={handleSignup}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateToLogin} className="items-center">
          <Text className="text-primary text-base">
            Already have an account? <Text className="font-semibold">Sign In</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-textSecondary text-center">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}