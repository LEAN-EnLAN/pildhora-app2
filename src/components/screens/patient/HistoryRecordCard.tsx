import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../ui/Card';
import { Chip } from '../../ui/Chip';
import { Button } from '../../ui/Button';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';
import { IntakeRecord, IntakeStatus } from '../../../types';

interface HistoryRecordCardProps {
  record: IntakeRecord;
  medication?: {
    id: string;
    name: string;
    dosage: string;
  };
  onMarkAsMissed?: (recordId: string) => void;
  onViewDetails?: (recordId: string) => void;
}

export const HistoryRecordCard: React.FC<HistoryRecordCardProps> = React.memo(({
  record,
  medication,
  onMarkAsMissed,
}) => {
  /**
   * Formats Date object or ISO string to 12-hour time format
   * @param date - Date object or ISO date string
   * @returns Formatted time string (e.g., "2:30 PM")
   */
  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12; // Convert 0 to 12 for midnight
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHour}:${displayMinutes} ${ampm}`;
  };

  /**
   * Returns status-specific configuration for visual styling and labels
   * Maps IntakeStatus enum to colors, icons, and chip variants
   * @returns Configuration object with color, label, icon, and chipColor
   */
  const getStatusConfig = () => {
    switch (record.status) {
      case IntakeStatus.TAKEN:
        return {
          color: colors.success,
          label: 'Taken',
          icon: 'checkmark-circle' as const,
          chipColor: 'success' as const,
        };
      case IntakeStatus.MISSED:
        return {
          color: colors.error,
          label: 'Missed',
          icon: 'close-circle' as const,
          chipColor: 'error' as const,
        };
      case IntakeStatus.PENDING:
      default:
        return {
          color: colors.gray[400],
          label: 'Pending',
          icon: 'time-outline' as const,
          chipColor: 'secondary' as const,
        };
    }
  };

  const statusConfig = getStatusConfig();
  
  // Prefer enriched medication data over record's embedded data
  const medicationName = medication?.name || record.medicationName;
  const dosageText = medication?.dosage || record.dosage;
  const scheduledTime = formatTime(record.scheduledTime);
  
  // Only show "Mark as missed" action for pending records when handler is provided
  const showMarkAsMissed = record.status === IntakeStatus.PENDING && onMarkAsMissed;

  /**
   * Comprehensive accessibility label describing the entire record
   * Includes medication details, times, and status for screen readers
   */
  const accessibilityLabel = `${medicationName}, ${dosageText}, scheduled at ${scheduledTime}, status: ${statusConfig.label}${
    record.takenAt ? `, taken at ${formatTime(record.takenAt)}` : ''
  }`;

  return (
    <Card
      variant="elevated"
      padding="md"
      style={styles.card}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.mainRow}>
        <View style={[styles.statusIndicator, { backgroundColor: statusConfig.color }]} />
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName} numberOfLines={1}>
            {medicationName}
          </Text>
          <Text style={styles.dosage} numberOfLines={1}>
            {dosageText}
          </Text>
          <Text style={styles.scheduledTime}>
            Scheduled: {scheduledTime}
          </Text>
        </View>
        <Chip
          label={statusConfig.label}
          variant="filled"
          color={statusConfig.chipColor}
          size="sm"
          leftIcon={<Ionicons name={statusConfig.icon} size={14} color="#FFFFFF" />}
          accessibilityLabel={`Status: ${statusConfig.label}`}
        />
      </View>

      {record.takenAt && (
        <View style={styles.takenAtInfo}>
          <Text style={styles.takenAtText}>
            Taken at {formatTime(record.takenAt)}
          </Text>
        </View>
      )}

      {showMarkAsMissed && (
        <View style={styles.actionsRow}>
          <Button
            variant="outline"
            size="sm"
            onPress={() => onMarkAsMissed(record.id)}
            accessibilityLabel="Mark as missed"
            accessibilityHint="Marks this medication dose as missed"
          >
            Mark as missed
          </Button>
        </View>
      )}
    </Card>
  );
});

HistoryRecordCard.displayName = 'HistoryRecordCard';

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 4,
    height: 60,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  medicationInfo: {
    flex: 1,
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
    marginBottom: spacing.xs,
  },
  scheduledTime: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  takenAtInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  takenAtText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  actionsRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
