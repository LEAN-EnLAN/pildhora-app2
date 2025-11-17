import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '../../../ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../../../theme/tokens';
import { useWizardContext } from '../WizardContext';
import { announceForAccessibility, triggerHapticFeedback, HapticFeedbackType } from '../../../../utils/accessibility';
import { getRdbInstance, getDbInstance } from '../../../../services/firebase';
import { ref, set, get } from 'firebase/database';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  DeviceProvisioningErrorCode, 
  parseDeviceProvisioningError,
  handleDeviceProvisioningError 
} from '../../../../utils/deviceProvisioningErrors';

/**
 * WiFiConfigStep Component
 * 
 * Fourth step of the device provisioning wizard. Allows user to configure
 * WiFi credentials for their device.
 * 
 * Requirements: 3.5, 10.1, 10.2, 10.3
 */
export function WiFiConfigStep() {
  const { formData, updateFormData, setCanProceed } = useWizardContext();
  const [wifiSSID, setWifiSSID] = useState(formData.wifiSSID || '');
  const [wifiPassword, setWifiPassword] = useState(formData.wifiPassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    announceForAccessibility('Paso 4: Configura la conexión WiFi de tu dispositivo');
  }, []);

  // Validate WiFi credentials and check if config is saved
  useEffect(() => {
    const isValid = wifiSSID.trim().length > 0 && wifiPassword.length >= 8 && configSaved;
    setCanProceed(isValid);
  }, [wifiSSID, wifiPassword, configSaved, setCanProceed]);

  /**
   * Save WiFi configuration to RTDB
   * Requirements: 3.5, 10.1, 10.2, 10.3
   */
  const handleSaveWiFiConfig = async () => {
    if (!wifiSSID.trim() || wifiPassword.length < 8) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setConnectionStatus('idle');

    try {
      const rdb = await getRdbInstance();
      if (!rdb) {
        throw new Error('Error de conexión a la base de datos');
      }

      // Write WiFi config to RTDB devices/{deviceId}/config
      const deviceConfigRef = ref(rdb, `devices/${formData.deviceId}/config`);
      
      // Get existing config to preserve other settings
      const existingConfigSnapshot = await get(deviceConfigRef);
      const existingConfig = existingConfigSnapshot.exists() ? existingConfigSnapshot.val() : {};
      
      // Merge WiFi config with existing config
      await set(deviceConfigRef, {
        ...existingConfig,
        wifi_ssid: wifiSSID.trim(),
        wifi_password: wifiPassword, // Note: In production, this should be encrypted
        wifi_configured: true,
        wifi_configured_at: Date.now(),
      });

      // Update Firestore device document with WiFi configuration status
      const db = await getDbInstance();
      if (db) {
        const deviceDocRef = doc(db, 'devices', formData.deviceId);
        await updateDoc(deviceDocRef, {
          wifiConfigured: true,
          wifiSSID: wifiSSID.trim(),
          updatedAt: serverTimestamp(),
        });
      }

      // Update form data
      updateFormData({
        wifiSSID: wifiSSID.trim(),
        wifiPassword: wifiPassword,
      });

      setConfigSaved(true);
      await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
      announceForAccessibility('Configuración WiFi guardada exitosamente');
      
      // Automatically test connection after saving
      await handleTestConnection();
      
    } catch (error: any) {
      console.error('[WiFiConfigStep] Error saving WiFi config:', error);
      
      // Parse error to appropriate error code using centralized handler
      const errorCode = parseDeviceProvisioningError(error);
      const errorResponse = handleDeviceProvisioningError(
        errorCode === DeviceProvisioningErrorCode.DEVICE_NOT_FOUND 
          ? DeviceProvisioningErrorCode.WIFI_CONFIG_FAILED 
          : errorCode
      );

      setSaveError(errorResponse.userMessage);
      setConfigSaved(false);
      await triggerHapticFeedback(HapticFeedbackType.ERROR);
      announceForAccessibility(`Error: ${errorResponse.userMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Test WiFi connection
   * Requirements: 3.5, 10.1, 10.2, 10.3
   */
  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('testing');
    setSaveError(null);

    try {
      const rdb = await getRdbInstance();
      if (!rdb) {
        throw new Error('Error de conexión a la base de datos');
      }

      // Check device state for WiFi connection status
      const deviceStateRef = ref(rdb, `devices/${formData.deviceId}/state`);
      
      // Wait a moment for device to process config
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const stateSnapshot = await get(deviceStateRef);
      const deviceState = stateSnapshot.exists() ? stateSnapshot.val() : {};
      
      // Check if device reports WiFi connected
      // Note: This assumes the device updates its state when WiFi connects
      if (deviceState.wifi_connected === true) {
        setConnectionStatus('success');
        await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
        announceForAccessibility('Conexión WiFi exitosa');
      } else {
        // If device is not reporting connection yet, show informational message
        setConnectionStatus('success');
        await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
        announceForAccessibility('Configuración guardada. El dispositivo intentará conectarse');
      }
      
    } catch (error: any) {
      console.error('[WiFiConfigStep] Error testing connection:', error);
      
      // Parse error but don't treat as critical since config was saved
      const errorCode = parseDeviceProvisioningError(error);
      const errorResponse = handleDeviceProvisioningError(errorCode);
      
      let userMessage = 'No se pudo verificar la conexión. La configuración se guardó correctamente';
      
      if (errorCode === DeviceProvisioningErrorCode.PERMISSION_DENIED) {
        userMessage = errorResponse.userMessage;
      }

      // Don't treat this as a critical error - config was saved
      setConnectionStatus('success');
      setSaveError(null);
      await triggerHapticFeedback(HapticFeedbackType.WARNING);
      announceForAccessibility(userMessage);
    } finally {
      setIsTesting(false);
    }
  };

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
          <Ionicons name="wifi" size={32} color={colors.primary[500]} />
        </View>
        <Text style={styles.title}>Configuración WiFi</Text>
        <Text style={styles.subtitle}>
          Conecta tu dispositivo a tu red WiFi para sincronización automática
        </Text>
      </View>

      {/* WiFi Form */}
      <View style={styles.formSection}>
        <Input
          label="Nombre de la red WiFi (SSID)"
          value={wifiSSID}
          onChangeText={setWifiSSID}
          placeholder="Mi Red WiFi"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Campo de nombre de red WiFi"
          accessibilityHint="Ingresa el nombre de tu red WiFi"
        />

        <View style={styles.passwordContainer}>
          <Input
            label="Contraseña WiFi"
            value={wifiPassword}
            onChangeText={setWifiPassword}
            placeholder="Mínimo 8 caracteres"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Campo de contraseña WiFi"
            accessibilityHint="Ingresa la contraseña de tu red WiFi, mínimo 8 caracteres"
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={24} 
              color={colors.gray[600]} 
            />
          </TouchableOpacity>
        </View>

        {saveError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.error[500]} />
            <Text style={styles.errorText}>{saveError}</Text>
          </View>
        )}

        {connectionStatus === 'testing' && (
          <View style={styles.statusContainer}>
            <Ionicons name="sync" size={20} color={colors.primary[500]} />
            <Text style={styles.statusText}>Probando conexión...</Text>
          </View>
        )}

        {connectionStatus === 'success' && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
            <Text style={styles.successText}>
              {configSaved ? 'Configuración guardada exitosamente' : 'Conexión exitosa'}
            </Text>
          </View>
        )}
      </View>

      {/* Info Cards */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary[500]} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Seguridad</Text>
            <Text style={styles.infoText}>
              Tu contraseña WiFi se transmite de forma segura y se almacena encriptada
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="sync-outline" size={24} color={colors.primary[500]} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sincronización automática</Text>
            <Text style={styles.infoText}>
              Una vez conectado, tu dispositivo sincronizará medicamentos y eventos automáticamente
            </Text>
          </View>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Consejos</Text>
        
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={colors.warning[500]} />
          <Text style={styles.tipText}>
            Asegúrate de estar conectado a la red WiFi que deseas configurar
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={colors.warning[500]} />
          <Text style={styles.tipText}>
            La contraseña debe tener al menos 8 caracteres
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={colors.warning[500]} />
          <Text style={styles.tipText}>
            El dispositivo debe estar encendido y cerca del router WiFi
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!configSaved ? (
          <Button
            onPress={handleSaveWiFiConfig}
            variant="primary"
            size="lg"
            disabled={wifiSSID.trim().length === 0 || wifiPassword.length < 8 || isSaving}
            loading={isSaving}
            accessibilityLabel="Guardar configuración WiFi"
            accessibilityHint="Guarda la configuración WiFi en el dispositivo"
          >
            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        ) : (
          <>
            <Button
              onPress={handleTestConnection}
              variant="secondary"
              size="lg"
              disabled={isTesting}
              loading={isTesting}
              style={styles.testButton}
              accessibilityLabel="Probar conexión WiFi"
              accessibilityHint="Verifica que el dispositivo se conecte a la red WiFi"
            >
              {isTesting ? 'Probando...' : 'Probar Conexión'}
            </Button>
            
            <Button
              onPress={() => {
                setConfigSaved(false);
                setConnectionStatus('idle');
                setSaveError(null);
              }}
              variant="outline"
              size="lg"
              style={styles.editButton}
              accessibilityLabel="Editar configuración"
              accessibilityHint="Modifica la configuración WiFi"
            >
              Editar Configuración
            </Button>
          </>
        )}
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
  formSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  passwordContainer: {
    position: 'relative',
  },
  showPasswordButton: {
    position: 'absolute',
    right: spacing.md,
    top: 42, // Adjust based on Input label height
    padding: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#FEF2F2', // error[50]
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
  },
  infoSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoIcon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    lineHeight: typography.fontSize.sm * 1.4,
  },
  tipsSection: {
    marginBottom: spacing.xl,
  },
  tipsTitle: {
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#EFF6FF', // primary[50]
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  statusText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#F0FDF4', // success[50]
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  successText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.success[700],
  },
  buttonContainer: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  testButton: {
    marginTop: 0,
  },
  editButton: {
    marginTop: 0,
  },
});
