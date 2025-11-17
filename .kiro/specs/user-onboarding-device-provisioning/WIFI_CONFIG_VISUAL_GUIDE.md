# WiFi Configuration Step - Visual Guide

## Component Overview

The WiFi Configuration Step is the fourth step in the device provisioning wizard, allowing users to securely configure their device's WiFi connection.

## Screen Layout

```
┌─────────────────────────────────────────┐
│                                         │
│              [WiFi Icon]                │
│                                         │
│        Configuración WiFi               │
│                                         │
│   Conecta tu dispositivo a tu red       │
│   WiFi para sincronización automática   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Nombre de la red WiFi (SSID)          │
│  ┌───────────────────────────────────┐ │
│  │ Mi Red WiFi                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Contraseña WiFi                       │
│  ┌───────────────────────────────────┐ │
│  │ ••••••••••••                  [👁] │ │
│  └───────────────────────────────────┘ │
│  Mínimo 8 caracteres                   │
│                                         │
│  [✓] Configuración guardada            │
│      exitosamente                       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [🛡️] Seguridad                        │
│  Tu contraseña WiFi se transmite de    │
│  forma segura y se almacena encriptada │
│                                         │
│  [🔄] Sincronización automática        │
│  Una vez conectado, tu dispositivo     │
│  sincronizará medicamentos y eventos   │
│  automáticamente                        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Consejos                               │
│                                         │
│  💡 Asegúrate de estar conectado a la  │
│     red WiFi que deseas configurar     │
│                                         │
│  💡 La contraseña debe tener al menos  │
│     8 caracteres                        │
│                                         │
│  💡 El dispositivo debe estar encendido│
│     y cerca del router WiFi            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    Probar Conexión                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    Editar Configuración           │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## State Flow Diagram

```
┌─────────────┐
│   Initial   │
│    State    │
└──────┬──────┘
       │
       │ User enters credentials
       ▼
┌─────────────┐
│  Validation │
│   Enabled   │
└──────┬──────┘
       │
       │ Click "Guardar Configuración"
       ▼
┌─────────────┐
│   Saving    │
│   Config    │
└──────┬──────┘
       │
       │ Success
       ▼
┌─────────────┐
│   Testing   │
│ Connection  │
└──────┬──────┘
       │
       ├─────────────┬─────────────┐
       │             │             │
       ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Success  │  │  Failed  │  │  Timeout │
│          │  │          │  │          │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     │             │             │
     └─────────────┴─────────────┘
                   │
                   ▼
            ┌─────────────┐
            │ Can Proceed │
            │  to Next    │
            └─────────────┘
```

## User Interaction Flow

### 1. Initial Entry
```
User arrives at WiFi Config Step
↓
Screen announces: "Paso 4: Configura la conexión WiFi"
↓
Form fields are empty
↓
Save button is disabled
```

### 2. Credential Entry
```
User types WiFi SSID
↓
User types password (8+ characters)
↓
Validation runs in real-time
↓
Save button becomes enabled
```

### 3. Save Configuration
```
User clicks "Guardar Configuración"
↓
Button shows loading state
↓
Config written to RTDB: devices/{deviceId}/config
↓
Success message displayed
↓
Haptic feedback triggered
↓
Automatic connection test starts
```

### 4. Connection Test
```
Testing status shown
↓
Wait 2 seconds for device processing
↓
Read device state from RTDB
↓
Check wifi_connected flag
↓
Display result (success/failed)
↓
Haptic feedback triggered
```

### 5. Post-Save Options
```
User can:
- Test Connection (retry)
- Edit Configuration (modify)
- Proceed to Next Step (if saved)
```

## Visual States

### State 1: Empty Form
```
┌─────────────────────────────────────┐
│  Nombre de la red WiFi (SSID)      │
│  ┌───────────────────────────────┐ │
│  │                               │ │ ← Empty
│  └───────────────────────────────┘ │
│                                     │
│  Contraseña WiFi                   │
│  ┌───────────────────────────────┐ │
│  │                           [👁] │ │ ← Empty
│  └───────────────────────────────┘ │
│                                     │
│  [Guardar Configuración] (disabled)│
└─────────────────────────────────────┘
```

### State 2: Valid Input
```
┌─────────────────────────────────────┐
│  Nombre de la red WiFi (SSID)      │
│  ┌───────────────────────────────┐ │
│  │ MyHomeNetwork                 │ │ ← Filled
│  └───────────────────────────────┘ │
│                                     │
│  Contraseña WiFi                   │
│  ┌───────────────────────────────┐ │
│  │ ••••••••••••              [👁] │ │ ← 8+ chars
│  └───────────────────────────────┘ │
│                                     │
│  [Guardar Configuración] (enabled) │
└─────────────────────────────────────┘
```

### State 3: Saving
```
┌─────────────────────────────────────┐
│  [Guardando...] (loading spinner)  │
└─────────────────────────────────────┘
```

### State 4: Testing Connection
```
┌─────────────────────────────────────┐
│  [🔄] Probando conexión...          │
└─────────────────────────────────────┘
```

### State 5: Success
```
┌─────────────────────────────────────┐
│  [✓] Configuración guardada         │
│      exitosamente                   │
│                                     │
│  [Probar Conexión]                 │
│  [Editar Configuración]            │
└─────────────────────────────────────┘
```

### State 6: Error
```
┌─────────────────────────────────────┐
│  [⚠] Error al guardar la            │
│      configuración WiFi             │
│                                     │
│  [Reintentar]                      │
└─────────────────────────────────────┘
```

## Color Coding

### Status Colors
- **Idle**: Gray (#6B7280)
- **Testing**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)

### Background Colors
- **Info Card**: Light Blue (#EFF6FF)
- **Success Card**: Light Green (#F0FDF4)
- **Error Card**: Light Red (#FEF2F2)
- **Warning Card**: Light Yellow (#FFFBEB)

## Accessibility Features

### Screen Reader Announcements
```
On mount:
"Paso 4: Configura la conexión WiFi de tu dispositivo"

