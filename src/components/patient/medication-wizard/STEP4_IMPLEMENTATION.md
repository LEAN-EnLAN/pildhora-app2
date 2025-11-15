# Step 4: Inventory Setup - Implementation Guide

## Overview

The MedicationInventoryStep component provides inventory tracking configuration for new medications. This step is only shown in "add" mode and allows patients to set up automatic inventory tracking with low quantity alerts.

## Key Features

### 1. Initial Quantity Input
- **Large numeric keypad input** for easy data entry
- Displays quantity with "dosis" unit label
- Validates input (positive integers only, max 9999)
- Shows visual error messages for invalid input

### 2. Auto-Calculated Low Quantity Threshold
- **Automatically calculates** based on medication schedule
- Formula: `Math.ceil((timesPerDay * daysPerWeek / 7) * 3)`
- Provides 3-day buffer as per requirements
- Updates dynamically when schedule changes

### 3. Manual Threshold Adjustment
- Allows users to override auto-calculated threshold
- Disables auto-calculation when manually edited
- Shows "✨ Calculado automáticamente" badge when using auto-calculation

### 4. Visual Quantity Indicator
- **Pill icon visualization** showing up to 20 pills
- Displays in rows of 10 for easy counting
- Shows "+X más" for quantities over 20
- Includes total count display

### 5. Threshold Preview
- **Progress bar visualization** showing current vs threshold
- Color-coded status (green = sufficient, yellow = low)
- Shows threshold marker on progress bar
- Displays status message: "✅ Cantidad suficiente" or "⚠️ Cantidad baja"

### 6. Skip Option
- **Dashed border button** to skip inventory tracking
- Shows confirmation screen when skipped
- Allows re-enabling from skip screen
- Validates as complete when skipped

## Component Structure

```typescript
MedicationInventoryStep
├── Header (title + subtitle)
├── Initial Quantity Section
│   ├── Large numeric input
│   ├── Error message (if invalid)
│   └── QuantityVisualizer (if valid)
├── Low Quantity Threshold Section (if quantity entered)
│   ├── Threshold input with auto-calculation badge
│   └── ThresholdPreview component
├── Skip Section
│   └── Skip button
└── Info Box
```

## Validation Logic

### Valid States
1. **Tracking enabled with quantity**: `initialQuantity > 0 && initialQuantity <= 9999`
2. **Tracking disabled (skipped)**: `trackInventory === false`

### Invalid States
- Empty quantity when tracking enabled
- Non-numeric quantity
- Quantity <= 0
- Quantity > 9999

## Auto-Threshold Calculation

The threshold is calculated to provide a 3-day buffer:

```typescript
const calculateAutoThreshold = (): number => {
  const timesPerDay = formData.times?.length || 1;
  const daysPerWeek = formData.frequency?.length || 7;
  
  // Calculate average doses per day
  const avgDosesPerWeek = timesPerDay * daysPerWeek;
  const avgDosesPerDay = avgDosesPerWeek / 7;
  
  // 3 days buffer as per requirements
  return Math.ceil(avgDosesPerDay * 3);
};
```

### Example Calculations

| Schedule | Calculation | Threshold |
|----------|-------------|-----------|
| 2x/day, 7 days/week | (2 * 7 / 7) * 3 = 6 | 6 doses |
| 3x/day, 5 days/week | (3 * 5 / 7) * 3 ≈ 6.4 | 7 doses |
| 1x/day, 7 days/week | (1 * 7 / 7) * 3 = 3 | 3 doses |

## Data Flow

### Input → Context
```typescript
// User enters quantity
handleQuantityChange("50")
  ↓
updateFormData({ initialQuantity: 50 })
  ↓
Auto-calculate threshold: 6
  ↓
updateFormData({ lowQuantityThreshold: 6 })
  ↓
setCanProceed(true)
```

### Skip Flow
```typescript
// User clicks skip
handleSkip()
  ↓
setTrackInventory(false)
  ↓
updateFormData({
  initialQuantity: undefined,
  lowQuantityThreshold: undefined
})
  ↓
setCanProceed(true)
```

## Accessibility Features

### Screen Reader Support
- Descriptive labels for all inputs
- Live region announcements for errors
- Semantic role attributes
- Hint text for user guidance

### Keyboard Navigation
- Number pad optimized for quantity input
- Tab order follows logical flow
- Clear focus indicators

### Visual Accessibility
- High contrast colors for status indicators
- Large touch targets (min 44x44 dp)
- Clear visual hierarchy
- Color-blind friendly status colors

## Integration with Wizard

### Mode Handling
```typescript
// Only show in add mode
if (mode === 'edit') {
  return null;
}
```

### Form Data Updates
```typescript
interface MedicationFormData {
  // ... other fields
  initialQuantity?: number;
  lowQuantityThreshold?: number;
}
```

### Validation State
- Component manages its own validation
- Calls `setCanProceed(isValid)` on changes
- Wizard enables/disables "Guardar" button based on validation

## Visual Components

### QuantityVisualizer
- Shows pill icons in rows
- Caps display at 20 pills
- Shows overflow count
- Displays total

### ThresholdPreview
- Progress bar with threshold marker
- Color-coded status
- Status text
- Alert message

## Styling

### Color Scheme
- Primary: Blue (#007AFF) for accents
- Success: Green for sufficient quantity
- Warning: Orange for low quantity
- Error: Red for validation errors
- Gray: Neutral backgrounds and borders

### Layout
- Centered large inputs for focus
- Generous spacing for touch targets
- Card-based sections for organization
- Responsive to different screen sizes

## Testing Considerations

### Unit Tests
- Threshold calculation accuracy
- Validation logic
- Skip/enable toggle
- Form data updates

### Integration Tests
- Wizard navigation with inventory step
- Data persistence across steps
- Mode-based rendering (add vs edit)

### E2E Tests
- Complete flow with inventory tracking
- Skip inventory flow
- Manual threshold adjustment
- Visual indicator accuracy

## Requirements Mapping

This implementation satisfies:
- **Requirement 8.1**: Maintains dose inventory count
- **Requirement 8.5**: Allows manual adjustment of inventory count

### Task Checklist
- ✅ Create `MedicationInventoryStep` component (add mode only)
- ✅ Build initial quantity input with large numeric keypad
- ✅ Implement auto-calculation of low quantity threshold
- ✅ Add visual quantity indicator (progress bar or pill count)
- ✅ Create manual threshold adjustment option
- ✅ Add skip option for medications without inventory tracking

## Usage Example

```typescript
import { MedicationWizard } from '@/components/patient/medication-wizard';

function AddMedicationScreen() {
  const handleComplete = async (formData: MedicationFormData) => {
    // formData includes:
    // - initialQuantity?: number
    // - lowQuantityThreshold?: number
    
    await saveMedication({
      ...formData,
      trackInventory: formData.initialQuantity !== undefined,
      currentQuantity: formData.initialQuantity,
    });
  };

  return (
    <MedicationWizard
      mode="add"
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
```

## Future Enhancements

1. **Refill History**: Track refill dates and quantities
2. **Consumption Patterns**: Analyze usage over time
3. **Smart Predictions**: Predict when refill is needed
4. **Pharmacy Integration**: Link to pharmacy for auto-refill
5. **Multiple Containers**: Track multiple bottles/packages
6. **Expiration Tracking**: Alert for expired medications

## Notes

- Step only appears in "add" mode, not "edit" mode
- Inventory can be managed separately after creation
- Threshold auto-updates when schedule changes
- Skip option provides flexibility for non-tracked medications
- Visual feedback helps users understand inventory status
