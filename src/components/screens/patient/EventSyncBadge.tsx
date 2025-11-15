import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { medicationEventQueue } from '../../../services/medicationEventService';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';

interface EventSyncBadgeProps {
  /**
   * Size variant
   */
  size?: 'sm' | 'md';
  /**
   * Callback when the badge is pressed
   */
  onPress?: () => void;
}

/**
 * EventSyncBadge - Compact indicator for pending events
 * 
 * Shows a small badge with pending event count
 * Can be placed in headers or navigation bars
 */
export function EventSyncBadge({ size = 'md', onPress }: EventSyncBadgeProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initial load
    loadSyncStatus();

    // Subscribe to sync completion
    const unsubscribe = medicationEventQueue.onSyncComplete(() => {
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

      setPendingCount(count);
      setIsSyncing(syncing);
    } catch (error) {
      console.error('[EventSyncBadge] Error loading sync status:', error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default action: trigger manual sync
      medicationEventQueue.syncPendingEvents().catch(error => {
        console.error('[EventSyncBadge] Manual sync error:', error);
      });
    }
  };

  // Don't show if no pending events
  if (pendingCount === 0 && !isSyncing) {
    return null;
  }

  const iconSize = size === 'sm' ? 16 : 20;
  const badgeSize = size === 'sm' ? 18 : 22;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        size === 'sm' && styles.containerSm,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`${pendingCount} eventos pendientes`}
      accessibilityHint="Toca para sincronizar"
      accessibilityRole="button"
    >
      {isSyncing ? (
        <ActivityIndicator size="small" color={colors.primary[500]} />
      ) : (
        <>
          <Ionicons
            name="cloud-upload-outline"
            size={iconSize}
            color={colors.warning[500]}
          />
          {pendingCount > 0 && (
            <View style={[styles.badge, { width: badgeSize, height: badgeSize }]}>
              <Text style={[styles.badgeText, size === 'sm' && styles.badgeTextSm]}>
                {pendingCount > 99 ? '99+' : pendingCount}
              </Text>
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSm: {
    width: 36,
    height: 36,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.warning[500],
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },
  badgeTextSm: {
    fontSize: 10,
  },
});
