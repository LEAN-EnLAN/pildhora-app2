import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { colors, spacing, typography } from '../../../theme/tokens';

interface UpcomingDoseCardProps {
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  onTakeMedication: () => void;
  loading?: boolean;
  style?: any;
}

export const UpcomingDoseCard: React.FC<UpcomingDoseCardProps> = React.memo(({
  medicationName,
  dosage,
  scheduledTime,
  onTakeMedication,
  loading = false,
  style
}) => {
  return (
    <Card 
      variant="elevated" 
      padding="lg" 
      style={[styles.card, style]}
      accessibilityLabel={`Next dose: ${medicationName} ${dosage} scheduled at ${scheduledTime}`}
    >
      <Text style={styles.title}>Próxima dosis</Text>
      
      <View 
        style={styles.medicationInfo}
        accessible={true}
        accessibilityLabel={`${medicationName}, ${dosage}`}
      >
        <Text style={styles.medicationName}>{medicationName}</Text>
        <Text style={styles.dosage}>{dosage}</Text>
      </View>
      
      <View 
        style={styles.timeContainer}
        accessible={true}
        accessibilityLabel={`Scheduled time: ${scheduledTime}`}
      >
        <Text style={styles.timeLabel}>Hora programada</Text>
        <Text style={styles.time}>{scheduledTime}</Text>
      </View>
      
      <Button
        onPress={onTakeMedication}
        variant="primary"
        fullWidth
        loading={loading}
        style={styles.button}
        accessibilityLabel={`Mark ${medicationName} as taken`}
        accessibilityHint="Records that you have taken this medication dose"
      >
        Tomar Medicación
      </Button>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary[50],
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  medicationInfo: {
    marginBottom: spacing.lg,
  },
  medicationName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  dosage: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[700],
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  timeLabel: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  time: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  button: {
    marginTop: spacing.sm,
  },
});
