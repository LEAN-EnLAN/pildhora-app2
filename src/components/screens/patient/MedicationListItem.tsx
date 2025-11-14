import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../ui/Card';
import { colors, spacing, typography } from '../../../theme/tokens';

interface MedicationListItemProps {
  medicationName: string;
  dosage: string;
  times: string[];
  status?: 'pending' | 'taken' | 'missed';
  onPress?: () => void;
  style?: any;
}

export const MedicationListItem: React.FC<MedicationListItemProps> = React.memo(({
  medicationName,
  dosage,
  times,
  status = 'pending',
  onPress,
  style
}) => {
  const statusColor = useMemo(() => {
    switch (status) {
      case 'taken':
        return colors.success;
      case 'missed':
        return colors.error;
      case 'pending':
      default:
        return colors.gray[400];
    }
  }, [status]);

  const statusText = useMemo(() => {
    switch (status) {
      case 'taken':
        return 'Tomado';
      case 'missed':
        return 'Perdido';
      case 'pending':
      default:
        return 'Pendiente';
    }
  }, [status]);

  const accessibilityLabel = useMemo(
    () => `${medicationName}, ${dosage}, status: ${statusText}, scheduled times: ${times.join(', ')}`,
    [medicationName, dosage, statusText, times]
  );

  const content = (
    <View style={styles.content}>
      <View style={styles.header}>
        <View 
          style={styles.medicationInfo}
          accessible={true}
          accessibilityLabel={`${medicationName}, ${dosage}`}
        >
          <Text style={styles.medicationName}>{medicationName}</Text>
          <Text style={styles.dosage}>{dosage}</Text>
        </View>
        
        <View 
          style={[styles.statusBadge, { backgroundColor: statusColor }]}
          accessible={true}
          accessibilityLabel={`Status: ${statusText}`}
          accessibilityRole="text"
        >
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
      
      <View 
        style={styles.timesContainer}
        accessible={true}
        accessibilityLabel={`Scheduled times: ${times.join(', ')}`}
      >
        <Text style={styles.timesLabel}>Horarios:</Text>
        <View style={styles.timesList}>
          {times.map((time, index) => (
            <View 
              key={index} 
              style={styles.timeChip}
              accessible={false}
            >
              <Text style={styles.timeText}>{time}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Card 
        variant="outlined" 
        padding="md" 
        onPress={onPress} 
        style={style}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Tap to view medication details"
      >
        {content}
      </Card>
    );
  }

  return (
    <Card 
      variant="outlined" 
      padding="md" 
      style={style}
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </Card>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicationInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  medicationName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  dosage: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.surface,
  },
  timesContainer: {
    gap: spacing.sm,
  },
  timesLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  timesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.medium,
  },
});
