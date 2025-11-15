# Unit Mapping Logic Guide

## Overview

The unit mapping system ensures that only logical unit-medication type combinations are available to users. This prevents confusing or incorrect selections like "gramos" for "crema" or "litros" for "tabletas".

## Architecture

### Core Data Structure

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

### Unit Definitions

```typescript
const DOSE_UNITS = [
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

## Medication Type → Unit Mappings

### Tablets (Tabletas)

**Allowed Units:**
- `units` (unidades) - Count of tablets
- `mg` (miligramos) - Weight of active ingredient
- `g` (gramos) - Weight of active ingredient
- `mcg` (microgramos) - Weight of active ingredient

**Rationale:**
Tablets are solid forms measured by count or by the weight of active ingredient.

**Examples:**
- 2 unidades de aspirina
- 500 mg de paracetamol
- 1 g de vitamina C

### Capsules (Cápsulas)

**Allowed Units:**
- `units` (unidades) - Count of capsules
- `mg` (miligramos) - Weight of active ingredient
- `g` (gramos) - Weight of active ingredient
- `mcg` (microgramos) - Weight of active ingredient

**Rationale:**
Capsules are similar to tablets - solid forms measured by count or active ingredient weight.

**Examples:**
- 1 unidad de omeprazol
- 250 mg de amoxicilina
- 50 mcg de levotiroxina

### Liquid (Líquido)

**Allowed Units:**
- `ml` (mililitros) - Volume measurement
- `l` (litros) - Volume measurement
- `drops` (gotas) - Count of drops

**Rationale:**
Liquids are measured by volume or by drops for precise dosing.

**Examples:**
- 10 ml de jarabe
- 0.5 l de solución
- 5 gotas de suspensión

### Cream (Crema)

**Allowed Units:**
- `g` (gramos) - Weight measurement
- `ml` (mililitros) - Volume measurement
- `applications` (aplicaciones) - Number of applications

**Rationale:**
Creams can be measured by weight, volume, or by the number of times applied.

**Examples:**
- 5 g de crema tópica
- 2 ml de gel
- 1 aplicación de pomada

### Inhaler (Inhalador)

**Allowed Units:**
- `puffs` (inhalaciones) - Number of puffs
- `inhalations` (inhalaciones) - Number of inhalations

**Rationale:**
Inhalers are measured by the number of puffs or inhalations taken.

**Examples:**
- 2 inhalaciones de salbutamol
- 1 puff de corticosteroide

### Drops (Gotas)

**Allowed Units:**
- `drops` (gotas) - Count of drops
- `ml` (mililitros) - Volume measurement

**Rationale:**
Eye drops, ear drops, and nasal drops are measured by drop count or volume.

**Examples:**
- 2 gotas en cada ojo
- 0.5 ml de solución oftálmica

### Spray (Spray)

**Allowed Units:**
- `sprays` (sprays) - Number of sprays
- `applications` (aplicaciones) - Number of applications
- `ml` (mililitros) - Volume measurement

**Rationale:**
Sprays can be measured by spray count, applications, or volume.

**Examples:**
- 1 spray nasal
- 2 aplicaciones de spray tópico
- 5 ml de spray bucal

### Other (Otro)

**Allowed Units:**
- All standard units
- `custom` (Unidad personalizada) - User-defined unit

**Rationale:**
For medications that don't fit standard categories, all units are available plus custom option.

**Examples:**
- 1 parche transdérmico (custom: "parches")
- 2 supositorios (custom: "supositorios")
- 1 óvulo (custom: "óvulos")

## Implementation Details

### Filtering Logic

The filtering is implemented in a `useEffect` hook that runs whenever the medication type changes:

```typescript
useEffect(() => {
  if (quantityType) {
    // Get allowed unit IDs for this medication type
    const allowedUnitIds = UNIT_MAPPINGS[quantityType] || [];
    
    // Filter the full unit list to only allowed units
    const filtered = [...DOSE_UNITS].filter(unit => 
      allowedUnitIds.includes(unit.id)
    );
    
    // Update available units state
    setAvailableUnits(filtered);
    
    // Check if current unit is compatible
    if (doseUnit && !allowedUnitIds.includes(doseUnit)) {
      // Unit is not compatible - reset it
      handleUnitReset();
    }
  } else {
    // No medication type selected - show all units
    setAvailableUnits([...DOSE_UNITS]);
  }
}, [quantityType]);
```

### Unit Reset Flow

When a user changes medication type and their current unit is incompatible:

1. **Detect Incompatibility**
   ```typescript
   if (doseUnit && !allowedUnitIds.includes(doseUnit)) {
     // Current unit is not in the allowed list
   }
   ```

2. **Get Previous Unit Label**
   ```typescript
   const previousUnit = DOSE_UNITS.find(u => u.id === doseUnit)?.label || doseUnit;
   ```

3. **Reset Unit State**
   ```typescript
   setDoseUnit('');
   setShowCustomUnit(false);
   setCustomUnit('');
   updateFormData({ doseUnit: '' });
   ```

4. **Notify User**
   ```typescript
   Alert.alert(
     'Unidad reiniciada',
     `La unidad anterior "${previousUnit}" no es compatible con el tipo de medicamento seleccionado. Por favor, selecciona una nueva unidad.`,
     [{ text: 'Entendido' }]
   );
   ```

5. **Revalidate Form**
   ```typescript
   const isValid = validateFields(doseValue, '', quantityType);
   setCanProceed(isValid);
   ```

### Custom Unit Handling

For the "Otro" medication type, users can define custom units:

```typescript
const handleDoseUnitSelect = useCallback((unitId: string) => {
  if (unitId === 'custom') {
    // Show custom unit input
    setShowCustomUnit(true);
    setDoseUnit('');
    setDoseUnitError('Ingresa una unidad personalizada');
    setCanProceed(false);
  } else {
    // Use standard unit
    setShowCustomUnit(false);
    setCustomUnit('');
    setDoseUnit(unitId);
    // Validate and update
    const isValid = validateFields(doseValue, unitId, quantityType);
    updateFormData({ doseUnit: unitId });
    setCanProceed(isValid);
  }
}, [doseValue, quantityType]);
```

## User Experience Flow

### Scenario 1: Compatible Unit Selection

1. User selects "Tabletas" as medication type
2. Available units: unidades, mg, g, mcg
3. User selects "mg"
4. No issues - form proceeds normally

### Scenario 2: Incompatible Unit Reset

1. User selects "Líquido" as medication type
2. User selects "ml" as unit
3. User changes medication type to "Tabletas"
4. System detects "ml" is not compatible with "Tabletas"
5. Alert shown: "La unidad anterior 'ml (mililitros)' no es compatible..."
6. Unit reset to empty
7. User must select new compatible unit

### Scenario 3: Custom Unit

1. User selects "Otro" as medication type
2. All units available including "Unidad personalizada"
3. User selects "Unidad personalizada"
4. Text input appears
5. User types custom unit (e.g., "parches")
6. Custom unit saved and used in form

## Validation Rules

### Unit Selection Validation

```typescript
// Validate dose unit
if (!currentDoseUnit || currentDoseUnit.trim() === '') {
  setDoseUnitError('Selecciona una unidad de dosis');
  isValid = false;
} else {
  setDoseUnitError('');
}
```

### Custom Unit Validation

```typescript
// For custom units, ensure text is entered
if (showCustomUnit && (!customUnit || customUnit.trim() === '')) {
  setDoseUnitError('Ingresa una unidad personalizada');
  isValid = false;
}
```

## Edge Cases

### Edge Case 1: Rapid Type Changes

**Scenario**: User rapidly changes medication type multiple times

**Handling**:
- Each type change triggers the useEffect
- Previous unit is checked against new type's allowed units
- Alert only shown if unit was actually incompatible
- State updates are batched by React

### Edge Case 2: Custom Unit with Type Change

**Scenario**: User has custom unit, then changes medication type

**Handling**:
- Custom units are only allowed for "Otro" type
- Changing away from "Otro" will reset custom unit
- User is notified via alert
- Custom unit input is hidden

### Edge Case 3: No Medication Type Selected

**Scenario**: User tries to select unit before selecting medication type

**Handling**:
- All units are available when no type is selected
- This allows flexibility in form completion order
- Validation still requires both type and unit before proceeding

## Testing Recommendations

### Unit Tests

```typescript
describe('Unit Mapping Logic', () => {
  test('filters units correctly for tablets', () => {
    const allowedUnits = UNIT_MAPPINGS['tablets'];
    expect(allowedUnits).toContain('units');
    expect(allowedUnits).toContain('mg');
    expect(allowedUnits).not.toContain('ml');
  });

  test('resets incompatible unit when type changes', () => {
    // Set liquid type with ml unit
    // Change to tablets type
    // Verify unit is reset
    // Verify alert is shown
  });

  test('allows custom unit for other type', () => {
    const allowedUnits = UNIT_MAPPINGS['other'];
    expect(allowedUnits).toContain('custom');
  });
});
```

### Integration Tests

```typescript
describe('Unit Mapping Integration', () => {
  test('complete flow with unit reset', async () => {
    // 1. Select liquid type
    // 2. Select ml unit
    // 3. Change to tablets type
    // 4. Verify alert appears
    // 5. Verify unit is reset
    // 6. Select new compatible unit
    // 7. Verify form is valid
  });
});
```

## Maintenance Guidelines

### Adding New Medication Types

1. Add new type to `QUANTITY_TYPES` in `types.ts`
2. Add mapping to `UNIT_MAPPINGS` object
3. Add emoji mapping in `getQuantityTypeEmoji()`
4. Update visualization logic if needed
5. Update documentation

### Adding New Units

1. Add new unit to `DOSE_UNITS` in `types.ts`
2. Add unit to appropriate medication type mappings
3. Update visualization logic if unit needs special handling
4. Update documentation

### Modifying Mappings

When modifying which units are allowed for a medication type:

1. Consider medical accuracy and user expectations
2. Update `UNIT_MAPPINGS` object
3. Test unit reset flow thoroughly
4. Update documentation and examples
5. Consider migration for existing data

## Best Practices

### Do's

✅ Always validate unit compatibility when medication type changes
✅ Provide clear user feedback when units are reset
✅ Allow custom units for flexibility
✅ Use medically accurate unit-type relationships
✅ Test edge cases thoroughly

### Don'ts

❌ Don't allow illogical unit-type combinations
❌ Don't reset units without notifying the user
❌ Don't block form submission due to unit incompatibility
❌ Don't make assumptions about user intent
❌ Don't forget to update context when resetting units

## Related Documentation

- [Wizard Components Documentation](./WIZARD_COMPONENTS_DOCUMENTATION.md)
- [Design Document](./design.md)
- [Requirements Document](./requirements.md)
- [Task 8 Implementation Summary](./TASK8_UNIT_FILTERING_IMPLEMENTATION.md)

---

**Last Updated**: November 15, 2025
**Maintained By**: Pildhora Development Team
