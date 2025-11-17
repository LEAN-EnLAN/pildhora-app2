/**
 * Continue Setup Prompt Component
 * 
 * Displays a prompt to users when they have incomplete wizard progress saved.
 * Allows them to resume from where they left off or start fresh.
 * 
 * Requirements: 11.5
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../../theme/tokens';

export interface ContinueSetupPromptProps {
  /** Current step number from saved progress */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Age of saved progress in milliseconds */
  progressAge: number;
  /** Callback when user chooses to continue */
  onContinue: () => void;
  /** Callback when user chooses to start fresh */
  onStartFresh: () => void;
}

/**
 * Format progress age into human-readable string
 */
function formatProgressAge(ageMs: number): string {
  const hours = Math.floor(ageMs / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  } else if (hours > 0) {
    return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  } else {
    return 'hace unos minutos';
  }
}

/**
 * ContinueSetupPrompt Component
 * 
 * Shows a card prompting the user to continue their incomplete setup
 * or start over with a fresh wizard.
 */
export function ContinueSetupPrompt({
  currentStep,
  totalSteps,
  progressAge,
  onContinue,
  onStartFresh,
}: ContinueSetupPromptProps) {
  const ageText = formatProgressAge(progressAge);
  const stepText = `Paso ${currentStep + 1} de ${totalSteps}`;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={32} color={colors.primary[500]} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Configuración Incompleta</Text>
          <Text style={styles.description}>
            Tienes una configuración de dispositivo sin terminar guardada {ageText}.
          </Text>
          <Text style={styles.progress}>
            Progreso guardado: {stepText}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            onPress={onContinue}
            variant="primary"
            size="lg"
            style={styles.button}
            accessibilityLabel="Continuar configuración"
            accessibilityHint={`Continúa desde el ${stepText}`}
          >
            Continuar Configuración
          </Button>
          
          <Button
            onPress={onStartFresh}
            variant="secondary"
            size="md"
            style={styles.button}
            accessibilityLabel="Empezar de nuevo"
            accessibilityHint="Descarta el progreso guardado y empieza desde el principio"
          >
            Empezar de Nuevo
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  content: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  progress: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
    textAlign: 'center',
    backgroundColor: colors.primary[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
