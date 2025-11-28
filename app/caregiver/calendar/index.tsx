import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { collection, query, where, orderBy, limit, getFirestore } from 'firebase/firestore';

import { RootState } from '../../../src/store';
import { MedicationEvent, Medication, PatientWithDevice } from '../../../src/types';
import { ScreenWrapper } from '../../../src/components/caregiver';
import { Container } from '../../../src/components/ui';
import PatientSelector from '../../../src/components/caregiver/PatientSelector';
import { CalendarView } from '../../../src/components/caregiver/calendar/CalendarView';
import { DayDetail } from '../../../src/components/caregiver/calendar/DayDetail';
import { AdherenceChart, AdherenceDay } from '../../../src/components/caregiver/calendar/AdherenceChart';
import { OfflineIndicator } from '../../../src/components/caregiver/OfflineIndicator';
import { ErrorState } from '../../../src/components/caregiver/ErrorState';
import { colors, spacing } from '../../../src/theme/tokens';

import { useCollectionSWR } from '../../../src/hooks/useCollectionSWR';
import { useLinkedPatients } from '../../../src/hooks/useLinkedPatients';
import { getDbInstance } from '../../../src/services/firebase';
import { categorizeError } from '../../../src/utils/errorHandling';

export default function CalendarScreen() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  // Get linked patients
  const { patients } = useLinkedPatients({
    caregiverId: user?.id || null,
    enabled: !!user?.id,
  });

  // Calculate month range for query
  const monthRange = useMemo(() => {
    return {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    };
  }, [currentDate]);

  // Query events for the current month
  const [eventsQuery, setEventsQuery] = useState<any>(null);

  useEffect(() => {
    const buildQuery = async () => {
      if (!user?.id || patients.length === 0) {
        setEventsQuery(null);
        return;
      }

      const db = await getDbInstance();
      if (!db) return;

      // We fetch all events for the patients to calculate adherence correctly across the month
      // Optimally, we would filter by date range in Firestore, but for now we'll fetch recent history
      // or implement a month-based query if the index exists.
      
      // UPDATED: Query by caregiverId to support all patients without limit
      // This replaces the previous 'in' query which was limited to 10 patients.
      // We fetch events for the caregiver and filter by patient client-side.
      setEventsQuery(query(
        collection(db, 'medicationEvents'),
        where('caregiverId', '==', user.id),
        orderBy('timestamp', 'desc'),
        limit(1000) // Safety limit for performance
      ));
    };

    buildQuery();
  }, [user?.id, patients, currentDate]); // Re-build if user changes

  const { data: allEvents = [], isLoading: eventsLoading, error: eventsError, mutate } = useCollectionSWR<MedicationEvent>({
    cacheKey: `calendar_events:${user?.id}:${monthRange.start.getTime()}`, // Update cache key when month changes
    query: eventsQuery,
    initialData: [],
    realtime: true,
  });

  // Filter events for the displayed month and selected date
  const { monthEvents, selectedDayEvents } = useMemo(() => {
    const monthStart = monthRange.start.getTime();
    const monthEnd = monthRange.end.getTime();
    
    // Filter by selected patient first
    const patientEvents = selectedPatientId 
      ? allEvents.filter(e => e.patientId === selectedPatientId)
      : allEvents;

    const mEvents = patientEvents.filter(e => {
      // Handle timestamp: Firestore Timestamp or number/string
      const ts = (e.timestamp as any) instanceof Object && 'toMillis' in (e.timestamp as any) ? (e.timestamp as any).toMillis() : new Date(e.timestamp).getTime();
      return ts >= monthStart && ts <= monthEnd;
    });

    const selectedStart = new Date(selectedDate);
    selectedStart.setHours(0, 0, 0, 0);
    const selectedEnd = new Date(selectedDate);
    selectedEnd.setHours(23, 59, 59, 999);

    const dEvents = patientEvents.filter(e => {
      const ts = (e.timestamp as any) instanceof Object && 'toMillis' in (e.timestamp as any) ? (e.timestamp as any).toMillis() : new Date(e.timestamp).getTime();
      return ts >= selectedStart.getTime() && ts <= selectedEnd.getTime();
    });

    return { monthEvents: mEvents, selectedDayEvents: dEvents };
  }, [allEvents, monthRange, selectedDate, selectedPatientId]);

  // Calculate Adherence Data for dots
  const adherenceData = useMemo(() => {
    const data: Record<string, { status: 'complete' | 'partial' | 'missed' | 'none' }> = {};
    
    // Group events by day
    const eventsByDay: Record<string, MedicationEvent[]> = {};
    monthEvents.forEach(e => {
      const ts = (e.timestamp as any) instanceof Object && 'toMillis' in (e.timestamp as any) ? (e.timestamp as any).toMillis() : new Date(e.timestamp).getTime();
      const dateStr = format(new Date(ts), 'yyyy-MM-dd');
      if (!eventsByDay[dateStr]) eventsByDay[dateStr] = [];
      eventsByDay[dateStr].push(e);
    });

    // Determine status for each day (Simplified logic)
    // "complete": All scheduled taken (requires medication schedule, which we don't have easily here without fetching all meds)
    // For now, let's use a heuristic based on event types:
    // If any 'missed' event -> 'missed' or 'partial'
    // If only 'taken' -> 'complete'
    // If 'skipped' -> 'partial'
    
    Object.keys(eventsByDay).forEach(dateStr => {
      const dayEvents = eventsByDay[dateStr];
      const hasMissed = dayEvents.some(e => e.status === 'missed');
      const hasSkipped = dayEvents.some(e => e.status === 'skipped');
      const hasTaken = dayEvents.some(e => e.status === 'taken');

      let status: 'complete' | 'partial' | 'missed' | 'none' = 'none';
      
      if (hasMissed) status = 'missed';
      else if (hasSkipped) status = 'partial';
      else if (hasTaken) status = 'complete';
      
      data[dateStr] = { status };
    });

    return data;
  }, [monthEvents]);

  // Calculate Selected Day Stats
  const selectedDayStats = useMemo(() => {
    let taken = 0;
    let missed = 0;
    let skipped = 0;

    selectedDayEvents.forEach(e => {
      if (e.status === 'taken') taken++;
      if (e.status === 'missed') missed++;
      if (e.status === 'skipped') skipped++;
    });

    return {
      taken,
      missed,
      skipped,
      total: taken + missed + skipped // Only counts recorded events
    };
  }, [selectedDayEvents]);

  // Calculate Weekly Stats for AdherenceChart
  const weeklyStats = useMemo(() => {
    // Week surrounding selected date
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start, end });
    const now = new Date();

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayStart = day.getTime();
      const dayEnd = new Date(day).setHours(23, 59, 59, 999);

      const dayEvents = allEvents.filter(e => {
        // Filter by patient if selected
        if (selectedPatientId && e.patientId !== selectedPatientId) return false;

        const ts = (e.timestamp as any) instanceof Object && 'toMillis' in (e.timestamp as any) ? (e.timestamp as any).toMillis() : new Date(e.timestamp).getTime();
        return ts >= dayStart && ts <= dayEnd;
      });

      const taken = dayEvents.filter(e => e.status === 'taken').length;
      const total = dayEvents.length;
      
      const isFuture = day > now;
      
      let percentage = 0;
      if (total > 0) {
        percentage = Math.round((taken / total) * 100);
      } else if (isFuture) {
        percentage = 0; // Future days show 0
      } else {
        // Past days with no events might be considered 0 or N/A. 
        // For chart purposes, let's say 0 unless we know they had meds scheduled.
        percentage = 0;
      }

      // AdherenceDay type expects: date: string, percentage: number, status: ...
      const status: AdherenceDay['status'] = percentage >= 80 ? 'good' : percentage >= 50 ? 'warning' : 'danger';

      return {
        date: dateStr,
        percentage,
        status,
        dayName: format(day, 'EEE', { locale: es }).toUpperCase() // MON, TUE, etc.
      };
    });
  }, [allEvents, selectedDate, selectedPatientId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    mutate().finally(() => setRefreshing(false));
  }, [mutate]);

  // Navigation to medication details
  const handleEventPress = useCallback((event: MedicationEvent) => {
    // Navigate to patient's medication history or details
    // For now, just go to the medications tab for that patient
    router.push(`/caregiver/medications/${event.patientId}`);
  }, [router]);

  return (
    <ScreenWrapper>
      <OfflineIndicator />
      
      {/* Patient Selector Header */}
      <View style={styles.headerContainer}>
        <PatientSelector
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
          patients={patients}
          showAllOption={true}
        />
      </View>

      <Container style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing || eventsLoading} onRefresh={onRefresh} />
          }
        >
          {/* Calendar View */}
          <View style={styles.section}>
            <CalendarView
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={adherenceData}
            />
          </View>

          {/* Weekly Adherence Chart */}
          <View style={styles.section}>
            <AdherenceChart 
              data={weeklyStats}
              title="Adherencia Semanal"
            />
          </View>

          {/* Selected Day Details */}
          <View style={styles.section}>
            <DayDetail
              date={selectedDate}
              events={selectedDayEvents}
              stats={selectedDayStats}
              loading={eventsLoading}
              onEventPress={handleEventPress}
            />
          </View>

          {/* Error State */}
          {eventsError && (
            <View style={styles.section}>
              <ErrorState
                category="server_error"
                message="No se pudieron cargar los eventos"
                onRetry={mutate}
              />
            </View>
          )}
          
        </ScrollView>
      </Container>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    paddingHorizontal: 0, 
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    zIndex: 10,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
