# Connection Code Error Handler - Visual Guide

## Error Display Components

### 1. Error Header
```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│                    ╭───────────╮                         │
│                    │     ⚠️     │                         │
│                    ╰───────────╯                         │
│                                                           │
│              Error de Conexión                           │
│                                                           │
│     No pudimos encontrar el código de                    │
│            conexión ingresado                            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 2. Suggested Action Card
```
┌─────────────────────────────────────────────────────────┐
│ ║                                                         │
│ ║  💡 Acción Sugerida                                    │
│ ║                                                         │
│ ║  Verifica el código e intenta nuevamente               │
│ ║                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Troubleshooting Steps
```
┌─────────────────────────────────────────────────────────┐
│  Pasos para Solucionar                                   │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ①  Verifica que el código esté escrito           │ │
│  │     correctamente                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ②  Asegúrate de no incluir espacios antes o      │ │
│  │     después del código                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ③  Los códigos distinguen entre mayúsculas y     │ │
│  │     minúsculas                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 4. New Code Instructions (for expired/used codes)
```
┌─────────────────────────────────────────────────────────┐
│  🔑 Cómo solicitar un nuevo código                       │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ① Contacta al paciente y pídele que abra la      │ │
│  │    aplicación                                      │ │
│  │                                                     │ │
│  │  ② El paciente debe ir a Configuración >          │ │
│  │    Dispositivo                                     │ │
│  │                                                     │ │
│  │  ③ Seleccionar "Generar Código de Conexión"       │ │
│  │                                                     │ │
│  │  ④ El paciente te compartirá el nuevo código      │ │
│  │    de 6-8 caracteres                               │ │
│  │                                                     │ │
│  │  ⑤ Ingresa el código aquí para conectarte         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │         🔄  Tengo un Nuevo Código                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 5. Action Buttons

**Retry Button (for retryable errors):**
```
┌─────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────┐ │
│  │         🔄  Intentar Nuevamente                    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Help Card:**
```
┌─────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────┐ │
│  │  ℹ️  Si continúas teniendo problemas, contacta al  │ │
│  │     paciente para verificar que el código sea      │ │
│  │     correcto y esté activo.                        │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Error Type Layouts

### CODE_NOT_FOUND
```
╔═══════════════════════════════════════════════════════╗
║                    ⚠️ Error Icon                       ║
║              Error de Conexión                         ║
║   No pudimos encontrar el código de conexión          ║
║              ingresado                                 ║
╠═══════════════════════════════════════════════════════╣
║ ║ 💡 Acción Sugerida                                  ║
║ ║ Verifica el código e intenta nuevamente             ║
╠═══════════════════════════════════════════════════════╣
║ Pasos para Solucionar                                  ║
║ ① Verifica que el código esté escrito correctamente   ║
║ ② Asegúrate de no incluir espacios                    ║
║ ③ Los códigos distinguen entre mayúsculas             ║
║ ④ Confirma con el paciente que el código sea correcto ║
║ ⑤ Si fue enviado por mensaje, cópialo directamente    ║
╠═══════════════════════════════════════════════════════╣
║              [🔄 Intentar Nuevamente]                  ║
╠═══════════════════════════════════════════════════════╣
║ ℹ️ Si continúas teniendo problemas, contacta al       ║
║   paciente para verificar el código                    ║
╚═══════════════════════════════════════════════════════╝
```

### CODE_EXPIRED
```
╔═══════════════════════════════════════════════════════╗
║                    ⚠️ Error Icon                       ║
║              Error de Conexión                         ║
║     Este código de conexión ha expirado               ║
╠═══════════════════════════════════════════════════════╣
║ ║ 💡 Acción Sugerida                                  ║
║ ║ Solicita un nuevo código al paciente                ║
╠═══════════════════════════════════════════════════════╣
║ Pasos para Solucionar                                  ║
║ ① Los códigos expiran después de 24 horas             ║
║ ② Contacta al paciente y pídele un nuevo código       ║
║ ③ El paciente puede generar un nuevo código desde     ║
║   su configuración de dispositivo                      ║
║ ④ Una vez que tengas el nuevo código, ingrésalo aquí  ║
╠═══════════════════════════════════════════════════════╣
║ 🔑 Cómo solicitar un nuevo código                      ║
║ ① Contacta al paciente y pídele que abra la app       ║
║ ② El paciente debe ir a Configuración > Dispositivo   ║
║ ③ Seleccionar "Generar Código de Conexión"            ║
║ ④ El paciente te compartirá el nuevo código           ║
║ ⑤ Ingresa el código aquí para conectarte              ║
║                                                         ║
║           [🔄 Tengo un Nuevo Código]                   ║
╠═══════════════════════════════════════════════════════╣
║ ℹ️ Si continúas teniendo problemas, contacta al       ║
║   paciente para verificar el código                    ║
╚═══════════════════════════════════════════════════════╝
```

