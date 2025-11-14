# Design Document

## Overview

This design document outlines the architecture and implementation approach for refactoring the medication management and history screens to align with the modern design system established in the patient home screen refactor. The refactor will transform four main screens (medication list, medication detail, medication add/edit, and history) to use consistent design patterns, proper component composition, and enhanced user experience.

The refactor follows the established design system patterns documented in `DESIGN_SYSTEM.md` and `PATIENT_HOME_REFACTOR_SUMMARY.md`, ensuring visual and functional consistency across the patient experience.

## Architecture

### High-Level Structure

```
app/patient/
├── medications/
│   ├── index.tsx          # Medication list screen (refactored)
│   ├── [id].tsx           # Medication detail screen (refactored)
│   ├── add.tsx            # Add medication screen (refactored)
│   └── assistant.tsx      # AI assistant (no changes)
├── history/
│   └── index.tsx          # History screen (refactored)
└── home.tsx               # Patient home (reference implementation)

src/components/
├── ui/                    # Core design system components (existing)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Chip.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   ├── SuccessMessage.tsx
│   └── AnimatedListItem.tsx
├── screens/patient/       # Screen-specific components
│   ├── MedicationListItem.tsx      # Enhanced (existing)
│   ├── MedicationCard.tsx          # New component
│   ├── HistoryRecordCard.tsx       # New component
│   └── HistoryFilterBar.tsx        # New component
└── patient/               # Legacy components
    └── MedicationForm.tsx           # To be refactored
```

### Design Principles

1. **Consistency**: All screens follow the same visual language and interaction patterns
2. **Composition**: Build complex UIs from simple, reusable components
3. **Accessibility**: WCAG 2.1 AA compliance with proper labels and touch targets
4. **Performance**: Optimized rendering with memoization and FlatList best practices
5. **Maintainability**: Use design tokens exclusively, no hardcoded values

## Components and Interfaces

### 1. Medication List Screen (`app/patient/medications/index.tsx`)

#### Component Structure

```typescript
PatientMedicationsScreen
├── SafeAreaView (container)
├── Header
│   ├── Back Button (TouchableOpacity + Icon)
│   ├── Title (Text)
│   └── Add Button (TouchableOpacity + Icon)
├── AnimatedFlatList
│   ├── ListHeaderComponent
│   │   └── Mode Indicator (if device connected)
│   ├── renderItem: AnimatedListItem
│   │   └── MedicationCard
│   └── ListEmptyComponent
│       ├── Icon (Ionicons)
│       ├── Title (Text)
│       ├── Description (Text)
│       └── Add Button (Button component)
└── LoadingSpinner (conditional)
```

#### Props and State

```typescript
interface MedicationListScreenState {
  loading: boolean;
  error: string | null;
  medications: Medication[];
  deviceConnected: boolean;
}

// Redux selectors
const { user } = useSelector((state: RootState) => state.auth);
const { medications, loading, error } = useSelector((state: RootState) => state.medications);
const deviceSlice = useSelector((state: RootState) => (state as any).device);
```

#### Styling Approach

```typescript
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  medicationItem: {
    marginBottom: spacing.md,
  },
  // ... more styles using design tokens
});
```

### 2. MedicationCard Component (New)

A dedicated card component for displaying medication information in the list view.

#### Component Interface

```typescript
interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
  showStatus?: boolean;
  status?: 'pending' | 'taken' | 'missed';
}

export const MedicationCard: React.FC<MedicationCardProps> = React.memo(({
  medication,
  onPress,
  showStatus = false,
  status = 'pending',
}) => {
  // Component implementation
});
```

#### Visual Structure

```
Card (pressable)
├── Header Row
│   ├── Icon Container
│   │   └── Ionicons (medkit-outline)
│   ├── Medication Info
│   │   ├── Name (Text - bold, large)
│   │   └── Dosage (Text - gray, medium)
│   └── Status Badge (optional)
│       └── Chip component
├── Times Section
│   ├── Label (Text - small, gray)
│   └── Times Row
│       └── Chip components (for each time)
└── Frequency Section
    ├── Icon (calendar-outline)
    └── Frequency Text
```

#### Styling

```typescript
const styles = StyleSheet.create({
  card: {
    // Uses Card component with variant="outlined"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  dosage: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  timesSection: {
    marginTop: spacing.md,
  },
  timesLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequencySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  frequencyText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.sm,
  },
});
```

### 3. Medication Detail Screen (`app/patient/medications/[id].tsx`)

#### Component Structure

