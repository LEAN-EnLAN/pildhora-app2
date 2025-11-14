# Design Document

## Overview

This design document outlines the architecture and implementation approach for refactoring and enhancing the UI components and screens in the Pildhora application. The design focuses on creating a cohesive, modern design system with reusable components, improving user experience through better visual hierarchy and interactions, and strengthening backend integration with robust error handling.

### Design Goals

1. **Consistency**: Establish a unified design language across all screens
2. **Reusability**: Create modular, composable UI components
3. **Performance**: Optimize rendering and minimize unnecessary re-renders
4. **Accessibility**: Ensure WCAG 2.1 AA compliance for all interactive elements
5. **Maintainability**: Improve code organization and reduce duplication
6. **User Experience**: Enhance visual feedback, loading states, and error handling

## Architecture

### Component Hierarchy

```
src/
├── components/
│   ├── ui/                          # Core UI component library
│   │   ├── Button.tsx               # Enhanced button component
│   │   ├── Card.tsx                 # Enhanced card component
│   │   ├── Input.tsx                # New unified input component
│   │   ├── Modal.tsx                # New modal component
│   │   ├── Chip.tsx                 # New chip/tag component
│   │   ├── LoadingSpinner.tsx       # New loading indicator
│   │   ├── ErrorMessage.tsx         # New error display component
│   │   ├── SuccessMessage.tsx       # New success feedback component
│   │   ├── Slider.tsx               # Enhanced slider wrapper
│   │   ├── ColorPicker.tsx          # Enhanced color picker
│   │   └── index.ts                 # Barrel export
│   ├── screens/                     # Screen-specific components
│   │   ├── caregiver/
│   │   │   └── DeviceLinkingCard.tsx
│   │   └── patient/
│   │       ├── AdherenceCard.tsx
│   │       ├── UpcomingDoseCard.tsx
│   │       ├── DeviceStatusCard.tsx
│   │       └── MedicationListItem.tsx
│   └── shared/                      # Shared composite components
│       ├── DeviceConfigPanel.tsx
│       └── NotificationSettings.tsx
└── app/
    ├── caregiver/
    │   └── add-device.tsx           # Refactored
    └── patient/
        ├── home.tsx                 # Refactored
        ├── settings.tsx             # Refactored
        └── link-device.tsx          # Refactored
```

### Design System Tokens

```typescript
// src/theme/tokens.ts
export const colors = {
  // Primary palette
  primary: {
    50: '#E6F0FF',
    100: '#CCE1FF',
    500: '#007AFF',  // Main primary
    600: '#0066CC',
    700: '#0052A3',
  },
  
  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5856D6',
  
  // Neutral palette
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Surface colors
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

## Components and Interfaces

### 1. Enhanced Button Component

**Purpose**: Provide a consistent, accessible button with multiple variants and states.

**Interface**:
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}
```

**Key Features**:
- Loading state with spinner
- Icon support (left/right)
- Press feedback animation
- Disabled state styling
- Full width option
- Accessibility labels

### 2. Enhanced Card Component

**Purpose**: Provide a consistent container for grouped content with elevation.

**Interface**:
```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}
```

**Key Features**:
- Multiple visual variants
- Optional header/footer sections
- Pressable variant for interactive cards
- Configurable padding
- Consistent shadow/elevation

### 3. New Input Component

**Purpose**: Unified text input with validation states and error handling.

**Interface**:
```typescript
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
}
```

**Key Features**:
- Label and helper text support
- Error state with message
- Icon support
- Focus/blur animations
- Required field indicator
- Accessibility labels

### 4. New Modal Component

**Purpose**: Consistent modal presentation with overlay and animations.

**Interface**:
```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  animationType?: 'fade' | 'slide';
  showCloseButton?: boolean;
  closeOnOverlayPress?: boolean;
}
```

