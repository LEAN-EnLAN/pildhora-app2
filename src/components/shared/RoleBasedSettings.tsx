import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SuccessMessage } from '../ui/SuccessMessage';
import { ErrorMessage } from '../ui/ErrorMessage';
import { NotificationSettings } from './NotificationSettings';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setNotificationsEnabled,
  setNotificationHierarchy,
  setNotificationPermissionStatus,
  addModality,
  removeModality,
  savePreferencesToBackend,
  savePermissionsToBackend,
} from '../../store/slices/preferencesSlice';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { ensurePushTokensRegistered } from '../../services/notifications/push';
import { colors, spacing, typography } from '../../theme/tokens';
import { useRouter } from 'expo-router';
import { useUserRole } from '../../hooks/useUserRole';
import { Ionicons } from '@expo/vector-icons';

/**
 * Role-based settings screen component
 * 
 * Displays different settings based on user role:
 * - Patients: Profile, notifications, device info, device management
 * - Caregivers: Profile, notifications, device info, patient management
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function RoleBasedSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((s: RootState) => s.auth);
  const prefs = useSelector((s: RootState) => s.preferences);
  const { role, isPatient, isCaregiver } = useUserRole();
  const uid = user?.id || '';

  const [notifStatus, setNotifStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const appVersion = Constants?.expoConfig?.version || '0.0.0';

  useEffect(() => {
    let mounted = true;
    Notifications.getPermissionsAsync().then((r) => {
      if (!mounted) return;
      const status = r.status as 'granted' | 'denied' | 'undetermined';
      setNotifStatus(status);
      dispatch(setNotificationPermissionStatus(status));
    });
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      dispatch(setNotificationsEnabled(enabled));
      if (uid) {
        await dispatch(savePreferencesToBackend(uid));
        showSuccess(enabled ? 'Notificaciones habilitadas' : 'Notificaciones deshabilitadas');
      }
    } catch (error) {
      showError('Error al guardar preferencias');
    }
  };

  const handleRequestNotifications = async () => {
    try {
      const res = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      } as any);
      const status = res.status as 'granted' | 'denied' | 'undetermined';
      setNotifStatus(status);
      dispatch(setNotificationPermissionStatus(status));

      if (status === 'granted' && uid) {
        await ensurePushTokensRegistered(uid);
        await dispatch(savePermissionsToBackend(uid));
        showSuccess('Permisos de notificación concedidos');
      } else if (status === 'denied') {
        showError('Permisos de notificación denegados. Por favor, habilítalos en la configuración del sistema.');
      }
    } catch (error) {
      showError('Error al solicitar permisos de notificación');
    }
  };

  const handleUpdateHierarchy = async (hierarchy: string[]) => {
    try {
      dispatch(setNotificationHierarchy(hierarchy));
      if (uid) {
        await dispatch(savePreferencesToBackend(uid));
        showSuccess('Prioridad actualizada');
      }
    } catch (error) {
      showError('Error al actualizar prioridad');
    }
  };

  const handleAddModality = async (name: string) => {
    try {
      dispatch(addModality(name));

      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync(name, {
            name,
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: 'default',
          });
        } catch (e) {
          console.warn('Failed to create notification channel:', e);
        }
      }

      if (uid) {
        await dispatch(savePreferencesToBackend(uid));
        showSuccess(`Modalidad "${name}" agregada`);
      }
    } catch (error) {
      showError('Error al agregar modalidad');
    }
  };

  const handleRemoveModality = async (name: string) => {
    try {
      dispatch(removeModality(name));
      if (uid) {
        await dispatch(savePreferencesToBackend(uid));
        showSuccess(`Modalidad "${name}" eliminada`);
      }
    } catch (error) {
      showError('Error al eliminar modalidad');
    }
  };

  // Get custom modalities (those not in the default set)
  const defaultModalities = ['urgent', 'medication', 'general'];
  const customModalities = prefs.notifications.hierarchy.filter((m) => !defaultModalities.includes(m));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configuraciones</Text>
          <Text style={styles.headerSubtitle}>
            {isPatient ? 'Personaliza tu experiencia' : 'Gestiona tu cuenta de cuidador'}
          </Text>
        </View>

        {/* Success/Error Messages */}
        {successMessage && (
          <View style={styles.messageContainer}>
            <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} autoDismiss={true} duration={3000} />
          </View>
        )}

        {errorMessage && (
          <View style={styles.messageContainer}>
            <ErrorMessage message={errorMessage} onDismiss={() => setErrorMessage(null)} variant="banner" />
          </View>
        )}

        {/* Profile Section */}
        <View style={styles.section}>
          <Card variant="elevated" padding="lg">
            <View style={styles.profileRow}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || (isPatient ? 'Paciente' : 'Cuidador')}</Text>
                <Text style={styles.profileEmail}>{user?.email || ''}</Text>
                <View style={styles.roleBadge}>
                  <Ionicons name={isPatient ? 'person' : 'people'} size={14} color={colors.primary[500]} />
                  <Text style={styles.roleBadgeText}>{isPatient ? 'Paciente' : 'Cuidador'}</Text>
                </View>
              </View>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => router.push(isPatient ? '/patient/edit-profile' : '/caregiver/edit-profile')}
                accessibilityLabel="Editar perfil"
              >
                Editar perfil
              </Button>
            </View>
          </Card>
        </View>

        {/* Patient-specific: Device Management Section */}
        {isPatient && user?.deviceId && (
          <View style={styles.section}>
            <Card variant="elevated" padding="lg">
              <View style={styles.sectionHeader}>
                <Ionicons name="hardware-chip-outline" size={24} color={colors.primary[500]} />
                <Text style={styles.sectionTitle}>Mi dispositivo</Text>
              </View>
              <Text style={styles.sectionDescription}>Gestiona tu dispositivo Pillbox y las conexiones de cuidadores</Text>
              <Button
                variant="primary"
                size="md"
                onPress={() => router.push('/patient/device-settings')}
                style={styles.deviceButton}
                accessibilityLabel="Gestionar dispositivo"
              >
                Gestionar dispositivo
              </Button>
            </Card>
          </View>
        )}

        {/* Caregiver-specific: Patient Management Section */}
        {isCaregiver && (
          <View style={styles.section}>
            <Card variant="elevated" padding="lg">
              <View style={styles.sectionHeader}>
                <Ionicons name="people-outline" size={24} color={colors.primary[500]} />
                <Text style={styles.sectionTitle}>Mis pacientes</Text>
              </View>
              <Text style={styles.sectionDescription}>Gestiona las conexiones con tus pacientes</Text>
              <Button
                variant="primary"
                size="md"
                onPress={() => router.push('/caregiver/add-device')}
                style={styles.deviceButton}
                accessibilityLabel="Gestionar pacientes"
              >
                Gestionar pacientes
              </Button>
            </Card>
          </View>
        )}

        {/* Notification Settings Section */}
        <View style={styles.section}>
          <NotificationSettings
            enabled={prefs.notifications.enabled}
            permissionStatus={notifStatus}
            hierarchy={prefs.notifications.hierarchy}
            customModalities={customModalities}
            onToggleEnabled={handleToggleNotifications}
            onUpdateHierarchy={handleUpdateHierarchy}
            onAddModality={handleAddModality}
            onRemoveModality={handleRemoveModality}
            onRequestPermission={handleRequestNotifications}
          />
        </View>

        {/* Device Info Section */}
        <View style={styles.section}>
          <Card variant="elevated" padding="lg">
            <Text style={styles.sectionTitle}>Información del dispositivo</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sistema operativo</Text>
              <Text style={styles.infoValue}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versión de la app</Text>
              <Text style={styles.infoValue}>{appVersion}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de cuenta</Text>
              <Text style={styles.infoValue}>{isPatient ? 'Paciente' : 'Cuidador'}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  messageContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  profileName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  deviceButton: {
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.medium,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.xs,
  },
});
