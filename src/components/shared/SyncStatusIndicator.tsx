import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSyncStatus, useForceSyncAll } from '../../hooks/useSyncStatus';
import { SyncStatus } from '../../services/dataSyncService';

interface SyncStatusIndicatorProps {
  /**
   * Whether to show detailed sync information
   */
  detailed?: boolean;
  /**
   * Whether to show the force sync button
   */
  showSyncButton?: boolean;
  /**
   * Custom styling
   */
  className?: string;
}

/**
 * Sync Status Indicator Component
 * 
 * Displays real-time synchronization status with visual indicators.
 * Shows medication sync and device event sync status.
 * 
 * Features:
 * - Color-coded status indicators
 * - Pending operation counts
 * - Last sync timestamps
 * - Manual sync trigger button
 * 
 * @example
 * ```tsx
 * // Simple indicator
 * <SyncStatusIndicator />
 * 
 * // Detailed with sync button
 * <SyncStatusIndicator detailed showSyncButton />
 * ```
 */
export function SyncStatusIndicator({
  detailed = false,
  showSyncButton = false,
  className = '',
}: SyncStatusIndicatorProps) {
  const {
    overallStatus,
    medicationSyncStatus,
    deviceEventSyncStatus,
    pendingMedicationOps,
    pendingDeviceEventOps,
    lastMedicationSync,
    lastDeviceEventSync,
    isSyncing,
    hasPendingOps,
  } = useSyncStatus();

  const { forceSyncAll, isSyncing: isForceSyncing } = useForceSyncAll();

  const statusConfig = getStatusConfig(overallStatus);

  if (!detailed) {
    // Simple indicator
    return (
      <View className={`flex-row items-center gap-2 ${className}`}>
        {isSyncing ? (
          <ActivityIndicator size="small" color={statusConfig.color} />
        ) : (
          <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
        )}
        <Text className="text-sm" style={{ color: statusConfig.color }}>
          {statusConfig.label}
        </Text>
        {hasPendingOps && (
          <View className="bg-orange-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-semibold">
              {pendingMedicationOps + pendingDeviceEventOps}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Detailed indicator
  return (
    <View className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          {isSyncing ? (
            <ActivityIndicator size="small" color={statusConfig.color} />
          ) : (
            <Ionicons name={statusConfig.icon} size={20} color={statusConfig.color} />
          )}
          <Text className="text-base font-semibold" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </Text>
        </View>
        {showSyncButton && (
          <TouchableOpacity
            onPress={forceSyncAll}
            disabled={isForceSyncing}
            className="bg-blue-500 rounded-lg px-3 py-1.5"
          >
            {isForceSyncing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-sm font-medium">Sincronizar</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Medication Sync Status */}
      <View className="mb-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600">Medicamentos → Dispositivo</Text>
          <View className="flex-row items-center gap-1">
            <Ionicons
              name={getStatusIcon(medicationSyncStatus)}
              size={14}
              color={getStatusColor(medicationSyncStatus)}
            />
            <Text className="text-xs" style={{ color: getStatusColor(medicationSyncStatus) }}>
              {getStatusLabel(medicationSyncStatus)}
            </Text>
          </View>
        </View>
        {pendingMedicationOps > 0 && (
          <Text className="text-xs text-gray-500 mt-0.5">
            {pendingMedicationOps} operación{pendingMedicationOps !== 1 ? 'es' : ''} pendiente{pendingMedicationOps !== 1 ? 's' : ''}
          </Text>
        )}
        {lastMedicationSync && (
          <Text className="text-xs text-gray-400 mt-0.5">
            Última sincronización: {formatTimestamp(lastMedicationSync)}
          </Text>
        )}
      </View>

      {/* Device Event Sync Status */}
      <View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600">Dispositivo → App</Text>
          <View className="flex-row items-center gap-1">
            <Ionicons
              name={getStatusIcon(deviceEventSyncStatus)}
              size={14}
              color={getStatusColor(deviceEventSyncStatus)}
            />
            <Text className="text-xs" style={{ color: getStatusColor(deviceEventSyncStatus) }}>
              {getStatusLabel(deviceEventSyncStatus)}
            </Text>
          </View>
        </View>
        {pendingDeviceEventOps > 0 && (
          <Text className="text-xs text-gray-500 mt-0.5">
            {pendingDeviceEventOps} evento{pendingDeviceEventOps !== 1 ? 's' : ''} pendiente{pendingDeviceEventOps !== 1 ? 's' : ''}
          </Text>
        )}
        {lastDeviceEventSync && (
          <Text className="text-xs text-gray-400 mt-0.5">
            Última sincronización: {formatTimestamp(lastDeviceEventSync)}
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Get status configuration (icon, color, label)
 */
function getStatusConfig(status: SyncStatus): {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
} {
  switch (status) {
    case 'synced':
      return {
        icon: 'checkmark-circle',
        color: '#10b981', // green-500
        label: 'Sincronizado',
      };
    case 'syncing':
      return {
        icon: 'sync',
        color: '#3b82f6', // blue-500
        label: 'Sincronizando...',
      };
    case 'pending':
      return {
        icon: 'time',
        color: '#f59e0b', // amber-500
        label: 'Pendiente',
      };
    case 'error':
      return {
        icon: 'alert-circle',
        color: '#ef4444', // red-500
        label: 'Error',
      };
    case 'offline':
      return {
        icon: 'cloud-offline',
        color: '#6b7280', // gray-500
        label: 'Sin conexión',
      };
    default:
      return {
        icon: 'help-circle',
        color: '#6b7280',
        label: 'Desconocido',
      };
  }
}

/**
 * Get status icon
 */
function getStatusIcon(status: SyncStatus): keyof typeof Ionicons.glyphMap {
  return getStatusConfig(status).icon;
}

/**
 * Get status color
 */
function getStatusColor(status: SyncStatus): string {
  return getStatusConfig(status).color;
}

/**
 * Get status label
 */
function getStatusLabel(status: SyncStatus): string {
  return getStatusConfig(status).label;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) {
    return 'hace unos segundos';
  } else if (diffMin < 60) {
    return `hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
  } else if (diffHour < 24) {
    return `hace ${diffHour} hora${diffHour !== 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Compact Sync Status Badge
 * 
 * Minimal badge showing sync status with icon only.
 * Useful for headers and toolbars.
 * 
 * @example
 * ```tsx
 * <SyncStatusBadge />
 * ```
 */
export function SyncStatusBadge() {
  const { overallStatus, isSyncing, totalPendingOps } = useSyncStatus();
  const statusConfig = getStatusConfig(overallStatus);

  return (
    <View className="relative">
      {isSyncing ? (
        <ActivityIndicator size="small" color={statusConfig.color} />
      ) : (
        <Ionicons name={statusConfig.icon} size={20} color={statusConfig.color} />
      )}
      {totalPendingOps > 0 && (
        <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-4 h-4 items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {totalPendingOps > 9 ? '9+' : totalPendingOps}
          </Text>
        </View>
      )}
    </View>
  );
}
