# Design Document

## Overview

This design document outlines the comprehensive refactoring of the medication wizard components to address critical usability issues. The redesign focuses on complete Spanish localization, improved visual design, functional feature implementation, and intelligent medication type/unit relationships. The goal is to create a polished, intuitive, and professional medication configuration experience.

### Key Design Goals

1. **Complete Spanish Localization**: All text, labels, and messages in Spanish
2. **Visual Polish**: Modern, attractive UI with proper spacing and layout
3. **Functional Completeness**: All features work as expected
4. **Logical Relationships**: Medication types and units make sense together
5. **Responsive Design**: Works beautifully on all screen sizes
6. **Performance**: Smooth interactions and transitions

## Architecture

### Component Structure

```
src/components/patient/medication-wizard/
├── MedicationIconNameStep.tsx       # Step 1 - Refactored
├── MedicationScheduleStep.tsx       # Step 2 - Complete redesign
├── MedicationDosageStep.tsx         # Step 3 - Enhanced
├── WizardContext.tsx                # Shared context (unchanged)
├── WizardProgressIndicator.tsx      # Progress bar (unchanged)
└── MedicationWizard.tsx             # Container (unchanged)
```

### Data Flow

```
User Input → Validation → Context Update → Visual Feedback
     ↓
Type Selection → Filter Units → Update Available Options
     ↓
Form Completion → Enable Next Button → Proceed to Next Step
```

## Components and Interfaces

### 1. Step 1: Icon and Name Selection (Refactored)

#### Spanish Localization

**All Text Updates**:
```typescript
const SPANISH_TEXT = {
  title: 'Icono y Nombre',
  subtitle: 'Selecciona un icono y escribe el nombre de tu medicamento',
  iconLabel: 'Icono del medicamento',
  iconHelper: 'Toca un icono para seleccionarlo',
  nameLabel: 'Nombre del medicamento',
  namePlaceholder: 'Ej: Aspirina, Ibuprofeno, Vitamina C',
  moreEmojisButton: 'Más emojis...',
  infoText: 'El icono te ayudará a identificar rápidamente tu medicamento en la lista',
  errors: {
    noIcon: 'Selecciona un icono para tu medicamento',
    noName: 'Ingresa el nombre del medicamento',
    nameTooShort: 'El nombre debe tener al menos 2 caracteres',
    nameTooLong: 'El nombre no puede exceder 50 caracteres',
    invalidChars: 'El nombre solo puede contener letras, números, espacios y guiones'
  }
};
```

#### Emoji Mosaic Layout

**Responsive Grid**:
```typescript
const EmojiGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;  // Center the grid
  align-items: center;
  gap: ${spacing.sm}px;
  padding-horizontal: ${spacing.md}px;
`;

const EmojiButton = styled.TouchableOpacity`
  width: 56px;
  height: 56px;
  border-radius: ${borderRadius.md}px;
  background-color: ${colors.surface};
  border-width: 1px;
  border-color: ${colors.gray[300]};
  justify-content: center;
  align-items: center;
  
  // Ensure minimum touch target
  min-width: 48px;
  min-height: 48px;
`;
```

**Responsive Calculation**:
```typescript
const useResponsiveEmojiGrid = () => {
  const { width } = useWindowDimensions();
  
  // Calculate how many emojis fit per row
  const emojiSize = 56;
  const gap = 8;
  const padding = 32;
  const availableWidth = width - padding;
  const emojisPerRow = Math.floor(availableWidth / (emojiSize + gap));
  
  return { emojisPerRow };
};
```

#### Functional "Más Emojis" Button

**Implementation**:
```typescript
const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
const emojiInputRef = useRef<TextInput>(null);

const handleMoreEmojis = () => {
  // Focus the hidden input to trigger native emoji keyboard
  emojiInputRef.current?.focus();
  setShowEmojiKeyboard(true);
};

// Hidden input that triggers emoji keyboard
<TextInput
  ref={emojiInputRef}
  style={styles.hiddenEmojiInput}
  value={emoji}
  onChangeText={(text) => {
    // Extract only the first emoji (handle multi-char emojis)
    const emojiMatch = text.match(/\p{Emoji}/u);
    if (emojiMatch) {
      handleEmojiSelect(emojiMatch[0]);
    }
    // Blur to close keyboard
    emojiInputRef.current?.blur();
  }}
  keyboardType="default"
  autoFocus={false}
  accessible={false}