### CODE_ALREADY_USED
```
╔═══════════════════════════════════════════════════════╗
║                    ⚠️ Error Icon                       ║
║              Error de Conexión                         ║
║   Este código de conexión ya ha sido utilizado        ║
╠═══════════════════════════════════════════════════════╣
║ ║ 💡 Acción Sugerida                                  ║
║ ║ Solicita un nuevo código al paciente                ║
╠═══════════════════════════════════════════════════════╣
║ Pasos para Solucionar                                  ║
║ ① Los códigos solo pueden usarse una vez              ║
║ ② Si ya usaste este código, deberías tener acceso     ║
║ ③ Verifica en tu lista de pacientes si ya estás       ║
║   conectado                                            ║
║ ④ Si necesitas conectarte nuevamente, solicita un     ║
║   nuevo código al paciente                             ║
║ ⑤ El paciente puede generar múltiples códigos         ║
╠═══════════════════════════════════════════════════════╣
║ 🔑 Cómo solicitar un nuevo código                      ║
║ [Instructions as above...]                             ║
║                                                         ║
║           [🔄 Tengo un Nuevo Código]                   ║
╠═══════════════════════════════════════════════════════╣
║ ℹ️ Si continúas teniendo problemas, contacta al       ║
║   paciente para verificar el código                    ║
╚═══════════════════════════════════════════════════════╝
```

### INVALID_CODE_FORMAT
```
╔═══════════════════════════════════════════════════════╗
║                    ⚠️ Error Icon                       ║
║              Error de Conexión                         ║
║   El formato del código de conexión no es válido      ║
╠═══════════════════════════════════════════════════════╣
║ ║ 💡 Acción Sugerida                                  ║
║ ║ Ingresa un código válido de 6 a 8 caracteres        ║
╠═══════════════════════════════════════════════════════╣
║ Pasos para Solucionar                                  ║
║ ① El código debe tener entre 6 y 8 caracteres         ║
║ ② Solo se permiten letras mayúsculas y números        ║
║ ③ No incluyas espacios ni caracteres especiales       ║
║ ④ Ejemplo de formato válido: ABC123 o XYZ789AB        ║
║ ⑤ Si copiaste el código, asegúrate de no incluir      ║
║   espacios adicionales                                 ║
╠═══════════════════════════════════════════════════════╣
║              [🔄 Intentar Nuevamente]                  ║
╠═══════════════════════════════════════════════════════╣
║ ℹ️ Si continúas teniendo problemas, contacta al       ║
║   paciente para verificar el código                    ║
╚═══════════════════════════════════════════════════════╝
```

### DEVICE_NOT_FOUND
```
╔═══════════════════════════════════════════════════════╗
║                    ⚠️ Error Icon                       ║
║              Error de Conexión                         ║
║   No pudimos encontrar el dispositivo asociado        ║
║              a este código                             ║
╠═══════════════════════════════════════════════════════╣
║ ║ 💡 Acción Sugerida                                  ║
║ ║ Contacta al paciente para verificar el estado       ║
║ ║ del dispositivo                                      ║
╠═══════════════════════════════════════════════════════╣
║ Pasos para Solucionar                                  ║
║ ① El dispositivo asociado no existe o fue eliminado   ║
║ ② Contacta al paciente para confirmar que su          ║
║   dispositivo esté registrado                          ║
║ ③ El paciente debe verificar su dispositivo en la     ║
║   configuración                                        ║
║ ④ Si el problema persiste, el paciente debe contactar ║
║   al soporte técnico                                   ║
╠═══════════════════════════════════════════════════════╣
║ ℹ️ Este error requiere un nuevo código de conexión    ║
║   del paciente.                                        ║
╠═══════════════════════════════════════════════════════╣
║ ℹ️ Si continúas teniendo problemas, contacta al       ║
║   paciente para verificar el código                    ║
╚═══════════════════════════════════════════════════════╝
```

