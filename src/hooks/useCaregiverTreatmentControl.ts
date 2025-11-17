import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { deviceActionsService, DeviceActionResult } from '../services/deviceActions';
import {
  criticalEventNotificationsService,
  CriticalEventNotification,
} from '../services/criticalEventNotifications';

/**
 * Hook for caregiver treatment control functionality
 * 
 * Provides access to:
 * - Device action triggers (test alarm, dispense dose, etc.)
 * - Critical event notifications
 * - Unread event count
 * 
 * Requirements:
 * - 8.4: Enable device action triggers for caregivers
 * - 8.5: Implement critical event notifications for caregivers
 * 
 * @example
 * ```typescript
 * const {
 *   triggerTestAlarm,
 *   dispenseManualDose,
 *   criticalEvents,
 *   unreadCount,
 *   markEventAsRead,
 *   isActionInProgress
 * } = useCaregiverTreatmentControl(deviceId);
 * 
 * // Trigger test alarm
 * await triggerTestAlarm();
 * 
 * // Dispense manual dose
 * await dispenseManualDose();
 * 
 * // Mark event as read
 * await markEventAsRead(eventId);
 * ```
 */
export function useCaregiverTreatmentControl(deviceId?: string) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [criticalEvents, setCriticalEvents] = useState<CriticalEventNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Trigger test alarm on device
   */
  const triggerTestAlarm = useCallback(async (): Promise<DeviceActionResult> => {
    if (!deviceId || !user?.id) {
      return {
        success: false,
        message: 'Device ID or User ID not available',
      };
    }

    setIsActionInProgress(true);
    try {
      const result = await deviceActionsService.triggerTestAlarm(deviceId, user.id);
      return result;
    } finally {
      setIsActionInProgress(false);
    }
  }, [deviceId, user?.id]);

  /**
   * Dispense manual dose
   */
  const dispenseManualDose = useCallback(async (): Promise<DeviceActionResult> => {
    if (!deviceId || !user?.id) {
      return {
        success: false,
        message: 'Device ID or User ID not available',
      };
    }

    setIsActionInProgress(true);
    try {
      const result = await deviceActionsService.dispenseManualDose(deviceId, user.id);
      return result;
    } finally {
      setIsActionInProgress(false);
    }
  }, [deviceId, user?.id]);

  /**
   * Sync device time
   */
  const syncDeviceTime = useCallback(async (): Promise<DeviceActionResult> => {
    if (!deviceId || !user?.id) {
      return {
        success: false,
        message: 'Device ID or User ID not available',
      };
    }

    setIsActionInProgress(true);
    try {
      const result = await deviceActionsService.syncDeviceTime(deviceId, user.id);
      return result;
    } finally {
      setIsActionInProgress(false);
    }
  }, [deviceId, user?.id]);

  /**
   * Check device status
   */
  const checkDeviceStatus = useCallback(async (): Promise<DeviceActionResult> => {
    if (!deviceId || !user?.id) {
      return {
        success: false,
        message: 'Device ID or User ID not available',
      };
    }

    setIsActionInProgress(true);
    try {
      const result = await deviceActionsService.checkDeviceStatus(deviceId, user.id);
      return result;
    } finally {
      setIsActionInProgress(false);
    }
  }, [deviceId, user?.id]);

  /**
   * Clear active alarm
   */
  const clearAlarm = useCallback(async (): Promise<DeviceActionResult> => {
    if (!deviceId || !user?.id) {
      return {
        success: false,
        message: 'Device ID or User ID not available',
      };
    }

    setIsActionInProgress(true);
    try {
      const result = await deviceActionsService.clearAlarm(deviceId, user.id);
      return result;
    } finally {
      setIsActionInProgress(false);
    }
  }, [deviceId, user?.id]);

  /**
   * Mark critical event as read
   */
  const markEventAsRead = useCallback(async (eventId: string): Promise<void> => {
    await criticalEventNotificationsService.markAsRead(eventId);
    
    // Update local state
    setCriticalEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, read: true } : event
      )
    );
    
    // Update unread count
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Set up critical event monitoring
   */
  useEffect(() => {
    if (!user?.id || user.role !== 'caregiver') {
      return;
    }

    // Start monitoring critical events
    criticalEventNotificationsService.startMonitoring(user.id, (event) => {
      setCriticalEvents((prev) => [event, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Load initial unread count
    criticalEventNotificationsService.getUnreadCount(user.id).then(setUnreadCount);

    // Cleanup on unmount
    return () => {
      criticalEventNotificationsService.stopMonitoring(user.id);
    };
  }, [user?.id, user?.role]);

  return {
    // Device actions
    triggerTestAlarm,
    dispenseManualDose,
    syncDeviceTime,
    checkDeviceStatus,
    clearAlarm,
    isActionInProgress,

    // Critical events
    criticalEvents,
    unreadCount,
    markEventAsRead,
  };
}