**Key Features**:
- Animated entrance/exit
- Configurable sizes
- Optional close button
- Overlay press to dismiss
- Accessibility support (trap focus)

### 5. New Chip Component

**Purpose**: Display tags, filters, or selectable options.

**Interface**:
```typescript
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  color?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  disabled?: boolean;
}
```

**Key Features**:
- Selectable state
- Removable with X button
- Multiple color variants
- Icon support
- Press animations

### 6. Enhanced Color Picker Component

**Purpose**: Intuitive color selection with presets and custom picker.

**Interface**:
```typescript
interface ColorPickerProps {
  value: string; // hex color
  onChange: (color: { hex: string; rgb: [number, number, number] }) => void;
  presets?: string[];
  showPresets?: boolean;
  showCustomPicker?: boolean;
}
```

**Key Features**:
- Preset color swatches
- HSB color picker
- RGB output for device config
- Visual preview
- Smooth transitions

### 7. Loading and Feedback Components

**LoadingSpinner**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}
```

**ErrorMessage**:
```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'banner' | 'toast';
}
```

**SuccessMessage**:
```typescript
interface SuccessMessageProps {
  message: string;
  autoDismiss?: boolean;
  duration?: number;
  onDismiss?: () => void;
}
```

## Data Models

### Device Configuration State

```typescript
interface DeviceConfig {
  deviceId: string;
  alarmMode: 'off' | 'sound' | 'led' | 'both';
  ledIntensity: number; // 0-1023
  ledColor: {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
  };
  lastUpdated: Date;
  syncStatus: 'synced' | 'pending' | 'error';
}
```

### Device Status State

```typescript
interface DeviceStatus {
  deviceId: string;
  battery: number | null; // percentage
  status: 'idle' | 'dispensing' | 'error' | 'offline';
  isOnline: boolean;
  lastSeen: Date;
  firmwareVersion?: string;
}
```

### Notification Preferences

```typescript
interface NotificationPreferences {
  enabled: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  hierarchy: string[]; // ordered list of modalities
  customModalities: string[];
}
```

## Screen Designs

### 1. Caregiver Add Device Screen

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Header: "Vincular Dispositivo"  │
├─────────────────────────────────┤
│                                 │
│  [Icon] Vincular ESP8266        │
│  Ingresa el ID del dispositivo  │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Device ID Input           │ │
│  └───────────────────────────┘ │
│                                 │
│  [Vincular Button - Primary]    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Estado: [Success/Error Card]   │
│                                 │
└─────────────────────────────────┘
```

**Key Improvements**:
- Step-by-step visual flow
- Inline validation feedback
- Animated state transitions
- Clear success/error states
- Contextual help text

### 2. Patient Home Screen

