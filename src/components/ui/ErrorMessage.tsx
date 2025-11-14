import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Animated } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'banner' | 'toast';
  style?: ViewStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  variant = 'inline',
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in with shake effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 100,
      }),
    ]).start(() => {
      // Shake animation for error icon
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const containerStyle = [
    styles.container,
    styles[`variant_${variant}`],
    style,
  ];

  return (
    <Animated.View 
      style={[
        containerStyle,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessible={true}
      accessibilityLabel={`Error: ${message}`}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{ translateX: shakeAnim }],
            },
          ]}
          accessible={false}
        >
          <Text style={styles.icon}>⚠️</Text>
        </Animated.View>
        <Text style={styles.message}>{message}</Text>
      </View>

      {(onRetry || onDismiss) && (
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              style={styles.button}
              accessibilityLabel="Retry action"
              accessibilityHint="Attempts the previous action again"
              accessibilityRole="button"
              accessible={true}
            >
              <Text style={styles.buttonText}>Reintentar</Text>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.dismissButton}
              accessibilityLabel="Dismiss error message"
              accessibilityHint="Closes this error message"
              accessibilityRole="button"
              accessible={true}
            >
              <Text style={styles.dismissButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.error + '15', // 15% opacity
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  variant_inline: {
    // Default styles
  },
  variant_banner: {
    borderRadius: 0,
    borderLeftWidth: 0,
    borderTopWidth: 4,
    borderTopColor: colors.error,
  },
  variant_toast: {
    ...StyleSheet.absoluteFillObject,
    top: undefined,
    bottom: spacing['2xl'],
    marginHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: typography.fontSize.lg,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[800],
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: borderRadius.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  dismissButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    fontWeight: typography.fontWeight.bold,
  },
});
