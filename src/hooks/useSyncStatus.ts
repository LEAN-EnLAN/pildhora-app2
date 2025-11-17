import { useEffect, useState } from 'react';
import { dataSyncService, SyncStatistics, SyncStatus } from '../services/dataSyncService';

/**
 * Hook to monitor data synchronization status
 * 
 * Provides real-time sync status for UI indicators showing:
 * - Medication sync status (app → device)
 * - Device event sync status (device → app)
 * - Pending operation counts
 * - Last sync timestamps
 * 
 * @example
 * ```tsx
 * function SyncIndicator() {
 *   const { medicationSyncStatus, pendingMedicationOps, lastMedicationSync } = useSyncStatus();
 *   
 *   return (
 *     <View>
 *       <Text>Status: {medicationSyncStatus}</Text>
 *       <Text>Pending: {pendingMedicationOps}</Text>
 *       {lastMedicationSync && (
 *         <Text>Last sync: {lastMedicationSync.toLocaleTimeString()}</Text>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */
export function useSyncStatus() {
  const [syncStats, setSyncStats] = useState<SyncStatistics>(
    dataSyncService.getSyncStatistics()
  );

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = dataSyncService.onSyncStatusChange((stats) => {
      setSyncStats(stats);
    });

    // Get initial stats
    setSyncStats(dataSyncService.getSyncStatistics());

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...syncStats,
    /**
     * Overall sync status (worst case of medication and device event sync)
     */
    overallStatus: getOverallStatus(
      syncStats.medicationSyncStatus,
      syncStats.deviceEventSyncStatus
    ),
    /**
     * Whether any sync operations are in progress
     */
    isSyncing: syncStats.medicationSyncStatus === 'syncing' || 
               syncStats.deviceEventSyncStatus === 'syncing',
    /**
     * Whether there are any pending operations
     */
    hasPendingOps: syncStats.pendingMedicationOps > 0 || 
                   syncStats.pendingDeviceEventOps > 0,
    /**
     * Total pending operations
     */
    totalPendingOps: syncStats.pendingMedicationOps + syncStats.pendingDeviceEventOps,
  };
}

/**
 * Get overall sync status (worst case)
 */
function getOverallStatus(
  medicationStatus: SyncStatus,
  deviceEventStatus: SyncStatus
): SyncStatus {
  const statusPriority: Record<SyncStatus, number> = {
    error: 4,
    offline: 3,
    syncing: 2,
    pending: 1,
    synced: 0,
  };

  const medicationPriority = statusPriority[medicationStatus];
  const deviceEventPriority = statusPriority[deviceEventStatus];

  const maxPriority = Math.max(medicationPriority, deviceEventPriority);

  // Find status with max priority
  for (const [status, priority] of Object.entries(statusPriority)) {
    if (priority === maxPriority) {
      return status as SyncStatus;
    }
  }

  return 'synced';
}

/**
 * Hook to start/stop medication sync for a patient
 * 
 * Automatically starts medication sync when component mounts and
 * stops when component unmounts.
 * 
 * @param patientId - Patient ID to sync medications for
 * @param deviceId - Device ID to sync to
 * @param enabled - Whether sync should be enabled
 * 
 * @example
 * ```tsx
 * function PatientMedicationList({ patientId, deviceId }) {
 *   useMedicationSync(patientId, deviceId);
 *   
 *   return <MedicationList />;
 * }
 * ```
 */
export function useMedicationSync(
  patientId: string | undefined,
  deviceId: string | undefined,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!patientId || !deviceId || !enabled) {
      return;
    }

    // Start medication sync
    dataSyncService.startMedicationSync(patientId, deviceId).catch(error => {
      console.error('[useMedicationSync] Failed to start sync:', error);
    });

    return () => {
      // Stop medication sync on unmount
      dataSyncService.stopMedicationSync(patientId);
    };
  }, [patientId, deviceId, enabled]);
}

/**
 * Hook to start/stop device event sync
 * 
 * Automatically starts device event sync when component mounts and
 * stops when component unmounts.
 * 
 * @param deviceId - Device ID to sync events from
 * @param patientId - Patient ID that owns the device
 * @param enabled - Whether sync should be enabled
 * 
 * @example
 * ```tsx
 * function DeviceEventMonitor({ deviceId, patientId }) {
 *   useDeviceEventSync(deviceId, patientId);
 *   
 *   return <EventList />;
 * }
 * ```
 */
export function useDeviceEventSync(
  deviceId: string | undefined,
  patientId: string | undefined,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!deviceId || !patientId || !enabled) {
      return;
    }

    // Start device event sync
    dataSyncService.startDeviceEventSync(deviceId, patientId).catch(error => {
      console.error('[useDeviceEventSync] Failed to start sync:', error);
    });

    return () => {
      // Stop device event sync on unmount
      dataSyncService.stopDeviceEventSync(deviceId);
    };
  }, [deviceId, patientId, enabled]);
}

/**
 * Hook to force sync all pending operations
 * 
 * Returns a function that can be called to manually trigger sync.
 * 
 * @example
 * ```tsx
 * function SyncButton() {
 *   const { forceSyncAll, isSyncing } = useForceSyncAll();
 *   
 *   return (
 *     <Button onPress={forceSyncAll} disabled={isSyncing}>
 *       Sync Now
 *     </Button>
 *   );
 * }
 * ```
 */
export function useForceSyncAll() {
  const [isSyncing, setIsSyncing] = useState(false);

  const forceSyncAll = async () => {
    setIsSyncing(true);
    try {
      await dataSyncService.forceSyncAll();
    } catch (error) {
      console.error('[useForceSyncAll] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    forceSyncAll,
    isSyncing,
  };
}
