# MedicationScheduleStep - Visual Guide

## Component Overview

The Schedule Configuration Step provides an intuitive interface for setting medication times and days.

## Screen Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back                                    Next →   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ● ─ ─ ○ ─ ○                                      │
│  Step 2 of 4                                       │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │                                           │    │
│  │  Horario                                  │    │
│  │  Configura cuándo debes tomar tu          │    │
│  │  medicamento                              │    │
│  │                                           │    │
│  │  Horarios *                               │    │
│  │  Selecciona los horarios en los que       │    │
│  │  debes tomar tu medicamento               │    │
│  │                                           │    │
│  │  ┌─────────────────────────────────┐     │    │
│  │  │ 🕐  08:00                    ✕  │     │    │
│  │  └─────────────────────────────────┘     │    │
│  │                                           │    │
│  │  ┌─────────────────────────────────┐     │    │
│  │  │ 🕐  12:00                    ✕  │     │    │
│  │  └─────────────────────────────────┘     │    │
│  │                                           │    │
│  │  ┌─────────────────────────────────┐     │    │
│  │  │ 🕐  20:00                    ✕  │     │    │
│  │  └─────────────────────────────────┘     │    │
│  │                                           │    │
│  │  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │    │
│  │  │  +  Agregar horario           │     │    │
│  │  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘     │    │
│  │                                           │    │
│  │  Días de la semana *                      │    │
│  │  Selecciona los días en los que           │    │
│  │  debes tomar tu medicamento               │    │
│  │                                           │    │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐          │    │
│  │  │Lun│ │Mar│ │Mié│ │Jue│ │Vie│          │    │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘          │    │
│  │  ┌───┐ ┌───┐                             │    │
│  │  │Sáb│ │Dom│                             │    │
│  │  └───┘ └───┘                             │    │
│  │                                           │    │
│  │  Vista previa del horario                │    │
│  │  ┌─────────────────────────────────┐     │    │
│  │  │ ─────●─────●─────────●──────── │     │    │
│  │  │ 00:00  06:00  12:00  18:00  24:00    │    │
│  │  │   08:00   12:00      20:00           │    │
│  │  └─────────────────────────────────┘     │    │
│  │                                           │    │
│  │  💡 Puedes agregar hasta 6 horarios      │    │
│  │     diferentes por día. Los horarios     │    │
│  │     se ordenarán automáticamente.        │    │
│  │                                           │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Interactive Elements

### 1. Time Cards
```
┌─────────────────────────────────┐
│ 🕐  08:00                    ✕  │
└─────────────────────────────────┘
 │                              │
 └─ Tap to edit time            └─ Tap to remove
```

**States:**
- Default: White background, gray border
- Pressed: Slightly scaled down (0.95)
- Minimum 1 time required (remove disabled)

### 2. Add Time Button
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│  +  Agregar horario           │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

**States:**
- Default: Dashed border, primary color
- Pressed: Slightly scaled down
- Hidden: When 6 times already added

### 3. Day Chips
```
Selected:        Unselected:
┌───────┐       ┌───────┐
│  Lun  │       │  Lun  │
└───────┘       └───────┘
 Filled          Outlined
 Primary         Gray
```

**States:**
- Selected: Filled with primary color, white text
- Unselected: Outlined, primary text
- Pressed: Scaled animation
- Minimum 1 day required

### 4. Visual Timeline
```
Timeline Bar:
─────●─────●─────────●────────
│    │     │         │        │
00:00 06:00 12:00    18:00   24:00
     08:00  12:00    20:00
```

**Components:**
- Gray horizontal bar (baseline)
- Hour markers (vertical lines)
- Time indicators (blue dots)
- Time labels below dots

## Time Picker Modals

### iOS Time Picker
```
┌─────────────────────────────────┐
│ Cancelar  Seleccionar hora  Confirmar │
├─────────────────────────────────┤
│                                 │
│         ┌───┐  ┌───┐           │
│         │ 8 │  │00 │           │
│         ├───┤  ├───┤           │
│         │ 9 │  │15 │  ← Spinner│
│         ├───┤  ├───┤           │
│         │10 │  │30 │           │
│         └───┘  └───┘           │
│                                 │
└─────────────────────────────────┘
```

### Android Time Picker
```
┌─────────────────────┐
│   Seleccionar hora  │
├─────────────────────┤
│                     │
│        12           │
│    9       3        │
│        6            │
│                     │
│   08 : 00           │
│                     │
│  [Cancelar] [OK]    │
└─────────────────────┘
```

