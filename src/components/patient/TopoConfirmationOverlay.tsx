import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  withSpring,
  Easing,
  RunOnJS,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/tokens';
import * as Haptics from 'expo-haptics';

interface TopoConfirmationOverlayProps {
  visible: boolean;
  onAnimationComplete?: () => void;
}

export const TopoConfirmationOverlay: React.FC<TopoConfirmationOverlayProps> = ({ visible, onAnimationComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Background fade in
      opacity.value = withTiming(1, { duration: 300 });
      
      // Circle pop in
      scale.value = withSpring(1, { damping: 12 });

      // Checkmark pop in with delay
      checkScale.value = withDelay(300, withSpring(1, { damping: 12 }));

      // Auto hide after 4 seconds (3-5s requested)
      const timeout = setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
      }, 4000);

      return () => clearTimeout(timeout);
    } else {
      scale.value = 0;
      opacity.value = 0;
      checkScale.value = 0;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View 
      entering={FadeIn} 
      exiting={FadeOut} 
      style={[styles.container, containerStyle]}
    >
      <View style={styles.overlay} />
      
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.successCircle, circleStyle]}>
          <Animated.View style={checkStyle}>
            <Ionicons name="checkmark" size={120} color={colors.surface} />
          </Animated.View>
        </Animated.View>

        <Animated.Text 
          entering={FadeIn.delay(500)}
          style={styles.title}
        >
          ¡Excelente!
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeIn.delay(700)}
          style={styles.subtitle}
        >
          Dosis registrada correctamente
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.95)', // Success Green
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  successCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 8,
    borderColor: colors.surface,
    ...shadows.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.surface,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
});
