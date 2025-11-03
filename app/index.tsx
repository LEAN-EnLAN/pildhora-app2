import { useEffect } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { checkAuthState } from '../src/store/slices/authSlice';

export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user is already authenticated
    dispatch(checkAuthState());
  }, [dispatch]);

  useEffect(() => {
    // Redirect based on auth state
    if (!loading) {
      if (isAuthenticated && user) {
        if (user.role === 'patient') {
          router.replace('/patient/home');
        } else {
          router.replace('/caregiver/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, loading, router]);

  const handleRoleSelect = (role: 'patient' | 'caregiver') => {
    // Navigate to signup with pre-selected role
    router.push(`/auth/signup?role=${role}`);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-textSecondary mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center p-5 bg-background">
      <Text className="text-3xl font-bold text-text mb-2">Welcome to Pildhora</Text>
      <Text className="text-base text-textSecondary mb-10">Smart Pillbox Management</Text>

      <View className="w-full max-w-xs mb-6">
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

      <TouchableOpacity onPress={handleLogin} className="items-center">
        <Text className="text-primary text-base font-semibold">Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}