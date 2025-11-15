# Inventory Step - Visual Guide

## Component States

### State 1: Initial Empty State
```
┌─────────────────────────────────────────────┐
│ Inventario                                  │
│ Configura el seguimiento de inventario      │
│ para saber cuándo necesitas recargar        │
│                                             │
│ Cantidad inicial *                          │
│ ¿Cuántas dosis tienes actualmente?          │
│                                             │
│        ┌──────────────┐                     │
│        │      0       │ dosis               │
│        └──────────────┘                     │
│                                             │
│ ⏭️ Omitir inventario                        │
│ No realizar seguimiento de inventario       │
│                                             │
│ 💡 El seguimiento de inventario te ayuda   │
│    a saber cuándo necesitas recargar...    │
└─────────────────────────────────────────────┘
```

### State 2: Quantity Entered (Low)
```
┌─────────────────────────────────────────────┐
│ Inventario                                  │
│                                             │
│ Cantidad inicial *                          │
│ ¿Cuántas dosis tienes actualmente?          │
│                                             │
│        ┌──────────────┐                     │
│        │     10       │ dosis               │
│        └──────────────┘                     │
│                                             │
│ Vista previa del inventario:                │
│ ┌─────────────────────────────────────┐    │
│ │ 💊💊💊💊💊💊💊💊💊💊              │    │
│ │ Total: 10 dosis                     │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Alerta de cantidad baja                     │
│ Alertar cuando queden: [6] dosis            │
│ ✨ Calculado automáticamente (3 días)       │
│                                             │
│ Estado actual:                              │
│ ⚠️ Cantidad baja                            │
│ ┌─────────────────────────────────────┐    │
│ │ [████████████░░░░░░░░░░░░░░░░░░]   │    │
│ │              ↑                      │    │
│ │              6                      │    │
│ └─────────────────────────────────────┘    │
│ Se activará la alerta cuando queden         │
│ 6 dosis o menos                             │
└─────────────────────────────────────────────┘
```

### State 3: Quantity Entered (Sufficient)
```
┌─────────────────────────────────────────────┐
│ Inventario                                  │
│                                             │
│ Cantidad inicial *                          │
│ ¿Cuántas dosis tienes actualmente?          │
│                                             │
│        ┌──────────────┐                     │
│        │     50       │ dosis               │
│        └──────────────┘                     │
│                                             │
│ Vista previa del inventario:                │
│ ┌─────────────────────────────────────┐    │
│ │ 💊💊💊💊💊💊💊💊💊💊              │    │
│ │ 💊💊💊💊💊💊💊💊💊💊              │    │
│ │ +30 más                             │    │
│ │ Total: 50 dosis                     │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Alerta de cantidad baja                     │
│ Alertar cuando queden: [6] dosis            │
│ ✨ Calculado automáticamente (3 días)       │
│                                             │
│ Estado actual:                              │
│ ✅ Cantidad suficiente                      │
│ ┌─────────────────────────────────────┐    │
│ │ [████░░░░░░░░░░░░░░░░░░░░░░░░░░░]   │    │
│ │     ↑                               │    │
│ │     6                               │    │
│ └─────────────────────────────────────┘    │
│ Se activará la alerta cuando queden         │
│ 6 dosis o menos                             │
└─────────────────────────────────────────────┘
```

### State 4: Manual Threshold Adjustment
```
┌─────────────────────────────────────────────┐
│ Inventario                                  │
│                                             │
│ Cantidad inicial *                          │
│        ┌──────────────┐                     │
│        │     50       │ dosis               │
│        └──────────────┘                     │
│                                             │
│ [Visualizer showing 50 pills]               │
│                                             │
│ Alerta de cantidad baja                     │
│ ┌─────────────────────────────────────┐    │
│ │ Alertar cuando queden:              │    │
│ │                    ┌────┐           │    │
│ │                    │ 10 │ dosis     │    │
│ │                    └────┘           │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Estado actual:                              │
│ ✅ Cantidad suficiente                      │
│ ┌─────────────────────────────────────┐    │
│ │ [████████░░░░░░░░░░░░░░░░░░░░░░░]   │    │
│ │         ↑                           │    │
│ │        10                           │    │
│ └─────────────────────────────────────┘    │
│ Se activará la alerta cuando queden         │
│ 10 dosis o menos                            │
└─────────────────────────────────────────────┘
```

### State 5: Validation Error
```
┌─────────────────────────────────────────────┐
│ Inventario                                  │
│                                             │
│ Cantidad inicial *                          │
│ ¿Cuántas dosis tienes actualmente?          │
│                                             │
│        ┌──────────────┐                     │
│        │     -5       │ dosis               │
│        └──────────────┘                     │
│          ⚠️ ERROR                           │
│                                             │
│ ❌ El valor debe ser mayor a 0              │
│                                             │
└─────────────────────────────────────────────┘
```

### State 6: Skipped Inventory
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                  📦                         │
│                                             │
│          Inventario omitido                 │
│                                             │
│ No se realizará seguimiento del             │
│ inventario para este medicamento.           │
│ Puedes activarlo más tarde desde la         │
│ configuración del medicamento.              │
│                                             │
│      ┌─────────────────────────┐           │
│      │ Activar seguimiento     │           │
│      └─────────────────────────┘           │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