## Color Scheme

### Error States
- **Error Icon Background:** `#FEF2F2` (error[50])
- **Error Icon Color:** `colors.error[500]` (red)
- **Error Title:** `colors.error[500]` (red)

### Action Card
- **Background:** `#FFFBEB` (warning[50])
- **Border Left:** `colors.warning[500]` (yellow/orange)
- **Icon Color:** `colors.warning[500]`

### Step Cards
- **Background:** `colors.surface` (white/light gray)
- **Step Number Background:** `colors.primary[100]` (light blue)
- **Step Number Text:** `colors.primary[700]` (dark blue)

### New Code Section
- **Header Icon:** `colors.primary[500]` (blue)
- **Instruction Number Background:** `colors.primary[500]` (blue)
- **Instruction Number Text:** `#FFFFFF` (white)
- **Button Background:** `colors.primary[500]` (blue)
- **Button Text:** `#FFFFFF` (white)

### Retry Button
- **Background:** `colors.surface` (white)
- **Border:** `colors.primary[500]` (blue)
- **Text:** `colors.primary[500]` (blue)

### Help Card
- **Background:** `colors.primary[50]` (very light blue)
- **Icon:** `colors.primary[500]` (blue)
- **Text:** `colors.gray[700]` (dark gray)

## Spacing

- **Container Padding:** `spacing.lg` (16px)
- **Section Margin:** `spacing.xl` (24px)
- **Card Padding:** `spacing.lg` (16px)
- **Step Gap:** `spacing.md` (12px)
- **Icon Gap:** `spacing.sm` (8px)

## Typography

- **Error Title:** `fontSize.2xl`, `fontWeight.bold`
- **Error Message:** `fontSize.base`, `lineHeight 1.5`
- **Section Title:** `fontSize.lg`, `fontWeight.bold`
- **Action Title:** `fontSize.base`, `fontWeight.semibold`
- **Step Text:** `fontSize.base`, `lineHeight 1.5`
- **Button Text:** `fontSize.base`, `fontWeight.semibold`

## Interaction Flow

```
User Enters Code
       ↓
Format Validation
       ↓
   ┌───┴───┐
   │       │
Invalid  Valid
   │       │
   │       ↓
   │   Service Call
   │       │
   │   ┌───┴───┐
   │   │       │
   │ Error  Success
   │   │       │
   └───┴───────┘
       │
Parse Error Code
       │
Display Error UI
       │
   ┌───┴───┐
   │       │
Retry  New Code
   │       │
   └───────┘
```

## Accessibility Features

### Screen Reader Announcements
- Error title announced first
- Error message read clearly
- Troubleshooting steps numbered and announced
- Button labels descriptive

### Visual Indicators
- High contrast colors (WCAG AA compliant)
- Clear visual hierarchy
- Large touch targets (44x44 minimum)
- Focus states visible

### Keyboard Navigation
- Tab through interactive elements
- Enter to activate buttons
- Escape to dismiss (if modal)

## Responsive Design

### Mobile (< 768px)
- Full width cards
- Stacked layout
- Larger touch targets
- Scrollable content

### Tablet/Desktop (≥ 768px)
- Max width container
- Centered layout
- Same component structure
- Optimized spacing

## Animation (Optional)

### Entry Animation
```
Error Display:
  - Fade in (300ms)
  - Slide up slightly (300ms)
  - Ease-out timing
```

### Button Interactions
```
Buttons:
  - Scale on press (0.95)
  - Haptic feedback
  - Color transition (200ms)
```

## Summary

The Connection Code Error Display provides:
- ✅ Clear visual hierarchy
- ✅ Consistent color scheme
- ✅ Accessible design
- ✅ Responsive layout
- ✅ User-friendly interactions
- ✅ Spanish language support
