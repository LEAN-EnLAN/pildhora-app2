# Patient Device Management Screen - Visual Guide

## Screen Overview

The patient device management screen provides a comprehensive interface for patients to manage their device connections, view connected caregivers, and control access through connection codes.

## Screen Sections

### 1. Header
```
┌─────────────────────────────────────────┐
│ ← Gestión de Dispositivo                │
└─────────────────────────────────────────┘
```
- Back button (arrow-back icon)
- Screen title "Gestión de Dispositivo"
- Clean, minimal design

### 2. Device Information Card
```
┌─────────────────────────────────────────┐
│ 🔲 ID del Dispositivo                   │
│    DEVICE-ABC123XYZ                     │
└─────────────────────────────────────────┘
```
- Hardware chip icon (blue)
- Device ID label
- Monospace device ID display
- Elevated card style

### 3. Connected Caregivers Section
```
┌─────────────────────────────────────────┐
│ Cuidadores Conectados                   │
│ Personas que tienen acceso a tu         │
│ información de medicamentos             │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Dr. María García                 │ │
│ │    maria@example.com                │ │
│ │    Conectado: 15 de enero de 2024   │ │
│ │                                     │ │
│ │    [Revocar Acceso]                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Enfermera Ana López              │ │
│ │    ana@example.com                  │ │
│ │    Conectado: 10 de enero de 2024   │ │
│ │                                     │ │
│ │    [Revocar Acceso]                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────────┐
│ Cuidadores Conectados                   │
│ Personas que tienen acceso a tu         │
│ información de medicamentos             │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │         👥                          │ │
│ │   No hay cuidadores conectados      │ │
│ │   Genera un código de conexión      │ │
│ │   para compartir con un cuidador    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4. Connection Codes Section
```
┌─────────────────────────────────────────┐
│ Códigos de Conexión    [Generar Código] │
│ Códigos activos para conectar nuevos    │
│ cuidadores                              │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔑 A B C 1 2 3                      │ │
│ │    Expira en 5h 30m                 │ │
│ │                                     │ │
│ │    [📤 Compartir]  [🗑️ Revocar]     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔑 X Y Z 7 8 9                      │ │
│ │    Expira en 23h 15m                │ │
│ │                                     │ │
│ │    [📤 Compartir]  [🗑️ Revocar]     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────────┐
│ Códigos de Conexión    [Generar Código] │
│ Códigos activos para conectar nuevos    │
│ cuidadores                              │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │         🔑                          │ │
│ │   No hay códigos activos            │ │
│ │   Genera un código para compartir   │ │
│ │   con un cuidador                   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 5. Help Section
```
┌─────────────────────────────────────────┐
│ ℹ️ ¿Cómo funciona?                      │
│                                         │
│ 1. Genera un código de conexión        │
│ 2. Comparte el código con tu cuidador  │
│ 3. El cuidador ingresa el código en    │
│    su app                               │
│ 4. Una vez conectado, podrá ver y      │
│    gestionar tus medicamentos          │
│                                         │
│ Los códigos expiran en 24 horas y      │
│ solo pueden usarse una vez.            │
└─────────────────────────────────────────┘
```

## User Flows

### Flow 1: Generate and Share Connection Code
```
1. User taps "Generar Código"
   ↓
2. Loading indicator shows
   ↓
3. Code is generated (e.g., "ABC123")
   ↓
4. Success message displays with code
   ↓
5. Alert dialog offers to share
   ↓
6. User taps "Compartir"
   ↓
7. Native share dialog opens
   ↓
8. User shares via SMS, email, etc.
   ↓
9. Code appears in active codes list
```

### Flow 2: Revoke Caregiver Access
```
1. User taps "Revocar Acceso" on caregiver card
   ↓
2. Confirmation dialog appears:
   "¿Estás seguro de que deseas revocar
    el acceso de Dr. María García?"
   ↓
3. User taps "Revocar"
   ↓
4. Loading indicator shows
   ↓
5. Device link is removed
   ↓
6. Success message displays
   ↓
7. Caregiver card is removed from list
   ↓
8. Caregiver loses access immediately
```

### Flow 3: Revoke Connection Code
```
1. User taps "Revocar" on code card
   ↓
2. Confirmation dialog appears:
   "¿Estás seguro de que deseas revocar
    este código?"
   ↓
3. User taps "Revocar"
   ↓
4. Loading indicator shows
   ↓
5. Code is deleted from Firestore
   ↓
6. Success message displays
   ↓
7. Code card is removed from list
   ↓
8. Code can no longer be used
```

