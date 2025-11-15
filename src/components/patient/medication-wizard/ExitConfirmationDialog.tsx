import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal, Button } from '../../ui';
import { colors, spacing, typography } from '../../../theme/tokens';

interface ExitConfirmationDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExitConfirmationDialog({ 
  visible, 
  onConfirm, 
  onCancel 
}: ExitConfirmationDialogProps) {
  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      title="¿Salir sin guardar?"
      size="sm"
      animationType="fade"
    >
      <View style={styles.content}>
        <Text style={styles.message}>
          Tienes cambios sin guardar. Si sales ahora, perderás toda la información ingresada.
        </Text>

        <View style={styles.actions}>
          <Button
            onPress={onCancel}
            variant="secondary"
            size="md"
            style={styles.button}
            accessibilityLabel="Continuar editando"
            accessibilityHint="Cierra el diálogo y regresa al formulario"
          >
            Continuar
          </Button>
          <Button
            onPress={onConfirm}
            variant="danger"
            size="md"
            style={styles.button}
            accessibilityLabel="Salir sin guardar"
            accessibilityHint="Descarta los cambios y sale del formulario"
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
