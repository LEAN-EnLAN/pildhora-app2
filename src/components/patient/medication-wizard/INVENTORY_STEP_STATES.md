# MedicationInventoryStep - Visual States

## Component States Overview

The MedicationInventoryStep component has three main visual states:

### 1. Active Tracking State (Default)

```
┌─────────────────────────────────────────────────────────┐
│  Inventario                                             │
│  Configura el seguimiento de dosis disponibles para    │
│  recibir alertas cuando se esté agotando                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Cantidad inicial *                                     │
│  ¿Cuántas dosis tienes actualmente?                     │
│                                                         │
│         ┌──────────────────┐                           │
│         │       30         │  dosis                     │
│         └──────────────────┘                           │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Vista previa:                                     │ │
│  │ 💊 💊 💊 💊 💊 💊 💊 💊 💊 💊                      │ │
│  │ 💊 💊 💊 💊 💊 💊 💊 💊 💊 💊                      │ │
│  │ 💊 💊 💊 💊 💊 💊 💊 💊 💊 💊                      │ │
│  │                                                   │ │
│  │ ████████████████████████████████████████████████  │ │
│  │ 30 dosis disponibles                              │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Alerta de cantidad baja                                │
│  Te avisaremos cuando queden pocas dosis                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🤖 Calculado automáticamente                      │ │
│  │    3 dosis (3 días de reserva)                    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ✏️ Ajustar manualmente                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 📅 Duración estimada:                             │ │
│  │    30 días                                        │ │
│  │    Basado en tu horario de 1 dosis por día       │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ─────────────────── o ───────────────────              │
│                                                         │
│  [ Omitir seguimiento de inventario ]                  │
│  Puedes activar esta función más tarde                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  💡 El sistema descontará automáticamente las dosis    │
│     cuando las registres como tomadas                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Manual Threshold State

When user clicks "Ajustar manualmente":

```
┌─────────────────────────────────────────────────────────┐
│  Alerta de cantidad baja                                │
│  Te avisaremos cuando queden pocas dosis                │
│                                                         │
│  🤖 Usar cálculo automático                             │
│                                                         │
│  Umbral personalizado:                                  │
│                                                         │
│         ┌──────────┐                                    │
│         │    5     │  dosis                             │
│         └──────────┘                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Skipped State

When user clicks "Omitir seguimiento de inventario":

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                        📦                               │
│                                                         │
│         Seguimiento de inventario desactivado           │
│                                                         │
│  No se realizará seguimiento de la cantidad de dosis   │
│  disponibles para este medicamento.                     │
│                                                         │
│  Puedes activar esta función más tarde desde la        │
│  configuración del medicamento.                         │
│                                                         │
│         [ Activar seguimiento ]                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4. Error State

When user enters invalid quantity:

```
┌─────────────────────────────────────────────────────────┐
│  Cantidad inicial *                                     │
│  ¿Cuántas dosis tienes actualmente?                     │
│                                                         │
│         ┌──────────────────┐                           │
│         │       0          │  dosis                     │
│         └──────────────────┘                           │
│         ⚠️ border-color: red                            │
│                                                         │
│  ❌ El valor debe ser mayor a 0                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Visual Elements

### Input Sizes
- **Quantity Input**: 64px bold (extra large for easy reading)
- **Threshold Input**: 32px bold (large but secondary)
- **Labels**: 14px medium (standard)
- **Helper Text**: 12px regular (subtle)

### Color Coding
- **Primary Blue** (`colors.primary[500]`): Info boxes, borders
- **Success Green** (`colors.success[500]`): Estimate box, progress bar
- **Error Red** (`colors.error[500]`): Validation errors
- **Gray Scale**: Neutral elements, text

### Icons
- 📦 Package - Skipped state
- 🤖 Robot - Auto-calculation
- ✏️ Pencil - Manual adjustment
- 📅 Calendar - Days estimate
- 💡 Lightbulb - Info/tips
- ❌ Cross - Errors

### Spacing
- Section margins: 24px (xl)
- Element gaps: 16px (lg)
- Input padding: 16px (lg)
- Content padding: 16px (lg)

## Responsive Behavior

### Small Screens (< 375px)
- Quantity input scales down to 48px
- Emoji grid shows 8 per row instead of 10
- Buttons stack vertically if needed

### Large Screens (> 768px)
- Maximum width: 600px (centered)
- Increased padding for comfort
- Larger touch targets

## Interaction States

### Input Focus
```css
borderColor: colors.primary[500]
borderWidth: 2
```

### Button Hover (web)
```css
backgroundColor: colors.primary[600]
```

### Button Disabled
```css
backgroundColor: colors.gray[300]
opacity: 0.6
```

### Loading State
```css
Button shows spinner
User cannot interact
```

## Accessibility States

### Screen Reader Announcements
- "Cantidad inicial de dosis, campo de texto numérico"
- "Ingresa cuántas dosis tienes disponibles"
- "Error: El valor debe ser mayor a 0" (live region)

### Focus Order
1. Quantity input
2. Manual adjust button
3. Threshold input (if manual)
4. Skip button
5. Enable tracking button (if skipped)

### Touch Targets
- All buttons: minimum 44x44 dp
- Input fields: minimum 44 dp height
- Toggle buttons: 48 dp height

## Animation States

### Transitions
- State changes: 200ms ease
- Error appearance: 150ms ease-in
- Skip/enable toggle: 300ms ease-in-out

### Micro-interactions
- Button press: scale(0.98)
- Input focus: border pulse
- Error shake: translateX(-5px to 5px)

## Data States

### Empty State
```typescript
initialQuantity: ''
lowQuantityThreshold: ''
trackInventory: true
autoThreshold: true
```

### Filled State
```typescript
initialQuantity: '30'
lowQuantityThreshold: '3'
trackInventory: true
autoThreshold: true
```

### Skipped State
```typescript
initialQuantity: ''
lowQuantityThreshold: ''
trackInventory: false
autoThreshold: true
```

### Manual State
```typescript
initialQuantity: '30'
lowQuantityThreshold: '5'
trackInventory: true
autoThreshold: false
```

## Edge Cases

### Very Small Quantity (< 5)
- Shows all emojis (no overflow)
- Threshold capped at quantity - 1
- Warning about low supply

### Very Large Quantity (> 100)
- Shows 20 emojis + overflow count
- Progress bar still shows 100%
- Days estimate may show months

### Zero Frequency
- Calculation returns 0 days
- Shows warning message
- Suggests reviewing schedule

### Single Dose
- Threshold set to 1 (minimum)
- Shows "1 día" (singular)
- Special handling in UI

## Testing Scenarios

### Happy Path
1. User enters 30 doses
2. System calculates threshold: 3
3. Shows 30 emojis in grid
4. Estimates 30 days
5. User proceeds to next step

### Manual Override
1. User enters 60 doses
2. System calculates threshold: 6
3. User clicks "Ajustar manualmente"
4. User enters 10 as threshold
5. System accepts custom value

### Skip Flow
1. User clicks "Omitir"
2. Shows skipped state
3. User clicks "Activar seguimiento"
4. Returns to tracking state
5. Previous values cleared

### Error Recovery
1. User enters 0
2. Shows error message
3. User enters 30
4. Error clears
5. Shows success state

---

This document provides a comprehensive visual reference for all states of the MedicationInventoryStep component.
