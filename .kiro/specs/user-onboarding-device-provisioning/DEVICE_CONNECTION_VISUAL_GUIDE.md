# Device Connection Interface - Visual Guide

## Screen Layout

```
┌─────────────────────────────────────────┐
│  ← Back                                  │ SafeAreaView Top
├─────────────────────────────────────────┤
│                                          │
│              ┌─────────┐                 │
│              │  🔗     │                 │ Icon Container
│              │ Link    │                 │ (80x80, rounded)
│              └─────────┘                 │
│                                          │
│        Conectar Dispositivo              │ Title (2xl, bold)
│                                          │
│   Ingresa el código de conexión         │ Subtitle (base)
│   proporcionado por el paciente para    │ (gray-600)
│   vincular su dispositivo                │
│                                          │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ Código de Conexión                │  │ Card
│  │                                   │  │
│  │ El código debe tener entre 6 y 8 │  │ Section Description
│  │ caracteres alfanuméricos          │  │
│  │                                   │  │
│  │ Código *                          │  │ Label
│  │ ┌─────────────────────────────┐  │  │
│  │ │ 🔑  ABC123            ✓      │  │  │ Input Field
│  │ └─────────────────────────────┘  │  │ (with icons)
│  │ ℹ️  6/8 caracteres               │  │ Character Counter
│  │                                   │  │
│  │ ┌─────────────────────────────┐  │  │
│  │ │      Continuar              │  │  │ Submit Button
│  │ └─────────────────────────────┘  │  │ (primary, lg)
│  └───────────────────────────────────┘  │
│                                          │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ ❓ ¿Necesitas ayuda?             │  │ Help Card
│  │                                   │  │ (primary-50 bg)
│  │ ✓ El paciente debe generar un    │  │
│  │   código desde su aplicación      │  │
│  │                                   │  │
│  │ ✓ Los códigos expiran después    │  │
│  │   de 24 horas                     │  │
│  │                                   │  │
│  │ ✓ Cada código solo puede usarse  │  │
│  │   una vez                         │  │
│  └───────────────────────────────────┘  │
│                                          │
│           ← Volver                       │ Back Button (ghost)
│                                          │
└─────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header Section
```
┌─────────────────────────────────────┐
│          ┌─────────┐                │
│          │  🔗     │                │ 80x80 circle
│          │ primary │                │ primary[50] bg
│          └─────────┘                │ primary[500] icon
│                                     │
│    Conectar Dispositivo             │ 2xl, bold, gray-900
│                                     │
│  Ingresa el código de conexión     │ base, gray-600
│  proporcionado por el paciente...  │ centered, relaxed line-height
└─────────────────────────────────────┘
```

### 2. Form Card
```
┌─────────────────────────────────────┐
│ Código de Conexión                  │ lg, semibold, gray-900
│                                     │
│ El código debe tener entre 6 y 8   │ sm, gray-600
│ caracteres alfanuméricos            │
│                                     │
│ Código *                            │ Label (sm, medium)
│ ┌─────────────────────────────┐    │
│ │ 🔑  [INPUT]           ✓     │    │ Input with icons
│ └─────────────────────────────┘    │
│ ℹ️  6/8 caracteres                 │ Hint (xs, gray-500)
│                                     │
│ ┌─────────────────────────────┐    │
│ │      Continuar              │    │ Button (primary, lg)
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 3. Input States

#### Empty State
```
┌─────────────────────────────────┐
│ 🔑  Ej: ABC123                 │
└─────────────────────────────────┘
```

#### Typing (Valid Format)
```
┌─────────────────────────────────┐
│ 🔑  ABC123              ✓      │
└─────────────────────────────────┘
ℹ️  6/8 caracteres
```

#### Format Error
```
┌─────────────────────────────────┐
│ 🔑  AB                         │
└─────────────────────────────────┘
❌ El código debe tener al menos 6 caracteres
```

#### Validation Error
```
┌─────────────────────────────────┐
│ 🔑  INVALID1                   │
└─────────────────────────────────┘
❌ Código no encontrado. Verifica el código e intenta nuevamente.
```

#### Validating State
```
┌─────────────────────────────────┐
│ 🔑  ABC123              ⏳     │
└─────────────────────────────────┘
```

