import { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator, Image, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { checkAuthState } from '../src/store/slices/authSlice';
import { getPostAuthRoute } from '../src/services/routing';

// Avoid React Native Web generating boxShadow CSS by removing shadow props on web
const commonShadow = Platform.select({
  web: {},
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  loadingText: {
    color: '#8E8E93',
    marginTop: 16,
  },
  logoContainer: {
    width: 128,
    height: 128,
    backgroundColor: '#007AFF',
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    ...commonShadow,
  },
  logoText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
  },
  patientButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    ...commonShadow,
  },
  caregiverButton: {
    backgroundColor: '#34C759',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    ...commonShadow,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  signInText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default function WelcomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading, initializing } = useSelector((state: RootState) => state.auth);
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    dispatch(checkAuthState());
  }, [dispatch]);

  useEffect(() => {
    // Redirect based on auth state only after initialization is complete
    const handleRouting = async () => {
      if (!initializing && !loading) {
        console.log('[Index] Auth state check:', { isAuthenticated, user: user?.id, role: user?.role });
        if (isAuthenticated && user) {
          setIsRouting(true);
          try {
            const route = await getPostAuthRoute(user);
            console.log('[Index] Routing to:', route);
            router.replace(route);
          } catch (error: any) {
            console.error('[Index] Routing error:', error);
            Alert.alert('Error de navegación', error.userMessage || 'No se pudo determinar la ruta.');
            setIsRouting(false);
          }
        } else {
          console.log('[Index] User not authenticated, staying at root');
        }
      }
    };

    handleRouting();
  }, [isAuthenticated, user, loading, initializing, router]);

  const handleRoleSelect = (role: 'patient' | 'caregiver') => {
    // Navigate to signup with pre-selected role
    router.push(`/auth/signup?role=${role}`);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  if (loading || initializing || isRouting) {
    return (
      <SafeAreaView edges={['top','bottom']} style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {isRouting ? 'Redirigiendo...' : 'Cargando...'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top','bottom']} style={styles.container}>
      {/* Logo/Icon */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>P</Text>
      </View>

      {/* Welcome Text */}
      <Text style={styles.welcomeTitle}>Bienvenido a Pildhora</Text>
      <Text style={styles.welcomeSubtitle}>Sistema de Pastillero Inteligente</Text>

      {/* Role Selection Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.patientButton}
          onPress={() => handleRoleSelect('patient')}
        >
          <Text style={styles.buttonText}>Soy un paciente</Text>
          <Text style={styles.buttonSubtext}>Quiero registrarme como paciente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.caregiverButton}
          onPress={() => handleRoleSelect('caregiver')}
        >
          <Text style={styles.buttonText}>Soy un cuidador</Text>
          <Text style={styles.buttonSubtext}>Quiero registrarme como cuidador</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.signInText}>¿Ya tienes una cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
