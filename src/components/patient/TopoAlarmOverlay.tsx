import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Vibration } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../../theme/tokens';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface TopoAlarmOverlayProps {
  visible: boolean;
  medicationName?: string;
  scheduledTime?: string;
}

export const TopoAlarmOverlay: React.FC<TopoAlarmOverlayProps> = ({ visible, medicationName, scheduledTime }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      // Start pulsing animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite
        true // Reverse
      );
      
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1000 }),
          withTiming(0.8, { duration: 1000 })
        ),
        -1,
        true
      );

      // Haptic feedback loop
      const interval = setInterval(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 2000);

      return () => clearInterval(interval);
    } else {
      scale.value = 1;
      opacity.value = 0.8;
    }
  }, [visible]);

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      exiting={FadeOut.duration(300)} 
      style={styles.container}
    >
      <View style={styles.overlay} />
      
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.pulseCircle, animatedCircleStyle]} />
        
        <View style={styles.iconContainer}>
          <Ionicons name="medkit" size={80} color={colors.surface} />
        </View>

        <Text style={styles.title}>¡Hora de tu medicamento!</Text>
        {medicationName && <Text style={styles.medicationName}>{medicationName}</Text>}
        {scheduledTime && <Text style={styles.time}>{scheduledTime}</Text>}
        <Text style={styles.subtitle}>Por favor, toma tu dosis ahora</Text>
        
        <View style={styles.instructionBox}>
          <Ionicons name="arrow-down-circle-outline" size={24} color={colors.primary[700]} />
          <Text style={styles.instructionText}>Presiona el botón en tu pastillero</Text>
        </View>
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
    zIndex: 9999, // Topmost layer
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 87, 34, 0.9)', // High visibility orange/red
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pulseCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.error[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    ...shadows.lg,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.surface,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  medicationName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.surface,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  time: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.surface,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 48,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 50,
    gap: 12,
    ...shadows.md,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[700],
  },
});
