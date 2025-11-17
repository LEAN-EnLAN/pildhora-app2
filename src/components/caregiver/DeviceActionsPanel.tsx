import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { useCaregiverTreatmentControl } from '../../hooks/useCaregiverTreatmentControl';

interface DeviceActionsPanelProps {
  deviceId?: string;
  patientName?: string;
}

/**
 * Device Actions Panel Component
 * 
 * Provides quick access to device control actions for caregivers:
 * - Test alarm
 * - Manual dose dispensing
 * - Device time sync
 * - Status check
 * - Clear alarm
 * 
 * Requirements: 8.4 - Enable device action triggers for caregivers
 * 
 * @example
 * ```typescript
 * <DeviceActionsPanel
 *   deviceId="DEVICE-001"
 *   patientName="John Doe"
 * />
 * ```
 */
export function DeviceActionsPanel({ deviceId, patientName }: DeviceActionsPanelProps) {
  const {
    triggerTestAlarm,
    dispenseManualDose,
    syncDeviceTime,
    checkDeviceStatus,
    clearAlarm,
    isActionInProgress,
  } = useCaregiverTreatmentControl(deviceId);

  const [activeAction, setActiveAction] = useState<string | null>(null);

  /**
   * Handle device action with confirmation and feedback
   */
  const handleAction = async (
    actionName: string,
    actionFn: () => Promise<any>,
    confirmMessage?: string
  ) => {
    // Show confirmation if provided
    if (confirmMessage) {
      Alert.alert(
        'Confirmar Acción',
        confirmMessage,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              await executeAction(actionName, actionFn);
            },
          },
        ]
      );
    } else {
      await executeAction(actionName, actionFn);
    }
  };

  /**
   * Execute device action
   */
  const executeAction = async (actionName: string, actionFn: () => Promise<any>) => {
    setActiveAction(actionName);
    try {
      const result = await actionFn();
      
      if (result.success) {
        Alert.alert('Éxito', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo completar la acción');
    } finally {
      setActiveAction(null);
    }
  };

  if (!deviceId) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyText}>No hay dispositivo conectado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={24} color={colors.primary[600]} />
        <Text style={styles.title}>Controles del Dispositivo</Text>
      </View>

      {patientName && (
        <Text style={styles.subtitle}>Paciente: {patientName}</Text>
      )}

      <View style={styles.actionsGrid}>
        {/* Test Alarm */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            activeAction === 'test_alarm' && styles.actionCardActive,
          ]}
          onPress={() =>
            handleAction(
              'test_alarm',
              triggerTestAlarm,
              '¿Deseas activar una alarma de prueba en el dispositivo?'
            )
          }
          disabled={isActionInProgress}
          accessibilityLabel="Probar alarma"
          accessibilityHint="Activa una alarma de prueba en el dispositivo"
          accessibilityRole="button"
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.blue[100] }]}>
            {activeAction === 'test_alarm' ? (
              <ActivityIndicator size="small" color={colors.blue[600]} />
            ) : (
              <Ionicons name="notifications-outline" size={24} color={colors.blue[600]} />
            )}
          </View>
          <Text style={styles.actionLabel}>Probar Alarma</Text>
        </TouchableOpacity>

        {/* Manual Dose */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            activeAction === 'dispense_dose' && styles.actionCardActive,
          ]}
          onPress={() =>
            handleAction(
              'dispense_dose',
              dispenseManualDose,
              '¿Deseas dispensar una dosis manualmente?'
            )
          }
          disabled={isActionInProgress}
          accessibilityLabel="Dispensar dosis"
          accessibilityHint="Dispensa una dosis manualmente desde el dispositivo"
          accessibilityRole="button"
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.green[100] }]}>
            {activeAction === 'dispense_dose' ? (
              <ActivityIndicator size="small" color={colors.green[600]} />
            ) : (
              <Ionicons name="medical-outline" size={24} color={colors.green[600]} />
            )}
          </View>
          <Text style={styles.actionLabel}>Dispensar Dosis</Text>
        </TouchableOpacity>

        {/* Sync Time */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            activeAction === 'sync_time' && styles.actionCardActive,
          ]}
          onPress={() => handleAction('sync_time', syncDeviceTime)}
          disabled={isActionInProgress}
          accessibilityLabel="Sincronizar hora"
          accessibilityHint="Sincroniza la hora del dispositivo con el servidor"
          accessibilityRole="button"
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.purple[100] }]}>
            {activeAction === 'sync_time' ? (
              <ActivityIndicator size="small" color={colors.purple[600]} />
            ) : (
              <Ionicons name="time-outline" size={24} color={colors.purple[600]} />
            )}
          </View>
          <Text style={styles.actionLabel}>Sincronizar Hora</Text>
        </TouchableOpacity>

        {/* Check Status */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            activeAction === 'check_status' && styles.actionCardActive,
          ]}
          onPress={() => handleAction('check_status', checkDeviceStatus)}
          disabled={isActionInProgress}
          accessibilityLabel="Verificar estado"
          accessibilityHint="Solicita una actualización del estado del dispositivo"
          accessibilityRole="button"
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.orange[100] }]}>
            {activeAction === 'check_status' ? (
              <ActivityIndicator size="small" color={colors.orange[600]} />
            ) : (
              <Ionicons name="pulse-outline" size={24} color={colors.orange[600]} />
            )}
          </View>
          <Text style={styles.actionLabel}>Verificar Estado</Text>
        </TouchableOpacity>

        {/* Clear Alarm */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            activeAction === 'clear_alarm' && styles.actionCardActive,
          ]}
          onPress={() =>
            handleAction(
              'clear_alarm',
              clearAlarm,
              '¿Deseas silenciar la alarma activa?'
            )
          }
          disabled={isActionInProgress}
          accessibilityLabel="Silenciar alarma"
          accessibilityHint="Silencia la alarma activa en el dispositivo"
          accessibilityRole="button"
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.red[100] }]}>
            {activeAction === 'clear_alarm' ? (
              <ActivityIndicator size="small" color={colors.red[600]} />
            ) : (
              <Ionicons name="volume-mute-outline" size={24} color={colors.red[600]} />
            )}
          </View>
          <Text style={styles.actionLabel}>Silenciar Alarma</Text>
        </TouchableOpacity>
      </View>

      {isActionInProgress && (
        <View style={styles.progressIndicator}>
          <ActivityIndicator size="small" color={colors.primary[600]} />
          <Text style={styles.progressText}>Procesando acción...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: '1%',
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  actionCardActive: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    textAlign: 'center',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: spacing.md,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    marginTop: spacing.md,
  },
});
