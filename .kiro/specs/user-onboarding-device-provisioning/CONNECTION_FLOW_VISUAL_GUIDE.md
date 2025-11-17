# Connection Flow Visual Guide

## Overview

This guide provides a visual representation of the caregiver device connection flow, including screen layouts, user interactions, and state transitions.

## Screen Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  CAREGIVER ONBOARDING FLOW                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  Signup/Login        │
│  (Caregiver)         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Routing Service     │
│  Checks onboarding   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  SCREEN 1: Device Connection (Code Entry)                   │
│  File: app/caregiver/device-connection.tsx                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  🔗 Conectar Dispositivo                           │    │
│  │                                                     │    │
│  │  Ingresa el código de conexión proporcionado       │    │
│  │  por el paciente para vincular su dispositivo      │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ Código de Conexión                          │  │    │
│  │  │                                             │  │    │
│  │  │ 🔑 [ABC123_____________] ✓                  │  │    │
│  │  │                                             │  │    │
│  │  │ 6/8 caracteres                              │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  [        Continuar        ]                       │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ ❓ ¿Necesitas ayuda?                        │  │    │
│  │  │                                             │  │    │
│  │  │ ✓ El paciente debe generar un código       │  │    │
│  │  │ ✓ Los códigos expiran después de 24 horas  │  │    │
│  │  │ ✓ Cada código solo puede usarse una vez    │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  ← Volver                                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ validateCode()
                       │ ✓ Valid code
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  SCREEN 2: Connection Confirmation                          │
│  File: app/caregiver/device-connection-confirm.tsx          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  👤 Confirmar Conexión                             │    │
│  │                                                     │    │
│  │  Revisa la información del paciente antes          │    │
│  │  de conectar                                       │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ Información del Paciente                    │  │    │
│  │  │                                             │  │    │
│  │  │ 👤 Nombre                                   │  │    │
│  │  │    John Doe                                 │  │    │
│  │  │ ─────────────────────────────────────────   │  │    │
│  │  │ 🔧 ID del Dispositivo                       │  │    │
│  │  │    DEVICE-001                               │  │    │
│  │  │ ─────────────────────────────────────────   │  │    │
│  │  │ 🔑 Código de Conexión                       │  │    │
│  │  │    ABC123                                   │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ 🛡️ Permisos de Acceso                       │  │    │
│  │  │                                             │  │    │
│  │  │ Al conectarte, tendrás acceso a:           │  │    │
│  │  │                                             │  │    │
│  │  │ ✓ Ver y gestionar medicamentos             │  │    │
│  │  │ ✓ Recibir notificaciones de eventos        │  │    │
│  │  │ ✓ Monitorear el estado y adherencia        │  │    │
│  │  │ ✓ Configurar ajustes del dispositivo       │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  [  Cancelar  ]  [     Conectar     ]             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ useCode()
                       │ completeOnboarding()
                       │ ✓ Success
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  SCREEN 3: Success Confirmation                             │
│  File: app/caregiver/device-connection-confirm.tsx          │
│  (Same file, different state)                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │              ✅ (Large checkmark icon)             │    │
│  │                                                     │    │
│  │          ¡Conexión Exitosa!                        │    │
│  │                                                     │    │
│  │  Te has conectado exitosamente con el              │    │
│  │  dispositivo de John Doe                           │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ 👤 Paciente: John Doe                       │  │    │
│  │  │ ─────────────────────────────────────────   │  │    │
│  │  │ 🔧 Dispositivo: DEVICE-001                  │  │    │
│  │  │ ─────────────────────────────────────────   │  │    │
│  │  │ ✓ Estado: Conectado                         │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ Próximos Pasos                              │  │    │
│  │  │                                             │  │    │
│  │  │ ① Accede al panel de control para ver      │  │    │
│  │  │   el estado del paciente                    │  │    │
│  │  │                                             │  │    │
│  │  │ ② Gestiona medicamentos y horarios desde   │  │    │
│  │  │   la sección de medicamentos                │  │    │
│  │  │                                             │  │    │
│  │  │ ③ Recibe notificaciones sobre eventos      │  │    │
│  │  │   importantes del dispositivo               │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  [      Ir al Panel de Control      ]             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ router.replace()
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Caregiver Dashboard                                         │
│  File: app/caregiver/dashboard.tsx                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## State Transitions

