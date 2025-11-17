import { getDbInstance } from './firebase';
import { collection, query, where, onSnapshot, Timestamp, addDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Critical event types that trigger caregiver notifications
 */
export type CriticalEventType =
  | 'dose_missed'
  | 'device_offline'
  | 'low_battery'
  | 'medication_deleted'
  | 'inventory_low'
  | 'device_error';

/**
 * Critical event notification
 */
export interface CriticalEventNotification {
  id: string;
  eventType: CriticalEventType;
  patientId: string;
  patientName: string;
  deviceId?: string;
  medicationId?: string;
  medicationName?: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date | string;
  caregiverId: string;
  read: boolean;
  notificationSent: boolean;
}

/**
 * Service for managing critical event notifications for caregivers
 * 
 * This service monitors critical events (missed doses, device offline, etc.)
 * and sends push notifications to caregivers. It also maintains a notification
 * history in Firestore for the caregiver to review.
 * 
 * Requirements: 8.5 - Implement critical event notifications for caregivers
 */
export class CriticalEventNotificationsService {
  private listeners: Map<string, () => void> = new Map();
  private notificationPermissionGranted: boolean = false;

  constructor() {
    this.initializeNotifications();
  }

  /**
   * Initialize notification permissions
   */
  private async initializeNotifications(): Promise<void> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.notificationPermissionGranted = finalStatus === 'granted';

      if (!this.notificationPermissionGranted) {
        console.warn('[CriticalEventNotifications] Notification permissions not granted');
      }

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (error) {
      console.error('[CriticalEventNotifications] Error initializing notifications:', error);
    }
  }

  /**
   * Start monitoring critical events for a caregiver
   * 
   * @param caregiverId - Caregiver user ID
   * @param onEvent - Callback when new critical event occurs
   */
  startMonitoring(
    caregiverId: string,
    onEvent?: (event: CriticalEventNotification) => void
  ): void {
    // Stop existing listener if any
    this.stopMonitoring(caregiverId);

    console.log('[CriticalEventNotifications] Starting monitoring for caregiver:', caregiverId);

    // Set up Firestore listener for critical events
    this.setupFirestoreListener(caregiverId, onEvent);
  }

  /**
   * Stop monitoring critical events for a caregiver
   * 
   * @param caregiverId - Caregiver user ID
   */
  stopMonitoring(caregiverId: string): void {
    const unsubscribe = this.listeners.get(caregiverId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(caregiverId);
      console.log('[CriticalEventNotifications] Stopped monitoring for caregiver:', caregiverId);
    }
  }

  /**
   * Set up Firestore listener for critical events
   */
  private async setupFirestoreListener(
    caregiverId: string,
    onEvent?: (event: CriticalEventNotification) => void
  ): Promise<void> {
    try {
      const db = await getDbInstance();
      if (!db) {
        console.warn('[CriticalEventNotifications] Firestore not available');
        return;
      }

      // Query for unread critical events for this caregiver
      const eventsQuery = query(
        collection(db, 'criticalEvents'),
        where('caregiverId', '==', caregiverId),
        where('read', '==', false)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        eventsQuery,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const event = {
                id: change.doc.id,
                ...change.doc.data(),
              } as CriticalEventNotification;

              console.log('[CriticalEventNotifications] New critical event:', event.eventType);

              // Send push notification if not already sent
              if (!event.notificationSent) {
                this.sendPushNotification(event);
              }

              // Call callback if provided
              if (onEvent) {
                onEvent(event);
              }
            }
          });
        },
        (error) => {
          console.error('[CriticalEventNotifications] Listener error:', error);
        }
      );

      this.listeners.set(caregiverId, unsubscribe);
    } catch (error) {
      console.error('[CriticalEventNotifications] Error setting up listener:', error);
    }
  }

  /**
   * Send push notification for critical event
   */
  private async sendPushNotification(event: CriticalEventNotification): Promise<void> {
    if (!this.notificationPermissionGranted) {
      console.warn('[CriticalEventNotifications] Cannot send notification - permission not granted');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: this.getNotificationTitle(event.eventType),
          body: event.message,
          data: {
            eventId: event.id,
            eventType: event.eventType,
            patientId: event.patientId,
            medicationId: event.medicationId,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      // Mark notification as sent in Firestore
      await this.markNotificationSent(event.id);

      console.log('[CriticalEventNotifications] Push notification sent for event:', event.id);
    } catch (error) {
      console.error('[CriticalEventNotifications] Error sending push notification:', error);
    }
  }

  /**
   * Get notification title based on event type
   */
  private getNotificationTitle(eventType: CriticalEventType): string {
    switch (eventType) {
      case 'dose_missed':
        return '⚠️ Dosis Perdida';
      case 'device_offline':
        return '📵 Dispositivo Desconectado';
      case 'low_battery':
        return '🔋 Batería Baja';
      case 'medication_deleted':
        return '🗑️ Medicamento Eliminado';
      case 'inventory_low':
        return '📦 Inventario Bajo';
      case 'device_error':
        return '❌ Error del Dispositivo';
      default:
        return '🔔 Evento Crítico';
    }
  }

  /**
   * Mark notification as sent in Firestore
   */
  private async markNotificationSent(eventId: string): Promise<void> {
    try {
      const db = await getDbInstance();
      if (!db) {
        return;
      }

      const { doc, updateDoc } = await import('firebase/firestore');
      const eventRef = doc(db, 'criticalEvents', eventId);
      await updateDoc(eventRef, {
        notificationSent: true,
      });
    } catch (error) {
      console.error('[CriticalEventNotifications] Error marking notification as sent:', error);
    }
  }

  /**
   * Mark event as read
   * 
   * @param eventId - Event ID
   */
  async markAsRead(eventId: string): Promise<void> {
    try {
      const db = await getDbInstance();
      if (!db) {
        return;
      }

      const { doc, updateDoc } = await import('firebase/firestore');
      const eventRef = doc(db, 'criticalEvents', eventId);
      await updateDoc(eventRef, {
        read: true,
      });

      console.log('[CriticalEventNotifications] Event marked as read:', eventId);
    } catch (error) {
      console.error('[CriticalEventNotifications] Error marking event as read:', error);
    }
  }

  /**
   * Create a critical event notification
   * 
   * @param event - Event data (without id and timestamp)
   */
  async createCriticalEvent(
    event: Omit<CriticalEventNotification, 'id' | 'timestamp' | 'read' | 'notificationSent'>
  ): Promise<void> {
    try {
      const db = await getDbInstance();
      if (!db) {
        console.warn('[CriticalEventNotifications] Firestore not available');
        return;
      }

      const eventData = {
        ...event,
        timestamp: Timestamp.now(),
        read: false,
        notificationSent: false,
      };

      await addDoc(collection(db, 'criticalEvents'), eventData);

      console.log('[CriticalEventNotifications] Critical event created:', event.eventType);
    } catch (error) {
      console.error('[CriticalEventNotifications] Error creating critical event:', error);
    }
  }

  /**
   * Get unread event count for a caregiver
   * 
   * @param caregiverId - Caregiver user ID
   * @returns Number of unread events
   */
  async getUnreadCount(caregiverId: string): Promise<number> {
    try {
      const db = await getDbInstance();
      if (!db) {
        return 0;
      }

      const { getDocs } = await import('firebase/firestore');
      const eventsQuery = query(
        collection(db, 'criticalEvents'),
        where('caregiverId', '==', caregiverId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(eventsQuery);
      return snapshot.size;
    } catch (error) {
      console.error('[CriticalEventNotifications] Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Cleanup all listeners
   */
  destroy(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
    console.log('[CriticalEventNotifications] Service destroyed');
  }
}

// Export singleton instance
export const criticalEventNotificationsService = new CriticalEventNotificationsService();