On save success:
"Configuración WiFi guardada exitosamente"

On test start:
"Probando conexión"

On test success:
"Conexión WiFi exitosa"

On error:
"Error: [error message]"
```

### Keyboard Navigation
```
Tab Order:
1. SSID Input Field
2. Password Input Field
3. Show Password Button
4. Save/Test Button
5. Edit Button (if saved)
```

### Touch Targets
- All buttons: 44x44 minimum
- Input fields: Full width, 48px height
- Show password icon: 44x44 touch area

## Data Flow

### Write to RTDB
```javascript
devices/{deviceId}/config
{
  // Existing config preserved
  alarm_mode: "sound",
  led_intensity: 80,
  
  // New WiFi config added
  wifi_ssid: "MyNetwork",
  wifi_password: "SecurePass123",
  wifi_configured: true,
  wifi_configured_at: 1700000000000
}
```

### Read from RTDB
```javascript
devices/{deviceId}/state
{
  is_online: true,
  wifi_connected: true,  // ← Check this
  battery_level: 85,
  last_seen: 1700000000000
}
```

### Update Wizard Context
```javascript
updateFormData({
  wifiSSID: "MyNetwork",
  wifiPassword: "SecurePass123"
})
```

## Error Messages

### Validation Errors
- Empty SSID: "El nombre de la red es requerido"
- Short password: "La contraseña debe tener al menos 8 caracteres"

### Save Errors
- Permission denied: "No tienes permiso para configurar este dispositivo"
- Network unavailable: "Servicio no disponible. Verifica tu conexión a internet"
- Generic error: "Error al guardar la configuración WiFi"

### Test Errors
- Cannot verify: "No se pudo verificar la conexión. La configuración se guardó correctamente"
- Permission denied: "No tienes permiso para verificar el estado del dispositivo"

## Tips and Guidance

### Security Tip
```
[🛡️] Seguridad
Tu contraseña WiFi se transmite de forma segura
y se almacena encriptada
```

### Sync Tip
```
[🔄] Sincronización automática
Una vez conectado, tu dispositivo sincronizará
medicamentos y eventos automáticamente
```

### Usage Tips
```
💡 Asegúrate de estar conectado a la red WiFi
   que deseas configurar

💡 La contraseña debe tener al menos 8 caracteres

💡 El dispositivo debe estar encendido y cerca
   del router WiFi
```

## Integration Points

### Wizard Context
- `formData.wifiSSID` - Current SSID value
- `formData.wifiPassword` - Current password value
- `updateFormData()` - Update wizard state
- `setCanProceed()` - Control navigation

### Firebase RTDB
- `devices/{deviceId}/config` - Write WiFi config
- `devices/{deviceId}/state` - Read connection status

### Accessibility Utils
- `announceForAccessibility()` - Screen reader
- `triggerHapticFeedback()` - Tactile feedback

## Testing Checklist

### Functional Tests
- [ ] Enter valid WiFi credentials
- [ ] Save configuration to RTDB
- [ ] Test connection after save
- [ ] Edit configuration after save
- [ ] Handle empty SSID
- [ ] Handle short password
- [ ] Handle network errors
- [ ] Handle permission errors

### UI Tests
- [ ] Password visibility toggle works
- [ ] Loading states display correctly
- [ ] Success message appears
- [ ] Error messages display
- [ ] Buttons enable/disable correctly
- [ ] Status indicators update

### Accessibility Tests
- [ ] Screen reader announces step
- [ ] All inputs have labels
- [ ] Buttons have accessibility hints
- [ ] Keyboard navigation works
- [ ] Touch targets are adequate
- [ ] Haptic feedback triggers

### Integration Tests
- [ ] Wizard state updates
- [ ] Navigation control works
- [ ] Back navigation preserves state
- [ ] Exit confirmation works
- [ ] Next step enabled after save

## Performance Considerations

- **Immediate Save**: No debouncing on save button
- **Optimistic UI**: Shows success before full verification
- **Minimal Reads**: Only reads device state when testing
- **Efficient Merge**: Preserves existing config
- **Timeout Handling**: 2-second delay for device processing

## Security Notes

⚠️ **Current Implementation**
- WiFi password stored in plain text in RTDB
- Transmitted over HTTPS
- Access controlled by Firebase security rules

✅ **Production Recommendations**
- Implement client-side encryption
- Use Firebase Functions for secure storage
- Add audit logging
- Support password rotation
- Implement secure credential management

## Conclusion

The WiFi Configuration Step provides a secure, user-friendly interface for configuring device WiFi connectivity with comprehensive error handling, accessibility support, and real-time feedback.
