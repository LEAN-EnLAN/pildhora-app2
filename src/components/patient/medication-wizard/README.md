# Medication Wizard

A multi-step wizard component for creating and editing medications with a guided, user-friendly interface.

## Components

### MedicationWizard

The main container component that orchestrates the wizard flow.

**Props:**
- `mode: 'add' | 'edit'` - Determines if creating new or editing existing medication
- `medication?: Medication` - Optional medication data for edit mode
- `onComplete: () => void` - Callback when wizard is completed
- `onCancel: () => void` - Callback when wizard is cancelled

**Features:**
- Multi-step navigation with validation gates
- Form data persistence across steps
- Exit confirmation for unsaved changes
- Android back button handling
- Progress tracking

**Usage:**
```tsx
import { MedicationWizard } from '@/components/patient/medication-wizard';

<MedicationWizard
  mode="add"
  onComplete={() => {
    // Handle completion
  }}
  onCancel={() => {
    // Handle cancellation
  }}
/>
```

### WizardProgressIndicator

Visual progress indicator showing current step and completion status.

**Props:**
- `currentStep: number` - Current step index (0-based)
- `totalSteps: number` - Total number of steps
- `stepLabels: string[]` - Labels for each step

**Features:**
- Visual progress bar
- Step circles with completion indicators
- Accessible with screen reader support
- Color-coded step states (completed, current, pending)

### ExitConfirmationDialog

Modal dialog for confirming exit when there are unsaved changes.

**Props:**
- `visible: boolean` - Controls dialog visibility
- `onConfirm: () => void` - Callback when user confirms exit
- `onCancel: () => void` - Callback when user cancels exit

### WizardContext

React context for sharing wizard state with step components.

**Context Value:**
- `formData: MedicationFormData` - Current form data
- `updateFormData: (updates: Partial<MedicationFormData>) => void` - Update form data
- `setCanProceed: (canProceed: boolean) => void` - Set validation state
- `mode: 'add' | 'edit'` - Current wizard mode

**Usage in Step Components:**
```tsx
import { useWizardContext } from '@/components/patient/medication-wizard';

function MyStep() {
  const { formData, updateFormData, setCanProceed } = useWizardContext();
  
  // Use context to access and update form data
}
```

## Form Data Structure

```typescript
interface MedicationFormData {
  // Step 1: Icon & Name
  emoji: string;
  name: string;
  
  // Step 2: Schedule
  times: string[];
  frequency: string[];
  nativeAlarmIds: string[];
  
  // Step 3: Dosage
  doseValue: string;
  doseUnit: string;
  quantityType: string;
  
  // Step 4: Inventory (add mode only)
  initialQuantity?: number;
  lowQuantityThreshold?: number;
}
```

## Navigation Flow

1. **Step 0**: Icon & Name Selection (to be implemented)
2. **Step 1**: Schedule Configuration (to be implemented)
3. **Step 2**: Dosage Configuration (to be implemented)
4. **Step 3**: Inventory Setup (add mode only, to be implemented)

## Validation

Each step must set `canProceed` to `true` before the user can navigate to the next step. The wizard enforces this validation gate.

## Accessibility

- Screen reader support for progress indicator
- Accessible labels and hints on all interactive elements
- Keyboard navigation support
- Android back button handling

## Next Steps

The following step components need to be implemented:
- MedicationIconNameStep (Task 5)
- MedicationScheduleStep (Task 6)
- MedicationDosageStep (Task 8)
- MedicationInventoryStep (Task 9)
