import { useEffect, useState, useRef } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator, StyleSheet, Animated, Dimensions, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { checkAuthState } from '../src/store/slices/authSlice';
import { getPostAuthRoute } from '../src/services/routing';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme/tokens';
import { AppIcon, Button } from '../src/components/ui';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading, initializing } = useSelector((state: RootState) => state.auth);
  const [isRouting, setIsRouting] = useState(false);
  const [viewState, setViewState] = useState<'landing' | 'roles'>('landing');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Check if user is already authenticated
    dispatch(checkAuthState());

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch]);

  useEffect(() => {
    // Redirect based on auth state only after initialization is complete
    const handleRouting = async () => {
      if (!initializing && !loading) {
        if (isAuthenticated && user) {
          setIsRouting(true);
          try {
            const route = await getPostAuthRoute(user);
            router.replace(route);
          } catch (error: any) {
            console.error('[Index] Routing error:', error);
            Alert.alert('Error de navegación', error.userMessage || 'No se pudo determinar la ruta.');
            setIsRouting(false);
          }
        }
      }
    };

    handleRouting();
  }, [isAuthenticated, user, loading, initializing, router]);

  const handleStart = () => {
    // Animate transition to roles
    Animated.sequence([
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setViewState('roles');
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleRoleSelect = (role: 'patient' | 'caregiver') => {
    router.push(`/auth/signup?role=${role}`);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleBackToLanding = () => {
    Animated.sequence([
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setViewState('landing');
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  if (loading || initializing || isRouting) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#EFF6FF', '#DBEAFE']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0F9FF', '#E0F2FE', '#DBEAFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Animated.View style={{ opacity: contentFadeAnim, width: '100%', alignItems: 'center' }}>
            {viewState === 'landing' ? (
              <>
                <View style={styles.heroSection}>
                  <View style={styles.logoContainer}>
                    <AppIcon size="2xl" showShadow={true} rounded={true} />
                  </View>
                  <Text style={styles.appName}>Pildhora</Text>
                  <Text style={styles.tagline}>Tu salud, simplificada.</Text>
                  <Text style={styles.description}>
                    Gestión inteligente de medicamentos para pacientes y cuidadores.
                    Nunca más olvides una dosis.
                  </Text>
                </View>

                <View style={styles.actionSection}>
                  <Button
                    onPress={handleStart}
                    variant="primary"
                    size="lg"
                    style={styles.startButton}
                  >
                    Comenzar ahora
                  </Button>

                  <TouchableOpacity onPress={handleLogin} style={styles.loginLink}>
                    <Text style={styles.loginText}>
                      ¿Ya tienes cuenta? <Text style={styles.loginTextBold}>Inicia sesión</Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Ionicons name="notifications-outline" size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={styles.featureText}>Recordatorios</Text>
                  </View>
                  <View style={styles.featureDivider} />
                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Ionicons name="people-outline" size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={styles.featureText}>Cuidadores</Text>
                  </View>
                  <View style={styles.featureDivider} />
                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Ionicons name="stats-chart-outline" size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={styles.featureText}>Seguimiento</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.headerSection}>
                  <TouchableOpacity onPress={handleBackToLanding} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.gray[600]} />
                  </TouchableOpacity>
                  <Text style={styles.roleTitle}>Elige tu perfil</Text>
                  <Text style={styles.roleSubtitle}>¿Cómo deseas utilizar Pildhora?</Text>
                </View>

                <View style={styles.cardsContainer}>
                  <TouchableOpacity
                    style={styles.roleCard}
                    onPress={() => handleRoleSelect('patient')}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#F8FAFC']}
                      style={styles.roleCardGradient}
                    >
                      <View style={[styles.roleIconContainer, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="person" size={32} color={colors.primary[500]} />
                      </View>
                      <View style={styles.roleContent}>
                        <Text style={styles.roleName}>Paciente</Text>
                        <Text style={styles.roleDescription}>
                          Quiero gestionar mis propios medicamentos y recibir recordatorios.
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.roleCard}
                    onPress={() => handleRoleSelect('caregiver')}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#F8FAFC']}
                      style={styles.roleCardGradient}
                    >
                      <View style={[styles.roleIconContainer, { backgroundColor: '#F0FDF4' }]}>
                        <Ionicons name="heart" size={32} color={colors.success[500]} />
                      </View>
                      <View style={styles.roleContent}>
                        <Text style={styles.roleName}>Cuidador</Text>
                        <Text style={styles.roleDescription}>
                          Quiero ayudar a un familiar o paciente a gestionar su salud.
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerSection}>
                  <TouchableOpacity onPress={handleLogin}>
                    <Text style={styles.loginText}>
                      ¿Ya tienes cuenta? <Text style={styles.loginTextBold}>Inicia sesión</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  // Landing Styles
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    marginBottom: spacing.xl,
    transform: [{ scale: 1.2 }],
  },
  appName: {
    fontSize: 42,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  startButton: {
    width: '100%',
    height: 60,
    borderRadius: borderRadius['2xl'],
    marginBottom: spacing.lg,
    ...shadows.lg,
    shadowColor: colors.primary[500],
    shadowOpacity: 0.3,
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  loginLink: {
    padding: spacing.sm,
  },
  loginText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  loginTextBold: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.bold,
  },
  featuresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureIcon: {
    opacity: 0.8,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
  },
  featureDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.gray[300],
    marginHorizontal: spacing.lg,
  },

  // Role Selection Styles
  headerSection: {
    width: '100%',
    marginBottom: spacing.xl,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: spacing.xs,
  },
  roleTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  roleSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
  },
  cardsContainer: {
    width: '100%',
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  roleCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    ...shadows.md,
    backgroundColor: '#FFFFFF',
  },
  roleCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  roleName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    lineHeight: 20,
  },
  footerSection: {
    alignItems: 'center',
  },
});
