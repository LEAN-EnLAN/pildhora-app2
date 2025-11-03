import { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from '../../src/store/slices/authSlice';
import { RootState, AppDispatch } from '../../src/store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const result = await dispatch(signIn({ email, password })).unwrap();
      // Navigation will be handled by auth state change
      if (result.role === 'patient') {
        router.replace('/patient/home');
      } else {
        router.replace('/caregiver/dashboard');
      }
    } catch (error) {
      Alert.alert('Login Failed', error as string);
    }
  };

  const navigateToSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-background">
      <View className="w-full max-w-sm">
        <Text className="text-3xl font-bold text-text text-center mb-2">Welcome Back</Text>
        <Text className="text-base text-textSecondary text-center mb-8">Sign in to your account</Text>

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

        <View className="mb-6">
          <Text className="text-sm font-medium text-text mb-2">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="bg-primary p-4 rounded-xl items-center mb-4"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold">
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateToSignup} className="items-center">
          <Text className="text-primary text-base">
            Don't have an account? <Text className="font-semibold">Sign Up</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-textSecondary text-center">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}