**Layout Structure**:
```
┌─────────────────────────────────┐
│ PILDHORA                        │
│ Hola, [Name]    [Alert] [User]  │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Estado del día              │ │
│ │   [Progress Ring: 75%]      │ │
│ │   3 de 4 dosis tomadas      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Próxima dosis               │ │
│ │ Aspirina 500mg              │ │
│ │ 14:30                       │ │
│ │         [Tomar Medicación]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Mi dispositivo              │ │
│ │ Batería: 85%  Estado: Activo│ │
│ └─────────────────────────────┘ │
│                                 │
│ Hoy                             │
│ ┌─────────────────────────────┐ │
│ │ Medicamento 1    [Ver]      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Medicamento 2    [Ver]      │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Key Improvements**:
- Prominent adherence visualization
- Clear next action (upcoming dose)
- Device status at a glance
- Simplified medication list
- Better visual hierarchy

### 3. Patient Settings Screen

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Configuraciones                 │
│ Personaliza tu experiencia      │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Perfil                      │ │
│ │ [Name]                      │ │
│ │ [Email]        [Editar]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Notificaciones              │ │
│ │                             │ │
│ │ Habilitar    [Toggle: ON]   │ │
│ │ Estado: granted             │ │
│ │                             │ │
│ │ Prioridad                   │ │
│ │ [urgent] > [medication] >   │ │
│ │ [general]                   │ │
│ │                             │ │
│ │ Modalidades                 │ │
│ │ [Chip: urgent ×]            │ │
│ │ [Chip: medication ×]        │ │
│ │ [Chip: general ×]           │ │
│ │                             │ │
│ │ [+ Agregar modalidad]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Dispositivo                 │ │
│ │ Sistema: iOS                │ │
│ │ Versión: 1.0.0              │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Key Improvements**:
- Grouped settings by category
- Visual chips for modalities
- Inline actions (no separate modals)
- Clear toggle states
- Better spacing and hierarchy

### 4. Patient Link Device Screen

**Layout Structure**:
```
┌─────────────────────────────────┐
│ Enlazar Dispositivo             │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Ingresar Device ID          │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ DEVICE-001              │ │ │
│ │ └─────────────────────────┘ │ │
│ │ [Enlazar]                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Dispositivos Enlazados          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ DEVICE-001      [Desenlazar]│ │
│ │                             │ │
│ │ Batería: 85%                │ │
│ │ Estado: Activo              │ │
│ │                             │ │
│ │ ▼ Configuración             │ │
│ │                             │ │
│ │ Modo de alarma              │ │
│ │ [off] [sound] [led] [both]  │ │
│ │                             │ │
│ │ Intensidad LED: 512         │ │
│ │ [────●────────────]          │ │
│ │                             │ │
│ │ Color LED                   │ │
│ │ [●] [Editar color]          │ │
│ │                             │ │
│ │ [Guardar cambios]           │ │
│ │                             │ │
│ │ [Dispensar]                 │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Key Improvements**:
- Expandable device cards
- Inline configuration controls
- Visual color preview
- Clear save/cancel actions
- Better error handling

## Error Handling

### Error Handling Strategy

1. **Validation Errors**: Display inline near the input field
2. **Network Errors**: Show retry option with error description
3. **Permission Errors**: Guide user to settings with clear instructions
4. **Backend Errors**: Log detailed info, show simplified message to user

### Error Message Patterns

```typescript
// Validation error
<Input
  error="El Device ID debe tener al menos 5 caracteres"
  value={deviceId}
/>

// Network error with retry
<ErrorMessage
  message="No se pudo conectar al servidor"
  onRetry={handleRetry}
  variant="banner"
/>

// Permission error with guidance
<ErrorMessage
  message="Permiso denegado. Verifica las reglas de Firestore."
  variant="inline"
/>
```

### Loading States

```typescript
// Button loading
<Button loading={isLoading}>
  Vincular
</Button>

// Screen loading
<LoadingSpinner
  size="lg"
  text="Cargando dispositivos..."
/>

// Skeleton loading
<SkeletonLoader
  type="card"
  count={3}
/>
```

## Testing Strategy

### Unit Tests

**Components to Test**:
- Button: variants, states, press handling
- Card: variants, press handling
- Input: validation, error states
- Modal: open/close, animations
- Chip: selection, removal
- ColorPicker: color selection, RGB conversion

**Test Approach**:
- React Native Testing Library
- Jest for assertions
- Mock user interactions
- Snapshot tests for visual regression

### Integration Tests

**Flows to Test**:
1. Device linking flow (caregiver)
2. Medication taking flow (patient)
3. Settings update flow (patient)
4. Device configuration flow (patient)

**Test Approach**:
- Test complete user journeys
- Mock Firebase services
- Verify state updates
- Check error handling

### Visual Regression Tests

**Screens to Test**:
- All refactored screens in light/dark mode
- Component variants
- Loading states
- Error states

**Test Approach**:
- Storybook for component isolation
- Percy or similar for visual diffs
- Test on iOS and Android

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Use `React.memo` for expensive components
2. **Lazy Loading**: Load color picker modal only when needed
3. **Debouncing**: Debounce slider changes for device config
4. **Virtualization**: Use FlatList for medication lists
5. **Image Optimization**: Use appropriate image sizes and formats