### Screen 1: Code Entry State Machine

```
┌─────────────┐
│   Initial   │
│   State     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Typing    │◄──────┐
│   Code      │       │
└──────┬──────┘       │
       │              │
       │ (input)      │
       └──────────────┘
       │
       │ (submit)
       ▼
┌─────────────┐
│ Validating  │
│   Code      │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│   Valid     │ │   Invalid   │
│   Code      │ │   Code      │
└──────┬──────┘ └──────┬──────┘
       │               │
       │               │ (show error)
       │               │
       │               ▼
       │        ┌─────────────┐
       │        │   Error     │
       │        │   State     │
       │        └──────┬──────┘
       │               │
       │               │ (retry)
       │               │
       │               ▼
       │        ┌─────────────┐
       │        │   Typing    │
       │        │   Code      │
       │        └─────────────┘
       │
       │ (navigate)
       ▼
┌─────────────┐
│Confirmation │
│   Screen    │
└─────────────┘
```

### Screen 2: Confirmation State Machine

```
┌─────────────┐
│   Review    │
│   Info      │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       │ (cancel)    │ (confirm)
       │             │
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│   Cancel    │ │ Connecting  │
│   Dialog    │ │   State     │
└──────┬──────┘ └──────┬──────┘
       │               │
       │ (yes)         ├─────────────┐
       │               │             │
       ▼               ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Back to   │ │   Success   │ │   Error     │
│   Entry     │ │   State     │ │   State     │
└─────────────┘ └──────┬──────┘ └──────┬──────┘
                       │               │
                       │               │ (retry)
                       │               │
                       │               ▼
                       │        ┌─────────────┐
                       │        │   Review    │
                       │        │   Info      │
                       │        └─────────────┘
                       │
                       │ (navigate)
                       ▼
                ┌─────────────┐
                │  Dashboard  │
                └─────────────┘
```

## Component Hierarchy

### Screen 1: Device Connection

```
DeviceConnectionScreen
├── SafeAreaView
│   └── Container
│       └── KeyboardAvoidingView
│           └── ScrollView
│               ├── Header
│               │   ├── IconContainer
│               │   │   └── Ionicons (link-outline)
│               │   ├── Title
│               │   └── Subtitle
│               │
│               ├── Card (Form)
│               │   ├── SectionTitle
│               │   ├── SectionDescription
│               │   ├── Input (Code)
│               │   │   ├── LeftIcon (key-outline)
│               │   │   └── RightIcon (checkmark-circle)
│               │   ├── HintContainer
│               │   │   ├── Ionicons (information-circle)
│               │   │   └── HintText
│               │   └── Button (Submit)
│               │
│               ├── Card (Help)
│               │   ├── HelpHeader
│               │   │   ├── Ionicons (help-circle)
│               │   │   └── HelpTitle
│               │   └── HelpContent
│               │       ├── HelpItem (×3)
│               │       │   ├── Ionicons (checkmark-circle)
│               │       │   └── HelpText
│               │
│               └── Button (Back)
```

### Screen 2: Connection Confirmation

```
DeviceConnectionConfirmScreen
├── SafeAreaView
│   └── Container
│       └── ScrollView
│           ├── Header
│           │   ├── IconContainer
│           │   │   └── Ionicons (person-add-outline)
│           │   ├── Title
│           │   └── Subtitle
│           │
│           ├── Card (Patient Info)
│           │   ├── SectionTitle
│           │   ├── InfoRow (×3)
│           │   │   ├── Ionicons
│           │   │   └── InfoContent
│           │   │       ├── InfoLabel
│           │   │       └── InfoValue
│           │   └── Divider (×2)
│           │
│           ├── Card (Permissions)
│           │   ├── PermissionsHeader
│           │   │   ├── Ionicons (shield-checkmark)
│           │   │   └── PermissionsTitle
│           │   ├── PermissionsDescription
│           │   └── PermissionsList
│           │       └── PermissionItem (×4)
│           │           ├── Ionicons (checkmark-circle)
│           │           └── PermissionText
│           │
│           ├── Card (Error) [conditional]
│           │   ├── ErrorHeader
│           │   │   ├── Ionicons (alert-circle)
│           │   │   └── ErrorTitle
│           │   └── ErrorMessage
│           │
│           └── Actions
│               ├── Button (Cancel)
│               └── Button (Connect)
```

