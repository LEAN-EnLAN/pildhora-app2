import React, { useState, useRef } from 'react';
import { Text, View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../src/store';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { linkDeviceToUser } from '../../src/services/deviceLinking';
import { getDbInstance } from '../../src/services/firebase';
import { startDeviceListener } from '../../src/store/slices/deviceSlice';
import { Button, Input, Card, LoadingSpinner, ErrorMessage, SuccessMessage } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme/tokens';

type Step = 'enterId' | 'linking' | 'success' | 'error';

export default function AddPatientScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const [step, setStep] = useState<Step>('enterId');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [validationError, setValidationError] = useState<string>('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Validate device ID
  const validateDeviceId = (id: string): boolean => {
    if (!id.trim()) {
      setValidationError('El Device ID es requerido');
      return false;
    }
    if (id.trim().length < 5) {
      setValidationError('El Device ID debe tener al menos 5 caracteres');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleDeviceIdChange = (text: string) => {
    setDeviceId(text);
    if (text.trim()) {
      validateDeviceId(text);
    } else {
      setValidationError('');
    }
  };

  const animateTransition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleLink = async () => {
    // Validate before proceeding
    if (!validateDeviceId(deviceId)) {
      return;
    }

    animateTransition(() => setStep('linking'));
    
    try {
      const db = await getDbInstance();
      if (!db) {
        throw new Error('No se pudo conectar a la base de datos');
      }
      const deviceRef = doc(db, 'devices', deviceId.trim());
      const snap = await getDoc(deviceRef);
      if (!snap.exists()) {
        const caregiverUid = getAuth()?.currentUser?.uid;
        await setDoc(deviceRef, {
          linkedUsers: caregiverUid ? [caregiverUid] : [],
          metadata: { model: 'ESP8266', notes: 'Dispositivo de prueba siempre activo' },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      const caregiverUid = getAuth()?.currentUser?.uid;
      if (caregiverUid) {
        await linkDeviceToUser(caregiverUid, deviceId.trim());
      }

      dispatch(startDeviceListener(deviceId.trim()));
      animateTransition(() => setStep('success'));
    } catch (error: any) {
      console.error("Error finding patient by device:", error);
      setErrorMessage(error.message || 'Ocurrió un error al verificar el dispositivo.');
      animateTransition(() => setStep('error'));
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    animateTransition(() => setStep('enterId'));
  };

  const renderContent = () => {
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    };

    switch (step) {
      case 'enterId':
        return (
          <Animated.View style={[styles.contentContainer, animatedStyle]}>
            <Card variant="elevated" padding="lg" style={styles.card}>
              <View style={styles.iconContainer}>
                <Ionicons name="hardware-chip-outline" size={48} color={colors.primary[500]} />
              </View>
              
              <Text style={styles.title}>Vincular ESP8266</Text>
              <Text style={styles.subtitle}>
                Ingresa el ID del dispositivo para conectarlo a tu cuenta
              </Text>

              <View style={styles.inputContainer}>
                <Input
                  label="Device ID"
                  placeholder="Ejemplo: esp8266-ABC123"
                  value={deviceId}
                  onChangeText={handleDeviceIdChange}
                  error={validationError}
                  helperText="Identificador único del dispositivo (mínimo 5 caracteres)"
                  autoCapitalize="none"
                  leftIcon={<Ionicons name="qr-code-outline" size={20} color={colors.gray[400]} />}
                  required
                />
              </View>

              <Button
                onPress={handleLink}
                variant="primary"
                size="lg"
                fullWidth
                disabled={!deviceId.trim() || !!validationError}
                accessibilityLabel="Vincular dispositivo"
              >
                Vincular Dispositivo
              </Button>
            </Card>
          </Animated.View>
        );

      case 'linking':
        return (
          <Animated.View style={[styles.contentContainer, animatedStyle]}>
            <Card variant="elevated" padding="lg" style={styles.card}>
              <LoadingSpinner 
                size="lg" 
                text="Vinculando dispositivo..."
              />
              <Text style={styles.loadingSubtext}>
                Esto puede tomar unos segundos
              </Text>
            </Card>
          </Animated.View>
        );

      case 'success':
        return (
          <Animated.View style={[styles.contentContainer, animatedStyle]}>
            <Card variant="elevated" padding="lg" style={styles.card}>
              <SuccessMessage
                message="¡Dispositivo vinculado exitosamente!"
                autoDismiss={false}
              />
              
              <Text style={styles.successDetails}>
                El dispositivo ha sido conectado y se iniciará la lectura de estado en tiempo real.
              </Text>

              <View style={styles.buttonGroup}>
                <Button
                  onPress={() => router.back()}
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Ionicons name="checkmark" size={20} color="#FFFFFF" />}
                >
                  Hecho
                </Button>
              </View>
            </Card>
          </Animated.View>
        );

      case 'error':
        return (
          <Animated.View style={[styles.contentContainer, animatedStyle]}>
            <Card variant="elevated" padding="lg" style={styles.card}>
              <ErrorMessage
                message={errorMessage || 'No se pudo vincular el dispositivo'}
                onRetry={handleRetry}
                variant="inline"
              />

              <Text style={styles.errorHelp}>
                Verifica que el Device ID sea correcto y que tengas conexión a internet.
              </Text>

              <View style={styles.buttonGroup}>
                <Button
                  onPress={handleRetry}
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Ionicons name="refresh" size={20} color="#FFFFFF" />}
                  style={styles.retryButton}
                >
                  Reintentar
                </Button>
                
                <Button
                  onPress={() => router.back()}
                  variant="outline"
                  size="lg"
                  fullWidth
                >
                  Cancelar
                </Button>
              </View>
            </Card>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Vincular Dispositivo' }} />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 480,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  inputContainer: {
    marginBottom: spacing['2xl'],
  },
  loadingSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  successDetails: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  errorHelp: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.md,
  },
  retryButton: {
    marginBottom: spacing.sm,
  },
});
