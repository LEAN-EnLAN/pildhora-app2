import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';

interface LowQuantityBannerProps {
  currentQuantity: number;
  threshold: number;
  daysRemaining: number;
  onRefill: () => void;
}

/**
 * Banner component that displays low inventory warning on medication detail screen
 * Shows current quantity, days remaining, and refill action button
 */
export const LowQuantityBanner: React.FC<LowQuantityBannerProps> = ({
  currentQuantity,
  threshold,
  daysRemaining,
  onRefill,
}) => {
  const isOutOfStock = currentQuantity === 0;
  const bannerColor = isOutOfStock ? colors.error[500] : colors.warning[500];
  const backgroundColor = isOutOfStock ? colors.error[50] : colors.warning[50];
  const borderColor = isOutOfStock ? colors.error[500] : colors.warning[200];
  const iconName = isOutOfStock ? 'alert-circle' : 'warning';

  return (
    <View 
      style={[styles.container, { backgroundColor, borderColor }]}
      accessibilityRole="alert"
      accessibilityLabel={
        isOutOfStock 
          ? 'Medicamento agotado. Necesita reabastecimiento inmediato.'
          : `Inventario bajo. ${daysRemaining} días restantes. ${currentQuantity} dosis disponibles.`
      }
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={24} color={bannerColor} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: bannerColor }]}>
          {isOutOfStock ? '¡Medicamento agotado!' : '¡Inventario bajo!'}
        </Text>
        
        <Text style={styles.message}>
          {isOutOfStock 
            ? 'No quedan dosis disponibles. Reabastece tu medicamento lo antes posible.'
            : `Solo quedan ${currentQuantity} dosis (aproximadamente ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'})`
          }
        </Text>
        
        <TouchableOpacity
          style={[styles.refillButton, { borderColor: bannerColor }]}
          onPress={onRefill}
          accessibilityRole="button"
          accessibilityLabel="Registrar reabastecimiento"
          accessibilityHint="Abre el diálogo para actualizar la cantidad de medicamento"
        >
          <Ionicons name="add-circle-outline" size={20} color={bannerColor} />
          <Text style={[styles.refillButtonText, { color: bannerColor }]}>
            Registrar reabastecimiento
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: spacing.md,
    paddingTop: spacing.xs,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.md,
  },
  refillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  refillButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