/>
```

### 2. Step 2: Schedule Configuration (Complete Redesign)

#### Remove External Package

**Remove**:
```typescript
// DELETE THIS
import { HorizontalTimeline } from 'react-native-horizontal-timeline';
```

#### New Schedule Card Design

**Time Card Component**:
```typescript
interface TimeCardProps {
  time: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

function TimeCard({ time, index, onEdit, onDelete, canDelete }: TimeCardProps) {
  return (
    <View style={styles.timeCard}>
      <TouchableOpacity 
        style={styles.timeCardContent}
        onPress={onEdit}
        activeOpacity={0.7}
      >
        <View style={styles.timeCardIcon}>
          <Text style={styles.timeCardEmoji}>🕐</Text>
        </View>
        <View style={styles.timeCardInfo}>
          <Text style={styles.timeCardLabel}>Horario {index + 1}</Text>
          <Text style={styles.timeCardTime}>{formatTime(time)}</Text>
        </View>
        <View style={styles.timeCardActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="pencil" size={20} color={colors.primary[500]} />
          </TouchableOpacity>
          {canDelete && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
```

**Styles**:
```typescript
timeCard: {
  backgroundColor: colors.surface,
  borderRadius: borderRadius.lg,
  marginBottom: spacing.md,
  ...shadows.md,
  overflow: 'hidden',
},
timeCardContent: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: spacing.lg,
  gap: spacing.md,
},
timeCardIcon: {
  width: 48,
  height: 48,
  borderRadius: borderRadius.full,
  backgroundColor: colors.primary[50],
  justifyContent: 'center',
  alignItems: 'center',
},
timeCardEmoji: {
  fontSize: 24,
},
timeCardInfo: {
  flex: 1,
},
timeCardLabel: {
  fontSize: typography.fontSize.sm,
  color: colors.gray[600],
  marginBottom: spacing.xs,
},
timeCardTime: {
  fontSize: typography.fontSize.xl,
  fontWeight: typography.fontWeight.bold,
  color: colors.gray[900],
  letterSpacing: -0.5,
},
timeCardActions: {
  flexDirection: 'row',
  gap: spacing.sm,
},
editButton: {
  width: 40,
  height: 40,
  borderRadius: borderRadius.md,
  backgroundColor: colors.primary[50],
  justifyContent: 'center',
  alignItems: 'center',
},
deleteButton: {
  width: 40,
  height: 40,
  borderRadius: borderRadius.md,
  backgroundColor: colors.error[50],
  justifyContent: 'center',
  alignItems: 'center',
},
```

#### Custom Schedule Preview Timeline

**New Timeline Component**:
```typescript
interface CustomTimelineProps {
  times: string[];
  emoji?: string;
}

function CustomTimeline({ times, emoji = '💊' }: CustomTimelineProps) {
  // Convert times to hours for visualization
  const timeHours = times.map(time => {
    const [hours] = time.split(':').map(Number);
    return hours;
  });

  return (
    <View style={styles.timeline}>
      <View style={styles.timelineHeader}>
        <Text style={styles.timelineTitle}>Vista previa del día</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineContent}
      >
        {Array.from({ length: 24 }).map((_, hour) => {
          const hasMedication = timeHours.includes(hour);
          const medicationTimes = times.filter(time => {
            const [h] = time.split(':').map(Number);
            return h === hour;
          });
          
          return (
            <View key={hour} style={styles.timelineHour}>
              {/* Hour marker */}
              <View style={styles.hourMarker}>
                <Text style={styles.hourLabel}>
                  {hour.toString().padStart(2, '0')}
                </Text>
              </View>
              
              {/* Medication indicator */}
              {hasMedication && (
                <View style={styles.medicationIndicator}>
                  <Text style={styles.medicationEmoji}>{emoji}</Text>
                  {medicationTimes.length > 1 && (
                    <View style={styles.medicationBadge}>
                      <Text style={styles.medicationBadgeText}>
                        {medicationTimes.length}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Hour line */}
              <View style={[
                styles.hourLine,
                hasMedication && styles.hourLineActive
              ]} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
```

**Timeline Styles**:
```typescript
timeline: {
  backgroundColor: colors.surface,
  borderRadius: borderRadius.lg,
  padding: spacing.lg,
  ...shadows.sm,
},
timelineHeader: {
  marginBottom: spacing.md,
},
timelineTitle: {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.gray[900],
},
timelineContent: {
  paddingVertical: spacing.md,
  gap: spacing.xs,
},
timelineHour: {
  alignItems: 'center',
  width: 60,
},
hourMarker: {
  marginBottom: spacing.xs,
},
hourLabel: {
  fontSize: typography.fontSize.xs,
  color: colors.gray[500],
  fontWeight: typography.fontWeight.medium,
},
medicationIndicator: {
  position: 'relative',
  marginBottom: spacing.xs,
},
medicationEmoji: {
  fontSize: 28,
},
medicationBadge: {
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: colors.primary[500],
  borderRadius: borderRadius.full,
  width: 18,
  height: 18,
  justifyContent: 'center',
  alignItems: 'center',
},
medicationBadgeText: {
  fontSize: 10,
  fontWeight: typography.fontWeight.bold,
  color: colors.surface,
},
hourLine: {
  width: 2,
  height: 40,
  backgroundColor: colors.gray[200],
},
hourLineActive: {
  backgroundColor: colors.primary[500],
  width: 3,
},
```

#### Day Selector Enhancement

**Horizontal Scrollable Row**:
```typescript
<ScrollView 
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.daysScrollContent}
>
  {DAYS_OF_WEEK.map((day) => (
    <Chip
      key={day.value}
      label={day.label}
      selected={frequency.includes(day.value)}
      onPress={() => handleDayToggle(day.value)}
      variant="outlined"
      color="primary"
      size="md"
      style={styles.dayChip}
    />
  ))}
</ScrollView>
```

### 3. Step 3: Dosage Configuration (Enhanced)

#### Spanish Localization

**Updated Text**:
```typescript
const SPANISH_TEXT = {
  title: 'Dosis',
  subtitle: 'Configura la cantidad y tipo de medicamento que debes tomar',
  quantityLabel: 'Cantidad',
  quantityHelper: 'Ingresa el valor numérico de la dosis',
  unitLabel: 'Unidad',
  unitHelper: 'Selecciona la unidad de medida',
  typeLabel: 'Tipo de medicamento',
  typeHelper: 'Selecciona la forma del medicamento',
  customUnitLabel: 'Unidad personalizada',
  customUnitPlaceholder: 'Ej: cucharadas, sobres',
  previewLabel: 'Vista previa:',
  summaryLabel: 'Resumen de la dosis:',
  infoText: 'Asegúrate de ingresar la dosis exacta como aparece en tu receta médica',
};

// Spanish medication types
const MEDICATION_TYPES_ES = [
  { id: 'tablets', label: 'Tabletas', icon: '💊' },
  { id: 'capsules', label: 'Cápsulas', icon: '💊' },
  { id: 'liquid', label: 'Líquido', icon: '🧪' },
  { id: 'cream', label: 'Crema', icon: '🧴' },
  { id: 'inhaler', label: 'Inhalador', icon: '💨' },
  { id: 'drops', label: 'Gotas', icon: '💧' },
  { id: 'spray', label: 'Spray', icon: '💦' },
  { id: 'other', label: 'Otro', icon: '📦' },
];
```

#### Intelligent Unit Filtering

**Unit Mapping by Type**:
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

// Spanish unit labels
const DOSE_UNITS_ES = [
  { id: 'mg', label: 'mg (miligramos)' },
  { id: 'g', label: 'g (gramos)' },
  { id: 'mcg', label: 'mcg (microgramos)' },
  { id: 'ml', label: 'ml (mililitros)' },
  { id: 'l', label: 'l (litros)' },
  { id: 'units', label: 'unidades' },
  { id: 'drops', label: 'gotas' },
  { id: 'sprays', label: 'sprays' },
  { id: 'puffs', label: 'inhalaciones' },
  { id: 'inhalations', label: 'inhalaciones' },
  { id: 'applications', label: 'aplicaciones' },
  { id: 'custom', label: 'Unidad personalizada' },
];
```

**Filtering Logic**:
```typescript
const [availableUnits, setAvailableUnits] = useState<typeof DOSE_UNITS_ES>([]);

useEffect(() => {
  if (quantityType) {
    const allowedUnitIds = UNIT_MAPPINGS[quantityType] || [];
    const filtered = DOSE_UNITS_ES.filter(unit => 
      allowedUnitIds.includes(unit.id)
    );
    setAvailableUnits(filtered);
    
    // Reset unit if it's not compatible
    if (doseUnit && !allowedUnitIds.includes(doseUnit)) {
      setDoseUnit('');
      updateFormData({ doseUnit: '' });
      // Show toast notification
      Alert.alert(
        'Unidad reiniciada',
        'La unidad anterior no es compatible con el tipo de medicamento seleccionado. Por favor, selecciona una nueva unidad.',
        [{ text: 'Entendido' }]
      );
    }
  }
}, [quantityType]);
```

#### Enhanced Dosage Preview

**Improved Pill Visualization**:
```typescript
function PillPreview({ count }: { count: number }) {
  const displayCount = Math.min(count, 12);
  
  return (
    <View style={styles.pillPreview}>
      <View style={styles.pillGrid}>
        {Array.from({ length: displayCount }).map((_, index) => (
          <View key={index} style={styles.pillContainer}>
            <LinearGradient
              colors={[colors.primary[400], colors.primary[600]]}
              style={styles.pill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.pillShine} />
            </LinearGradient>
          </View>
        ))}
      </View>
      {count > 12 && (
        <Text style={styles.pillMoreText}>
          +{count - 12} más
        </Text>
      )}
    </View>
  );
}
```

**Improved Liquid Visualization**:
```typescript
function LiquidPreview({ amount, unit }: { amount: number; unit: string }) {
  const fillPercentage = Math.min((amount / 100) * 100, 100);
  
  return (
    <View style={styles.liquidPreview}>
      <View style={styles.liquidContainer}>
        <LinearGradient
          colors={[colors.info[300], colors.info[500]]}
          style={[styles.liquidFill, { height: `${fillPercentage}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.liquidGlass} />
      </View>
      <Text style={styles.liquidLabel}>
        {amount} {unit}
      </Text>
    </View>
  );
}
```

**Improved Cream Visualization**:
```typescript
function CreamPreview({ amount, unit }: { amount: number; unit: string }) {
  return (
    <View style={styles.creamPreview}>
      <View style={styles.creamTube}>
        <LinearGradient
          colors={[colors.success[300], colors.success[500]]}
          style={styles.creamTubeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.creamCap} />
          <View style={styles.creamBody}>
            <View 
              style={[
                styles.creamFill, 
                { width: `${Math.min((amount / 100) * 100, 100)}%` }
              ]} 
            />
          </View>
        </LinearGradient>
      </View>
      <Text style={styles.creamLabel}>
        {amount} {unit}
      </Text>
    </View>
  );
}
```

**Preview Styles**:
```typescript
// Pill Preview
pillPreview: {
  alignItems: 'center',
  padding: spacing.lg,
},
pillGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: spacing.sm,
  maxWidth: 300,
},
pillContainer: {
  width: 40,
  height: 40,
},
pill: {
  width: '100%',
  height: '100%',
  borderRadius: borderRadius.full,
  justifyContent: 'center',
  alignItems: 'center',
  ...shadows.sm,
},
pillShine: {
  position: 'absolute',
  top: 8,
  left: 8,
  width: 12,
  height: 12,
  borderRadius: borderRadius.full,
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
},
pillMoreText: {
  marginTop: spacing.md,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.gray[600],
},

// Liquid Preview
liquidPreview: {
  alignItems: 'center',
  padding: spacing.lg,
},
liquidContainer: {
  width: 80,
  height: 120,
  position: 'relative',
  marginBottom: spacing.md,
},
liquidFill: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  borderBottomLeftRadius: borderRadius.md,
  borderBottomRightRadius: borderRadius.md,
},
liquidGlass: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderWidth: 3,
  borderColor: colors.gray[400],
  borderRadius: borderRadius.md,
  backgroundColor: 'transparent',
},
liquidLabel: {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.gray[900],
},

// Cream Preview
creamPreview: {
  alignItems: 'center',
  padding: spacing.lg,
},
creamTube: {
  width: 100,
  height: 140,
  marginBottom: spacing.md,
},
creamTubeGradient: {
  width: '100%',
  height: '100%',
  borderRadius: borderRadius.lg,
  overflow: 'hidden',
  ...shadows.md,
},
creamCap: {
  height: 30,
  backgroundColor: colors.gray[700],
  borderTopLeftRadius: borderRadius.lg,
  borderTopRightRadius: borderRadius.lg,
},
creamBody: {
  flex: 1,
  padding: spacing.sm,
  justifyContent: 'flex-end',
},
creamFill: {
  height: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: borderRadius.sm,
},
creamLabel: {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.gray[900],
},
```

## Data Models

### Updated Medication Type

```typescript
interface MedicationFormData {
  // Step 1
  emoji: string;
  name: string;
  
  // Step 2
  times: string[];
  frequency: string[];
  nativeAlarmIds: string[];
  
  // Step 3
  doseValue: string;
  doseUnit: string;
  quantityType: string;
  
  // Step 4 (unchanged)
  initialQuantity?: number;
  lowQuantityThreshold?: number;
}
```

### Unit Mapping Configuration

```typescript
interface UnitMapping {
  medicationType: string;
  allowedUnits: string[];
  defaultUnit?: string;
}

const UNIT_MAPPINGS: UnitMapping[] = [
  {
    medicationType: 'tablets',
    allowedUnits: ['units', 'mg', 'g', 'mcg'],
    defaultUnit: 'units',
  },
  {
    medicationType: 'capsules',
    allowedUnits: ['units', 'mg', 'g', 'mcg'],
    defaultUnit: 'units',
  },
  {
    medicationType: 'liquid',
    allowedUnits: ['ml', 'l', 'drops'],
    defaultUnit: 'ml',
  },
  {
    medicationType: 'cream',
    allowedUnits: ['g', 'ml', 'applications'],
    defaultUnit: 'g',
  },
  {
    medicationType: 'inhaler',
    allowedUnits: ['puffs', 'inhalations'],
    defaultUnit: 'puffs',
  },
  {
    medicationType: 'drops',
    allowedUnits: ['drops', 'ml'],
    defaultUnit: 'drops',
  },
  {
    medicationType: 'spray',
    allowedUnits: ['sprays', 'applications', 'ml'],
    defaultUnit: 'sprays',
  },
  {
    medicationType: 'other',
    allowedUnits: ['units', 'mg', 'g', 'mcg', 'ml', 'l', 'drops', 'sprays', 'puffs', 'inhalations', 'applications', 'custom'],
    defaultUnit: 'units',
  },
];
```

## Error Handling

### Validation Errors

1. **Empty Fields**: Display inline error messages in Spanish
2. **Invalid Format**: Show format requirements
3. **Unit Incompatibility**: Alert user when unit is reset due to type change

### User Feedback

```typescript
// Unit reset notification
Alert.alert(
  'Unidad reiniciada',
  'La unidad anterior no es compatible con el tipo de medicamento seleccionado. Por favor, selecciona una nueva unidad.',
  [{ text: 'Entendido' }]
);

// Emoji keyboard unavailable
Alert.alert(
  'Teclado no disponible',
  'No se pudo abrir el teclado de emojis. Por favor, selecciona un emoji de la cuadrícula.',
  [{ text: 'OK' }]
);
```

## Testing Strategy

### Unit Tests

1. **Unit Filtering Logic**: Verify correct units shown for each type
2. **Unit Reset Logic**: Verify unit is cleared when incompatible
3. **Spanish Text**: Verify all text is in Spanish
4. **Emoji Selection**: Verify emoji updates correctly

### Integration Tests

1. **Complete Wizard Flow**: Test all three steps in sequence
2. **Type-Unit Relationship**: Test changing types and verifying units
3. **Schedule Preview**: Test timeline displays correctly
4. **Dosage Preview**: Test all visualization types

### Visual Tests

1. **Emoji Grid Layout**: Verify centering and responsiveness
2. **Schedule Cards**: Verify card styling and layout
3. **Timeline**: Verify timeline displays correctly
4. **Dosage Previews**: Verify all preview types look good

## Performance Considerations

1. **Debounced Validation**: 300ms delay for text inputs
2. **Memoized Components**: Use React.memo for preview components
3. **Optimized Renders**: Avoid unnecessary re-renders
4. **Smooth Animations**: Use native driver for all animations

## Accessibility

1. **Screen Reader Support**: All components have proper labels
2. **Touch Targets**: Minimum 48x48 dp for all interactive elements
3. **Color Contrast**: WCAG AA compliant
4. **Focus Management**: Proper focus order through wizard

## Migration Strategy

1. **Phase 1**: Update Spanish text in all components
2. **Phase 2**: Fix emoji mosaic layout and button
3. **Phase 3**: Redesign schedule screen and remove package
4. **Phase 4**: Implement unit filtering logic
5. **Phase 5**: Enhance dosage previews
6. **Phase 6**: Testing and polish

