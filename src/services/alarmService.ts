import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  withRetry,
  handleError,
  createPlatformError,
  createPermissionError,
  showPermissionGuidance,
  ApplicationError,
  ErrorCategory,
  ErrorSeverity,
} from '../utils/errorHandling';

/**
 * AlarmService - Abstraction layer for platform-specific alarm APIs
 * 
 * This service provides a unified interface for creating, updating, and deleting
 * medication alarms across iOS and Android platforms using expo-notifications.
 * 
 * Features:
 * - Platform-specific alarm creation (iOS: UNCalendarNotificationTrigger, Android: AlarmManager)
 * - Permission request flow with user guidance
 * - Alarm ID storage for future updates/deletions
 * - Fallback to in-app notifications if permissions denied
 */

// Error types for alarm operations
export class AlarmServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AlarmServiceError';
  }
}

// Alarm configuration interface
export interface AlarmConfig {
  medicationId: string;
  medicationName: string;
  time: string; // Format: "HH:MM" (24-hour)
  days: number[]; // 0-6, where 0 is Sunday
  emoji?: string;
}

// Alarm result interface
export interface AlarmResult {
  alarmId: string;
  success: boolean;
  fallbackToInApp: boolean;
}

// Permission status type
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

// Storage key for alarm mappings
const ALARM_STORAGE_KEY = 'medication_alarms';

/**
 * AlarmService class
 */
class AlarmService {
  private permissionStatus: PermissionStatus = 'undetermined';
  private alarmMappings: Map<string, string[]> = new Map(); // medicationId -> alarmIds[]

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the alarm service
   */
  private async initializeService(): Promise<void> {
    try {
      // Load alarm mappings from storage
      await this.loadAlarmMappings();
      
      // Check current permission status
      await this.checkPermissionStatus();
      
      // Configure notification handler
      this.configureNotificationHandler();
    } catch (error) {
      console.error('[AlarmService] Initialization error:', error);
    }
  }

