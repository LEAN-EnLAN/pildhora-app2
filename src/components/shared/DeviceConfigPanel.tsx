import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

type AlarmMode = 'off' | 'sound' | 'led' | 'both';

interface DeviceConfigPanelProps {
  deviceId: string;
  initialAlarmMode?: AlarmMode;
  initialLedIntensity?: number;
  initialLedColor?: { r: number; g: number; b: number };
  onSave: (config: {
    alarmMode: AlarmMode;
    ledIntensity: number;
    ledColor: { r: number; g: number; b: number };
  }) => void;
  onCancel?: () => void;
  loading?: boolean;
  style?: any;
}

export const DeviceConfigPanel: React.FC<DeviceConfigPanelProps> = React.memo(({
  deviceId,
  initialAlarmMode = 'both',
  initialLedIntensity = 512,
  initialLedColor = { r: 255, g: 255, b: 255 },
  onSave,
  onCancel,
  loading = false,
  style,
}) => {
  const [alarmMode, setAlarmMode] = useState<AlarmMode>(initialAlarmMode);
  const [ledIntensity, setLedIntensity] = useState(initialLedIntensity);
  const [debouncedLedIntensity, setDebouncedLedIntensity] = useState(initialLedIntensity);
  const [ledColor, setLedColor] = useState(initialLedColor);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce LED intensity changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedLedIntensity(ledIntensity);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [ledIntensity]);

  const rgbToHex = useCallback((r: number, g: number, b: number) =>
    `#${[r, g, b]
      .map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0'))
      .join('')}`,
    []
  );

  const currentColorHex = useMemo(
    () => rgbToHex(ledColor.r, ledColor.g, ledColor.b),
    [ledColor, rgbToHex]
  );

  const handleSave = useCallback(() => {
    onSave({
      alarmMode,
      ledIntensity: debouncedLedIntensity,
      ledColor,
    });
  }, [onSave, alarmMode, debouncedLedIntensity, ledColor]);

  const handleColorChange = useCallback((color: { hex: string; rgb: [number, number, number] }) => {
    setLedColor({
      r: color.rgb[0],
      g: color.rgb[1],
      b: color.rgb[2],
    });
  }, []);

  const handleSliderChange = useCallback((value: number) => {
    setLedIntensity(value);
  }, []);

  const handleShowColorPicker = useCallback(() => {
    setShowColorPicker(true);
  }, []);

  const handleHideColorPicker = useCallback(() => {
    setShowColorPicker(false);
  }, []);

  const alarmModes: { value: AlarmMode; label: string }[] = [
    { value: 'off', label: 'Apagado' },
    { value: 'sound', label: 'Sonido' },
    { value: 'led', label: 'LED' },
    { value: 'both', label: 'Ambos' },
  ];

  return (
    <Card variant="elevated" padding="lg" style={style}>
      <Text style={styles.title}>Configuración del Dispositivo</Text>
      <Text style={styles.deviceId}>ID: {deviceId}</Text>

      {/* Alarm Mode Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Modo de alarma</Text>
        <View style={styles.chipContainer}>
          {alarmModes.map((mode) => (
            <Chip
              key={mode.value}
              label={mode.label}
              selected={alarmMode === mode.value}
              onPress={() => setAlarmMode(mode.value)}
              variant="filled"
              color="primary"
              disabled={loading}
              accessibilityLabel={`Alarm mode: ${mode.label}`}
              accessibilityHint={`Sets alarm mode to ${mode.label}`}
            />
          ))}
        </View>
      </View>

      {/* LED Intensity Slider */}
      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sectionLabel}>Intensidad LED</Text>
          <Text style={styles.sliderValue}>{ledIntensity}</Text>
        </View>
        <Slider
          minimumValue={0}
          maximumValue={1023}
          step={1}
          value={ledIntensity}
          onValueChange={handleSliderChange}
          minimumTrackTintColor={colors.primary[500]}
          maximumTrackTintColor={colors.gray[300]}
          thumbTintColor={colors.primary[500]}
          disabled={loading}
          style={styles.slider}
          accessibilityLabel={`LED intensity slider, current value ${ledIntensity}`}
          accessibilityRole="adjustable"
          accessibilityValue={{ min: 0, max: 1023, now: ledIntensity }}
          accessible={true}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabelText}>0</Text>
          <Text style={styles.sliderLabelText}>1023</Text>
        </View>
      </View>

      {/* LED Color Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Color LED</Text>
        <TouchableOpacity
          onPress={handleShowColorPicker}
          disabled={loading}
          style={styles.colorButton}
          accessibilityLabel={`Select LED color, current color is ${currentColorHex}`}
          accessibilityHint="Opens color picker to change LED color"
          accessibilityRole="button"
          accessible={true}
        >
          <View 
            style={[styles.colorPreview, { backgroundColor: currentColorHex }]}
            accessible={false}
          />
          <Text style={styles.colorButtonText}>Editar color</Text>
        </TouchableOpacity>
        <Text style={styles.colorValue}>
          RGB({ledColor.r}, {ledColor.g}, {ledColor.b})
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {onCancel && (
          <Button
            onPress={onCancel}
            variant="outline"
            disabled={loading}
            style={styles.actionButton}
          >
            Cancelar
          </Button>
        )}
        <Button
          onPress={handleSave}
          variant="primary"
          loading={loading}
          style={onCancel ? styles.actionButton : styles.actionButtonFull}
        >
          Guardar cambios
        </Button>
      </View>

      {/* Color Picker Modal */}
      <ColorPicker
        visible={showColorPicker}
        onClose={handleHideColorPicker}
        value={currentColorHex}
        onChange={handleColorChange}
        showPresets={true}
        showCustomPicker={true}
      />
    </Card>
  );
});

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  deviceId: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sliderValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sliderLabelText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    minHeight: 44,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: spacing.md,
  },
  colorButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
  },
  colorValue: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonFull: {
    flex: 1,
  },
});
