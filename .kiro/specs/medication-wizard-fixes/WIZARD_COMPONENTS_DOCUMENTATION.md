# Medication Wizard Components Documentation

## Overview

The Medication Wizard is a multi-step form interface that guides users through creating or editing medication entries in the Pildhora application. It consists of three main steps, each implemented as a separate React component with comprehensive validation, accessibility features, and responsive design.

## Architecture

### Component Structure

```
src/components/patient/medication-wizard/
├── MedicationWizard.tsx              # Main wizard container
├── WizardContext.tsx                 # Shared state management
├── WizardProgressIndicator.tsx       # Progress bar component
├── MedicationIconNameStep.tsx        # Step 1: Icon & Name
├── MedicationScheduleStep.tsx        # Step 2: Schedule
└── MedicationDosageStep.tsx          # Step 3: Dosage
```

### Data Flow

```
User Input → Local State → Validation → Context Update → Enable/Disable Next Button
     ↓
Form Data Persists Across Steps via WizardContext
     ↓
Final Submission → Save to Database
```

## Step 1: Icon and Name Selection

**File:** `MedicationIconNameStep.tsx`

### Purpose
Allows users to select an emoji icon and enter a name for their medication.

### Key Features

1. **Emoji Selection Grid**
   - 24 pre-selected common medication emojis
   - Responsive grid layout that adapts to screen size
   - Centered alignment for better visual balance
   - Minimum 48x48 dp touch targets for accessibility

2. **Native Emoji Picker**
   - "Más emojis" button opens device's native emoji keyboard
   - Hidden TextInput triggers the keyboard
   - Extracts and validates emoji from user input
   - Handles multi-character emojis (with modifiers and ZWJ sequences)

3. **Name Input**
   - Text input with real-time validation
   - Character limit: 2-50 characters
   - Allows letters, numbers, spaces, hyphens, and Spanish characters
   - Character counter display

4. **Validation**
   - Emoji: Required, must be selected
   - Name: Required, 2-50 characters, valid characters only
   - Debounced validation (300ms) for performance
   - Immediate validation for emoji selection (better UX)

### Responsive Layout

The component calculates responsive emoji grid layout based on screen width:

- **Small phones (< 360px)**: 4-5 emojis per row, 48px emoji size
- **Medium phones (360-768px)**: 5-8 emojis per row, 56px emoji size
- **Tablets (≥ 768px)**: Up to 10 emojis per row, 64px emoji size

### Accessibility

- All interactive elements have proper accessibility labels
- Screen reader support with descriptive hints
- Minimum touch target sizes (48x48 dp)
- Error messages announced via accessibility live regions
- Proper focus management

### Code Example

```typescript
// Responsive emoji grid calculation
const emojiGridLayout = useMemo(() => {
  let emojiSize = 56;
  let gap = 8;
  
  if (screenWidth < 360) {
    emojiSize = 48;
    gap = 6;
  } else if (screenWidth >= 768) {
    emojiSize = 64;
    gap = 12;
  }
  
  const horizontalPadding = spacing.lg * 2;
  const availableWidth = screenWidth - horizontalPadding;
  const emojisPerRow = Math.floor(availableWidth / (emojiSize + gap));
  
  return {
    emojisPerRow: Math.max(4, Math.min(10, emojisPerRow)),
    emojiSize,
    gap,
  };
}, [screenWidth]);
```

## Step 2: Schedule Configuration

**File:** `MedicationScheduleStep.tsx`

### Purpose
Allows users to configure when they need to take their medication (times and days).

### Key Features

1. **Time Management**
   - Add up to 6 different times per day
   - Native time picker (iOS modal, Android default)
   - Times automatically sorted chronologically
   - Edit or delete existing times
   - Must have at least one time

2. **Modern Time Cards**
   - Card-based design with clock emoji
   - Large, bold time display
   - Edit button (pencil icon)
   - Delete button (trash icon) - only shown when multiple times exist
   - Press state visual feedback

3. **Day Selection**
   - Horizontal scrollable row of day chips
   - Select multiple days
   - Must have at least one day selected
   - Spanish day labels (Lun, Mar, Mié, etc.)

4. **Visual Timeline Preview**
   - Custom-built 24-hour timeline
   - Shows medication emoji at scheduled hours
   - Badge indicator for multiple medications per hour
   - Horizontal scroll for full day view
   - Active hour highlighting

### Custom Timeline Component

The `CustomTimeline` component provides a visual representation of the medication schedule:

- 24-hour timeline with hour markers (00-23)
- Medication indicators at scheduled times
- Count badges for multiple times in same hour
- Active hour lines highlighted in primary color
- Horizontal scrolling for full day navigation

### Responsive Layout

- **Small screens**: Smaller card padding, compact icons
- **Medium screens**: Standard layout
- **Tablets**: Larger padding, bigger icons, more spacing

### Time Picker Behavior

- **iOS**: Modal with spinner picker, Cancel/Confirm buttons
- **Android**: Native time picker dialog
- **24-hour format**: Default for consistency
- **Automatic sorting**: Times are sorted after adding/editing

### Accessibility

