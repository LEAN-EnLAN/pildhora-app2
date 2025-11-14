import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState, AppDispatch } from '../../../src/store';
import { fetchMedications } from '../../../src/store/slices/medicationsSlice';
import { Medication } from '../../../src/types';
import { Button, LoadingSpinner, ErrorMessage, AnimatedListItem } from '../../../src/components/ui';
import { MedicationCard } from '../../../src/components/screens/patient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/theme/tokens';

export default function MedicationsIndex() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { medications, loading, error } = useSelector((state: RootState) => state.medications);
  const deviceSlice = useSelector((state: RootState) => (state as any).device);
  const patientId = user?.id;

  useEffect(() => {
    if (patientId) dispatch(fetchMedications(patientId));
  }, [patientId, dispatch]);

  // Check if device is connected
  const isDeviceConnected = useMemo(() => {
    return deviceSlice?.state?.is_online || false;
  }, [deviceSlice]);

  // Handle navigation to add medication
  const handleAddMedication = useCallback(() => {
    router.push('/patient/medications/add');
  }, [router]);

  // Handle navigation back
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    if (patientId) {
      dispatch(fetchMedications(patientId));
    }
  }, [patientId, dispatch]);

  // Render medication item with animation
  const renderMedicationItem = useCallback(({ item, index }: { item: Medication; index: number }) => (
    <AnimatedListItem index={index} delay={50} style={styles.medicationItem}>
      <MedicationCard
        medication={item}
        onPress={() => router.push(`/patient/medications/${item.id}`)}
      />
    </AnimatedListItem>
  ), [router]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="calendar-outline" size={64} color={colors.gray[400]} />
      </View>
      <Text style={styles.emptyTitle}>No hay medicamentos</Text>
      <Text style={styles.emptyDescription}>
        Agrega tu primer medicamento para comenzar a gestionar tu tratamiento
      </Text>
      <Button
        variant="primary"
        size="lg"
        onPress={handleAddMedication}
        accessibilityLabel="Agregar primer medicamento"
        accessibilityHint="Navega a la pantalla para agregar un nuevo medicamento"
      >
        Agregar Medicamento
      </Button>
    </View>
  ), [handleAddMedication]);

  // Render mode indicator when device is connected
  const renderModeIndicator = useCallback(() => {
    if (!isDeviceConnected) return null;

    return (
      <View style={styles.modeIndicator}>
        <View style={styles.modeIndicatorContent}>
          <Ionicons name="link" size={20} color={colors.info} />
          <Text style={styles.modeIndicatorText}>
            Modo cuidador activo - Los medicamentos son gestionados por tu cuidador
          </Text>
        </View>
      </View>
    );
  }, [isDeviceConnected]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Volver"
              accessibilityHint="Regresa a la pantalla anterior"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={24} color={colors.gray[900]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Medicamentos</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="lg" text="Cargando medicamentos..." />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Volver"
              accessibilityHint="Regresa a la pantalla anterior"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={24} color={colors.gray[900]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Medicamentos</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
            variant="inline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityLabel="Volver"
            accessibilityHint="Regresa a la pantalla anterior"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color={colors.gray[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medicamentos</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMedication}
          accessibilityLabel="Agregar medicamento"
          accessibilityHint="Navega a la pantalla para agregar un nuevo medicamento"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Medication List */}
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={renderMedicationItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderModeIndicator}
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  medicationItem: {
    marginBottom: spacing.md,
  },
  modeIndicator: {
    backgroundColor: colors.info + '15',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  modeIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIndicatorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    marginLeft: spacing.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
});