```typescript
MedicationDetailScreen
├── SafeAreaView
├── Header
│   ├── Back Button
│   ├── Title ("Editar Medicamento")
│   └── Delete Button (icon)
├── ScrollView
│   ├── MedicationForm (refactored)
│   │   ├── Basic Information Section (Card)
│   │   │   ├── Input (name)
│   │   │   ├── Input (dosage)
│   │   │   └── Input (quantity type)
│   │   ├── Schedule Section (Card)
│   │   │   ├── Frequency Selector (Chips)
│   │   │   └── Time Inputs
│   │   └── Actions Section
│   │       ├── Button (Save - primary)
│   │       └── Button (Cancel - secondary)
│   └── Delete Confirmation Modal
└── LoadingSpinner (conditional)
```

#### Form State Management

```typescript
interface MedicationFormState {
  name: string;
  dosage: string;
  doseValue: string;
  doseUnit: string;
  quantityType: string;
  frequency: string[];
  times: string[];
  errors: {
    name?: string;
    dosage?: string;
    times?: string;
  };
  isSubmitting: boolean;
}
```

### 4. History Screen (`app/patient/history/index.tsx`)

#### Component Structure

```typescript
HistoryScreen
├── SafeAreaView
├── Header
│   ├── Back Button
│   ├── Title ("Historial")
│   └── Clear All Button (icon)
├── HistoryFilterBar
│   └── Chip components (All, Taken, Missed)
├── ScrollView
│   ├── Date Groups
│   │   ├── Date Header (Text)
│   │   └── HistoryRecordCard (multiple)
│   └── Clear All Section
│       └── Button (danger variant)
├── Empty State (conditional)
│   ├── Icon
│   ├── Title
│   └── Description
└── LoadingSpinner (conditional)
```

### 5. HistoryFilterBar Component (New)

A dedicated component for filter chips with proper state management.

#### Component Interface

```typescript
interface HistoryFilterBarProps {
  selectedFilter: 'all' | 'taken' | 'missed';
  onFilterChange: (filter: 'all' | 'taken' | 'missed') => void;
  counts?: {
    all: number;
    taken: number;
    missed: number;
  };
}

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  selectedFilter,
  onFilterChange,
  counts,
}) => {
  // Component implementation
};
```

#### Visual Structure

```
View (horizontal scroll container)
└── ScrollView (horizontal)
    ├── Chip ("Todos" + count)
    ├── Chip ("Tomados" + count)
    └── Chip ("Olvidados" + count)
```

### 6. HistoryRecordCard Component (New)

A card component for displaying individual intake records.

#### Component Interface

```typescript
interface HistoryRecordCardProps {
  record: IntakeRecord;
  medication?: {
    id: string;
    name: string;
    dosage: string;
  };
  onMarkAsMissed?: (recordId: string) => void;
  onViewDetails?: (recordId: string) => void;
}

export const HistoryRecordCard: React.FC<HistoryRecordCardProps> = React.memo(({
  record,
  medication,
  onMarkAsMissed,
  onViewDetails,
}) => {
  // Component implementation
});
```

#### Visual Structure

```
Card
├── Main Row
│   ├── Status Indicator (colored bar)
│   ├── Medication Info
│   │   ├── Name (Text - bold)
│   │   ├── Dosage (Text - gray)
│   │   └── Scheduled Time (Text - small)
│   └── Status Badge
│       └── Chip (with icon)
├── Taken At Info (conditional)
│   └── Text (small, gray)
└── Actions Row (conditional)
    └── Button ("Marcar como olvidado")
```

#### Styling

```typescript
const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 4,
    height: 60,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  statusTaken: {
    backgroundColor: colors.success,
  },
  statusMissed: {
    backgroundColor: colors.error,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  dosage: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  scheduledTime: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  takenAtInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  takenAtText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  actionsRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
```

## Data Models

### Medication Model (Existing)

```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;
  doseValue: string;
  doseUnit: string;
  quantityType: string;
  frequency: string; // Comma-separated days: "Mon,Wed,Fri"
  times: string[];   // Array of times: ["08:00", "20:00"]
  caregiverId: string;
  patientId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### IntakeRecord Model (Existing)

```typescript
interface IntakeRecord {
  id: string;
  medicationId?: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date;
  takenAt?: Date;
  status: IntakeStatus;
  patientId: string;
  caregiverId?: string;
  createdAt: Date;
}

enum IntakeStatus {
  PENDING = 'pending',
  TAKEN = 'taken',
  MISSED = 'missed',
}
```

### Enriched Intake Record (Computed)

```typescript
type EnrichedIntakeRecord = IntakeRecord & {
  medication?: {
    id: string;
    name: string;
    dosage: string;
  };
};
```

## Error Handling

### Error States

1. **Network Errors**: Display ErrorMessage component with retry functionality
2. **Validation Errors**: Show inline errors on Input components
3. **Permission Errors**: Display modal explaining required permissions
4. **Data Errors**: Show ErrorMessage with option to refresh or go back

### Error Handling Pattern

```typescript
try {
  // Operation
  await dispatch(fetchMedications(patientId));
} catch (error: any) {
  // Use ErrorMessage component
  setError(error?.message || 'An error occurred');
}
```

### Loading States

```typescript
// Full screen loading
if (loading) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="lg" text="Cargando medicamentos..." />
      </View>
    </SafeAreaView>
  );
}