- Time cards have descriptive labels with formatted time
- Day chips announce selection state
- Timeline provides summary of scheduled times
- All buttons have proper roles and hints

## Step 3: Dosage Configuration

**File:** `MedicationDosageStep.tsx`

### Purpose
Allows users to configure the dosage amount, unit, and medication type.

### Key Features

1. **Dose Value Input**
   - Large, centered numeric input
   - Supports decimal values (up to 2 decimal places)
   - Responsive font size (36-56px based on screen)
   - Real-time validation

2. **Intelligent Unit Filtering**
   - Units filtered based on selected medication type
   - Prevents illogical combinations (e.g., "gramos" for "crema")
   - Automatic unit reset with user notification
   - Custom unit option for "Otro" type

3. **Medication Type Selection**
   - 8 medication types with emoji icons
   - Responsive grid layout (1-3 columns based on screen)
   - Visual selection state
   - Spanish labels

4. **Enhanced Dosage Visualizations**
   - **Pills/Capsules**: Grid of gradient pills with shine effect
   - **Liquid**: Gradient-filled glass container with level indicator
   - **Cream**: Tube/jar with cap and fill level
   - **Other types**: Emoji with count display
   - All visualizations include medication emoji

### Unit Mapping Logic

The `UNIT_MAPPINGS` object defines which units are valid for each medication type:

```typescript
const UNIT_MAPPINGS: Record<string, string[]> = {
  tablets: ['units', 'mg', 'g', 'mcg'],
  capsules: ['units', 'mg', 'g', 'mcg'],
  liquid: ['ml', 'l', 'drops'],
  cream: ['g', 'ml', 'applications'],
  inhaler: ['puffs', 'inhalations'],
  drops: ['drops', 'ml'],
  spray: ['sprays', 'applications', 'ml'],
  other: ['units', 'mg', 'g', 'mcg', 'ml', 'l', 'drops', 'sprays', 'puffs', 'inhalations', 'applications', 'custom'],
};
```

**How it works:**

1. When user selects a medication type, the `useEffect` hook filters available units
2. If the currently selected unit is not compatible with the new type:
   - Unit is reset to empty string
   - User receives an alert notification explaining the change
   - Form validation is re-run
3. Only compatible units are displayed in the unit selector

### Responsive Layout Calculations

```typescript
const responsiveLayout = useMemo(() => {
  const isSmallScreen = screenWidth < 360;
  const isTablet = screenWidth >= 768;
  
  // Quantity type button width
  let quantityTypeWidth = '47%'; // 2 columns (default)
  if (isTablet) {
    quantityTypeWidth = '31%'; // 3 columns
  } else if (isSmallScreen) {
    quantityTypeWidth = '100%'; // 1 column
  }
  
  return {
    isSmallScreen,
    isTablet,
    quantityTypeWidth,
    doseInputFontSize: isSmallScreen ? 36 : isTablet ? 56 : 48,
    chipSize: isSmallScreen ? 'sm' : 'md',
  };
}, [screenWidth]);
```

### Dosage Visualizer Components

#### PillPreview
- Displays up to 12 pills in a grid
- Each pill has gradient coloring and shine effect
- Shows "+X más" text for counts over 12
- Includes medication emoji

#### LiquidPreview
- Glass container with gradient fill
- Fill percentage calculated based on amount and unit
- Different max amounts for ml, l, and drops
- Border and shadow for depth

#### CreamPreview
- Tube/jar visualization with cap
- Gradient coloring for tube body
- Fill level indicator in body section
- Cap section at top with darker color

### Validation

- **Dose Value**: Required, numeric, > 0, max 10 characters
- **Dose Unit**: Required, must be selected
- **Quantity Type**: Required, must be selected
- Debounced validation (300ms) for dose value input
- Immediate validation for unit and type selection

### Accessibility

- Large touch targets for all interactive elements
- Descriptive labels for screen readers
- Error messages announced via live regions
- Proper button roles and states
- Summary box for dose confirmation

## Shared Components

### WizardContext

Provides shared state management across all wizard steps:

```typescript
interface WizardContextValue {
  formData: MedicationFormData;
  updateFormData: (data: Partial<MedicationFormData>) => void;
  canProceed: boolean;
  setCanProceed: (canProceed: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}
```

### WizardProgressIndicator

Visual progress bar showing current step (1/3, 2/3, 3/3).

## Performance Optimizations

### Debounced Validation

All text inputs use debounced validation with 300ms delay to prevent excessive re-renders:

```typescript
const debouncedValidation = useDebouncedCallback((value) => {
  const isValid = validateFields(value);
  setCanProceed(isValid);
}, 300);
```

### Memoization

- All step components wrapped in `React.memo`
- Sub-components (TimeCard, CustomTimeline, preview components) memoized
- Expensive calculations wrapped in `useMemo`
- Event handlers wrapped in `useCallback`

### Responsive Calculations

Responsive layout values calculated once per screen width change using `useMemo`:

```typescript
const responsiveLayout = useMemo(() => {
  // Calculate layout values based on screenWidth
  return { /* layout values */ };
}, [screenWidth]);
```

## Validation Strategy