### 4. Help Card
```
┌─────────────────────────────────────┐
│ ❓ ¿Necesitas ayuda?                │ lg, semibold
│                                     │ primary[50] background
│ ✓ El paciente debe generar un      │ sm, gray-700
│   código desde su aplicación        │
│                                     │
│ ✓ Los códigos expiran después      │
│   de 24 horas                       │
│                                     │
│ ✓ Cada código solo puede usarse    │
│   una vez                           │
└─────────────────────────────────────┘
```

## Interaction Flow

### 1. Initial Load
```
User lands on screen
  ↓
Header and form displayed
  ↓
Input field focused (optional)
  ↓
Help section visible
```

### 2. Code Entry
```
User types character
  ↓
Convert to uppercase
  ↓
Remove spaces
  ↓
Limit to 8 chars
  ↓
Validate format
  ↓
Show feedback (error/success/counter)
  ↓
Enable/disable submit button
```

### 3. Validation Flow
```
User clicks "Continuar"
  ↓
Check format validity
  ↓
Show loading state
  ↓
Call validateCode() service
  ↓
Success: Navigate to confirmation
  ↓
Error: Show error message
```

## Color Palette

### Primary Colors
- **Icon Container Background**: `colors.primary[50]` (#EFF6FF)
- **Icon Color**: `colors.primary[500]` (#3B82F6)
- **Help Card Background**: `colors.primary[50]` (#EFF6FF)
- **Help Card Border**: `colors.primary[100]` (#DBEAFE)

### Text Colors
- **Title**: `colors.gray[900]` (#111827)
- **Subtitle**: `colors.gray[600]` (#4B5563)
- **Section Title**: `colors.gray[900]` (#111827)
- **Section Description**: `colors.gray[600]` (#4B5563)
- **Help Text**: `colors.gray[700]` (#374151)
- **Hint Text**: `colors.gray[500]` (#6B7280)

### Status Colors
- **Success**: `colors.success[500]` (#10B981)
- **Error**: `colors.error` (#EF4444)
- **Warning**: `colors.warning[500]` (#F59E0B)

### Background Colors
- **Screen**: `colors.gray[50]` (#F9FAFB)
- **Card**: `colors.surface` (#FFFFFF)

## Typography Scale

### Font Sizes
- **Title**: `typography.fontSize['2xl']` (24px)
- **Section Title**: `typography.fontSize.lg` (18px)
- **Body**: `typography.fontSize.base` (16px)
- **Description**: `typography.fontSize.sm` (14px)
- **Hint**: `typography.fontSize.xs` (12px)

### Font Weights
- **Title**: `typography.fontWeight.bold` (700)
- **Section Title**: `typography.fontWeight.semibold` (600)
- **Label**: `typography.fontWeight.medium` (500)
- **Body**: `typography.fontWeight.normal` (400)

## Spacing System

### Padding
- **Screen**: `spacing.lg` (16px)
- **Card**: `spacing.lg` (16px)
- **Section**: `spacing.md` (12px)

### Margins
- **Header Bottom**: `spacing.xl` (24px)
- **Card Bottom**: `spacing.lg` (16px)
- **Form Section Bottom**: `spacing.lg` (16px)
- **Help Items**: `spacing.md` (12px)

### Gaps
- **Icon + Text**: `spacing.sm` (8px)
- **Help Items**: `spacing.md` (12px)

## Accessibility Features

### Screen Reader Support
```
Header:
- "Conectar Dispositivo"
- "Ingresa el código de conexión proporcionado por el paciente para vincular su dispositivo"

Input:
- Label: "Código de conexión"
- Hint: "Ingresa el código de 6 a 8 caracteres proporcionado por el paciente"
- Error: "Error: [error message]"

Button:
- Label: "Validar código"
- Hint: "Valida el código de conexión e inicia el proceso de vinculación"
- State: disabled/busy during validation

Back Button:
- Label: "Volver"
- Hint: "Regresa a la pantalla anterior"
```

### Keyboard Navigation
1. Tab to input field
2. Type code
3. Tab to submit button
4. Enter to submit
5. Tab to back button

### Focus States
- Input field: Blue border (primary[500])
- Buttons: Scale animation (0.95)

## Responsive Behavior

### Small Screens (< 375px)
- Reduce padding to `spacing.md`
- Smaller icon (40x40)
- Smaller font sizes

### Medium Screens (375px - 768px)
- Standard layout (as shown)
- Full padding and spacing

### Large Screens (> 768px)
- Max width constraint (600px)
- Centered content
- Increased padding

## Animation Details

### Button Press
```
Scale: 1.0 → 0.95 → 1.0
Duration: Spring animation
Trigger: onPressIn/onPressOut
```

### Input Focus
```
Border Color: gray[300] → primary[500]
Duration: 200ms
Easing: Linear
Trigger: onFocus/onBlur
```

### Loading State
```
Button: Show ActivityIndicator
Input: Disabled
Duration: Until validation completes
```

## Error States

### Format Errors (Client-Side)
```
┌─────────────────────────────────┐
│ 🔑  AB                         │
└─────────────────────────────────┘
❌ El código debe tener al menos 6 caracteres

┌─────────────────────────────────┐
│ 🔑  ABCDEFGHI                  │
└─────────────────────────────────┘
❌ El código no puede tener más de 8 caracteres

┌─────────────────────────────────┐
│ 🔑  ABC-123                    │
└─────────────────────────────────┘
❌ El código solo puede contener letras y números
```

### Validation Errors (Server-Side)
```
┌─────────────────────────────────┐
│ 🔑  INVALID1                   │
└─────────────────────────────────┘
❌ Código no encontrado. Verifica el código e intenta nuevamente.

┌─────────────────────────────────┐
│ 🔑  EXPIRED1                   │
└─────────────────────────────────┘
❌ Este código ha expirado. Solicita un nuevo código al paciente.

┌─────────────────────────────────┐
│ 🔑  USED1234                   │
└─────────────────────────────────┘
❌ Este código ya ha sido utilizado.
```

## Success State

### Valid Format
```
┌─────────────────────────────────┐
│ 🔑  ABC123              ✓      │
└─────────────────────────────────┘
ℹ️  6/8 caracteres

[Continuar] ← Enabled, primary color
```

### Validating
```
┌─────────────────────────────────┐
│ 🔑  ABC123              ⏳     │
└─────────────────────────────────┘

[⏳ Validando...] ← Disabled, loading spinner
```

## Navigation Flow

```
DeviceConnectionScreen
        │
        │ User enters valid code
        │ Clicks "Continuar"
        │
        ↓
    validateCode()
        │
        ├─ Success ──→ Navigate to confirmation
        │              (with code data in params)
        │
        └─ Error ────→ Show error message
                       Stay on screen
```

## Implementation Notes

### Code Transformation
```typescript
Input: "abc 123"
  ↓ toUpperCase()
"ABC 123"
  ↓ replace(/\s/g, '')
"ABC123"
  ↓ slice(0, 8)
"ABC123"
```

### Validation Sequence
```typescript
1. Format validation (client-side)
   - Length check (6-8)
   - Character check (A-Z, 0-9)
   
2. Server validation (if format valid)
   - Code exists
   - Not expired
   - Not used
   - Associated with device
```

### State Management
```typescript
code: string              // Current input value
formatError: string|null  // Client-side validation error
validationError: string|null // Server-side validation error
isValidating: boolean     // Loading state
```

## Testing Scenarios

### Happy Path
1. User enters "ABC123"
2. Format validates ✓
3. Server validates ✓
4. Navigate to confirmation

### Error Paths
1. User enters "AB" → Format error
2. User enters "ABC-123" → Format error
3. User enters "INVALID1" → Server error
4. User enters "EXPIRED1" → Server error
5. User enters "USED1234" → Server error

### Edge Cases
1. User enters spaces → Removed automatically
2. User enters lowercase → Converted to uppercase
3. User enters > 8 chars → Truncated to 8
4. User submits empty → Error message
5. Network error → User-friendly message

## Conclusion

This visual guide provides a comprehensive overview of the device connection interface, including layout, interactions, colors, typography, and accessibility features. Use this as a reference for implementation, testing, and documentation.
