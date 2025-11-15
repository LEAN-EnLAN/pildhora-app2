import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';

export default function PatientLayout() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Role guard: only allow patients to access patient screens
    // Add a small delay to allow logout to complete properly
    const timer = setTimeout(() => {
      if (!isAuthenticated || user?.role !== 'patient') {
        console.log('[PatientLayout] Redirecting - Auth:', isAuthenticated, 'Role:', user?.role);
        router.replace('/');
      }
    }, 300); // Increased delay to allow logout to complete

    return () => clearTimeout(timer);
  }, [isAuthenticated, user?.role]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ title: 'Patient Home' }} />
      <Stack.Screen name="link-device" options={{ title: 'Enlazar Dispositivo' }} />
      <Stack.Screen name="settings" options={{ title: 'Configuraciones' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Editar perfil' }} />
    </Stack>
  );
}
