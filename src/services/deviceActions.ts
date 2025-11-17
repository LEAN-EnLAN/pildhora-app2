import { getRdbInstance } from './firebase';
import { ref, set, get } from 'firebase/database';

/**
 * Device action types that can be triggered by caregivers
 */
export type DeviceActionType = 
  | 'test_alarm'
  | 'dispense_dose'
  | 'sync_time'
  | 'check_status'
  | 'clear_alarm';

/**
 * Device action result
 */
export interface DeviceActionResult {
  success: boolean;
  message: string;
  actionId?: string;
}

/**
 * Device action request stored in RTDB
 */
interface DeviceActionRequest {
  actionType: DeviceActionType;
  requestedBy: string;
  requestedAt: number;
  status: 'pending' | 'completed' | 'failed';
  completedAt?: number;
  error?: string;
}

/**
 * Service for triggering device actions from the caregiver app
 * 
 * This service allows caregivers to send commands to patient devices
 * through Firebase Realtime Database. The device firmware monitors
 * the actions node and executes commands.
 * 
 * Requirements: 8.4 - Enable device action triggers for caregivers
 */
export class DeviceActionsService {
  /**
   * Trigger a test alarm on the device
   * 
   * @param deviceId - Device identifier
   * @param userId - User ID triggering the action (caregiver)
   * @returns Action result
   */
  async triggerTestAlarm(deviceId: string, userId: string): Promise<DeviceActionResult> {
    return this.triggerAction(deviceId, 'test_alarm', userId);
  }

  /**
   * Trigger manual dose dispensing
   * 
   * @param deviceId - Device identifier
   * @param userId - User ID triggering the action (caregiver)
   * @returns Action result
   */
  async dispenseManualDose(deviceId: string, userId: string): Promise<DeviceActionResult> {
    return this.triggerAction(deviceId, 'dispense_dose', userId);
  }

  /**
   * Sync device time with server
   * 
   * @param deviceId - Device identifier
   * @param userId - User ID triggering the action (caregiver)
   * @returns Action result
   */
  async syncDeviceTime(deviceId: string, userId: string): Promise<DeviceActionResult> {
    return this.triggerAction(deviceId, 'sync_time', userId);
  }

  /**
   * Request device status update
   * 
   * @param deviceId - Device identifier
   * @param userId - User ID triggering the action (caregiver)
   * @returns Action result
   */
  async checkDeviceStatus(deviceId: string, userId: string): Promise<DeviceActionResult> {
    return this.triggerAction(deviceId, 'check_status', userId);
  }

  /**
   * Clear active alarm on device
   * 
   * @param deviceId - Device identifier
   * @param userId - User ID triggering the action (caregiver)
   * @returns Action result
   */
  async clearAlarm(deviceId: string, userId: string): Promise<DeviceActionResult> {
    return this.triggerAction(deviceId, 'clear_alarm', userId);
  }

  /**
   * Generic method to trigger any device action
   * 
   * @param deviceId - Device identifier
   * @param actionType - Type of action to trigger
   * @param userId - User ID triggering the action
   * @returns Action result
   */
  private async triggerAction(
    deviceId: string,
    actionType: DeviceActionType,
    userId: string
  ): Promise<DeviceActionResult> {
    try {
      console.log('[DeviceActionsService] Triggering action:', { deviceId, actionType, userId });

      // Validate inputs
      if (!deviceId || !userId) {
        return {
          success: false,
          message: 'Device ID and User ID are required',
        };
      }

      // Get RTDB instance
      const rdb = await getRdbInstance();
      if (!rdb) {
        return {
          success: false,
          message: 'Firebase Realtime Database not available',
        };
      }

      // Check if device is online
      const deviceStateRef = ref(rdb, `devices/${deviceId}/state`);
      const deviceStateSnapshot = await get(deviceStateRef);
      
      if (!deviceStateSnapshot.exists()) {
        return {
          success: false,
          message: 'Device not found',
        };
      }

      const deviceState = deviceStateSnapshot.val();
      if (!deviceState.is_online) {
        return {
          success: false,
          message: 'Device is offline. Please ensure the device is connected.',
        };
      }

      // Generate action ID
      const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create action request
      const actionRequest: DeviceActionRequest = {
        actionType,
        requestedBy: userId,
        requestedAt: Date.now(),
        status: 'pending',
      };

      // Write action to RTDB
      const actionRef = ref(rdb, `devices/${deviceId}/actions/${actionId}`);
      await set(actionRef, actionRequest);

      console.log('[DeviceActionsService] Action triggered successfully:', actionId);

      return {
        success: true,
        message: this.getSuccessMessage(actionType),
        actionId,
      };
    } catch (error: any) {
      console.error('[DeviceActionsService] Error triggering action:', error);
      return {
        success: false,
        message: error.message || 'Failed to trigger device action',
      };
    }
  }

  /**
   * Get user-friendly success message for action type
   */
  private getSuccessMessage(actionType: DeviceActionType): string {
    switch (actionType) {
      case 'test_alarm':
        return 'Test alarm triggered successfully';
      case 'dispense_dose':
        return 'Manual dose dispensing initiated';
      case 'sync_time':
        return 'Device time sync requested';
      case 'check_status':
        return 'Device status update requested';
      case 'clear_alarm':
        return 'Alarm cleared successfully';
      default:
        return 'Action triggered successfully';
    }
  }

  /**
   * Get the status of a previously triggered action
   * 
   * @param deviceId - Device identifier
   * @param actionId - Action identifier
   * @returns Action request with current status
   */
  async getActionStatus(deviceId: string, actionId: string): Promise<DeviceActionRequest | null> {
    try {
      const rdb = await getRdbInstance();
      if (!rdb) {
        return null;
      }

      const actionRef = ref(rdb, `devices/${deviceId}/actions/${actionId}`);
      const snapshot = await get(actionRef);

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.val() as DeviceActionRequest;
    } catch (error) {
      console.error('[DeviceActionsService] Error getting action status:', error);
      return null;
    }
  }
}

// Export singleton instance
export const deviceActionsService = new DeviceActionsService();