  /**
   * Configure the notification handler for when notifications are received
   */
  private configureNotificationHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  /**
   * Load alarm mappings from AsyncStorage
   */
  private async loadAlarmMappings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(ALARM_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.alarmMappings = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('[AlarmService] Failed to load alarm mappings:', error);
    }
  }

  /**
   * Save alarm mappings to AsyncStorage
   */
  private async saveAlarmMappings(): Promise<void> {
    try {
      const obj = Object.fromEntries(this.alarmMappings);
      await AsyncStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('[AlarmService] Failed to save alarm mappings:', error);
    }
  }

  /**
   * Check if the app can schedule alarms
   */
  async canScheduleAlarms(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[AlarmService] Error checking alarm permissions:', error);
      return false;
    }
  }

  /**
   * Check current permission status
   */
  private async checkPermissionStatus(): Promise<void> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      this.permissionStatus = status as PermissionStatus;
    } catch (error) {
      console.error('[AlarmService] Error checking permission status:', error);
      this.permissionStatus = 'undetermined';
    }
  }

  /**
   * Request notification permissions with user guidance
   */
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      if (existingStatus === 'granted') {
        this.permissionStatus = 'granted';
        return 'granted';
      }

      // Show guidance to user before requesting
      if (existingStatus === 'undetermined') {
        // Show permission guidance
        const shouldRequest = await showPermissionGuidance('NOTIFICATIONS', false);
        
        if (!shouldRequest) {
          this.permissionStatus = 'denied';
          return 'denied';
        }

        // Request permissions
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        
        this.permissionStatus = status as PermissionStatus;
        return status as PermissionStatus;
      }

      // Permission was denied - show settings guidance
      await showPermissionGuidance('NOTIFICATIONS', true);
      this.permissionStatus = 'denied';
      return 'denied';
    } catch (error: any) {
      const appError = await handleError(
        error,
        { operation: 'request_permissions' },
        false
      );
      console.error('[AlarmService] Error requesting permissions:', appError.message);
      throw new AlarmServiceError(
        'Failed to request notification permissions',
        'PERMISSION_REQUEST_FAILED',
        'No se pudieron solicitar los permisos de notificación. Por favor, intenta nuevamente.',
        true
      );
    }
  }

  /**
   * Show permission guidance dialog
   */
  async showPermissionGuidance(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Permisos de Notificación',
        'Para recibir recordatorios de medicamentos, necesitamos tu permiso para enviar notificaciones.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Permitir',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }

  /**
   * Show settings guidance when permissions are denied
   */
  showSettingsGuidance(): void {
    Alert.alert(
      'Permisos Denegados',
      'Los permisos de notificación están desactivados. Para recibir recordatorios de medicamentos, por favor activa las notificaciones en la configuración de tu dispositivo.',
      [
        {
          text: 'Entendido',
          style: 'cancel',
        },
      ]
    );
  }

  /**
   * Create an alarm for a medication
   */
  async createAlarm(config: AlarmConfig): Promise<AlarmResult> {
    try {
      // Validate config
      if (!config.medicationId || !config.medicationName || !config.time || !config.days || config.days.length === 0) {
        throw new AlarmServiceError(
          'Invalid alarm configuration',
          'INVALID_CONFIG',
          'La configuración de la alarma no es válida.',
          false
        );
      }

      // Check permissions first
      const hasPermission = await this.canScheduleAlarms();
      
      if (!hasPermission) {
        const status = await this.requestPermissions();
        
        if (status !== 'granted') {
          // Fallback to in-app notifications
          console.log('[AlarmService] Permissions denied, falling back to in-app notifications');
          return {
            alarmId: `fallback_${config.medicationId}_${Date.now()}`,
            success: true,
            fallbackToInApp: true,
          };
        }
      }

      // Parse time
      const [hours, minutes] = config.time.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new AlarmServiceError(
          `Invalid time format: ${config.time}`,
          'INVALID_TIME_FORMAT',
          'El formato de hora no es válido. Usa el formato HH:MM.',
          false
        );
      }

      // Create notification content
      const content: Notifications.NotificationContentInput = {
        title: '💊 Recordatorio de Medicamento',
        body: `Es hora de tomar ${config.emoji || '💊'} ${config.medicationName}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          medicationId: config.medicationId,
          medicationName: config.medicationName,
          type: 'medication_alarm',
        },
      };

      // Schedule notifications for each day with retry logic
      const alarmIds: string[] = [];
      
      for (const day of config.days) {
        try {
          const trigger = this.createTrigger(hours, minutes, day);
          
          const notificationId = await withRetry(
            async () => {
              return await Notifications.scheduleNotificationAsync({
                content,
                trigger,
              });
            },
            { maxAttempts: 2, initialDelayMs: 500 },
            { operation: 'schedule_notification', medicationId: config.medicationId, day }
          );
          
          alarmIds.push(notificationId);
        } catch (error: any) {
          const appError = await handleError(
            error,
            { operation: 'schedule_notification', medicationId: config.medicationId, day },
            false
          );
          console.error('[AlarmService] Failed to schedule notification for day:', day, appError.message);
          // Continue with other days even if one fails
        }
      }

      if (alarmIds.length === 0) {
        throw new AlarmServiceError(
          'Failed to schedule any notifications',
          'ALARM_CREATION_FAILED',
          'No se pudo crear ningún recordatorio. Por favor, intenta nuevamente.',
          true
        );
      }

      // Store alarm IDs with retry logic
      await withRetry(
        async () => {
          const existingAlarms = this.alarmMappings.get(config.medicationId) || [];
          this.alarmMappings.set(config.medicationId, [...existingAlarms, ...alarmIds]);
          await this.saveAlarmMappings();
        },
        { maxAttempts: 2, initialDelayMs: 500 },
        { operation: 'save_alarm_mappings', medicationId: config.medicationId }
      );

      console.log('[AlarmService] Created alarms:', alarmIds);

      return {
        alarmId: alarmIds.join(','), // Return comma-separated IDs
        success: true,
        fallbackToInApp: false,
      };
    } catch (error: any) {
      const appError = await handleError(
        error,
        { operation: 'create_alarm', medicationId: config.medicationId },
        false
      );
      console.error('[AlarmService] Error creating alarm:', appError.message);
      
      if (error instanceof AlarmServiceError) {
        throw error;
      }
      
      throw new AlarmServiceError(
        `Failed to create alarm: ${error.message}`,
        'ALARM_CREATION_FAILED',
        'No se pudo crear el recordatorio. Por favor, intenta nuevamente.',
        true
      );
    }
  }

  /**
   * Create platform-specific trigger
   */
  private createTrigger(
    hours: number,
    minutes: number,
    weekday: number
  ): Notifications.NotificationTriggerInput {
    if (Platform.OS === 'ios') {
      // iOS: Use calendar trigger (UNCalendarNotificationTrigger)
      return {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        weekday: weekday + 1, // iOS uses 1-7 (Sunday = 1)
        repeats: true,
      };
    } else {
      // Android: Use calendar trigger with AlarmManager
      return {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        weekday: weekday + 1, // Convert to 1-7
        repeats: true,
      };
    }
  }

  /**
   * Update an alarm
   */
  async updateAlarm(
    medicationId: string,
    config: AlarmConfig
  ): Promise<AlarmResult> {
    try {
      // Delete existing alarms
      await this.deleteAlarm(medicationId);
      
      // Create new alarms
      return await this.createAlarm(config);
    } catch (error: any) {
      console.error('[AlarmService] Error updating alarm:', error);
      
      if (error instanceof AlarmServiceError) {
        throw error;
      }
      
      throw new AlarmServiceError(
        `Failed to update alarm: ${error.message}`,
        'ALARM_UPDATE_FAILED',
        'No se pudo actualizar el recordatorio. Por favor, intenta nuevamente.',
        true
      );
    }
  }

  /**
   * Delete an alarm
   */
  async deleteAlarm(medicationId: string): Promise<void> {
    try {
      const alarmIds = this.alarmMappings.get(medicationId);
      
      if (!alarmIds || alarmIds.length === 0) {
        console.log('[AlarmService] No alarms found for medication:', medicationId);
        return;
      }

      // Cancel all notifications for this medication
      for (const alarmId of alarmIds) {
        // Handle comma-separated IDs
        const ids = alarmId.includes(',') ? alarmId.split(',') : [alarmId];
        
        for (const id of ids) {
          if (!id.startsWith('fallback_')) {
            await Notifications.cancelScheduledNotificationAsync(id);
          }
        }
      }

      // Remove from mappings
      this.alarmMappings.delete(medicationId);
      await this.saveAlarmMappings();

      console.log('[AlarmService] Deleted alarms for medication:', medicationId);
    } catch (error: any) {
      console.error('[AlarmService] Error deleting alarm:', error);
      
      throw new AlarmServiceError(
        `Failed to delete alarm: ${error.message}`,
        'ALARM_DELETION_FAILED',
        'No se pudo eliminar el recordatorio. Por favor, intenta nuevamente.',
        true
      );
    }
  }

  /**
   * Get all scheduled alarms for a medication
   */
  async getAlarmsForMedication(medicationId: string): Promise<string[]> {
    return this.alarmMappings.get(medicationId) || [];
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('[AlarmService] Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Cancel all alarms
   */
  async cancelAllAlarms(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.alarmMappings.clear();
      await this.saveAlarmMappings();
      console.log('[AlarmService] Cancelled all alarms');
    } catch (error) {
      console.error('[AlarmService] Error cancelling all alarms:', error);
      throw new AlarmServiceError(
        'Failed to cancel all alarms',
        'CANCEL_ALL_FAILED',
        'No se pudieron cancelar todos los recordatorios.',
        true
      );
    }
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): PermissionStatus {
    return this.permissionStatus;
  }
}

// Export singleton instance
export const alarmService = new AlarmService();

// Export helper functions
export const createMedicationAlarm = (config: AlarmConfig) => alarmService.createAlarm(config);
export const updateMedicationAlarm = (medicationId: string, config: AlarmConfig) => 
  alarmService.updateAlarm(medicationId, config);
export const deleteMedicationAlarm = (medicationId: string) => alarmService.deleteAlarm(medicationId);
export const canScheduleAlarms = () => alarmService.canScheduleAlarms();
export const requestAlarmPermissions = () => alarmService.requestPermissions();
