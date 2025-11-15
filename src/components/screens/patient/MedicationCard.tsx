import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../ui/Card';
import { Chip } from '../../ui/Chip';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';
import { Medication } from '../../../types';

interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
  showLowQuantityBadge?: boolean;
  currentQuantity?: number;
}

export const MedicationCard: React.FC<MedicationCardProps> = React.memo(({
  medication,
  onPress,
  showLowQuantityBadge = false,
  currentQuantity,
}) => {
  /**
   * Formats 24-hour time string to 12-hour format with AM/PM
   * @param time - Time string in HH:MM format (e.g., "14:30")
   * @returns Formatted time string (e.g., "2:30 PM")
   */
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${displayHour}:${minutes} ${ampm}`;
  };

  /**
   * Converts frequency string to human-readable text
   * Frequency is stored as comma-separated day abbreviations (e.g., "Mon,Wed,Fri")
   * @returns User-friendly frequency description
   */
  const getFrequencyText = (): string => {
    if (!medication.frequency) return 'Daily';
    
    const days = medication.frequency.split(',');
    if (days.length === 7) return 'Every day';
    if (days.length === 1) return days[0];
    return `${days.length} days per week`;
  };

  /**
   * Constructs complete dosage text from medication properties
   * Combines doseValue, doseUnit, and quantityType (e.g., "500 mg tablet")
   * Falls back to legacy dosage field if new fields are not available
   * @returns Formatted dosage string
   */
  const getDosageText = (): string => {
    if (medication.doseValue && medication.doseUnit) {
      const quantityText = medication.quantityType ? ` ${medication.quantityType}` : '';
      return `${medication.doseValue} ${medication.doseUnit}${quantityText}`;
    }
    return medication.dosage || 'No dosage specified';
  };

  return (
    <Card
      variant="outlined"
      padding="md"
      onPress={onPress}
      accessibilityLabel={`${medication.name}, ${getDosageText()}, scheduled at ${medication.times.map(formatTime).join(', ')}`}
      accessibilityHint="Tap to view medication details and edit"
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="medkit-outline" size={24} color={colors.primary[500]} />
        </View>
        <View style={styles.medicationInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.medicationName} numberOfLines={1}>
              {medication.name}
            </Text>
            {showLowQuantityBadge && (
              <View 
                style={[
                  styles.lowQuantityBadge,
                  currentQuantity === 0 && styles.outOfStockBadge
                ]}
                accessibilityLabel={
                  currentQuantity === 0 
                    ? 'Medicamento agotado' 
                    : `Inventario bajo: ${currentQuantity} dosis restantes`
                }
              >
                <Ionicons 
                  name={currentQuantity === 0 ? "alert-circle" : "warning"} 
                  size={12} 
                  color="#FFFFFF" 
                />
                <Text style={styles.badgeText}>
                  {currentQuantity === 0 ? 'Agotado' : 'Bajo'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.dosage} numberOfLines={1}>
            {getDosageText()}
          </Text>
        </View>
      </View>

      <View style={styles.timesSection}>
        <Text style={styles.timesLabel}>Scheduled times</Text>
        <View style={styles.timesRow}>
          {medication.times.map((time, index) => (
            <Chip
              key={`${time}-${index}`}
              label={formatTime(time)}
              variant="filled"
              color="primary"
              size="sm"
              accessibilityLabel={`Scheduled at ${formatTime(time)}`}
            />
          ))}
        </View>
      </View>

      <View style={styles.frequencySection}>
        <Ionicons name="calendar-outline" size={16} color={colors.gray[600]} />
        <Text style={styles.frequencyText}>{getFrequencyText()}</Text>
      </View>
    </Card>
  );
});

MedicationCard.displayName = 'MedicationCard';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  medicationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  medicationName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    flex: 1,
  },
  lowQuantityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  outOfStockBadge: {
    backgroundColor: colors.error[500],
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  dosage: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  timesSection: {
    marginTop: spacing.md,
  },
  timesLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequencySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  frequencyText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.sm,
  },
});
