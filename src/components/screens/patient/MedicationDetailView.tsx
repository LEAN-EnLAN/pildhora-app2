import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../ui';
import { LowQuantityBanner } from './LowQuantityBanner';
import { RefillDialog } from './RefillDialog';
import { Chip } from '../../ui/Chip';
import { colors, spacing, typography, borderRadius, shadows } from '../../../theme/tokens';
import { Medication } from '../../../types';
import { inventoryService, InventoryStatus } from '../../../services/inventoryService';

interface MedicationDetailViewProps {
  medication: Medication;
  onEdit: () => void;
  onDelete: () => void;
  onRefillComplete: () => void;
}

/**
 * Detailed view of a medication with all information
 * Shows low quantity banner and refill dialog when applicable
 */
export const MedicationDetailView: React.FC<MedicationDetailViewProps> = ({
  medication,
  onEdit,
  onDelete,
  onRefillComplete,
}) => {
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus | null>(null);
  const [refillDialogVisible, setRefillDialogVisible] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Load inventory status
  useEffect(() => {
    const loadInventoryStatus = async () => {
      if (!medication.trackInventory || !medication.id) {
        setInventoryStatus(null);
        return;
      }

      try {
        setIsLoadingInventory(true);
        const status = await inventoryService.getInventoryStatus(medication.id);
        setInventoryStatus(status);
      } catch (error) {
        console.error('[MedicationDetailView] Error loading inventory status:', error);
        setInventoryStatus(null);
      } finally {
        setIsLoadingInventory(false);
      }
    };

    loadInventoryStatus();
  }, [medication.id, medication.trackInventory, medication.currentQuantity]);

  // Handle refill confirmation
  const handleRefillConfirm = useCallback(async (newQuantity: number) => {
    if (!medication.id) {
      return;
    }

    try {
      await inventoryService.refillInventory(medication.id, newQuantity);
      
      // Reload inventory status
      const status = await inventoryService.getInventoryStatus(medication.id);
      setInventoryStatus(status);
      
      setRefillDialogVisible(false);
      onRefillComplete();
    } catch (error) {
      console.error('[MedicationDetailView] Error refilling inventory:', error);
      throw error;
    }
  }, [medication.id, onRefillComplete]);

  // Format time to 12-hour format
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get frequency text
  const getFrequencyText = (): string => {
    if (!medication.frequency) return 'Todos los días';
    
    const days = medication.frequency.split(',').map(d => d.trim());
    if (days.length === 7) return 'Todos los días';
    if (days.length === 1) return days[0];
    return `${days.length} días por semana`;
  };

  // Get dosage text
  const getDosageText = (): string => {
    if (medication.doseValue && medication.doseUnit) {
      const quantityText = medication.quantityType ? ` ${medication.quantityType}` : '';
      return `${medication.doseValue} ${medication.doseUnit}${quantityText}`;
    }
    return medication.dosage || 'No especificado';
  };

  const showLowQuantityBanner = inventoryStatus && inventoryStatus.isLow;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Low Quantity Banner */}
      {showLowQuantityBanner && (
        <LowQuantityBanner
          currentQuantity={inventoryStatus.currentQuantity}
          threshold={medication.lowQuantityThreshold || 0}
          daysRemaining={inventoryStatus.daysRemaining}
          onRefill={() => setRefillDialogVisible(true)}
        />
      )}

      {/* Medication Header */}
      <Card variant="elevated" padding="lg" style={styles.headerCard}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {medication.emoji ? (
              <Text style={styles.emoji}>{medication.emoji}</Text>
            ) : (
              <Ionicons name="medkit" size={48} color={colors.primary[500]} />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.dosage}>{getDosageText()}</Text>
          </View>
        </View>
      </Card>

      {/* Schedule Section */}
      <Card variant="outlined" padding="lg" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={24} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>Horario</Text>
        </View>
        <View style={styles.timesContainer}>
          {medication.times.map((time, index) => (
            <Chip
              key={`${time}-${index}`}
              label={formatTime(time)}
              variant="filled"
              color="primary"
              size="md"
            />
          ))}
        </View>
        <View style={styles.frequencyRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} />
          <Text style={styles.frequencyText}>{getFrequencyText()}</Text>
        </View>
      </Card>

      {/* Inventory Section */}
      {medication.trackInventory && (
        <Card variant="outlined" padding="lg" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Inventario</Text>
          </View>
          
          {isLoadingInventory ? (
            <Text style={styles.loadingText}>Cargando...</Text>
          ) : inventoryStatus ? (
            <>
              <View style={styles.inventoryRow}>
                <Text style={styles.inventoryLabel}>Cantidad actual:</Text>
                <Text style={styles.inventoryValue}>
                  {inventoryStatus.currentQuantity} dosis
                </Text>
              </View>
              <View style={styles.inventoryRow}>
                <Text style={styles.inventoryLabel}>Días restantes:</Text>
                <Text style={styles.inventoryValue}>
                  {inventoryStatus.daysRemaining} {inventoryStatus.daysRemaining === 1 ? 'día' : 'días'}
                </Text>
              </View>
              <View style={styles.inventoryRow}>
                <Text style={styles.inventoryLabel}>Umbral bajo:</Text>
                <Text style={styles.inventoryValue}>
                  {medication.lowQuantityThreshold || 0} dosis
                </Text>
              </View>
              {medication.lastRefillDate && (
                <View style={styles.inventoryRow}>
                  <Text style={styles.inventoryLabel}>Último reabastecimiento:</Text>
                  <Text style={styles.inventoryValue}>
                    {new Date(medication.lastRefillDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              <Button
                variant="secondary"
                size="md"
                onPress={() => setRefillDialogVisible(true)}
                style={styles.refillButton}
                accessibilityLabel="Registrar reabastecimiento"
              >
                Registrar reabastecimiento
              </Button>
            </>
          ) : (
            <Text style={styles.noInventoryText}>
              No se pudo cargar el estado del inventario
            </Text>
          )}
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          onPress={onEdit}
          style={styles.actionButton}
          accessibilityLabel="Editar medicamento"
        >
          Editar medicamento
        </Button>
        <Button
          variant="danger"
          size="lg"
          onPress={onDelete}
          style={styles.actionButton}
          accessibilityLabel="Eliminar medicamento"
        >
          Eliminar medicamento
        </Button>
      </View>

      {/* Refill Dialog */}
      <RefillDialog
        visible={refillDialogVisible}
        medication={medication}
        onConfirm={handleRefillConfirm}
        onCancel={() => setRefillDialogVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  headerCard: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  emoji: {
    fontSize: 48,
  },
  headerInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  dosage: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[600],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginLeft: spacing.sm,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  frequencyText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    marginLeft: spacing.sm,
  },
  inventoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  inventoryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
  },
  inventoryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  noInventoryText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  refillButton: {
    marginTop: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});
