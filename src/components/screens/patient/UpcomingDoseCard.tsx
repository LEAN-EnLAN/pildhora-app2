import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { colors, spacing, typography } from '../../../theme/tokens';
import { triggerHapticFeedback, HapticFeedbackType, announceForAccessibility } from '../../../utils/accessibility';

interface UpcomingDoseCardProps {
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  onTakeMedication: () => void;
  loading?: boolean;
  isCompleted?: boolean;
  completedAt?: Date;
  style?: any;
}

export const UpcomingDoseCard: React.FC<UpcomingDoseCardProps> = React.memo(({
  medicationName,
  dosage,
  scheduledTime,
  onTakeMedication,
  loading = false,
  isCompleted = false,
  completedAt,
  style
}) => {
  const completedTimeStr = completedAt 
    ? completedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : '';

  const cardStyle = isCompleted 
    ? { ...styles.card, ...styles.cardCompleted, ...style }
    : { ...styles.card, ...style };

  // Handle dose taking with haptic feedback
  const handleTakeDose = useCallback(async () => {
    if (!isCompleted) {
      // Trigger haptic feedback for dose completion
      await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
      
      // Announce for screen readers
      announceForAccessibility(`Registrando dosis de ${medicationName}`);
      
      onTakeMedication();
    }
  }, [isCompleted, medicationName, onTakeMedication]);

  return (
    <Card 
      variant="elevated" 
      padding="lg" 
      style={cardStyle}
      accessibilityLabel={`Next dose: ${medicationName} ${dosage} scheduled at ${scheduledTime}${isCompleted ? ' - Already taken' : ''}`}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>Próxima dosis</Text>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.completedBadgeText}>Completada</Text>
          </View>
        )}
      </View>
      
      <View 
        style={styles.medicationInfo}
        accessible={true}
        accessibilityLabel={`${medicationName}, ${dosage}`}
      >
        <Text style={[styles.medicationName, isCompleted && styles.textCompleted]}>
          {medicationName}
        </Text>
        <Text style={[styles.dosage, isCompleted && styles.textCompleted]}>
          {dosage}
        </Text>
      </View>
      
      <View 
        style={styles.timeContainer}
        accessible={true}
        accessibilityLabel={`Scheduled time: ${scheduledTime}`}
      >
        <Text style={styles.timeLabel}>Hora programada</Text>
        <Text style={[styles.time, isCompleted && styles.textCompleted]}>
          {scheduledTime}
        </Text>
      </View>
      
      {isCompleted && completedTimeStr && (
        <View style={styles.completedInfo}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
          <Text style={styles.completedInfoText}>
            Tomado a las {completedTimeStr}
          </Text>
        </View>
      )}
      
      <Button
        onPress={handleTakeDose}
        variant={isCompleted ? "secondary" : "primary"}
        fullWidth
        loading={loading}
        disabled={isCompleted}
        style={styles.button}
        accessibilityLabel={isCompleted ? `${medicationName} ya tomado` : `Registrar ${medicationName} como tomado`}
        accessibilityHint={isCompleted ? "Esta dosis ya ha sido registrada" : "Registra que has tomado esta dosis de medicamento"}
      >
        {isCompleted ? 'Dosis Registrada' : 'Tomar Medicación'}
      </Button>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary[50],
  },
  cardCompleted: {
    backgroundColor: colors.gray[50],
    opacity: 0.9,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[600],
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  completedBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
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
  textCompleted: {
    color: colors.gray[500],
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
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  completedInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  button: {
    marginTop: spacing.sm,
  },
});
