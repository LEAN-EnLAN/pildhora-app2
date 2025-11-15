import React, { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { View, StyleSheet, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { Medication } from '../../../types';
import { Button } from '../../ui';
import { WizardProgressIndicator } from './WizardProgressIndicator';
import { ExitConfirmationDialog } from './ExitConfirmationDialog';
import { WizardProvider } from './WizardContext';
import { colors, spacing } from '../../../theme/tokens';
import { triggerHapticFeedback, HapticFeedbackType, announceForAccessibility } from '../../../utils/accessibility';

// Lazy load wizard step components for better performance
const MedicationIconNameStep = lazy(() => import('./MedicationIconNameStep').then(m => ({ default: m.MedicationIconNameStep })));
const MedicationScheduleStep = lazy(() => import('./MedicationScheduleStep').then(m => ({ default: m.MedicationScheduleStep })));
const MedicationDosageStep = lazy(() => import('./MedicationDosageStep').then(m => ({ default: m.MedicationDosageStep })));
const MedicationInventoryStep = lazy(() => import('./MedicationInventoryStep').then(m => ({ default: m.MedicationInventoryStep })));

export interface MedicationFormData {
  // Step 1: Icon & Name
  emoji: string;
  name: string;
  
  // Step 2: Schedule
  times: string[];
  frequency: string[];
  nativeAlarmIds: string[]; // Platform-specific alarm identifiers
  
  // Step 3: Dosage
  doseValue: string;
  doseUnit: string;
  quantityType: string;
  
  // Step 4: Inventory (add mode only)
  initialQuantity?: number;
  lowQuantityThreshold?: number;
}

interface WizardState {
  currentStep: number;
  totalSteps: number;
  formData: MedicationFormData;
  canProceed: boolean;
  isSubmitting: boolean;
}

interface MedicationWizardProps {
  mode: 'add' | 'edit';
  medication?: Medication;
  onComplete: (formData: MedicationFormData) => void | Promise<void>;
  onCancel: () => void;
}

const INITIAL_FORM_DATA: MedicationFormData = {
  emoji: '',
  name: '',
  times: ['08:00'],
  frequency: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  nativeAlarmIds: [],
  doseValue: '',
  doseUnit: '',
  quantityType: '',
  initialQuantity: undefined,
  lowQuantityThreshold: undefined,
};

export function MedicationWizard({ mode, medication, onComplete, onCancel }: MedicationWizardProps) {
  // Initialize form data from medication if editing
  const getInitialFormData = (): MedicationFormData => {
    if (mode === 'edit' && medication) {
      // Apply data migration for existing medications
      return {
        emoji: medication.emoji || '💊', // Default emoji for medications without one
        name: medication.name || '',
        times: medication.times || ['08:00'],
        frequency: medication.frequency ? medication.frequency.split(',').map(s => s.trim()) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        nativeAlarmIds: medication.nativeAlarmIds || [],
        doseValue: medication.doseValue || '',
        doseUnit: medication.doseUnit || '',
        quantityType: medication.quantityType || '',
        // Don't include inventory fields in edit mode - they're managed separately
        initialQuantity: undefined,
        lowQuantityThreshold: undefined,
      };
    }
    return INITIAL_FORM_DATA;
  };

  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 0,
    totalSteps: mode === 'add' ? 4 : 3, // Add mode has inventory step
    formData: getInitialFormData(),
    canProceed: false,
    isSubmitting: false,
  });

  const [showExitDialog, setShowExitDialog] = useState(false);
  const hasUnsavedChanges = useRef(false);

  // Track if form has been modified
  const updateFormData = useCallback((updates: Partial<MedicationFormData>) => {
    hasUnsavedChanges.current = true;
    setWizardState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
    }));
  }, []);

  // Update validation state
  const setCanProceed = useCallback((canProceed: boolean) => {
    setWizardState(prev => ({ ...prev, canProceed }));
  }, []);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    if (!wizardState.canProceed) {
      await triggerHapticFeedback(HapticFeedbackType.ERROR);
      Alert.alert('Validación', 'Por favor completa todos los campos requeridos antes de continuar');
      return;
    }

    if (wizardState.currentStep < wizardState.totalSteps - 1) {
      // Trigger haptic feedback for step transition
      await triggerHapticFeedback(HapticFeedbackType.SELECTION);
      
      setWizardState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        canProceed: false, // Reset validation for next step
      }));
    }
  }, [wizardState.canProceed, wizardState.currentStep, wizardState.totalSteps]);

  const handleBack = useCallback(async () => {
    if (wizardState.currentStep > 0) {
      // Trigger haptic feedback for step transition
      await triggerHapticFeedback(HapticFeedbackType.SELECTION);
      
      setWizardState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
        canProceed: true, // Previous steps are already validated
      }));
    }
  }, [wizardState.currentStep]);

  // Exit handling
  const handleExit = useCallback(() => {
    if (hasUnsavedChanges.current) {
      setShowExitDialog(true);
    } else {
      onCancel();
    }
  }, [onCancel]);

  const handleExitConfirm = useCallback(() => {
    setShowExitDialog(false);
    hasUnsavedChanges.current = false;
    onCancel();
  }, [onCancel]);

  const handleExitCancel = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  // Handle Android back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (wizardState.currentStep > 0) {
        handleBack();
        return true;
      } else {
        handleExit();
        return true;
      }
    });

    return () => backHandler.remove();
  }, [wizardState.currentStep, handleBack, handleExit]);

  // Announce step changes for screen readers
  useEffect(() => {
    const stepLabels = getStepLabels(mode);
    const currentStepLabel = stepLabels[wizardState.currentStep];
    announceForAccessibility(
      `Paso ${wizardState.currentStep + 1} de ${wizardState.totalSteps}: ${currentStepLabel}`
    );
  }, [wizardState.currentStep, wizardState.totalSteps, mode]);

  // Completion handler
  const handleComplete = useCallback(async () => {
    setWizardState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Trigger success haptic feedback
      await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
      
      // Pass form data to parent component
      hasUnsavedChanges.current = false;
      await onComplete(wizardState.formData);
      
      // Announce completion for screen readers
      announceForAccessibility(
        mode === 'add' 
          ? 'Medicamento guardado exitosamente' 
          : 'Medicamento actualizado exitosamente'
      );
    } catch (error) {
      console.error('[MedicationWizard] Error in completion handler:', error);
      await triggerHapticFeedback(HapticFeedbackType.ERROR);
      Alert.alert('Error', 'No se pudo guardar el medicamento');
      setWizardState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [onComplete, wizardState.formData, mode]);

  // Render current step
  const renderStep = () => {
    const isFirstStep = wizardState.currentStep === 0;
    const isLastStep = wizardState.currentStep === wizardState.totalSteps - 1;

    // Render step content based on current step with lazy loading
    let stepContent;
    switch (wizardState.currentStep) {
      case 0:
        stepContent = <MedicationIconNameStep />;
        break;
      case 1:
        stepContent = <MedicationScheduleStep />;
        break;
      case 2:
        stepContent = <MedicationDosageStep />;
        break;
      case 3:
        stepContent = <MedicationInventoryStep />;
        break;
      default:
        stepContent = null;
    }

    return (
      <View style={styles.stepContainer}>
        {/* Step content with Suspense for lazy loading */}
        <View style={styles.stepContent}>
          <Suspense fallback={
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          }>
            {stepContent}
          </Suspense>
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigationContainer}>
          <View style={styles.navigationButtons}>
            {!isFirstStep && (
              <Button
                onPress={handleBack}
                variant="secondary"
                size="lg"
                style={styles.navButton}
                accessibilityLabel="Paso anterior"
                accessibilityHint="Regresa al paso anterior del formulario"
              >
                Atrás
              </Button>
            )}
            
            {isFirstStep && (
              <Button
                onPress={handleExit}
                variant="secondary"
                size="lg"
                style={styles.navButton}
                accessibilityLabel="Cancelar"
                accessibilityHint="Cancela y sale del formulario"
              >
                Cancelar
              </Button>
            )}

            {!isLastStep && (
              <Button
                onPress={handleNext}
                variant="primary"
                size="lg"
                disabled={!wizardState.canProceed}
                style={styles.navButton}
                accessibilityLabel="Siguiente paso"
                accessibilityHint="Continúa al siguiente paso del formulario"
              >
                Siguiente
              </Button>
            )}

            {isLastStep && (
              <Button
                onPress={handleComplete}
                variant="primary"
                size="lg"
                disabled={!wizardState.canProceed}
                loading={wizardState.isSubmitting}
                style={styles.navButton}
                accessibilityLabel={mode === 'add' ? 'Guardar medicamento' : 'Actualizar medicamento'}
                accessibilityHint={mode === 'add' ? 'Guarda el nuevo medicamento' : 'Guarda los cambios del medicamento'}
              >
                {mode === 'add' ? 'Guardar' : 'Actualizar'}
              </Button>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <WizardProvider
      value={{
        formData: wizardState.formData,
        updateFormData,
        setCanProceed,
        mode,
      }}
    >
      <View style={styles.container}>
        {/* Progress Indicator */}
        <WizardProgressIndicator
          currentStep={wizardState.currentStep}
          totalSteps={wizardState.totalSteps}
          stepLabels={getStepLabels(mode)}
        />

        {/* Current Step Content */}
        <View style={styles.content}>
          {renderStep()}
        </View>

        {/* Exit Confirmation Dialog */}
        <ExitConfirmationDialog
          visible={showExitDialog}
          onConfirm={handleExitConfirm}
          onCancel={handleExitCancel}
        />
      </View>
    </WizardProvider>
  );
}

// Helper function to get step labels
function getStepLabels(mode: 'add' | 'edit'): string[] {
  const baseSteps = [
    'Icono y Nombre',
    'Horario',
    'Dosis',
  ];
  
  if (mode === 'add') {
    baseSteps.push('Inventario');
  }
  
  return baseSteps;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
  },
});