### Bundle Size

- Tree-shake unused components
- Lazy load heavy dependencies (color picker)
- Use platform-specific code splitting

### Rendering Performance

- Avoid inline function definitions in render
- Use `useCallback` for event handlers
- Minimize re-renders with proper dependency arrays
- Profile with React DevTools

## Accessibility

### WCAG 2.1 AA Compliance

1. **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI components
2. **Touch Targets**: Minimum 44x44 points for interactive elements
3. **Screen Reader Support**: Proper labels and hints
4. **Keyboard Navigation**: Support for external keyboards
5. **Focus Indicators**: Clear visual focus states

### Implementation

```typescript
// Accessible button
<Button
  accessibilityLabel="Vincular dispositivo"
  accessibilityHint="Conecta un nuevo dispositivo a tu cuenta"
  accessibilityRole="button"
>
  Vincular
</Button>

// Accessible input
<Input
  label="Device ID"
  accessibilityLabel="Ingresa el identificador del dispositivo"
  required
/>
```

## Animation Guidelines

### Timing

- **Fast**: 150-200ms for micro-interactions (button press)
- **Medium**: 250-300ms for transitions (modal open)
- **Slow**: 400-500ms for complex animations (screen transitions)

### Easing

- **Ease-out**: For entrances (elements coming into view)
- **Ease-in**: For exits (elements leaving view)
- **Ease-in-out**: For movements (elements changing position)

### Implementation

```typescript
// Button press animation
const scaleAnim = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.95,
    useNativeDriver: true,
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};
```

## Migration Strategy

### Phase 1: Component Library

1. Create new design tokens file
2. Enhance existing Button component
3. Enhance existing Card component
4. Create new Input, Modal, Chip components
5. Update component exports

### Phase 2: Screen Refactoring

1. Refactor caregiver add-device screen
2. Refactor patient home screen
3. Refactor patient settings screen
4. Refactor patient link-device screen

### Phase 3: Backend Integration

1. Improve error handling in deviceLinking service
2. Add retry logic for network failures
3. Enhance logging for debugging
4. Add validation before database writes

### Phase 4: Testing and Polish

1. Write unit tests for new components
2. Write integration tests for refactored screens
3. Perform accessibility audit
4. Optimize performance
5. Visual regression testing

## Dependencies

### New Dependencies

```json
{
  "@react-native-community/slider": "^4.4.3", // Already installed
  "react-native-reanimated": "^3.x", // For smooth animations
  "react-native-gesture-handler": "^2.x" // For better touch handling
}
```

### Existing Dependencies

- React Native
- Expo
- Firebase (Firestore, Realtime Database, Auth)
- Redux Toolkit
- React Navigation (Expo Router)

## Security Considerations

1. **Input Validation**: Sanitize all user inputs before sending to backend
2. **Authentication**: Verify user auth state before all operations
3. **Authorization**: Check user permissions for device operations
4. **Data Encryption**: Use HTTPS for all network requests
5. **Sensitive Data**: Never log sensitive information (tokens, passwords)

## Monitoring and Analytics

### Metrics to Track

1. **Performance**: Screen load times, animation frame rates
2. **Errors**: Error rates by type and screen
3. **User Behavior**: Feature usage, flow completion rates
4. **Device Stats**: Device linking success rate, configuration save rate

### Implementation

```typescript
// Track screen view
analytics.logScreenView({
  screen_name: 'patient_home',
  screen_class: 'PatientHome',
});

// Track user action
analytics.logEvent('device_linked', {
  device_id: deviceId,
  success: true,
});

// Track error
analytics.logEvent('error_occurred', {
  error_type: 'network',
  screen: 'add_device',
  message: error.message,
});
```
