import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../ui/Card';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';
import Svg, { Circle } from 'react-native-svg';

interface AdherenceCardProps {
  takenCount: number;
  totalCount: number;
  style?: any;
}

export const AdherenceCard: React.FC<AdherenceCardProps> = React.memo(({
  takenCount,
  totalCount,
  style
}) => {
  const percentage = useMemo(
    () => totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0,
    [takenCount, totalCount]
  );
  
  // Progress ring calculations
  const progressRingData = useMemo(() => {
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = circumference - (percentage / 100) * circumference;
    
    return { size, strokeWidth, radius, circumference, progress };
  }, [percentage]);
  
  const { size, strokeWidth, radius, circumference, progress } = progressRingData;

  return (
    <Card 
      variant="elevated" 
      padding="lg" 
      style={style}
      accessibilityLabel={`Adherence status: ${percentage} percent complete. ${takenCount} of ${totalCount} doses taken today`}
    >
      <Text style={styles.title}>Estado del día</Text>
      
      <View 
        style={styles.progressContainer}
        accessible={true}
        accessibilityLabel={`${percentage} percent adherence`}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percentage }}
      >
        <Svg width={size} height={size} accessible={false}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.gray[200]}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.success}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        <View style={styles.percentageContainer} accessible={false}>
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>
      </View>
      
      <Text 
        style={styles.subtitle}
        accessible={true}
        accessibilityLabel={`${takenCount} of ${totalCount} doses taken`}
      >
        {takenCount} de {totalCount} dosis tomadas
      </Text>
    </Card>
  );
});

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    position: 'relative',
  },
  percentageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
