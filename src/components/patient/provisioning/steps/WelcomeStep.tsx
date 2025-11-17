import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../../theme/tokens';
import { useWizardContext } from '../WizardContext';
import { announceForAccessibility } from '../../../../utils/accessibility';

/**
 * WelcomeStep Component
 * 
 * First step of the device provisioning wizard. Provides an overview
 * of the setup process, visual guides for locating the device ID,
 * and troubleshooting tips.
 * 
 * Requirements: 3.1, 11.1, 11.4
 */
export function WelcomeStep() {
  const { setCanProceed } = useWizardContext();

  // Welcome step can always proceed
  useEffect(() => {
    setCanProceed(true);
    announceForAccessibility('Bienvenido al asistente de configuración del dispositivo');
  }, [setCanProceed]);

  const handleHelpPress = () => {
    // Open help documentation or support page
    Linking.openURL('https://support.example.com/device-setup');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="hardware-chip" size={48} color={colors.primary[500]} />
        </View>
        <Text style={styles.title}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>
          Configuremos tu dispositivo dispensador de medicamentos
        </Text>
      </View>

      {/* Setup Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Qué haremos?</Text>
        <Text style={styles.sectionText}>
          Este asistente te guiará paso a paso para configurar tu dispositivo. El proceso tomará aproximadamente 5 minutos.
        </Text>
      </View>

      {/* Steps Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pasos de configuración</Text>
        
        <View style={styles.stepsList}>
          <StepPreview
            icon="keypad-outline"
            title="Ingresar ID del dispositivo"
            description="Introduce el código único de tu dispositivo"
          />
          <StepPreview
            icon="checkmark-circle-outline"
            title="Verificar dispositivo"
            description="Confirmaremos que tu dispositivo está disponible"
          />
          <StepPreview
            icon="wifi-outline"
            title="Configurar WiFi"
            description="Conecta tu dispositivo a tu red WiFi"
          />
          <StepPreview
            icon="settings-outline"
            title="Personalizar preferencias"
            description="Ajusta alarmas, LED y volumen"
          />
        </View>
      </View>

      {/* Device ID Location Guide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Dónde encuentro el ID del dispositivo?</Text>
        <View style={styles.guideCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary[500]} style={styles.guideIcon} />
          <View style={styles.guideContent}>
            <Text style={styles.guideText}>
              El ID del dispositivo es un código alfanumérico de 5-100 caracteres ubicado en:
            </Text>
            <View style={styles.locationList}>
              <Text style={styles.locationItem}>• Parte inferior del dispositivo</Text>
              <Text style={styles.locationItem}>• Etiqueta en la caja del producto</Text>
              <Text style={styles.locationItem}>• Manual de usuario</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Troubleshooting Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consejos útiles</Text>
        
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={colors.warning[500]} />
          <Text style={styles.tipText}>
            Asegúrate de tener tu dispositivo cerca y encendido
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={colors.warning[500]} />
          <Text style={styles.tipText}>
            Ten a mano tu contraseña de WiFi
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={colors.warning[500]} />
          <Text style={styles.tipText}>
            El proceso puede pausarse y reanudarse en cualquier momento
          </Text>
        </View>
      </View>

      {/* Help Link */}
      <TouchableOpacity 
        style={styles.helpButton}
        onPress={handleHelpPress}
        accessibilityRole="button"
        accessibilityLabel="Obtener ayuda adicional"
        accessibilityHint="Abre la página de soporte en tu navegador"
      >
        <Ionicons name="help-circle-outline" size={20} color={colors.primary[500]} />
        <Text style={styles.helpButtonText}>¿Necesitas ayuda adicional?</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.primary[500]} />
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * StepPreview Component
 * 
 * Displays a preview of an upcoming wizard step with icon, title, and description.
 */
interface StepPreviewProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function StepPreview({ icon, title, description }: StepPreviewProps) {
  return (
    <View style={styles.stepPreview}>
      <View style={styles.stepIconContainer}>
        <Ionicons name={icon} size={24} color={colors.primary[500]} />
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
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
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: '#EFF6FF', // primary[50]
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    lineHeight: typography.fontSize.base * 1.5,
  },
  stepsList: {
    gap: spacing.md,
  },
  stepPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#EFF6FF', // primary[50]
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    lineHeight: typography.fontSize.sm * 1.4,
  },
  guideCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF', // primary[50]
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  guideIcon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  guideContent: {
    flex: 1,
  },
  guideText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[800],
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.base * 1.5,
  },
  locationList: {
    gap: spacing.xs,
  },
  locationItem: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    lineHeight: typography.fontSize.sm * 1.4,
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
    lineHeight: typography.fontSize.sm * 1.4,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[300],
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  helpButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
});
