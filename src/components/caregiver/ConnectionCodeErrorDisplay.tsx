import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import {
  ConnectionCodeErrorCode,
  handleConnectionCodeError,
  getNewCodeInstructions,
} from '../../utils/connectionCodeErrors';

/**
 * ConnectionCodeErrorDisplay Component
 * 
 * Displays connection code errors with user-friendly messages,
 * troubleshooting steps, and guidance for obtaining a new code.
 * 
 * Requirements: 11.4
 */

interface ConnectionCodeErrorDisplayProps {
  errorCode: ConnectionCodeErrorCode;
  onRetry?: () => void;
  onRequestNewCode?: () => void;
  style?: any;
}

export function ConnectionCodeErrorDisplay({
  errorCode,
  onRetry,
  onRequestNewCode,
  style,
}: ConnectionCodeErrorDisplayProps) {
  const errorResponse = handleConnectionCodeError(errorCode);
  const newCodeInstructions = getNewCodeInstructions();

  return (
    <ScrollView 
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Error Header */}
      <View style={styles.errorHeader}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
        </View>
        <Text style={styles.errorTitle}>Error de Conexión</Text>
        <Text style={styles.errorMessage}>{errorResponse.userMessage}</Text>
      </View>

      {/* Suggested Action */}
      <View style={styles.actionCard}>
        <View style={styles.actionHeader}>
          <Ionicons name="bulb" size={20} color={colors.warning[500]} />
          <Text style={styles.actionTitle}>Acción Sugerida</Text>
        </View>
        <Text style={styles.actionText}>{errorResponse.suggestedAction}</Text>
      </View>

      {/* Troubleshooting Steps */}
      <View style={styles.troubleshootingSection}>
        <Text style={styles.sectionTitle}>Pasos para Solucionar</Text>
        
        {errorResponse.troubleshootingSteps.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* New Code Instructions (for expired/used codes) */}
      {errorResponse.promptNewCode && (
        <View style={styles.newCodeSection}>
          <View style={styles.newCodeHeader}>
            <Ionicons name="key" size={24} color={colors.primary[500]} />
            <Text style={styles.newCodeTitle}>{newCodeInstructions.title}</Text>
          </View>
          
          <View style={styles.newCodeCard}>
            {newCodeInstructions.steps.map((step, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{step}</Text>
              </View>
            ))}
          </View>

          {onRequestNewCode && (
            <TouchableOpacity
              style={styles.newCodeButton}
              onPress={onRequestNewCode}
              accessibilityRole="button"
              accessibilityLabel="Solicitar nuevo código"
            >
              <Ionicons name="refresh-circle" size={20} color="#FFFFFF" />
              <Text style={styles.newCodeButtonText}>Tengo un Nuevo Código</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Retry Button */}
      {errorResponse.retryable && onRetry && !errorResponse.promptNewCode && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Reintentar conexión"
        >
          <Ionicons name="refresh" size={20} color={colors.primary[500]} />
          <Text style={styles.retryButtonText}>Intentar Nuevamente</Text>
        </TouchableOpacity>
      )}

      {/* Non-retryable Notice */}
      {!errorResponse.retryable && !errorResponse.promptNewCode && (
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle" size={20} color={colors.gray[600]} />
          <Text style={styles.noticeText}>
            Este error requiere un nuevo código de conexión del paciente.
          </Text>
        </View>
      )}

      {/* Help Text */}
      <View style={styles.helpCard}>
        <Ionicons name="help-circle" size={20} color={colors.primary[500]} />
        <Text style={styles.helpText}>
          Si continúas teniendo problemas, contacta al paciente para verificar que el código sea correcto y esté activo.
        </Text>
      </View>
    </ScrollView>
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
  errorHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: '#FEF2F2', // error[50]
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.error[500],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: typography.fontSize.base * 1.5,
  },
  actionCard: {
    backgroundColor: '#FFFBEB', // warning[50]
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning[500],
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  actionText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[800],
    lineHeight: typography.fontSize.base * 1.5,
  },
  troubleshootingSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  stepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.gray[800],
    lineHeight: typography.fontSize.base * 1.5,
  },
  newCodeSection: {
    marginBottom: spacing.xl,
  },
  newCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  newCodeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  newCodeCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs / 2,
  },
  instructionNumberText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    lineHeight: typography.fontSize.base * 1.5,
  },
  newCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  newCodeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary[500],
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.gray[100],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    lineHeight: typography.fontSize.sm * 1.5,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  helpText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    lineHeight: typography.fontSize.sm * 1.5,
  },
});
