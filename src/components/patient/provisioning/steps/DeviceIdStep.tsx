import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../ui';
import { colors, spacing, typography, borderRadius } from '../../../../theme/tokens';
import { useWizardContext } from '../WizardContext';
import { announceForAccessibility, triggerHapticFeedback, HapticFeedbackType } from '../../../../utils/accessibility';
import { getDbInstance } from '../../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  DeviceProvisioningErrorCode, 
  parseDeviceProvisioningError 
} from '../../../../utils/deviceProvisioningErrors';

/**
 * DeviceIdStep Component
 * 
 * Second step of the device provisioning wizard. Allows user to enter
 * their device ID with real-time validation and availability checking.
 * 
 * Requirements: 3.2, 3.3, 4.3, 11.3, 11.4
 */
export function DeviceIdStep() {
  const { formData, updateFormData, setCanProceed } = useWizardContext();
  const [deviceId, setDeviceId] = useState(formData.deviceId || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkDebounceTimer, setCheckDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Announce step for accessibility
  useEffect(() => {
    announceForAccessibility('Paso 2: Ingresa el ID de tu dispositivo');
  }, []);

  /**
   * Validate device ID format
   * Requirements: 3.2, 11.3
   */
  const validateFormat = useCallback((id: string): string | null => {
    if (!id || id.trim().length === 0) {
      return 'El ID del dispositivo es requerido';
    }

    if (id.trim().length < 5) {
      return 'El ID debe tener al menos 5 caracteres';
    }

    if (id.length > 100) {
      return 'El ID no puede tener más de 100 caracteres';
    }

    // Check for invalid characters (allow alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return 'El ID solo puede contener letras, números, guiones y guiones bajos';
    }

    return null;
  }, []);

  /**
   * Check if device is available (not already claimed)
   * Requirements: 3.3, 4.3, 11.4
   */
  const checkDeviceAvailability = useCallback(async (id: string): Promise<string | null> => {
    try {
      const db = await getDbInstance();
      if (!db) {
        const errorCode = DeviceProvisioningErrorCode.DEVICE_OFFLINE;
        const errorResponse = require('../../../../utils/deviceProvisioningErrors').handleDeviceProvisioningError(errorCode);
        return errorResponse.userMessage;
      }

      // Check if device document exists in Firestore
      const deviceRef = doc(db, 'devices', id);
      const deviceDoc = await getDoc(deviceRef);

      if (deviceDoc.exists()) {
        const deviceData = deviceDoc.data();
        
        // Check if device is already claimed by another patient
        if (deviceData.primaryPatientId) {
          const errorCode = DeviceProvisioningErrorCode.DEVICE_ALREADY_CLAIMED;
          const errorResponse = require('../../../../utils/deviceProvisioningErrors').handleDeviceProvisioningError(errorCode);
          return errorResponse.userMessage;
        }
      }

      // Device is available
      return null;
    } catch (error: any) {
      console.error('[DeviceIdStep] Error checking device availability:', error);
      
      // Parse error to appropriate error code
      const errorCode = parseDeviceProvisioningError(error);
      const errorResponse = require('../../../../utils/deviceProvisioningErrors').handleDeviceProvisioningError(errorCode);
      return errorResponse.userMessage;
    }
  }, []);

  /**
   * Handle device ID change with validation and availability check
   */
  const handleDeviceIdChange = useCallback((value: string) => {
    setDeviceId(value);
    setValidationError(null);
    setCanProceed(false);

    // Clear existing debounce timer
    if (checkDebounceTimer) {
      clearTimeout(checkDebounceTimer);
    }

    // Validate format first
    const formatError = validateFormat(value);
    if (formatError) {
      setValidationError(formatError);
      return;
    }

    // Debounce availability check (wait 500ms after user stops typing)
    const timer = setTimeout(async () => {
      setIsChecking(true);
      
      const availabilityError = await checkDeviceAvailability(value);
      
      setIsChecking(false);
      
      if (availabilityError) {
        setValidationError(availabilityError);
        await triggerHapticFeedback(HapticFeedbackType.ERROR);
        announceForAccessibility(availabilityError);
      } else {
        // Device ID is valid and available
        updateFormData({ deviceId: value });
        setCanProceed(true);
        await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
        announceForAccessibility('ID del dispositivo válido');
      }
    }, 500);

    setCheckDebounceTimer(timer);
  }, [validateFormat, checkDeviceAvailability, updateFormData, setCanProceed, checkDebounceTimer]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (checkDebounceTimer) {
        clearTimeout(checkDebounceTimer);
      }
    };
  }, [checkDebounceTimer]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="keypad" size={32} color={colors.primary[500]} />
        </View>
        <Text style={styles.title}>ID del Dispositivo</Text>
        <Text style={styles.subtitle}>
          Ingresa el código único de tu dispositivo dispensador
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <Input
          label="ID del Dispositivo"
          value={deviceId}
          onChangeText={handleDeviceIdChange}
          placeholder="Ej: DEVICE-12345"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={100}
          accessibilityLabel="Campo de ID del dispositivo"
          accessibilityHint="Ingresa el código alfanumérico de 5 a 100 caracteres ubicado en tu dispositivo"
        />

        {/* Validation Feedback */}
        {isChecking && (
          <View style={styles.feedbackContainer}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.feedbackText}>Verificando disponibilidad...</Text>
          </View>
        )}

        {validationError && !isChecking && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.error[500]} />
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        )}

        {!validationError && !isChecking && deviceId.length >= 5 && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.successText}>ID válido y disponible</Text>
          </View>
        )}
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>¿Dónde encuentro el ID?</Text>
        
        <View style={styles.helpCard}>
          <Ionicons name="location-outline" size={24} color={colors.primary[500]} style={styles.helpIcon} />
          <View style={styles.helpContent}>
            <Text style={styles.helpText}>
              El ID del dispositivo está ubicado en:
            </Text>
            <View style={styles.locationList}>
              <Text style={styles.locationItem}>• Parte inferior del dispositivo</Text>
              <Text style={styles.locationItem}>• Etiqueta en la caja</Text>
              <Text style={styles.locationItem}>• Manual de usuario</Text>
            </View>
          </View>
        </View>

        <View style={styles.formatCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.gray[600]} />
          <Text style={styles.formatText}>
            El ID debe tener entre 5 y 100 caracteres alfanuméricos
          </Text>
        </View>
      </View>

      {/* Troubleshooting */}
      <View style={styles.troubleshootingSection}>
        <Text style={styles.troubleshootingTitle}>¿Problemas?</Text>
        
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={colors.warning[500]} />
          <Text style={styles.tipText}>
            Verifica que el ID esté escrito correctamente, sin espacios
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={colors.warning[500]} />
          <Text style={styles.tipText}>
            Si el dispositivo ya está registrado, contacta al soporte
          </Text>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: '#EFF6FF', // primary[50]
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  feedbackText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#FEF2F2', // error[50]
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    lineHeight: typography.fontSize.sm * 1.4,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#F0FDF4', // success[50]
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  successText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  helpSection: {
    marginBottom: spacing.xl,
  },
  helpTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF', // primary[50]
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  helpIcon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  helpContent: {
    flex: 1,
  },
  helpText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  locationList: {
    gap: spacing.xs,
  },
  locationItem: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  formatText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  troubleshootingSection: {
    marginBottom: spacing.lg,
  },
  troubleshootingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB', // warning[50]
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[800],
  },
});