// Inline loading (button)
<Button loading={isSubmitting} onPress={handleSubmit}>
  {isSubmitting ? 'Guardando...' : 'Guardar'}
</Button>
```

## Testing Strategy

### Unit Tests

1. **Component Tests**
   - MedicationCard renders correctly with all props
   - HistoryRecordCard displays status correctly
   - HistoryFilterBar updates selection
   - Form validation logic works correctly

2. **Hook Tests**
   - useMemo computations are correct
   - useCallback functions maintain referential equality
   - Custom hooks return expected values

3. **Utility Tests**
   - Time formatting functions
   - Date grouping logic
   - Frequency parsing

### Integration Tests

1. **Screen Tests**
   - Medication list loads and displays medications
   - Medication detail screen loads existing medication
   - History screen groups records by date
   - Filter functionality works correctly

2. **Navigation Tests**
   - Navigation between screens works
   - Back button returns to previous screen
   - Deep linking to medication detail works

3. **Redux Integration**
   - Actions dispatch correctly
   - State updates trigger re-renders
   - Subscriptions work properly

### Accessibility Tests

1. **Screen Reader Tests**
   - All interactive elements have labels
   - Navigation is logical
   - Status changes are announced

2. **Touch Target Tests**
   - All buttons meet 44x44 minimum
   - Touch areas don't overlap
   - Gestures work correctly

3. **Visual Tests**
   - Color contrast meets WCAG AA
   - Text is readable at different sizes
   - Focus indicators are visible

### Performance Tests

1. **Rendering Performance**
   - FlatList scrolls smoothly with 100+ items
   - No dropped frames during animations
   - Memory usage is reasonable

2. **Load Time Tests**
   - Initial load completes in < 2 seconds
   - Navigation transitions are smooth
   - Images load progressively

## Implementation Phases

### Phase 1: Core Component Updates

1. Create MedicationCard component
2. Create HistoryRecordCard component
3. Create HistoryFilterBar component
4. Update MedicationListItem component (if needed)

### Phase 2: Medication List Screen

1. Refactor medication list screen structure
2. Implement header with design tokens
3. Add AnimatedListItem wrappers
4. Implement empty state
5. Add loading and error states
6. Add mode indicator for device connection

### Phase 3: Medication Detail Screen

1. Refactor medication detail screen structure
2. Update MedicationForm component
3. Implement form validation with Input components
4. Add delete confirmation modal
5. Implement loading and error states

### Phase 4: History Screen

1. Refactor history screen structure
2. Implement HistoryFilterBar
3. Implement HistoryRecordCard
4. Add date grouping with proper headers
5. Implement empty states for each filter
6. Add clear all functionality with confirmation

### Phase 5: Polish and Optimization

1. Add animations and transitions
2. Optimize FlatList performance
3. Add accessibility labels and hints
4. Test on multiple devices and screen sizes
5. Performance profiling and optimization

## Migration Strategy

### Backward Compatibility

**Critical: Backend and API Compatibility**

- **Redux state structure remains unchanged**: All slices (medicationsSlice, intakesSlice, authSlice, deviceSlice) maintain their current structure
- **API calls remain unchanged**: All Firebase operations (Firestore, RTDB) use existing service functions without modification
- **Data models remain unchanged**: Medication and IntakeRecord interfaces stay exactly as defined
- **No database schema changes**: Firestore collections and RTDB paths remain the same
- **Service layer untouched**: All functions in `src/services/` remain unchanged
- **Redux actions unchanged**: All thunks and actions maintain their current signatures
- **Navigation structure remains unchanged**: All routes and navigation patterns stay the same

**What Changes (Frontend Only)**:
- UI components and their styling
- Component composition and layout
- Design token usage instead of hardcoded values
- Accessibility labels and hints
- Animation implementations
- Component organization and file structure

### Gradual Migration

1. Create new components alongside old ones
2. Update one screen at a time
3. Test thoroughly before moving to next screen
4. Keep old components until all screens are migrated
5. Remove old components after verification

### Backend Safety Checklist

Before making any changes, verify:
- [ ] No modifications to Redux slice reducers or action creators
- [ ] No changes to Firebase service functions
- [ ] No alterations to data model interfaces
- [ ] No updates to API call signatures
- [ ] No changes to Firestore collection names or document structures
- [ ] No modifications to RTDB paths or data structures

During implementation:
- [ ] Only modify component render logic and styling
- [ ] Use existing Redux selectors without modification
- [ ] Call existing dispatch actions with same parameters
- [ ] Maintain existing prop interfaces for data flow
- [ ] Keep all business logic in existing services

After implementation:
- [ ] Verify all CRUD operations still work (Create, Read, Update, Delete)
- [ ] Test medication sync with Firebase
- [ ] Verify intake record creation and updates
- [ ] Check device state subscriptions
- [ ] Validate real-time updates still function

### Testing During Migration

- Test each screen independently
- Verify navigation between old and new screens
- **Verify Redux state updates work identically**
- **Test all Firebase operations (read, write, update, delete)**
- **Verify real-time subscriptions still work**
- **Check device state synchronization**
- Validate accessibility
- Performance testing

## Accessibility Considerations

### Screen Reader Support

```typescript
// Example: Medication card
<Card
  onPress={onPress}
  accessibilityLabel={`${medication.name}, ${medication.dosage}, scheduled at ${times.join(', ')}`}
  accessibilityHint="Tap to view medication details and edit"
  accessibilityRole="button"
