import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../../theme/tokens';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * SkeletonLoader component for displaying loading placeholders
 * Provides a shimmer animation effect for better UX during async operations
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius: customBorderRadius = borderRadius.md,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius: customBorderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * MedicationCardSkeleton - Skeleton loader for medication cards
 */
export const MedicationCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={48} height={48} borderRadius={borderRadius.md} />
        <View style={styles.cardInfo}>
          <SkeletonLoader width="70%" height={20} style={{ marginBottom: spacing.xs }} />
          <SkeletonLoader width="50%" height={16} />
        </View>
      </View>
      <View style={styles.cardTimes}>
        <SkeletonLoader width={80} height={32} borderRadius={borderRadius.full} style={{ marginRight: spacing.sm }} />
        <SkeletonLoader width={80} height={32} borderRadius={borderRadius.full} />
      </View>
      <SkeletonLoader width="60%" height={16} style={{ marginTop: spacing.md }} />
    </View>
  );
};

/**
 * EventCardSkeleton - Skeleton loader for event cards
 */
export const EventCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={48} height={48} borderRadius={borderRadius.md} />
        <View style={styles.cardInfo}>
          <SkeletonLoader width="80%" height={18} style={{ marginBottom: spacing.xs }} />
          <SkeletonLoader width="60%" height={16} style={{ marginBottom: spacing.xs }} />
          <SkeletonLoader width="40%" height={14} />
        </View>
      </View>
    </View>
  );
};

/**
 * ListSkeleton - Skeleton loader for lists
 */
interface ListSkeletonProps {
  count?: number;
  ItemSkeleton?: React.ComponentType;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 3,
  ItemSkeleton = MedicationCardSkeleton,
}) => {
  return (
    <View style={styles.listSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <ItemSkeleton />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray[200],
  },
  cardSkeleton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardTimes: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  listSkeleton: {
    padding: spacing.lg,
  },
  listItem: {
    marginBottom: spacing.md,
  },
});
