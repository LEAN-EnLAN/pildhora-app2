import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../../../theme/tokens';
import { useWizardContext } from '../WizardContext';
import { announceForAccessibility, triggerHapticFeedback, HapticFeedbackType } from '../../../../utils/accessibility';
import { completeOnboarding } from '../../../../services/onboarding';
import { Button } from '../../../ui';

/**
 * CompletionStep Component
 * 
 * Sixth and final step of the device provisioning wizard. Shows success
 * message, summary of configuration, and marks onboarding as complete.
 * 
 * Requirements: 3.7, 3.8, 9.4
 */
export function CompletionStep() {
  const router = useRouter();
  const { formData, setCanProceed, userId } = useWizardContext();
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  useEffect(() => {
    announceForAccessibility('Paso 6: Configuración completada exitosamente');
    markOnboardingComplete();
  }, []);

  /**
   * Mark onboarding as complete in user document
   * Requirements: 3.8, 9.4
   */
  const markOnboardingComplete = async () => {
    setIsCompleting(true);
    
    try {
      await completeOnboarding(userId);
      
      setCanProceed(true);
      await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
      announceForAccessibility('Configuración completada. Tu dispositivo está listo para usar');
      
    } catch (error: any) {
      console.error('[CompletionStep] Error completing onboarding:', error);
      
      let userMessage = 'Error al completar la configuración';
      
      if (error.code === 'permission-denied') {
        userMessage = 'No tienes permiso para completar la configuración';
      } else if (error.code === 'unavailable') {
        userMessage = 'Servicio no disponible. Verifica tu conexión a internet';
      }

      setCompletionError(userMessage);
      setCanProceed(false);
      await triggerHapticFeedback(HapticFeedbackType.ERROR);
    } finally {
      setIsCompleting(false);
    }
  };

  /**
   * Navigate to patient home
   * Requirements: 3.8, 9.4
   */
  const handleGoToHome = async () => {
    await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
    router.replace('/patient/home');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Header */}
      <View style={styles.header}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
        </View>
        <Text style={styles.title}>¡Configuración Completada!</Text>
        <Text style={styles.subtitle}>
          Tu dispositivo está listo para ayudarte a gestionar tus medicamentos
        </Text>
      </View>

      {/* Configuration Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Resumen de Configuración</Text>
        
        <View style={styles.summaryCard}>
          <SummaryItem
            icon="hardware-chip"
            label="Dispositivo"
            value={formData.deviceId}
          />
          <SummaryItem
            icon="wifi"
            label="Red WiFi"
            value={formData.wifiSSID || 'No configurada'}
          />
          <SummaryItem
            icon="notifications"
            label="Modo de Alarma"
            value={getAlarmModeLabel(formData.alarmMode)}
          />
          <SummaryItem
            icon="bulb"
            label="LED"
            value={`${formData.ledIntensity}% intensidad`}
          />
          {(formData.alarmMode === 'sound' || formData.alarmMode === 'both') && (
            <SummaryItem
              icon="volume-high"
              label="Volumen"
              value={`${formData.volume}%`}
            />
          )}
        </View>
      </View>

      {/* Next Steps */}
      <View style={styles.nextStepsSection}>
        <Text style={styles.nextStepsTitle}>Próximos Pasos</Text>
        
        <View style={styles.stepsList}>
          <NextStepItem
            number={1}
            icon="medical"
            title="Agregar Medicamentos"
            description="Comienza agregando tus medicamentos y horarios"
          />
          <NextStepItem
            number={2}
            icon="calendar"
            title="Configurar Horarios"
            description="Establece los horarios para cada medicamento"
          />
          <NextStepItem
            number={3}
            icon="notifications"
            title="Recibir Recordatorios"
            description="Tu dispositivo te notificará cuando sea hora de tomar tus medicamentos"
          />
        </View>
      </View>

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <Ionicons name="information-circle" size={24} color={colors.primary[500]} style={styles.tipsIcon} />
        <View style={styles.tipsContent}>
          <Text style={styles.tipsTitle}>Consejo</Text>
          <Text style={styles.tipsText}>
            Puedes modificar la configuración de tu dispositivo en cualquier momento desde el menú de ajustes
          </Text>
        </View>
      </View>

      {/* Error Display */}
      {completionError && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={20} color={colors.error[500]} />
          <Text style={styles.errorText}>{completionError}</Text>
        </View>
      )}

      {/* Navigation Button */}
      {!completionError && (
        <View style={styles.navigationSection}>
          <Button
            onPress={handleGoToHome}
            variant="primary"
            size="lg"
            disabled={isCompleting}
            loading={isCompleting}
            accessibilityLabel="Ir al inicio"
            accessibilityHint="Navega a la pantalla principal de paciente"
          >
            Ir al Inicio
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

/**
 * Get alarm mode label in Spanish
 */
function getAlarmModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    sound: 'Solo Sonido',
    vibrate: 'Solo Vibración',
    both: 'Sonido y Vibración',
    silent: 'Silencioso',
  };
  return labels[mode] || mode;
}

/**
 * SummaryItem Component
 */
interface SummaryItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function SummaryItem({ icon, label, value }: SummaryItemProps) {
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryItemIcon}>
        <Ionicons name={icon} size={20} color={colors.primary[500]} />
      </View>
      <View style={styles.summaryItemContent}>
        <Text style={styles.summaryItemLabel}>{label}</Text>
        <Text style={styles.summaryItemValue}>{value}</Text>
      </View>
    </View>
  );
}

/**
 * NextStepItem Component
 */
interface NextStepItemProps {
  number: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function NextStepItem({ number, icon, title, description }: NextStepItemProps) {
  return (
    <View style={styles.nextStepItem}>
      <View style={styles.nextStepNumber}>
        <Text style={styles.nextStepNumberText}>{number}</Text>
      </View>
      <View style={styles.nextStepIcon}>
        <Ionicons name={icon} size={24} color={colors.primary[500]} />
      </View>
      <View style={styles.nextStepContent}>
        <Text style={styles.nextStepTitle}>{title}</Text>
        <Text style={styles.nextStepDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  summarySection: {
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#EFF6FF', // primary[50]
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  summaryItemContent: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  summaryItemValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  nextStepsSection: {
    marginBottom: spacing.xl,
  },
  nextStepsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  stepsList: {
    gap: spacing.md,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  nextStepNumber: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  nextStepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },
  nextStepIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#EFF6FF', // primary[50]
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  nextStepDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    lineHeight: typography.fontSize.sm * 1.4,
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF', // primary[50]
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  tipsIcon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  tipsText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    lineHeight: typography.fontSize.sm * 1.4,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2', // error[50]
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
  },
  navigationSection: {
    marginTop: spacing.lg,
  },
});
