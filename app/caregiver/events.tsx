import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { getDbInstance } from '../../src/services/firebase';
import { RootState } from '../../src/store';
import { MedicationEvent, Patient } from '../../src/types';
import { MedicationEventCard } from '../../src/components/caregiver/MedicationEventCard';
import { EventFilterControls, EventFilters } from '../../src/components/caregiver/EventFilterControls';
import { Container, ListSkeleton, EventCardSkeleton } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme/tokens';

const EVENTS_PER_PAGE = 20;
const FILTERS_STORAGE_KEY = '@medication_event_filters';

export default function MedicationEventRegistry() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [events, setEvents] = useState<MedicationEvent[]>([]);
  const [allEvents, setAllEvents] = useState<MedicationEvent[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({});

  /**
   * Load saved filters from AsyncStorage
   */
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
        if (savedFilters) {
          const parsed = JSON.parse(savedFilters);
          // Convert date strings back to Date objects
          if (parsed.dateRange) {
            parsed.dateRange = {
              start: new Date(parsed.dateRange.start),
              end: new Date(parsed.dateRange.end),
            };
          }
          setFilters(parsed);
        }
      } catch (error) {
        console.error('[MedicationEventRegistry] Error loading filters:', error);
      }
    };

    loadFilters();
  }, []);

  /**
   * Save filters to AsyncStorage whenever they change
   */
  useEffect(() => {
    const saveFilters = async () => {
      try {
        await AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
      } catch (error) {
        console.error('[MedicationEventRegistry] Error saving filters:', error);
      }
    };

    saveFilters();
  }, [filters]);

  /**
   * Load patients for filter dropdown
   */
  useEffect(() => {
    if (!user?.id) return;

    const loadPatients = async () => {
      try {
        const db = await getDbInstance();
        if (!db) return;

        const patientsQuery = query(
          collection(db, 'patients'),
          where('caregiverId', '==', user.id)
        );

        const unsubscribe = onSnapshot(patientsQuery, (snapshot) => {
          const patientData: Patient[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            patientData.push({
              id: doc.id,
              name: data.name,
              email: data.email,
              caregiverId: data.caregiverId,
              createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
              deviceId: data.deviceId,
              adherence: data.adherence,
              lastTaken: data.lastTaken,
            });
          });
          setPatients(patientData);
        });

        return unsubscribe;
      } catch (error) {
        console.error('[MedicationEventRegistry] Error loading patients:', error);
      }
    };

    loadPatients();
  }, [user?.id]);

  /**
   * Setup Firestore listener for real-time event updates
   */
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError('Usuario no autenticado');
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const db = await getDbInstance();
        if (!db) {
          throw new Error('Base de datos no disponible');
        }

        // Build query with filters
        let eventsQuery: Query<DocumentData> = collection(db, 'medicationEvents');
        
        // Always filter by caregiver
        const constraints: any[] = [
          where('caregiverId', '==', user.id),
        ];

        // Add patient filter if specified
        if (filters.patientId) {
          constraints.push(where('patientId', '==', filters.patientId));
        }

        // Add event type filter if specified
        if (filters.eventType) {
          constraints.push(where('eventType', '==', filters.eventType));
        }

        // Add date range filter if specified
        if (filters.dateRange) {
          constraints.push(
            where('timestamp', '>=', Timestamp.fromDate(filters.dateRange.start)),
            where('timestamp', '<=', Timestamp.fromDate(filters.dateRange.end))
          );
        }

        // Add ordering and limit
        constraints.push(orderBy('timestamp', 'desc'));
        constraints.push(limit(EVENTS_PER_PAGE));

        eventsQuery = query(eventsQuery, ...constraints);

        // Setup real-time listener
        unsubscribe = onSnapshot(
          eventsQuery,
          (snapshot) => {
            const eventData: MedicationEvent[] = [];
            
            snapshot.forEach((doc) => {
              const data = doc.data();
              eventData.push({
                id: doc.id,
                eventType: data.eventType,
                medicationId: data.medicationId,
                medicationName: data.medicationName,
                medicationData: data.medicationData,
                patientId: data.patientId,
                patientName: data.patientName,
                caregiverId: data.caregiverId,
                timestamp: data.timestamp instanceof Timestamp 
                  ? data.timestamp.toDate().toISOString()
                  : data.timestamp,
                syncStatus: data.syncStatus,
                changes: data.changes,
              });
            });

            setAllEvents(eventData);
            setLoading(false);
            setRefreshing(false);
            setError(null);
          },
          (err) => {
            console.error('[MedicationEventRegistry] Firestore listener error:', err);
            setError('Error al cargar eventos');
            setLoading(false);
            setRefreshing(false);
          }
        );
      } catch (err: any) {
        console.error('[MedicationEventRegistry] Setup error:', err);
        setError(err.message || 'Error al configurar la conexión');
        setLoading(false);
        setRefreshing(false);
      }
    };

    setupListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, filters.patientId, filters.eventType, filters.dateRange]);

  /**
   * Apply client-side search filter to events
   */
  const filteredEvents = useMemo(() => {
    if (!filters.searchQuery) {
      return allEvents;
    }

    const searchLower = filters.searchQuery.toLowerCase();
    return allEvents.filter(event =>
      event.medicationName.toLowerCase().includes(searchLower)
    );
  }, [allEvents, filters.searchQuery]);

  /**
   * Update events when filtered events change
   */
  useEffect(() => {
    setEvents(filteredEvents);
  }, [filteredEvents]);

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback((newFilters: EventFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // The Firestore listener will automatically update the data
    // We just need to show the refreshing indicator
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  /**
   * Handle event card press - navigate to event detail
   */
  const handleEventPress = useCallback((event: MedicationEvent) => {
    router.push({
      pathname: '/caregiver/events/[id]',
      params: { id: event.id }
    });
  }, [router]);

  /**
   * Render individual event item
   */
  const renderEventItem = useCallback(({ item }: { item: MedicationEvent }) => (
    <MedicationEventCard
      event={item}
      onPress={() => handleEventPress(item)}
    />
  ), [handleEventPress]);

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="notifications-off-outline" size={64} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>No hay eventos</Text>
        <Text style={styles.emptySubtitle}>
          Los cambios de medicamentos de tus pacientes aparecerán aquí
        </Text>
      </View>
    );
  };

  /**
   * Render loading state with skeleton loaders
   */
  if (loading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <Container style={styles.container}>
          <ListSkeleton count={5} ItemSkeleton={EventCardSkeleton} />
        </Container>
      </SafeAreaView>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <Container style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error[500]} />
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <Container style={styles.container}>
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <EventFilterControls
              filters={filters}
              onFiltersChange={handleFiltersChange}
              patients={patients.map(p => ({ id: p.id, name: p.name }))}
            />
          }
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 120, // Approximate height of event card
            offset: 120 * index,
            index,
          })}
        />
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.error[500],
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[700],
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
