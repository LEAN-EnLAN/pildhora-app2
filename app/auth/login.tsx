import { useEffect, useState } from 'react';
import { Text, View, Alert, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, logout, signInWithGoogle } from '../../src/store/slices/authSlice';
import { RootState, AppDispatch } from '../../src/store';
import { getAuthInstance } from '../../src/services/firebase';
import { Button, Card, Container, AppIcon } from '../../src/components/ui';
import { PHTextField } from '../../src/components/ui/PHTextField';
import { getPostAuthRoute } from '../../src/services/routing';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated, user, initializing } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleRouting = async () => {
      if (!initializing && isAuthenticated && user) {
        setIsRouting(true);
        try {
          const route = await getPostAuthRoute(user);
          router.replace(route);
        } catch (error: any) {
          console.error('[LoginScreen] Routing error:', error);
          Alert.alert('Error de navegación', error.userMessage || 'No se pudo determinar la ruta.');
          setIsRouting(false);
        }
      }
    };

    handleRouting();
  }, [isAuthenticated, user, initializing, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    if (loading || isRouting) return;
    if (isAuthenticated && user) {
      setIsRouting(true);
      try {
        const route = await getPostAuthRoute(user);
        router.replace(route);
      } catch (error: any) {
        console.error('[LoginScreen] Routing error:', error);
        Alert.alert('Error de navegación', error.userMessage || 'No se pudo determinar la ruta.');
        setIsRouting(false);
      }
      return;
    }
    try {
      setIsRouting(true);
      const result = await dispatch(signIn({ email: email.trim(), password })).unwrap();
      const route = await getPostAuthRoute(result);
      router.replace(route);
    } catch (error: any) {
      setIsRouting(false);
      const message = typeof error === 'string' ? error : (error?.message || 'Error desconocido');
      let friendly = message;
      if (message.includes('auth/wrong-password')) friendly = 'Contraseña incorrecta. Intenta nuevamente.';
      if (message.includes('auth/user-not-found')) friendly = 'No existe una cuenta con ese correo.';
      if (message.includes('auth/too-many-requests')) friendly = 'Demasiados intentos. Espera un momento y vuelve a intentar.';
      Alert.alert('Error de inicio de sesión', friendly);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading || isRouting) return;
    try {
      setIsRouting(true);
      const result = await dispatch(signInWithGoogle({})).unwrap();
      const route = await getPostAuthRoute(result);
      router.replace(route);
    } catch (error: any) {
      setIsRouting(false);
      const message = typeof error === 'string' ? error : (error?.message || 'Error desconocido');
      Alert.alert('Error de Google', message);
    }
  };

  const navigateToSignup = () => {
    router.push('/auth/signup');
  };

  const handleLogout = async () => {
    await dispatch(logout());
    try { 
      const authInstance = await getAuthInstance();
      if (authInstance) await authInstance.signOut(); 
    } catch {}
    Alert.alert('Sesión cerrada', 'Has cerrado sesión. Ahora puedes iniciar con otra cuenta.');
  };

  if (isRouting) {
    return (
      <SafeAreaView edges={['top','bottom']} style={styles.flex1}>
        <Container style={styles.flex1}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Redirigiendo...</Text>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top','bottom']} style={styles.flex1}>
      <Container style={styles.flex1}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Card style={styles.card}>
          {isAuthenticated && user && (
            <View style={styles.loggedInContainer}>
              <Text style={styles.loggedInText}>
                Ya iniciaste sesión como {user.email || user.name}.
              </Text>
              <Button onPress={handleLogout} variant="secondary" size="sm" style={styles.logoutButton}>
                Cerrar Sesión
              </Button>
            </View>
          )}

          <View style={styles.header}>
            <AppIcon size="2xl" showShadow={true} rounded={true} />
            <Text style={styles.title}>Bienvenido de nuevo</Text>
            <Text style={styles.subtitle}>Inicia sesión en tu cuenta de Pildhora</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <PHTextField
              placeholder="Ingresa tu correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <PHTextField
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secure
            />
          </View>

          <Button
            onPress={handleLogin}
            disabled={loading || isRouting}
            variant="primary"
            size="lg"
            style={styles.loginButton}
          >
            {loading || isRouting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>

          <Button
            onPress={handleGoogleLogin}
            disabled={loading || isRouting}
            variant="secondary"
            size="lg"
            style={[styles.loginButton, styles.googleButton]}
          >
            Iniciar sesión con Google
          </Button>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>¿No tienes una cuenta? </Text>
            <Button onPress={navigateToSignup} style={styles.signupButton}>
              Regístrate
            </Button>
          </View>

          <View style={styles.backButtonContainer}>
            <Button onPress={() => router.back()} style={styles.backButton}>
              ← Volver a la selección de rol
            </Button>
          </View>

        </Card>
      </KeyboardAvoidingView>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 384,
    padding: 24,
  },
  loggedInContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loggedInText: {
    color: '#92400E',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loginButton: {
    width: '100%',
  },
  googleButton: {
    marginTop: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#6B7280',
  },
  signupButton: {
    padding: 0,
  },
  backButtonContainer: {
    marginTop: 16,
  },
  backButton: {
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