### Screen 3: Success Confirmation

```
DeviceConnectionConfirmScreen (Success State)
├── SafeAreaView
│   └── Container
│       └── ScrollView
│           ├── SuccessHeader
│           │   ├── SuccessIconContainer
│           │   │   └── Ionicons (checkmark-circle)
│           │   ├── SuccessTitle
│           │   └── SuccessSubtitle
│           │
│           ├── Card (Details)
│           │   ├── DetailRow (×3)
│           │   │   ├── Ionicons
│           │   │   └── DetailContent
│           │   │       ├── DetailLabel
│           │   │       └── DetailValue
│           │   └── Divider (×2)
│           │
│           ├── Card (Next Steps)
│           │   ├── NextStepsTitle
│           │   └── NextStepItem (×3)
│           │       ├── StepNumber
│           │       │   └── StepNumberText
│           │       └── StepText
│           │
│           └── Button (Dashboard)
```

## Color Scheme

### Primary Colors
- **Primary Blue**: `#007AFF` - Main actions, icons
- **Success Green**: `#34C759` - Success states, checkmarks
- **Error Red**: `#FF3B30` - Error states, alerts
- **Warning Orange**: `#FF9500` - Warnings, cautions

### Neutral Colors
- **Gray 50**: `#F9FAFB` - Background
- **Gray 100**: `#F3F4F6` - Card backgrounds
- **Gray 200**: `#E5E7EB` - Dividers
- **Gray 600**: `#4B5563` - Secondary text
- **Gray 900**: `#111827` - Primary text

### Semantic Colors
- **Primary 50**: `#E6F0FF` - Light blue backgrounds
- **Primary 100**: `#CCE1FF` - Light blue borders
- **Success 500**: `#34C759` - Success indicators
- **Error 50**: `#FEF2F2` - Error backgrounds
- **Error 500**: `#FF3B30` - Error text/icons

## Typography

### Font Sizes
- **3xl**: 30px - Large headings
- **2xl**: 24px - Screen titles
- **xl**: 20px - Section titles
- **lg**: 18px - Card titles
- **base**: 16px - Body text
- **sm**: 14px - Secondary text
- **xs**: 12px - Hints, captions

### Font Weights
- **Bold**: 700 - Titles, emphasis
- **Semibold**: 600 - Section headers
- **Medium**: 500 - Labels
- **Normal**: 400 - Body text

## Spacing

### Spacing Scale
- **xs**: 4px - Tight spacing
- **sm**: 8px - Small gaps
- **md**: 12px - Medium gaps
- **lg**: 16px - Large gaps
- **xl**: 20px - Extra large gaps
- **2xl**: 24px - Section spacing
- **3xl**: 32px - Screen padding

## Icons

### Icon Usage

**Screen 1: Code Entry**
- `link-outline` (48px) - Main header icon
- `key-outline` (20px) - Input field icon
- `checkmark-circle` (20px) - Valid code indicator
- `information-circle-outline` (16px) - Hint icon
- `help-circle-outline` (24px) - Help section icon
- `checkmark-circle-outline` (20px) - Help item bullets

**Screen 2: Confirmation**
- `person-add-outline` (48px) - Main header icon
- `person-outline` (24px) - Patient name icon
- `hardware-chip-outline` (24px) - Device ID icon
- `key-outline` (24px) - Connection code icon
- `shield-checkmark-outline` (24px) - Permissions icon
- `checkmark-circle` (20px) - Permission bullets
- `alert-circle` (24px) - Error icon

**Screen 3: Success**
- `checkmark-circle` (80px) - Large success icon
- `person-outline` (20px) - Patient detail icon
- `hardware-chip-outline` (20px) - Device detail icon
- `checkmark-circle-outline` (20px) - Status icon

## Interaction Patterns

### Input Validation
```
User types → Real-time format check → Visual feedback
                                    ↓
                              Valid: ✓ green checkmark
                              Invalid: ⚠️ error message
```

### Button States
```
Default → Hover → Active → Loading → Success/Error
  ↓        ↓       ↓         ↓           ↓
Normal   Pressed  Pressed  Spinner    Feedback
Color    Color    Color    + Text     Message
```

### Error Handling
```
Error occurs → Display error card → User reads → Retry action
                      ↓
              Clear, actionable message
              with retry guidance
```

## Accessibility

