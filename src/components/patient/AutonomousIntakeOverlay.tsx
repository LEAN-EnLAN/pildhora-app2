import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, TextInput } from 'react-native';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInUp
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, borderRadius, spacing } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

interface AutonomousIntakeOverlayProps {
  visible: boolean;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  icon?: string;
  onTake: () => void;
  onSkip: (reason?: string) => void;
  loading?: boolean;
}

export const AutonomousIntakeOverlay: React.FC<AutonomousIntakeOverlayProps> = ({
  visible,
  medicationName,
  dosage,
  scheduledTime,
  icon = '💊',
  onTake,
  onSkip,
  loading = false
}) => {
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  if (!visible) return null;

  const handleSkipPress = () => {
    setShowSkipReason(true);
  };

  const confirmSkip = () => {
    onSkip(skipReason);
    setShowSkipReason(false);
    setSkipReason('');
  };

  return (
    <Animated.View 
      entering={FadeIn} 
      exiting={FadeOut} 
      style={styles.container}
    >
      <View style={styles.overlay} />
      
      <Animated.View 
        entering={SlideInUp.springify().damping(15)}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>{icon}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Hora de tu medicación</Text>
            <Text style={styles.time}>{scheduledTime}</Text>
          </View>
        </View>

        <View style={styles.medInfo}>
          <Text style={styles.medName}>{medicationName}</Text>
          <Text style={styles.medDosage}>{dosage}</Text>
        </View>

        <View style={styles.actions}>
          {!showSkipReason ? (
            <>
              <TouchableOpacity 
                style={[styles.takeButton, loading && styles.buttonDisabled]} 
                onPress={onTake}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.success[500], colors.success[600]]}
                  style={styles.takeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="checkmark-circle" size={28} color={colors.surface} />
                  <Text style={styles.takeButtonText}>
                    {loading ? 'Registrando...' : 'Tomar Medicación Ahora'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.skipButton, loading && styles.buttonDisabled]} 
                onPress={handleSkipPress}
                disabled={loading}
              >
                <Text style={styles.skipButtonText}>Omitir Dosis</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.skipReasonContainer}>
              <Text style={styles.skipReasonLabel}>¿Por qué vas a omitir esta dosis?</Text>
              <TextInput
                style={styles.input}
                placeholder="Razón (opcional)..."
                value={skipReason}
                onChangeText={setSkipReason}
                multiline
              />
              <View style={styles.skipActions}>
                <TouchableOpacity 
                  style={styles.cancelSkipButton} 
                  onPress={() => setShowSkipReason(false)}
                >
                  <Text style={styles.cancelSkipText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmSkipButton} 
                  onPress={confirmSkip}
                >
                  <Text style={styles.confirmSkipText}>Confirmar Omisión</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
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
    zIndex: 9998, // Just below TopoAlarmOverlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconEmoji: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  medInfo: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  medName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 4,
    textAlign: 'center',
  },
  medDosage: {
    fontSize: 18,
    color: colors.gray[600],
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  takeButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  takeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  takeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.surface,
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.gray[500],
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  skipReasonContainer: {
    gap: spacing.md,
  },
  skipReasonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  skipActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelSkipButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
  },
  cancelSkipText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
  },
  confirmSkipButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.error[500],
    borderRadius: borderRadius.lg,
  },
  confirmSkipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
  },
});
