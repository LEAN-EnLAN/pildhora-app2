import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SyncStatusIndicator, SyncStatusBadge } from '../shared/SyncStatusIndicator';
import { useMedicationSync, useDeviceEventSync } from '../../hooks/useSyncStatus';

/**
 * Data Sync Integration Example
 * 
 * This component demonstrates how to integrate the data synchronization
 * service into your application screens.
 * 
 * Key Integration Points:
 * 1. Start medication sync for patient's medications
 * 2. Start device event sync for device events
 * 3. Display sync status indicators in UI
 * 
 * Usage in Patient Home Screen:
 * ```tsx
 * import { useMedicationSync, useDeviceEventSync } from '../../hooks/useSyncStatus';
 * import { SyncStatusBadge } from '../../components/shared/SyncStatusIndicator';
 * 
 * function PatientHome() {
 *   const { user } = useSelector((state: RootState) => state.auth);
 *   const deviceId = user?.deviceId;
 *   
 *   // Start syncing medications and device events
 *   useMedicationSync(user?.id, deviceId);
 *   useDeviceEventSync(deviceId, user?.id);
 *   
 *   return (
 *     <View>
 *       <View style={styles.header}>
 *         <Text>Patient Home</Text>
 *         <SyncStatusBadge />
 *       </View>
 *       // ... rest of your UI
 *     </View>
 *   );
 * }
 * ```
 * 
 * Usage in Caregiver Dashboard:
 * ```tsx
 * function CaregiverDashboard() {
 *   const selectedPatient = useSelector((state: RootState) => state.caregiver.selectedPatient);
 *   
 *   // Start syncing for selected patient
 *   useMedicationSync(selectedPatient?.id, selectedPatient?.deviceId);
 *   useDeviceEventSync(selectedPatient?.deviceId, selectedPatient?.id);
 *   
 *   return (
 *     <View>
 *       <SyncStatusIndicator detailed showSyncButton />
 *       // ... rest of your UI
 *     </View>
 *   );
 * }
 * ```
 */
export function DataSyncExample() {
  const { user } = useSelector((state: RootState) => state.auth);
  const deviceId = user?.deviceId;

  // Start medication sync (app → device)
  useMedicationSync(user?.id, deviceId);

  // Start device event sync (device → app)
  useDeviceEventSync(deviceId, user?.id);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Data Sync Integration
          </Text>
          <Text className="text-gray-600">
            Examples of sync status indicators and integration patterns
          </Text>
        </View>

        {/* Simple Badge */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Simple Badge (for headers)
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-700">Sync Status:</Text>
              <SyncStatusBadge />
            </View>
          </View>
        </View>

        {/* Simple Indicator */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Simple Indicator
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <SyncStatusIndicator />
          </View>
        </View>

        {/* Detailed Indicator */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Detailed Indicator
          </Text>
          <SyncStatusIndicator detailed />
        </View>

        {/* Detailed with Sync Button */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Detailed with Sync Button
          </Text>
          <SyncStatusIndicator detailed showSyncButton />
        </View>

        {/* Integration Notes */}
        <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <Text className="text-blue-900 font-semibold mb-2">
            Integration Notes:
          </Text>
          <Text className="text-blue-800 text-sm mb-2">
            • Use useMedicationSync() to start syncing medications to device
          </Text>
          <Text className="text-blue-800 text-sm mb-2">
            • Use useDeviceEventSync() to start syncing device events to app
          </Text>
          <Text className="text-blue-800 text-sm mb-2">
            • Both hooks automatically clean up on unmount
          </Text>
          <Text className="text-blue-800 text-sm">
            • Sync happens automatically within 5 seconds of changes
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