## Color Coding

### Status Colors
- **Green (Success)**: Sufficient quantity
  - Used when: `currentQuantity > threshold`
  - Color: `colors.success` (#34C759)

- **Yellow (Warning)**: Low quantity
  - Used when: `currentQuantity <= threshold`
  - Color: `colors.warning[500]` (#FF9500)

- **Red (Error)**: Validation errors
  - Used when: Invalid input
  - Color: `colors.error[500]` (#FF3B30)

### UI Elements
- **Primary Blue**: Accents, info boxes
  - Color: `colors.primary[500]` (#007AFF)

- **Gray**: Borders, labels, secondary text
  - Various shades from `colors.gray`

## Interactive Elements

### 1. Quantity Input
- **Type**: Large numeric input
- **Size**: 64px font
- **Keyboard**: Number pad
- **Max Length**: 4 digits
- **Validation**: Real-time
- **Touch Target**: 100px height

### 2. Threshold Input
- **Type**: Numeric input
- **Size**: 24px font
- **Keyboard**: Number pad
- **Max Length**: 4 digits
- **Auto-fill**: Yes (can override)
- **Touch Target**: 44px height

### 3. Skip Button
- **Style**: Dashed border
- **Icon**: ⏭️
- **Touch Target**: Full width, 60px height
- **Feedback**: Haptic on press

### 4. Enable Button (Skip State)
- **Style**: Secondary variant
- **Size**: Large
- **Touch Target**: 200px width, 48px height
- **Feedback**: Haptic on press

## Animations

### Entry Animation
- Fade in from bottom
- Duration: 300ms
- Easing: ease-out

### Validation Feedback
- Shake animation on error
- Duration: 400ms
- Amplitude: 10px

### Progress Bar Fill
- Smooth width transition
- Duration: 500ms
- Easing: ease-in-out

### Pill Icons
- Stagger appearance
- Delay: 50ms per pill
- Scale from 0 to 1

## Accessibility

### Screen Reader Flow
1. "Paso 4: Configuración de inventario"
2. "Configura el seguimiento de inventario para tu medicamento"
3. "Cantidad inicial, campo de texto, requerido"
4. "Ingresa cuántas dosis tienes actualmente"
5. [User enters value]
6. "Vista previa del inventario: Total 50 dosis"
7. "Alerta de cantidad baja"
8. "Umbral de cantidad baja, campo de texto"
9. "Cantidad de dosis para activar la alerta"
10. "Estado actual: Cantidad suficiente"
11. "Omitir seguimiento de inventario, botón"

### Focus Order
1. Quantity input
2. Threshold input (if visible)
3. Skip button
4. Enable button (if in skip state)

### Haptic Feedback
- **Light**: On input focus
- **Medium**: On value change
- **Heavy**: On validation error
- **Success**: On skip/enable toggle

## Responsive Behavior

### Small Screens (< 375px)
- Reduce font sizes by 10%
- Stack visualizer pills in single column
- Reduce spacing by 20%

### Large Screens (> 768px)
- Increase max width to 600px
- Center content
- Larger touch targets

### Landscape Mode
- Reduce vertical spacing
- Compact visualizer
- Inline threshold input

## Edge Cases

### 1. Very Large Quantities (> 100)
```
Vista previa del inventario:
💊💊💊💊💊💊💊💊💊💊
💊💊💊💊💊💊💊💊💊💊
+980 más
Total: 1000 dosis
```

### 2. Very Small Quantities (< 5)
```
Vista previa del inventario:
💊💊💊
Total: 3 dosis
```

### 3. Threshold Equals Quantity
```
Estado actual:
⚠️ Cantidad baja
[████████████████████████████████]
                                ↑
                               10
```

### 4. Threshold Greater Than Quantity
```
Estado actual:
⚠️ Cantidad baja
[████████████████████████████████]
                                ↑
                               15
(Threshold capped at quantity for display)
```

## Best Practices

### Do's ✅
- Use large, easy-to-tap inputs
- Provide immediate visual feedback
- Show clear error messages
- Use familiar icons (💊)
- Auto-calculate sensible defaults
- Allow manual overrides
- Provide skip option
- Show visual previews

### Don'ts ❌
- Don't hide validation errors
- Don't use small touch targets
- Don't require exact values
- Don't force inventory tracking
- Don't use complex calculations
- Don't overwhelm with options
- Don't skip accessibility
- Don't ignore edge cases

## Testing Checklist

- [ ] Enter valid quantity (1-9999)
- [ ] Enter invalid quantity (0, negative, text)
- [ ] Verify auto-threshold calculation
- [ ] Manually adjust threshold
- [ ] Check visualizer with various quantities
- [ ] Test progress bar at different levels
- [ ] Skip inventory tracking
- [ ] Re-enable from skip state
- [ ] Test with different schedules
- [ ] Verify accessibility labels
- [ ] Test keyboard navigation
- [ ] Check haptic feedback
- [ ] Test on small screens
- [ ] Test on large screens
- [ ] Test in landscape mode
- [ ] Verify color contrast
- [ ] Test with screen reader
- [ ] Check error states
- [ ] Verify form data updates
- [ ] Test wizard navigation
