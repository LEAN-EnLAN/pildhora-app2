import React, { createContext, useContext } from 'react';
import { MedicationFormData } from './MedicationWizard';

interface WizardContextValue {
  formData: MedicationFormData;
  updateFormData: (updates: Partial<MedicationFormData>) => void;
  setCanProceed: (canProceed: boolean) => void;
  mode: 'add' | 'edit';
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

export function useWizardContext() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizardContext must be used within a WizardProvider');
  }
  return context;
}

interface WizardProviderProps {
  children: React.ReactNode;
  value: WizardContextValue;
}

export function WizardProvider({ children, value }: WizardProviderProps) {
  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}
