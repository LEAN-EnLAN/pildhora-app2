import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../src/store';
import { Button, Container, Card, Input, AnimatedListItem } from '../../src/components/ui';
import { validateCode, ConnectionCodeError } from '../../src/services/connectionCode';
import { getCaregiverPatients } from '../../src/services/firebase/user';
import { Patient } from '../../src/types';
import { colors, spacing, typography, borderRadius } from '../../src/theme/tokens';

/**
 * DeviceConnectionScreen
 * 
 * Consolidated screen for caregivers to:
 * 1. Connect to patient devices using connection codes
 * 2. View and manage linked patients
 * 3. Access patient medication management
 * 
 * This screen combines device linking and patient management since
 * linking with a device and linking with a patient are essentially the same.
 * 
 * Requirements: 5.1, 5.2, 5.3
 * 
 * Flow:
 * 1. Caregiver enters connection code to link new patient/device
 * 2. Real-time format validation (6-8 alphanumeric)
 * 3. Code validation on submit
 * 4. Navigate to confirmation screen (Task 9)
 * 5. View list of linked patients below
 * 6. Access patient medications from the list
 */
export default function DeviceConnectionScreen() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Linked patients state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);

  // Form state
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);

  /**
   * Validate code format (6-8 alphanumeric characters)
   * Requirements: 5.2
   */
  const validateCodeFormat = useCallback((value: string): boolean => {
    // Empty is valid (no error shown until user types)
    if (!value) {
      setFormatError(null);
      return true;
    }

    // Convert to uppercase for validation
    const upperValue = value.toUpperCase();

    // Check length
    if (upperValue.length < 6) {
      setFormatError('El código debe tener al menos 6 caracteres');
      return false;
    }

    if (upperValue.length > 8) {
      setFormatError('El código no puede tener más de 8 caracteres');
      return false;
    }

    // Check alphanumeric only
    if (!/^[A-Z0-9]+$/.test(upperValue)) {
      setFormatError('El código solo puede contener letras y números');
      return false;
    }

    setFormatError(null);
    return true;
  }, []);

  /**
   * Handle code input change with real-time validation
   * Requirements: 5.2, 5.3
   */
  const handleCodeChange = useCallback((value: string) => {
    // Convert to uppercase and remove spaces
    const cleanValue = value.toUpperCase().replace(/\s/g, '');
    
    // Limit to 8 characters
    const limitedValue = cleanValue.slice(0, 8);
    
    setCode(limitedValue);
    setValidationError(null); // Clear server validation errors on input change
    
    // Validate format
    validateCodeFormat(limitedValue);
  }, [validateCodeFormat]);

  /**
   * Handle code validation and navigation
   * Requirements: 5.2, 5.3
   */
  const handleValidateCode = useCallback(async () => {
    // Validate format first
    if (!validateCodeFormat(code)) {
      return;
    }

    if (!code) {
      setValidationError('Por favor ingresa un código de conexión');
      return;
    }

    if (!user?.id) {
      setValidationError('Error de autenticación. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate code with service
      const codeData = await validateCode(code);

      if (!codeData) {
        setValidationError('Código no válido o expirado');
        return;
      }

      // Navigate to confirmation screen with code data
      // This will be implemented in Task 9
      router.push({
        pathname: '/caregiver/device-connection-confirm',
        params: {
          code: codeData.code,
          patientId: codeData.patientId,
          patientName: codeData.patientName,
          deviceId: codeData.deviceId,
        },
      });
    } catch (error: any) {
      console.error('[DeviceConnection] Validation error:', error);

      // Handle ConnectionCodeError with user-friendly messages
      if (error instanceof ConnectionCodeError) {
        setValidationError(error.userMessage);
      } else {
        setValidationError('Error al validar el código. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsValidating(false);
    }
  }, [code, user, router, validateCodeFormat]);

  /**
   * Load linked patients
   */
  const loadPatients = useCallback(async () => {
    if (!user?.id) {
      setLoadingPatients(false);
      return;
    }
    
    try {
      const list = await getCaregiverPatients(user.id);
      setPatients(list);
    } catch (error) {
      console.error('[DeviceConnection] Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  /**
   * Navigate to patient medications
   */
  const handleManagePatient = useCallback((patientId: string) => {
    router.push(`/caregiver/medications/${patientId}`);
  }, [router]);

  /**
   * Check if form is valid for submission
   */
  const isFormValid = code.length >= 6 && code.length <= 8 && !formatError;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <Container style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="link-outline"
                  size={48}
                  color={colors.primary[500]}
                  accessible={false}
                />
              </View>
              <Text style={styles.title}>Conectar Dispositivo</Text>
              <Text style={styles.subtitle}>
                Ingresa el código de conexión proporcionado por el paciente para vincular su dispositivo
              </Text>
            </View>

            {/* Connection Code Form */}
            <Card style={styles.card}>
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Código de Conexión</Text>
                <Text style={styles.sectionDescription}>
                  El código debe tener entre 6 y 8 caracteres alfanuméricos
                </Text>

                <Input
                  label="Código"
                  placeholder="Ej: ABC123"
                  value={code}
                  onChangeText={handleCodeChange}
                  error={formatError || validationError || undefined}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={8}
                  required
                  leftIcon={
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color={colors.gray[400]}
                    />
                  }
                  rightIcon={
                    code.length >= 6 && !formatError ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.success[500]}
                      />
                    ) : null
                  }
                  accessibilityLabel="Código de conexión"
                  accessibilityHint="Ingresa el código de 6 a 8 caracteres proporcionado por el paciente"
                />

                {/* Format hint */}
                {!formatError && !validationError && code.length > 0 && (
                  <View style={styles.hintContainer}>
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color={colors.gray[500]}
                    />
                    <Text style={styles.hintText}>
                      {code.length}/8 caracteres
                    </Text>
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <Button
                variant="primary"
                size="lg"
                onPress={handleValidateCode}
                disabled={!isFormValid || isValidating}
                loading={isValidating}
                fullWidth
                accessibilityLabel="Validar código"
                accessibilityHint="Valida el código de conexión e inicia el proceso de vinculación"
              >
                {isValidating ? 'Validando...' : 'Continuar'}
              </Button>
            </Card>

            {/* Help Section */}
            <Card style={styles.helpCard}>
              <View style={styles.helpHeader}>
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color={colors.primary[500]}
                />
                <Text style={styles.helpTitle}>¿Necesitas ayuda?</Text>
              </View>

              <View style={styles.helpContent}>
                <View style={styles.helpItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={colors.gray[600]}
                  />
                  <Text style={styles.helpText}>
                    El paciente debe generar un código desde su aplicación
                  </Text>
                </View>

                <View style={styles.helpItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={colors.gray[600]}
                  />
                  <Text style={styles.helpText}>
                    Los códigos expiran después de 24 horas
                  </Text>
                </View>

                <View style={styles.helpItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={colors.gray[600]}
                  />
                  <Text style={styles.helpText}>
                    Cada código solo puede usarse una vez
                  </Text>
                </View>
              </View>
            </Card>

            {/* Linked Patients Section */}
            <View style={styles.patientsSection}>
              <View style={styles.patientsSectionHeader}>
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={colors.primary[500]}
                />
                <Text style={styles.patientsSectionTitle}>Pacientes Vinculados</Text>
              </View>

              {/* Navigate to Dashboard Button */}
              {patients.length > 0 && (
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => router.push('/caregiver/dashboard')}
                  style={styles.dashboardButton}
                  leftIcon={<Ionicons name="grid-outline" size={20} color={colors.surface} />}
                  accessibilityLabel="Ir al tablero de pacientes"
                  accessibilityHint="Navega al tablero principal para ver todos los pacientes"
                  fullWidth
                >
                  Ver Tablero de Pacientes
                </Button>
              )}

              {loadingPatients ? (
                <Card style={styles.loadingCard}>
                  <ActivityIndicator size="large" color={colors.primary[500]} />
                  <Text style={styles.loadingText}>Cargando pacientes...</Text>
                </Card>
              ) : patients.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons
                    name="person-add-outline"
                    size={48}
                    color={colors.gray[300]}
                  />
                  <Text style={styles.emptyText}>No hay pacientes vinculados</Text>
                  <Text style={styles.emptySubtext}>
                    Usa el código de conexión arriba para vincular tu primer paciente
                  </Text>
                </Card>
              ) : (
                <View style={styles.patientsList}>
                  {patients.map((patient, index) => (
                    <AnimatedListItem key={patient.id} index={index} delay={100}>
                      <Card style={styles.patientCard}>
                        <View style={styles.patientCardContent}>
                          <View style={styles.patientAvatar}>
                            <Ionicons
                              name="person"
                              size={24}
                              color={colors.primary[500]}
                            />
                          </View>
                          <View style={styles.patientInfo}>
                            <Text style={styles.patientName}>{patient.name}</Text>
                            <Text style={styles.patientEmail}>{patient.email}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => handleManagePatient(patient.id)}
                            accessibilityLabel={`Gestionar medicamentos de ${patient.name}`}
                            accessibilityHint="Abre la pantalla de gestión de medicamentos para este paciente"
                            accessibilityRole="button"
                          >
                            <Text style={styles.manageButtonText}>Gestionar</Text>
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color={colors.primary[500]}
                            />
                          </TouchableOpacity>
                        </View>
                      </Card>
                    </AnimatedListItem>
                  ))}
                </View>
              )}
            </View>

            {/* Back Button */}
            <Button
              variant="ghost"
              size="md"
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityLabel="Volver"
              accessibilityHint="Regresa a la pantalla anterior"
            >
              ← Volver
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    paddingHorizontal: spacing.md,
  },
  // Form Card
  card: {
    marginBottom: spacing.lg,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  hintText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  // Help Card
  helpCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[100],
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  helpTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  helpContent: {
    gap: spacing.md,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  helpText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  // Back Button
  backButton: {
    alignSelf: 'center',
  },
  // Patients Section
  patientsSection: {
    marginTop: spacing.xl,
  },
  dashboardButton: {
    marginBottom: spacing.lg,
  },
  patientsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  patientsSectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[600],
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  patientsList: {
    gap: spacing.md,
  },
  patientCard: {
    padding: spacing.md,
  },
  patientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  patientEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    minHeight: 44,
  },
  manageButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
});
