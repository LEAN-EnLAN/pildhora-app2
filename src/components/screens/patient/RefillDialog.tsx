import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Modal, Button } from '../../ui';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';
import { Medication } from '../../../types';

interface RefillDialogProps {
  visible: boolean;
  medication: Medication;
  onConfirm: (newQuantity: number) => Promise<void>;
  onCancel: () => void;
}

/**
 * Dialog component for refilling medication inventory
 * Allows user to input new quantity and updates refill date automatically
 */
export const RefillDialog: React.FC<RefillDialogProps> = ({
  visible,
  medication,
  onConfirm,
  onCancel,
}) => {
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    const parsedQuantity = parseInt(quantity, 10);

    // Validation
    if (!quantity.trim()) {
      Alert.alert('Error', 'Por favor ingrese una cantidad');
      return;
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Error', 'Por favor ingrese una cantidad válida mayor a 0');
      return;
    }

    if (parsedQuantity > 9999) {
      Alert.alert('Error', 'La cantidad no puede ser mayor a 9999');
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirm(parsedQuantity);
      setQuantity(''); // Reset input
      Alert.alert('Éxito', 'Inventario actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el inventario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setQuantity(''); // Reset input
    onCancel();
  };

  // Calculate visual preview
  const parsedQuantity = parseInt(quantity, 10);
  const showPreview = !isNaN(parsedQuantity) && parsedQuantity > 0;

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title="Registrar reabastecimiento"
      size="md"
      animationType="slide"
    >
      <View style={styles.content}>
        <Text style={styles.medicationName}>{medication.name}</Text>
        
        <View style={styles.inputSection}>
          <Text style={styles.label}>Nueva cantidad</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            placeholder="Ingrese cantidad"
            placeholderTextColor={colors.gray[400]}
            maxLength={4}
            accessibilityLabel="Cantidad de reabastecimiento"
            accessibilityHint="Ingrese el número de dosis después del reabastecimiento"
          />
          
          {showPreview && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Vista previa:</Text>
              <View style={styles.previewPills}>
                {Array.from({ length: Math.min(parsedQuantity, 10) }).map((_, index) => (
                  <View key={index} style={styles.pill} />
                ))}
                {parsedQuantity > 10 && (
                  <Text style={styles.previewMore}>+{parsedQuantity - 10} más</Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            La fecha de reabastecimiento se actualizará automáticamente a hoy.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            onPress={handleCancel}
            variant="secondary"
            size="md"
            style={styles.actionButton}
            disabled={isSubmitting}
            accessibilityLabel="Cancelar"
            accessibilityHint="Cierra el diálogo sin actualizar el inventario"
          >
            Cancelar
          </Button>
          <Button
            onPress={handleConfirm}
            variant="primary"
            size="md"
            style={styles.actionButton}
            loading={isSubmitting}
            accessibilityLabel="Confirmar reabastecimiento"
            accessibilityHint="Actualiza el inventario con la nueva cantidad"
          >
            Confirmar
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.sm,
  },
  medicationName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  previewContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.sm,
  },
  previewLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  previewPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  pill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
  },
  previewMore: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  infoBox: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    lineHeight: typography.fontSize.sm * 1.5,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
