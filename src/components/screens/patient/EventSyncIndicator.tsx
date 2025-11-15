import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { medicationEventQueue } from '../../../services/medicationEventService';
import { colors, spacing, typography, borderRadius, shadows } from '../../../theme/tokens';

interface EventSyncIndicatorProps {
  /**
   * Whether to show the indicator even when there are no pending events
   */
  alwaysShow?: boolean;
  /**
   * Callback when the indicator is pressed
   */
  onPress?: () => void;
}

/**
 * EventSyncIndicator - Displays pending event count and sync status
 * 
 * Shows:
 * - Number of pending events waiting to sync
 * - Sync in progress indicator
 * - Last sync time
 */
export function EventSyncIndicator({ alwaysShow = false, onPress }: EventSyncIndicatorProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Initial load
    loadSyncStatus();

    // Subscribe to sync completion
    const unsubscribe = medicationEventQueue.onSyncComplete(() => {
      console.log('[EventSyncIndicator] Sync completed, refreshing status');
      loadSyncStatus();
    });

    // Refresh every 30 seconds
    const intervalId = setInterval(() => {
      loadSyncStatus();
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const loadSyncStatus = async () => {
    try {
      const count = await medicationEventQueue.getPendingCount();
      const syncing = medicationEventQueue.isSyncInProgress();
      const lastSyncTime = medicationEventQueue.getLastSyncAttempt();

      setPendingCount(count);
      setIsSyncing(syncing);
      setLastSync(lastSyncTime);
    } catch (error) {
      console.error('[EventSyncIndicator] Error loading sync status:', error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default action: trigger manual sync
      medicationEventQueue.syncPendingEvents().catch(error => {
        console.error('[EventSyncIndicator] Manual sync error:', error);
      });
    }
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Nunca';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

  // Don't show if no pending events and alwaysShow is false
  if (!alwaysShow && pendingCount === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        pendingCount > 0 && styles.containerWithPending,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`${pendingCount} eventos pendientes de sincronización`}
      accessibilityHint="Toca para sincronizar manualmente"
      accessibilityRole="button"
    >
      <View style={styles.content}>
        {isSyncing ? (
          <ActivityIndicator size="small" color={colors.primary[500]} />
        ) : (
          <Ionicons
            name={pendingCount > 0 ? 'cloud-upload-outline' : 'cloud-done-outline'}
            size={20}
            color={pendingCount > 0 ? colors.warning[500] : colors.success}
          />
        )}
        
        <View style={styles.textContainer}>
          {pendingCount > 0 ? (
            <>
              <Text style={styles.countText}>
                {pendingCount} {pendingCount === 1 ? 'evento' : 'eventos'} pendiente{pendingCount === 1 ? '' : 's'}
              </Text>
              <Text style={styles.subtitleText}>
                {isSyncing ? 'Sincronizando...' : 'Toca para sincronizar'}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.syncedText}>Sincronizado</Text>
              <Text style={styles.subtitleText}>
                {formatLastSync(lastSync)}
              </Text>
            </>
          )}
        </View>

        {pendingCount > 0 && !isSyncing && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  containerWithPending: {
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  countText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  syncedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
  subtitleText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  badge: {
    backgroundColor: colors.warning[500],
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },
});