### Screen Reader Announcements

**Code Entry:**
- "Código de conexión, campo de texto, ingresa el código de 6 a 8 caracteres proporcionado por el paciente"
- "Continuar, botón, valida el código de conexión e inicia el proceso de vinculación"

**Confirmation:**
- "Confirmar conexión, pantalla"
- "Información del paciente, John Doe, dispositivo DEVICE-001"
- "Conectar, botón, confirma y establece la conexión con el dispositivo del paciente"

**Success:**
- "Conexión exitosa, te has conectado exitosamente con el dispositivo de John Doe"
- "Ir al panel de control, botón, navega al panel de control del cuidador"

### Focus Order
1. Code input field
2. Submit button
3. Help section (optional)
4. Back button

### Touch Targets
- All buttons: minimum 44×44 points
- Input fields: minimum 44 points height
- Icon buttons: 44×44 points

## Animation & Transitions

### Screen Transitions
- **Entry**: Slide from right (300ms ease-out)
- **Exit**: Slide to left (300ms ease-in)
- **Success**: Fade in (400ms ease-out)

### Element Animations
- **Loading spinner**: Continuous rotation
- **Success icon**: Scale up + fade in (500ms)
- **Error shake**: Horizontal shake (300ms)

### Micro-interactions
- **Button press**: Scale down to 0.95 (100ms)
- **Input focus**: Border color transition (200ms)
- **Card hover**: Subtle shadow increase (200ms)

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Full-width cards
- Stacked buttons
- Larger touch targets

### Tablet (768px - 1024px)
- Centered content (max-width: 600px)
- Larger spacing
- Side-by-side buttons

### Desktop (> 1024px)
- Centered content (max-width: 600px)
- Hover states enabled
- Keyboard shortcuts active

## Error States

### Visual Error Indicators

**Invalid Code Format:**
```
┌─────────────────────────────────────┐
│ 🔑 [ABC12_____________]             │
│                                     │
│ ⚠️ El código debe tener entre 6 y 8│
│    caracteres                       │
└─────────────────────────────────────┘
```

**Expired Code:**
```
┌─────────────────────────────────────┐
│ ⚠️ Error de Conexión                │
│                                     │
│ Este código ha expirado. Solicita  │
│ un nuevo código al paciente.        │
└─────────────────────────────────────┘
```

**Connection Error:**
```
┌─────────────────────────────────────┐
│ ⚠️ Error de Conexión                │
│                                     │
│ Error al conectar con el            │
│ dispositivo. Por favor, intenta     │
│ nuevamente.                         │
│                                     │
│ [     Reintentar     ]              │
└─────────────────────────────────────┘
```

## Success States

### Visual Success Indicators

**Valid Code:**
```
┌─────────────────────────────────────┐
│ 🔑 [ABC123____________] ✅          │
│                                     │
│ ℹ️ 6/8 caracteres                   │
└─────────────────────────────────────┘
```

**Connection Success:**
```
┌─────────────────────────────────────┐
│                                     │
│            ✅                        │
│      (Large checkmark)              │
│                                     │
│     ¡Conexión Exitosa!              │
│                                     │
│ Te has conectado exitosamente con   │
│ el dispositivo de John Doe          │
└─────────────────────────────────────┘
```

## Loading States

### Visual Loading Indicators

**Validating Code:**
```
┌─────────────────────────────────────┐
│ 🔑 [ABC123____________] ⏳          │
│                                     │
│ Validando código...                 │
└─────────────────────────────────────┘
```

**Connecting:**
```
┌─────────────────────────────────────┐
│ [  Cancelar  ]  [ ⏳ Conectando... ]│
│                                     │
│ (Button disabled, spinner visible)  │
└─────────────────────────────────────┘
```

## Best Practices

### Do's ✅
- Show clear progress indicators
- Provide immediate feedback
- Use consistent iconography
- Display helpful error messages
- Offer retry options
- Celebrate success
- Guide next steps

### Don'ts ❌
- Don't hide errors
- Don't use technical jargon
- Don't block without explanation
- Don't skip validation
- Don't forget loading states
- Don't ignore accessibility
- Don't leave users stranded

## Conclusion

This visual guide provides a comprehensive overview of the connection flow UI/UX design. The implementation follows modern design principles with clear visual hierarchy, consistent styling, and excellent user experience throughout the entire flow.