### Step 1 Validation
- Emoji: Must be selected
- Name: 2-50 characters, valid characters only

### Step 2 Validation
- Times: At least one time, valid format (HH:MM)
- Frequency: At least one day selected

### Step 3 Validation
- Dose Value: Required, numeric, > 0
- Dose Unit: Required
- Quantity Type: Required

### Validation Flow

1. User input triggers local state update
2. Debounced validation runs (300ms delay for text inputs)
3. Validation function checks all fields
4. Error messages updated
5. `setCanProceed()` called with validation result
6. Next button enabled/disabled based on result

## Accessibility Features

### Screen Reader Support

- All interactive elements have `accessibilityLabel`
- Descriptive `accessibilityHint` for complex interactions
- Proper `accessibilityRole` for semantic meaning
- Error messages use `accessibilityLiveRegion="assertive"`

### Touch Targets

- Minimum 48x48 dp for all interactive elements
- `hitSlop` prop for small buttons (edit, delete)
- Adequate spacing between interactive elements

### Visual Feedback

- Clear focus states
- Press states for touchable elements
- Error states with color and text
- Success states for completed fields

### Keyboard Navigation

- Proper `returnKeyType` for inputs
- Logical tab order
- Keyboard dismissal after selection

## Styling Guidelines

### Design Tokens

All components use centralized design tokens from `theme/tokens`:

- **Colors**: `colors.primary`, `colors.gray`, `colors.error`, etc.
- **Spacing**: `spacing.xs` through `spacing.3xl`
- **Typography**: `typography.fontSize`, `typography.fontWeight`
- **Border Radius**: `borderRadius.sm` through `borderRadius.full`
- **Shadows**: `shadows.sm`, `shadows.md`, `shadows.lg`

### Responsive Design

Components adapt to three screen size categories:

1. **Small phones** (< 360px): Compact layout, smaller fonts
2. **Medium phones** (360-768px): Standard layout
3. **Tablets** (≥ 768px): Spacious layout, larger elements

### Visual Hierarchy

- **Headers**: Large, bold titles with descriptive subtitles
- **Section Labels**: Medium weight, clear hierarchy
- **Helper Text**: Smaller, muted color for guidance
- **Error Text**: Red color, small size, centered
- **Info Boxes**: Colored background with left border accent

## Testing Recommendations

### Unit Tests

- Validation logic for each step
- Unit filtering logic
- Emoji extraction logic
- Responsive layout calculations

### Integration Tests

- Complete wizard flow (all 3 steps)
- Navigation between steps
- Form data persistence
- Unit reset when changing medication type

### Accessibility Tests

- Screen reader compatibility (TalkBack/VoiceOver)
- Keyboard navigation
- Touch target sizes
- Color contrast ratios

### Visual Tests

- Emoji grid layout on different screen sizes
- Time card styling and layout
- Timeline visualization
- Dosage preview components
- Responsive behavior

## Common Issues and Solutions

### Issue: Emoji keyboard doesn't open

**Solution**: The hidden TextInput may not be receiving focus. Check that:
- `emojiInputRef.current` is not null
- The input is not disabled
- The component is mounted

### Issue: Unit reset alert appears unexpectedly

**Solution**: This happens when changing medication type to one that doesn't support the current unit. This is expected behavior to prevent illogical combinations.

### Issue: Timeline doesn't scroll

**Solution**: Ensure the ScrollView has `horizontal={true}` and sufficient content width.

### Issue: Validation doesn't update

**Solution**: Check that:
- Debounced validation is being called
- `setCanProceed()` is being invoked
- Context is properly connected

## Future Enhancements

### Potential Improvements

1. **Medication Search**: Add autocomplete for common medication names
2. **Dosage Templates**: Pre-filled templates for common medications
3. **Photo Upload**: Allow users to upload medication photos
4. **Barcode Scanner**: Scan medication barcodes for auto-fill
5. **Reminder Customization**: More granular reminder settings
6. **Multi-language**: Support for additional languages beyond Spanish
7. **Voice Input**: Voice-to-text for medication names
8. **Medication Interactions**: Warn about potential drug interactions

## Related Documentation

- [Requirements Document](./requirements.md)
- [Design Document](./design.md)
- [Task List](./tasks.md)
- [Performance Quick Reference](./PERFORMANCE_QUICK_REFERENCE.md)
- [Accessibility Testing Complete](./ACCESSIBILITY_TESTING_COMPLETE.md)
- [Responsive Layout Visual Guide](./RESPONSIVE_LAYOUT_VISUAL_GUIDE.md)
- [Timeline Visual Guide](./TIMELINE_VISUAL_GUIDE.md)
- [Cream Preview Visual Guide](./CREAM_PREVIEW_VISUAL_GUIDE.md)

## Changelog

### Version 1.0 (Current)

- Complete Spanish localization
- Responsive emoji grid with centering
- Functional "Más emojis" button
- Modern time card design
- Custom 24-hour timeline
- Intelligent unit filtering
- Enhanced dosage visualizations
- Comprehensive accessibility support
- Performance optimizations
- Full documentation

---

**Last Updated**: November 15, 2025
**Maintained By**: Pildhora Development Team
