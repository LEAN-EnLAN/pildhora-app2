# Schedule Step Architecture

## Component Structure

```
MedicationScheduleStep
├── ScrollView
│   ├── Header (Title + Subtitle)
│   ├── Times Section
│   │   ├── Time List (gap: 12px)
│   │   └── Add Time Button
│   ├── Days Section
│   │   └── Day Chips (48x48)
│   ├── Timeline Section
│   │   └── Visual Timeline
│   └── Info Box
└── Time Picker Modal (iOS)
    └── SafeAreaView
        ├── Header (Cancel/Title/Confirm)
        └── DateTimePicker
```

## Data Flow

```
WizardContext ↔ Local State ↔ User Actions ↔ Validation ↔ Context Update
```

## iOS Modal Flow

```
Tap "Agregar" → handleAddTime() → Modal appears → User selects → 
handleIOSConfirm() → Update times → Validation → Context update
```

## Styling Hierarchy

```
Design Tokens → Component Styles → Platform-Specific Styles
```

## Key Improvements

1. **Native iOS Modal** - Proper Modal with SafeAreaView
2. **Better Spacing** - 24px sections, 16px padding, 12px gaps
3. **Larger Touch Targets** - 60px buttons, 48px chips
4. **Enhanced Typography** - 20px time text, semibold weights
5. **Professional Polish** - Shadows, borders, letter-spacing

## Touch Target Sizes

- Time buttons: 60px height ✅
- Remove buttons: 48x48 ✅
- Add button: 60px height ✅
- Day chips: 48x48 ✅
- Modal buttons: 44x44 + hit slop ✅

All meet or exceed WCAG 2.1 AA requirements (44x44 minimum).
