import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, ColorPicker } from '../../../ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../../../theme/tokens';
import { useWizardContext } from '../WizardContext';
import { announceForAccessibility, triggerHapticFeedback, HapticFeedbackType } from '../../../../utils/accessibility';
import { saveDeviceConfig } from '../../../../services/deviceConfig';
import Slider from '@react-native-community/slider';

/**
 * PreferencesStep Component
 * 
 * Fifth step of the device provisioning wizard. Allows user to configure
 * device preferences including alarm mode, LED settings, and volume.
 * 
 * Requirements: 3.6, 10.1, 10.2
 */
export function PreferencesStep() {
  const { formData, updateFormData, setCanProceed } = useWizardContext();
  
  // Alarm mode state - map to user-friendly options
  const [alarmMode, setAlarmMode] = useState<'sound' | 'vibrate' | 'both' | 'silent'>(
    formData.alarmMode || 'both'
  );
  
  // LED settings state
  const [ledIntensity, setLedIntensity] = useState(formData.ledIntensity ?? 50);
  const [ledColor, setLedColor] = useState(formData.ledColor || '#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Volume state
  const [volume, setVolume] = useState(formData.volume ?? 75);
  
  // Save and test states
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  useEffect(() => {
    announceForAccessibility('Paso 5: Configura las preferencias de tu dispositivo');
  }, []);

  // Always allow proceeding to next step (preferences are optional but should be saved)
  useEffect(() => {
    setCanProceed(true);
  }, [setCanProceed]);

  // Update form data when preferences change
  useEffect(() => {
    updateFormData({
      alarmMode,
      ledIntensity,
      ledColor,
      volume,
    });
    // Mark as not saved when preferences change
    if (preferencesSaved) {
      setPreferencesSaved(false);
    }
  }, [alarmMode, ledIntensity, ledColor, volume, updateFormData]);

  /**
   * Save preferences using deviceConfig service
   * Requirements: 3.6, 10.1, 10.2
   */
  const handleSavePreferences = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Convert hex color to RGB for device config
      const rgbColor = hexToRgb(ledColor);

      // Map alarm mode to device config format
      let deviceAlarmMode: 'off' | 'sound' | 'led' | 'both';
      if (alarmMode === 'silent') {
        deviceAlarmMode = 'off';
      } else if (alarmMode === 'vibrate') {
        // Map vibrate to LED since device doesn't have vibration motor
        deviceAlarmMode = 'led';
      } else {
        deviceAlarmMode = alarmMode as 'sound' | 'both';
      }

      // Convert LED intensity from 0-100 to 0-1023 for device
      const deviceLedIntensity = Math.round((ledIntensity / 100) * 1023);

      // Save to device config
      await saveDeviceConfig(formData.deviceId, {
        alarmMode: deviceAlarmMode,
        ledIntensity: deviceLedIntensity,
        ledColor: rgbColor,
      });

      setPreferencesSaved(true);
      await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
      announceForAccessibility('Preferencias guardadas exitosamente');
      
    } catch (error: any) {
      console.error('[PreferencesStep] Error saving preferences:', error);
      
      let userMessage = 'Error al guardar las preferencias';
      
      if (error.code === 'PERMISSION_DENIED' || error.code === 'permission-denied') {
        userMessage = 'No tienes permiso para configurar este dispositivo';
      } else if (error.code === 'unavailable') {
        userMessage = 'Servicio no disponible. Verifica tu conexión a internet';
      } else if (error.userMessage) {
        userMessage = error.userMessage;
      }

      setSaveError(userMessage);
      setPreferencesSaved(false);
      await triggerHapticFeedback(HapticFeedbackType.ERROR);
      announceForAccessibility(`Error: ${userMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Test alarm with current settings
   * Requirements: 3.6
   */
  const handleTestAlarm = async () => {
    setIsTesting(true);
    
    try {
      // Provide haptic feedback to simulate alarm test
      await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
      announceForAccessibility('Alarma de prueba activada');
      
      // In a real implementation, this would trigger a test alarm on the device
      // For now, we simulate the test duration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      console.error('[PreferencesStep] Error testing alarm:', error);
      await triggerHapticFeedback(HapticFeedbackType.ERROR);
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Convert hex color to RGB object
   */
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 59, g: 130, b: 246 }; // Default blue
  };

  /**
   * Handle color picker change
   */
  const handleColorChange = (color: { hex: string; rgb: [number, number, number] }) => {
    setLedColor(color.hex);
  };

  const alarmModes = [
    { id: 'sound' as const, label: 'Sonido', icon: 'volume-high' as const },
    { id: 'vibrate' as const, label: 'Vibración', icon: 'phone-portrait' as const },
    { id: 'both' as const, label: 'Ambos', icon: 'notifications' as const },
    { id: 'silent' as const, label: 'Silencioso', icon: 'volume-mute' as const },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="settings" size={32} color={colors.primary[500]} />
        </View>
        <Text style={styles.title}>Preferencias del Dispositivo</Text>
        <Text style={styles.subtitle}>
          Personaliza cómo tu dispositivo te notificará sobre tus medicamentos
        </Text>
      </View>

      {/* Alarm Mode Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modo de Alarma</Text>
        <View style={styles.alarmModesGrid}>
          {alarmModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.alarmModeCard,
                alarmMode === mode.id && styles.alarmModeCardSelected,
              ]}
              onPress={() => setAlarmMode(mode.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: alarmMode === mode.id }}
              accessibilityLabel={mode.label}
            >
              <Ionicons
                name={mode.icon}
                size={28}
                color={alarmMode === mode.id ? colors.primary[500] : colors.gray[600]}
              />
              <Text
                style={[
                  styles.alarmModeLabel,
                  alarmMode === mode.id && styles.alarmModeLabelSelected,
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* LED Intensity */}
      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sectionTitle}>Intensidad del LED</Text>
          <Text style={styles.sliderValue}>{ledIntensity}%</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={5}
          value={ledIntensity}
          onValueChange={setLedIntensity}
          minimumTrackTintColor={colors.primary[500]}
          maximumTrackTintColor={colors.gray[300]}
          thumbTintColor={colors.primary[500]}
          accessibilityLabel="Control deslizante de intensidad del LED"
          accessibilityValue={{ min: 0, max: 100, now: ledIntensity }}
        />
      </View>

      {/* LED Color Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color del LED</Text>
        <Text style={styles.sectionDescription}>
          Selecciona el color del indicador LED
        </Text>
        
        <TouchableOpacity
          style={styles.colorPickerButton}
          onPress={() => setShowColorPicker(true)}
          accessibilityLabel="Abrir selector de color"
          accessibilityHint="Abre un selector para elegir el color del LED"
          accessibilityRole="button"
        >
          <View style={[styles.colorPreview, { backgroundColor: ledColor }]} />
          <Text style={styles.colorPickerButtonText}>
            {ledColor.toUpperCase()}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>

        {/* LED Preview */}
        <View style={styles.ledPreview}>
          <View 
            style={[
              styles.ledIndicator,
              { 
                backgroundColor: ledColor,
                opacity: ledIntensity / 100,
              }
            ]}
          />
          <Text style={styles.ledPreviewText}>Vista previa del LED</Text>
        </View>
      </View>

      {/* Volume */}
      {(alarmMode === 'sound' || alarmMode === 'both') && (
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sectionTitle}>Volumen</Text>
            <Text style={styles.sliderValue}>{volume}%</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={5}
            value={volume}
            onValueChange={setVolume}
            minimumTrackTintColor={colors.primary[500]}
            maximumTrackTintColor={colors.gray[300]}
            thumbTintColor={colors.primary[500]}
            accessibilityLabel="Control deslizante de volumen"
            accessibilityValue={{ min: 0, max: 100, now: volume }}
          />
        </View>
      )}

      {/* Error Display */}
      {saveError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={colors.error[500]} />
          <Text style={styles.errorText}>{saveError}</Text>
        </View>
      )}

      {/* Success Display */}
      {preferencesSaved && (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
          <Text style={styles.successText}>Preferencias guardadas exitosamente</Text>
        </View>
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary[500]} />
        <Text style={styles.infoText}>
          Puedes probar la alarma antes de guardar para asegurarte de que las configuraciones sean de tu agrado
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleTestAlarm}
          variant="secondary"
          size="lg"
          disabled={isTesting}
          loading={isTesting}
          accessibilityLabel="Probar alarma"
          accessibilityHint="Activa una alarma de prueba con la configuración actual"
        >
          {isTesting ? 'Probando...' : 'Probar Alarma'}
        </Button>
        
        <Button
          onPress={handleSavePreferences}
          variant="primary"
          size="lg"
          disabled={isSaving || preferencesSaved}
          loading={isSaving}
          accessibilityLabel="Guardar preferencias"
          accessibilityHint="Guarda la configuración de preferencias en el dispositivo"
        >
          {isSaving ? 'Guardando...' : preferencesSaved ? 'Preferencias Guardadas' : 'Guardar Preferencias'}
        </Button>
      </View>

      {/* Color Picker Modal */}
      <ColorPicker
        value={ledColor}
        onChange={handleColorChange}
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        showPresets={true}
        showCustomPicker={true}
      />
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
  section: {
    marginBottom: spacing.xl,
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
  },
  alarmModesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  alarmModeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  alarmModeCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: '#EFF6FF', // primary[50]
  },
  alarmModeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  alarmModeLabelSelected: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sliderValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  slider: {
    width: '100%',
    height: 40,
  },
  colorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  colorPickerButtonText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  ledPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[900],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  ledIndicator: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  ledPreviewText: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    fontWeight: typography.fontWeight.medium,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#FEF2F2', // error[50]
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#F0FDF4', // success[50]
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  successText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.success[700],
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', // primary[50]
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    lineHeight: typography.fontSize.sm * 1.4,
  },
});
