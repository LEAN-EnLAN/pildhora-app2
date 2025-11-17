import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal, Button } from '../../ui';
import { colors, spacing, typography } from '../../../theme/tokens';

/**
 * Props for ExitConfirmationDialog component
 */
export interface ExitConfirmationDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ExitConfirmationDialog Component
 * 
 * Displays a confirmation dialog when the user attempts to exit the wizard
 * with unsaved changes. Prevents accidental data loss.
 * 
 * Accessibility:
 * - Clear action buttons with descriptive labels
 * - Proper focus management
 * - Screen reader announcements
 */
export function ExitConfirmationDialog({ 
  visible, 
  onConfirm, 
  onCancel 
}: ExitConfirmationDialogProps) {
  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      title="¿Salir de la configuración?"
      size="sm"
      animationType="fade"
    >
      <View style={styles.content}>
        <Text style={styles.message}>
          Si sales ahora, perderás el progreso de la configuración del dispositivo. ¿Estás seguro de que deseas salir?
        </Text>

        <View style={styles.actions}>
          <Button
            onPress={onCancel}
            variant="secondary"
            size="md"
            style={styles.button}
            accessibilityLabel="Continuar configuración"
            accessibilityHint="Cierra este diálogo y regresa a la configuración"
          >
            Continuar
          </Button>
          
          <Button
            onPress={onConfirm}
            variant="danger"
            size="md"
            style={styles.button}
            accessibilityLabel="Salir sin guardar"
            accessibilityHint="Descarta el progreso y sale de la configuración"
          >
            Salir
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.sm,
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