### Flow 4: Pull to Refresh
```
1. User pulls down on screen
   ↓
2. Refresh indicator shows
   ↓
3. Data is reloaded from Firestore
   ↓
4. Caregivers list updates
   ↓
5. Connection codes list updates
   ↓
6. Refresh indicator disappears
```

## Color Scheme

### Icons
- **Device Info**: Blue (`colors.primary[600]`)
- **Caregivers**: Blue (`colors.primary[600]`)
- **Connection Codes**: Green (`colors.success[600]`)
- **Help**: Blue (`colors.primary[600]`)

### Buttons
- **Primary** (Generate Code): Blue background
- **Secondary** (Share): Gray background
- **Danger** (Revoke): Red background

### Cards
- **Elevated**: White with shadow
- **Outlined** (Help): White with border

## Responsive Behavior

### Small Screens (< 375px)
- Single column layout
- Full-width cards
- Stacked buttons in code cards

### Medium Screens (375px - 768px)
- Single column layout
- Full-width cards
- Side-by-side buttons in code cards

### Large Screens (> 768px)
- Single column layout (centered)
- Max width constraint
- Side-by-side buttons in code cards

## Accessibility Features

### Screen Reader Support
- All buttons have descriptive labels
- Card content is properly structured
- Status messages are announced

### Touch Targets
- All buttons meet 44x44 minimum size
- Adequate spacing between interactive elements
- Large tap areas for cards

### Visual Indicators
- High contrast text
- Clear focus states
- Color + icon + text for status

## Error States

### Network Error
```
┌─────────────────────────────────────────┐
│ ⚠️ Error al cargar datos               │
│ Por favor, verifica tu conexión a      │
│ internet e intenta nuevamente.         │
│                                         │
│ [Reintentar]                           │
└─────────────────────────────────────────┘
```

### No Device Linked
```
┌─────────────────────────────────────────┐
│         ⚠️                              │
│   No hay dispositivo vinculado         │
│                                         │
│   Primero debes vincular un            │
│   dispositivo para gestionar           │
│   cuidadores y códigos de conexión.    │
│                                         │
│   [Vincular Dispositivo]               │
└─────────────────────────────────────────┘
```

### Code Generation Error
```
┌─────────────────────────────────────────┐
│ ⚠️ Error al generar código             │
│ No se pudo generar un código único.    │
│ Por favor, intenta nuevamente.         │
└─────────────────────────────────────────┘
```

## Success States

### Code Generated
```
┌─────────────────────────────────────────┐
│ ✅ Código generado: ABC123             │
└─────────────────────────────────────────┘
```

### Caregiver Revoked
```
┌─────────────────────────────────────────┐
│ ✅ Acceso de Dr. María García          │
│    revocado exitosamente               │
└─────────────────────────────────────────┘
```

### Code Revoked
```
┌─────────────────────────────────────────┐
│ ✅ Código revocado exitosamente        │
└─────────────────────────────────────────┘
```

## Animation & Transitions

### Card Entrance
- Fade in with slight scale up
- Staggered animation for multiple cards
- Duration: 300ms

### Button Press
- Scale down to 0.95
- Haptic feedback (if available)
- Duration: 100ms

### List Updates
- Smooth removal animation
- Fade out + slide up
- Duration: 200ms

### Pull to Refresh
- Native refresh control
- Smooth spring animation
- Automatic dismiss on complete

## Best Practices

### Data Loading
- Show loading state immediately
- Use skeleton loaders for cards
- Provide pull-to-refresh option

### User Feedback
- Always show success/error messages
- Use confirmation dialogs for destructive actions
- Provide clear action outcomes

### Error Handling
- User-friendly error messages in Spanish
- Retry options for network errors
- Graceful degradation for missing data

### Performance
- Efficient Firestore queries
- Minimal re-renders
- Optimistic UI updates where possible

## Integration Points

### Services Used
- `connectionCode.ts` - Code generation and management
- `deviceLinking.ts` - Caregiver link management
- `firebase.ts` - Firestore and RTDB access

### Collections Accessed
- `deviceLinks` - Caregiver connections
- `connectionCodes` - Active codes
- `users` - User profile data

### State Management
- Local component state
- Redux for user authentication
- No global state for this screen

## Testing Checklist

- [ ] Screen loads with device ID
- [ ] Screen shows empty state without device
- [ ] Caregivers list displays correctly
- [ ] Connection codes list displays correctly
- [ ] Generate code button works
- [ ] Share code functionality works
- [ ] Revoke caregiver confirmation works
- [ ] Revoke code confirmation works
- [ ] Pull to refresh works
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Back button navigates correctly
- [ ] All accessibility labels present
- [ ] Screen reader navigation works
- [ ] Touch targets are adequate size