## User Interactions

### Adding a Time
1. User taps "Agregar horario"
2. Time picker appears
3. User selects time
4. Time is added to list (sorted)
5. Timeline updates

### Editing a Time
1. User taps time card
2. Time picker appears with current time
3. User adjusts time
4. Time updates in list (re-sorted)
5. Timeline updates

### Removing a Time
1. User taps X button
2. Time is removed (if > 1 time)
3. Timeline updates

### Selecting Days
1. User taps day chip
2. Chip toggles selected state
3. Visual feedback (fill/outline)
4. Minimum 1 day enforced

## Validation States

### Valid State
- ✅ At least 1 time selected
- ✅ At least 1 day selected
- ✅ All times in valid format
- → "Next" button enabled

### Invalid State
- ❌ No times selected
- ❌ No days selected
- ❌ Invalid time format
- → "Next" button disabled
- → Error message shown

## Accessibility

### Screen Reader Announcements
- "Paso 2 de 4: Configuración de horario"
- "Horario 1: 08:00"
- "Lunes está seleccionado. Toca para deseleccionar"
- "Agregar horario. Toca para agregar un nuevo horario"

### Touch Targets
- All buttons: Minimum 44x44 dp
- Time cards: 60dp height
- Day chips: 48x48 dp
- Remove buttons: 48x48 dp

### Visual Feedback
- Haptic feedback on selection
- Scale animation on press
- Color changes on state
- Clear focus indicators

## Responsive Behavior

### Small Screens
- Scrollable content
- Stacked day chips (2 rows)
- Compact timeline

### Large Screens
- More spacing
- Single row day chips
- Expanded timeline

### Landscape
- Horizontal layout maintained
- Scrollable if needed
- Modal pickers adapt

## Color Scheme

### Primary Elements
- Selected chips: Primary 500 (#007AFF)
- Timeline dots: Primary 500
- Add button: Primary 500

### Secondary Elements
- Time cards: Surface (#FFFFFF)
- Borders: Gray 200 (#E5E7EB)
- Text: Gray 900 (#111827)

### Feedback
- Error: Error 500 (#FF3B30)
- Success: Success (#34C759)
- Info: Primary 50 (#E6F0FF)

## Data Format

### Input (from context)
```typescript
{
  times: string[];      // ["08:00", "12:00", "20:00"]
  frequency: string[];  // ["Mon", "Tue", "Wed", "Thu", "Fri"]
}
```

### Output (to context)
```typescript
{
  times: string[];      // Sorted chronologically
  frequency: string[];  // Day codes
}
```

### Day Codes
- Mon = Monday (Lunes)
- Tue = Tuesday (Martes)
- Wed = Wednesday (Miércoles)
- Thu = Thursday (Jueves)
- Fri = Friday (Viernes)
- Sat = Saturday (Sábado)
- Sun = Sunday (Domingo)

## Edge Cases

### Minimum Values
- Times: 1 (cannot remove last time)
- Days: 1 (cannot deselect last day)

### Maximum Values
- Times: 6 (add button hidden)
- Days: 7 (all days selected)

### Time Conflicts
- Duplicate times: Allowed (same time, different days)
- Close times: No minimum gap required
- Sorting: Automatic chronological order

### Platform Differences
- iOS: Modal with spinner
- Android: Native dialog
- Time format: Device settings respected

## Performance

### Optimizations
- Lazy loading in wizard
- Efficient array operations
- Minimal re-renders
- Platform-specific code splitting

### Memory
- Small state footprint
- No heavy computations
- Efficient timeline rendering

## Testing Scenarios

### Happy Path
1. Add 3 times (08:00, 12:00, 20:00)
2. Select weekdays (Mon-Fri)
3. View timeline preview
4. Proceed to next step

### Edge Cases
1. Try to remove last time (should fail)
2. Try to deselect last day (should fail)
3. Add maximum times (6)
4. Select all days (7)

### Error Handling
1. Invalid time format (handled by picker)
2. Network issues (N/A - local only)
3. Platform API failures (graceful degradation)

---

**Component:** MedicationScheduleStep  
**Step:** 2 of 4 (add) / 2 of 3 (edit)  
**Status:** ✅ Complete  
**Last Updated:** 2025-11-15
