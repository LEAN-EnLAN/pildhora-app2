import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState, AppDispatch } from "../../../src/store";
import { fetchMedications } from "../../../src/store/slices/medicationsSlice";
import { startIntakesSubscription, stopIntakesSubscription, deleteAllIntakes, updateIntakeStatus } from "../../../src/store/slices/intakesSlice";
import { IntakeRecord, IntakeStatus } from "../../../src/types";
import { waitForFirebaseInitialization } from "../../../src/services/firebase";
import { LoadingSpinner, ErrorMessage, Modal, Button, BrandedEmptyState, AppBar, Toast, ToastType } from "../../../src/components/ui";
import { HistoryFilterBar, HistoryRecordCard } from "../../../src/components/screens/patient";
import { colors, spacing, typography, borderRadius, shadows } from "../../../src/theme/tokens";

type EnrichedIntakeRecord = IntakeRecord & {
  medication?: {
    id: string;
    name: string;
    dosage: string;
  };
};

const CLEARED_HISTORY_KEY = '@history_cleared_timestamp';

export default function HistoryScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { medications } = useSelector((state: RootState) => state.medications);
  
  const { intakes, loading, error } = useSelector((state: RootState) => state.intakes);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "taken" | "missed">("all");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearedTimestamp, setClearedTimestamp] = useState<number | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const patientId = user?.id;

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await waitForFirebaseInitialization();
        setIsInitialized(true);
        // Load cleared timestamp
        const storedTimestamp = await AsyncStorage.getItem(CLEARED_HISTORY_KEY);
        if (storedTimestamp) {
          setClearedTimestamp(parseInt(storedTimestamp, 10));
        }
      } catch (error: any) {
        // Firebase initialization failed - error will be handled by error state
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (!patientId || !isInitialized) return;
    dispatch(startIntakesSubscription(patientId));
    return () => {
      dispatch(stopIntakesSubscription());
    };
  }, [patientId, isInitialized, dispatch]);

  useEffect(() => {
    if (patientId && isInitialized) {
      dispatch(fetchMedications(patientId));
    }
  }, [patientId, isInitialized, dispatch]);

  // Memoize filtered history
  const filteredHistory = useMemo(() => {
    return intakes.filter((record) => {
      // Check if record is older than cleared timestamp
      if (clearedTimestamp) {
        const recordTime = new Date(record.scheduledTime).getTime();
        if (recordTime <= clearedTimestamp) {
          return false;
        }
      }

      if (selectedFilter === "all") return true;
      if (selectedFilter === "taken") return record.status === IntakeStatus.TAKEN;
      if (selectedFilter === "missed") return record.status === IntakeStatus.MISSED;
      return true;
    });
  }, [intakes, selectedFilter, clearedTimestamp]);

  // Memoize enriched and grouped history
  const groupedHistory = useMemo(() => {
    const enriched = filteredHistory.map((record) => {
      const med = medications.find((m) => m.id === record.medicationId);
      return {
        ...record,
        medication: med ? { id: med.id, name: med.name, dosage: med.dosage } : undefined,
      } as EnrichedIntakeRecord;
    });

    const grouped = enriched.reduce((acc, record) => {
      const date = new Date(record.scheduledTime).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, EnrichedIntakeRecord[]>);

    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [filteredHistory, medications]);

  // Calculate filter counts
  const filterCounts = useMemo(() => ({
    all: intakes.length,
    taken: intakes.filter(r => r.status === IntakeStatus.TAKEN).length,
    missed: intakes.filter(r => r.status === IntakeStatus.MISSED).length,
  }), [intakes]);

  const handleClearAllData = useCallback(async () => {
    try {
      if (!patientId) return;
      
      setIsClearing(true);
      
      // 1. Backend deletion
      await dispatch(deleteAllIntakes(patientId)).unwrap();
      
      // 2. Local flag update (UI immediately reflects cleared state)
      const now = Date.now();
      await AsyncStorage.setItem(CLEARED_HISTORY_KEY, now.toString());
      setClearedTimestamp(now);
      
      // 3. Visual feedback
      setShowClearAllModal(false);
      setToast({
        visible: true,
        message: 'Historial eliminado correctamente',
        type: 'success'
      });
    } catch (error: any) {
      // Error handling
      setShowClearAllModal(false);
      setToast({
        visible: true,
        message: 'Error al eliminar el historial. Inténtalo de nuevo.',
        type: 'error'
      });
    } finally {
      setIsClearing(false);
    }
  }, [patientId, dispatch]);

  const handleMarkAsMissed = useCallback(async (recordId: string) => {
    try {
      await dispatch(updateIntakeStatus({ id: recordId, status: IntakeStatus.MISSED })).unwrap();
    } catch (error: any) {
      // Error marking as missed - error state will be shown if needed
      setToast({
        visible: true,
        message: 'Error al actualizar el estado',
        type: 'error'
      });
    }
  }, [dispatch]);

  const handleRetry = useCallback(() => {
    setIsInitialized(false);
  }, []);

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" });

  const renderEmptyState = () => {
    const props = {
      icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
      title: 'No hay registros en el historial',
      message: 'Los registros de medicamentos aparecerán aquí',
    };
    if (selectedFilter === 'taken') {
      Object.assign(props, {
        icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
        title: 'No hay medicamentos tomados',
        message: 'Los medicamentos que tomes aparecerán aquí',
      });
    } else if (selectedFilter === 'missed') {
      Object.assign(props, {
        icon: 'close-circle-outline' as keyof typeof Ionicons.glyphMap,
        title: 'No hay medicamentos olvidados',
        message: 'Los medicamentos olvidados aparecerán aquí',
      });
    }
    return (
      <BrandedEmptyState icon={props.icon} title={props.title} message={props.message} />
    );
  };

  if (loading || !isInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner 
            size="large" 
            message={!isInitialized ? "Inicializando aplicación..." : "Cargando historial..."} 
          />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ErrorMessage 
            message={error}
            onRetry={handleRetry}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.container}>
      <AppBar 
        title="Historial" 
        showBackButton={true} 
        onBackPress={() => router.back()} 
      />

      {/* Filter Bar */}
      <HistoryFilterBar
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        counts={filterCounts}
      />

      {/* History List */}
      <ScrollView style={styles.historyList} contentContainerStyle={styles.historyListContent}>
        {filteredHistory.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {groupedHistory.map(([date, records]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatDate(date)}</Text>
                {records.map((record) => (
                  <HistoryRecordCard
                    key={record.id}
                    record={record}
                    medication={record.medication}
                    onMarkAsMissed={handleMarkAsMissed}
                  />
                ))}
              </View>
            ))}
            
            {/* Clear All Section */}
            {intakes.length > 0 && (
              <View style={styles.clearAllSection}>
                <Button
                  variant="danger"
                  onPress={() => setShowClearAllModal(true)}
                  leftIcon={<Ionicons name="trash-outline" size={20} color="#FFFFFF" />}
                  accessibilityLabel="Limpiar todo el historial"
                  accessibilityHint="Elimina todos los registros del historial permanentemente"
                >
                  Limpiar todo el historial
                </Button>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Toast Notification */}
      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* Clear All Confirmation Modal */}
      <Modal
        visible={showClearAllModal}
        onClose={() => !isClearing && setShowClearAllModal(false)}
        title="Limpiar Historial"
        size="sm"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            ¿Estás seguro de que quieres limpiar todos los datos del historial? Esta acción no se puede deshacer.
          </Text>
          <View style={styles.modalActions}>
            <Button
              variant="secondary"
              onPress={() => setShowClearAllModal(false)}
              style={styles.modalButton}
              disabled={isClearing}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onPress={handleClearAllData}
              style={styles.modalButton}
              loading={isClearing}
              disabled={isClearing}
            >
              Limpiar todo
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    padding: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  dateGroup: {
    marginBottom: spacing['2xl'],
  },
  dateHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[500],
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearAllSection: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
    alignItems: 'center',
  },
  modalContent: {
    gap: spacing.lg,
  },
  modalText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  modalButton: {
    flex: 1,
    maxWidth: 150,
  },
});
