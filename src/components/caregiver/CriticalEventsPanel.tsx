import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { useCaregiverTreatmentControl } from '../../hooks/useCaregiverTreatmentControl';
import { CriticalEventNotification, CriticalEventType } from '../../services/criticalEventNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CriticalEventsPanelProps {
  onEventPress?: (event: CriticalEventNotification) => void;
  maxEvents?: number;
}

/**
 * Critical Events Panel Component
 * 
 * Displays critical event notifications for caregivers with:
 * - Real-time event updates
 * - Unread count badge
 * - Event type icons and colors
 * - Relative timestamps
 * - Mark as read functionality
 * 
 * Requirements: 8.5 - Implement critical event notifications for caregivers
 * 
 * @example
 * ```typescript
 * <CriticalEventsPanel
 *   onEventPress={(event) => router.push(`/caregiver/events/${event.id}`)}
 *   maxEvents={5}
 * />
 * ```
 */
export function CriticalEventsPanel({ onEventPress, maxEvents = 10 }: CriticalEventsPanelProps) {
  const { criticalEvents, unreadCount, markEventAsRead } = useCaregiverTreatmentControl();

  /**
   * Get icon for event type
   */
  const getEventIcon = (eventType: CriticalEventType): string => {
    switch (eventType) {
      case 'dose_missed':
        return 'alert-circle';
      case 'device_offline':
        return 'wifi-off';
      case 'low_battery':
        return 'battery-dead';
      case 'medication_deleted':
        return 'trash';
      case 'inventory_low':
        return 'cube';
      case 'device_error':
        return 'warning';
      default:
        return 'notifications';
    }
  };

  /**
   * Get color for event type
   */
  const getEventColor = (eventType: CriticalEventType): string => {
    switch (eventType) {
      case 'dose_missed':
        return colors.orange[600];
      case 'device_offline':
        return colors.red[600];
      case 'low_battery':
        return colors.yellow[600];
      case 'medication_deleted':
        return colors.red[600];
      case 'inventory_low':
        return colors.orange[600];
      case 'device_error':
        return colors.red[600];
      default:
        return colors.gray[600];
    }
  };

  /**
   * Get background color for event type
   */
  const getEventBackgroundColor = (eventType: CriticalEventType): string => {
    switch (eventType) {
      case 'dose_missed':
        return colors.orange[50];
      case 'device_offline':
        return colors.red[50];
      case 'low_battery':
        return colors.yellow[50];
      case 'medication_deleted':
        return colors.red[50];
      case 'inventory_low':
        return colors.orange[50];
      case 'device_error':
        return colors.red[50];
      default:
        return colors.gray[50];
    }
  };

  /**
   * Handle event press
   */
  const handleEventPress = async (event: CriticalEventNotification) => {
    // Mark as read
    if (!event.read) {
      await markEventAsRead(event.id);
    }

    // Call callback if provided
    if (onEventPress) {
      onEventPress(event);
    }
  };

  /**
   * Render event item
   */
  const renderEventItem = ({ item }: { item: CriticalEventNotification }) => {
    const iconName = getEventIcon(item.eventType);
    const iconColor = getEventColor(item.eventType);
    const backgroundColor = getEventBackgroundColor(item.eventType);

    // Format timestamp
    const timestamp = typeof item.timestamp === 'string' 
      ? new Date(item.timestamp) 
      : item.timestamp;
    const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true, locale: es });

    return (
      <TouchableOpacity
        style={[
          styles.eventCard,
          !item.read && styles.eventCardUnread,
        ]}
        onPress={() => handleEventPress(item)}
        accessibilityLabel={`Evento crítico: ${item.message}`}
        accessibilityHint="Toca para ver detalles"
        accessibilityRole="button"
      >
        <View style={[styles.eventIcon, { backgroundColor }]}>
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventPatient}>{item.patientName}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.eventMessage} numberOfLines={2}>
            {item.message}
          </Text>

          {item.medicationName && (
            <Text style={styles.eventMedication}>
              Medicamento: {item.medicationName}
            </Text>
          )}

          <Text style={styles.eventTime}>{timeAgo}</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
      </TouchableOpacity>
    );
  };

  const displayEvents = criticalEvents.slice(0, maxEvents);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="alert-circle" size={24} color={colors.red[600]} />
          <Text style={styles.title}>Eventos Críticos</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {displayEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.green[400]} />
          <Text style={styles.emptyText}>No hay eventos críticos</Text>
          <Text style={styles.emptySubtext}>
            Te notificaremos cuando ocurra algo importante
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginLeft: spacing.sm,
  },
  badge: {
    backgroundColor: colors.red[600],
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
    color: colors.white,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  eventCardUnread: {
    backgroundColor: colors.blue[50],
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  eventPatient: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue[600],
    marginLeft: spacing.xs,
  },
  eventMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  eventMedication: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  eventTime: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