>
  {/* Card content */}
</Card>

// Example: Status indicator
<View
  style={[styles.statusIndicator, statusStyle]}
  accessibilityLabel={`Status: ${statusText}`}
  accessibilityRole="text"
/>
```

### Touch Targets

All interactive elements must meet minimum 44x44 points:

```typescript
const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    // Ensures proper touch target
  },
});
```

### Color Contrast

All text must meet WCAG AA contrast ratios:
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

Design tokens already meet these requirements.

## Performance Optimizations

### FlatList Optimization

```typescript
<FlatList
  data={medications}
  renderItem={renderMedicationItem}
  keyExtractor={(item) => item.id}
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={10}
  // Memoized callbacks
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
/>
```

### Component Memoization

```typescript
// Memoize expensive components
export const MedicationCard = React.memo(({ medication, onPress }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.medication.id === nextProps.medication.id &&
         prevProps.medication.updatedAt === nextProps.medication.updatedAt;
});

// Memoize callbacks
const handlePress = useCallback((medicationId: string) => {
  router.push(`/patient/medications/${medicationId}`);
}, [router]);

// Memoize computed values
const groupedHistory = useMemo(() => {
  return groupHistoryByDate(intakes, medications);
}, [intakes, medications]);
```

### Animation Performance

```typescript
// Use native driver for animations
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Important for performance
}).start();

// Avoid animating layout properties
// Good: opacity, transform
// Bad: width, height, padding
```

## Design Tokens Reference

### Spacing Scale

```typescript
spacing.xs    // 4px  - Minimal gaps
spacing.sm    // 8px  - Small gaps
spacing.md    // 12px - Medium gaps
spacing.lg    // 16px - Large gaps (primary padding)
spacing.xl    // 20px - Extra large gaps
spacing['2xl'] // 24px - Section spacing
spacing['3xl'] // 32px - Major section spacing
```

### Typography Scale

```typescript
// Font sizes
typography.fontSize.xs    // 12px - Small labels
typography.fontSize.sm    // 14px - Secondary text
typography.fontSize.base  // 16px - Body text
typography.fontSize.lg    // 18px - Card titles
typography.fontSize.xl    // 20px - Section titles
typography.fontSize['2xl'] // 24px - Screen titles

// Font weights
typography.fontWeight.normal    // 400
typography.fontWeight.medium    // 500
typography.fontWeight.semibold  // 600
typography.fontWeight.bold      // 700
typography.fontWeight.extrabold // 800
```

### Color Palette

```typescript
// Primary colors
colors.primary[50]   // Light backgrounds
colors.primary[500]  // Main actions
colors.primary[700]  // Pressed states

// Semantic colors
colors.success  // #34C759 - Taken status
colors.error    // #FF3B30 - Missed status
colors.warning  // #FF9500 - Warnings
colors.info     // #5856D6 - Information

// Neutral colors
colors.gray[50]   // Lightest backgrounds
colors.gray[200]  // Borders
colors.gray[600]  // Secondary text
colors.gray[900]  // Primary text

// Surface colors
colors.background  // #F2F2F7 - App background
colors.surface     // #FFFFFF - Card background
```

## Conclusion

This design provides a comprehensive blueprint for refactoring the medication and history screens to align with the modern design system. The implementation follows established patterns from the patient home screen refactor, ensuring consistency, accessibility, and maintainability.

Key benefits of this design:
- **Consistency**: All screens use the same design language
- **Maintainability**: Design tokens make updates easy
- **Accessibility**: WCAG 2.1 AA compliant from the start
- **Performance**: Optimized for smooth scrolling and animations
- **Scalability**: Component-based architecture supports future enhancements

The phased implementation approach allows for incremental progress with thorough testing at each stage, minimizing risk and ensuring quality.
