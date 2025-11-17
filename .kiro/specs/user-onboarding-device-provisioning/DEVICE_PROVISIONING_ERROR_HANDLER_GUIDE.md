# Device Provisioning Error Handler - Quick Reference Guide

## Overview
Comprehensive error handling system for device provisioning with user-friendly messages, troubleshooting steps, and support guidance.

## Quick Start

### Import Error Handler
```typescript
import { 
  DeviceProvisioningErrorCode,
  handleDeviceProvisioningError,
  parseDeviceProvisioningError,
  createDeviceProvisioningError
} from '../utils/deviceProvisioningErrors';
```

### Import Error Display Component
```typescript
import { DeviceProvisioningErrorDisplay } from '../DeviceProvisioningErrorDisplay';
```

## Error Codes

| Error Code | Description | Retryable | Support Required |
|------------|-------------|-----------|------------------|
| `DEVICE_NOT_FOUND` | Device ID not found in system | ✅ Yes | ❌ No |
| `DEVICE_ALREADY_CLAIMED` | Device registered to another user | ❌ No | ✅ Yes |
| `INVALID_DEVICE_ID` | Invalid device ID format | ✅ Yes | ❌ No |
| `WIFI_CONFIG_FAILED` | WiFi configuration failed | ✅ Yes | ❌ No |
| `DEVICE_OFFLINE` | Device not responding | ✅ Yes | ❌ No |
| `PERMISSION_DENIED` | User lacks permission | ❌ No | ✅ Yes |

## Usage Examples

### Example 1: Handle Specific Error
```typescript
const errorResponse = handleDeviceProvisioningError(
  DeviceProvisioningErrorCode.DEVICE_NOT_FOUND
);

console.log(errorResponse.userMessage);
console.log(errorResponse.suggestedAction);
errorResponse.troubleshootingSteps.forEach(step => console.log(step));
```

### Example 2: Parse Firebase Error
```typescript
try {
  // Firebase operation
  await getDoc(deviceRef);
} catch (error) {
  const errorCode = parseDeviceProvisioningError(error);
  const errorResponse = handleDeviceProvisioningError(errorCode);
  
  // Show error to user
  setErrorMessage(errorResponse.userMessage);
}
```

### Example 3: Create Application Error
```typescript
const appError = createDeviceProvisioningError(
  DeviceProvisioningErrorCode.DEVICE_NOT_FOUND,
  { deviceId: 'DEVICE-123', userId: 'user-456' }
);

// Log for debugging
console.error(appError);

// Show to user
alert(appError.userMessage);
```

### Example 4: Display Error in Component
```typescript
function MyComponent() {
  const [errorCode, setErrorCode] = useState<DeviceProvisioningErrorCode | null>(null);

  const handleRetry = () => {
    setErrorCode(null);
    // Retry logic
  };

  if (errorCode) {
    return (
      <DeviceProvisioningErrorDisplay
        errorCode={errorCode}
        onRetry={handleRetry}
        onContactSupport={() => {
          // Open support contact
        }}
      />
    );
  }

  return <NormalContent />;
}
```

### Example 5: Inline Error Handling
```typescript
const checkDevice = async (deviceId: string) => {
  try {
    const deviceDoc = await getDoc(doc(db, 'devices', deviceId));
    
    if (!deviceDoc.exists()) {
      const errorCode = DeviceProvisioningErrorCode.DEVICE_NOT_FOUND;
      const errorResponse = handleDeviceProvisioningError(errorCode);
      return { error: errorResponse.userMessage };
    }
    
    if (deviceDoc.data().primaryPatientId) {
      const errorCode = DeviceProvisioningErrorCode.DEVICE_ALREADY_CLAIMED;
      const errorResponse = handleDeviceProvisioningError(errorCode);
      return { error: errorResponse.userMessage };
    }
    
    return { success: true };
  } catch (error) {
    const errorCode = parseDeviceProvisioningError(error);
    const errorResponse = handleDeviceProvisioningError(errorCode);
    return { error: errorResponse.userMessage };
  }
};
```

## Error Response Structure

```typescript
interface DeviceProvisioningErrorResponse {
  userMessage: string;              // "No pudimos encontrar el dispositivo..."
  retryable: boolean;               // true or false
  suggestedAction: string;          // "Verifica el ID del dispositivo..."
  troubleshootingSteps: string[];   // ["Paso 1...", "Paso 2...", ...]
  supportContact?: boolean;         // true if support needed
}
```

## Firebase Error Mapping

| Firebase Error Code | Maps To |
|---------------------|---------|
| `not-found` | `DEVICE_NOT_FOUND` |
| `permission-denied` | `PERMISSION_DENIED` |
| `unavailable` | `DEVICE_OFFLINE` |
| `timeout` | `DEVICE_OFFLINE` |
| `invalid-argument` | `INVALID_DEVICE_ID` |
| `failed-precondition` | `INVALID_DEVICE_ID` |

## Error Message Examples

### DEVICE_NOT_FOUND
```
User Message: "No pudimos encontrar el dispositivo con el ID proporcionado"
Suggested Action: "Verifica el ID del dispositivo e intenta nuevamente"
Steps:
1. Verifica que el ID esté escrito correctamente
2. Asegúrate de no incluir espacios antes o después del ID
3. Revisa que el ID coincida con el que aparece en tu dispositivo
4. El ID debe estar en la parte inferior del dispositivo o en la caja
5. Si el problema persiste, contacta al soporte técnico
```

### DEVICE_ALREADY_CLAIMED
```
User Message: "Este dispositivo ya está registrado a otro usuario"
Suggested Action: "Verifica el ID del dispositivo o contacta al soporte"
Steps:
1. Confirma que el ID del dispositivo sea correcto
2. Si compraste un dispositivo usado, el propietario anterior debe desvincularlo primero
3. Si eres el propietario legítimo, contacta al soporte técnico con tu comprobante de compra
4. Proporciona el ID del dispositivo y tu información de cuenta al soporte
```

### WIFI_CONFIG_FAILED
```
User Message: "No pudimos configurar la conexión WiFi del dispositivo"
Suggested Action: "Verifica las credenciales WiFi e intenta nuevamente"
Steps:
1. Verifica que el nombre de la red WiFi (SSID) sea correcto
2. Asegúrate de que la contraseña WiFi esté escrita correctamente
3. Confirma que tu red WiFi esté activa y funcionando
4. El dispositivo solo soporta redes WiFi de 2.4 GHz (no 5 GHz)
5. Verifica que tu router no tenga restricciones de dispositivos
6. Intenta reiniciar tu router y el dispositivo
7. Si usas caracteres especiales en la contraseña, verifica que sean compatibles
```

## Support Contact Information

```typescript
const supportInfo = getSupportContactInfo();
// Returns:
{
  email: 'soporte@pillhub.com',
  phone: '+1-800-PILLHUB',
  hours: 'Lunes a Viernes, 9:00 AM - 6:00 PM'
}
```

## Best Practices

### 1. Always Parse Errors
```typescript
// ✅ Good
try {
  await operation();
} catch (error) {
  const errorCode = parseDeviceProvisioningError(error);
  const errorResponse = handleDeviceProvisioningError(errorCode);
  showError(errorResponse.userMessage);
}

// ❌ Bad
try {
  await operation();
} catch (error) {
  showError(error.message); // Technical message, not user-friendly
}
```

### 2. Provide Retry Options
```typescript
// ✅ Good
if (errorResponse.retryable) {
  return (
    <DeviceProvisioningErrorDisplay
      errorCode={errorCode}
      onRetry={handleRetry}
    />
  );
}

// ❌ Bad
return <Text>{errorResponse.userMessage}</Text>; // No retry option
```

### 3. Show Troubleshooting Steps
```typescript
// ✅ Good
<DeviceProvisioningErrorDisplay
  errorCode={errorCode}
  onRetry={handleRetry}
/>

// ❌ Bad
<Text>{errorResponse.userMessage}</Text> // No troubleshooting guidance
```

### 4. Handle Support Contact
```typescript
// ✅ Good
if (errorResponse.supportContact) {
  return (
    <DeviceProvisioningErrorDisplay
      errorCode={errorCode}
      onContactSupport={() => openSupportChat()}
    />
  );
}

// ❌ Bad
// Not providing support contact when required
```

### 5. Preserve Error Context
```typescript
// ✅ Good
const appError = createDeviceProvisioningError(
  errorCode,
  { deviceId, userId, timestamp: Date.now() }
);
logError(appError);

// ❌ Bad
logError(errorCode); // Lost context
```

## Accessibility

The error display component includes:
- Screen reader announcements
- High contrast error states
- Large touch targets
- Clear visual hierarchy
- Keyboard navigation support

## Localization

All messages are in Spanish:
- Error messages
- Troubleshooting steps
- Button labels
- Support information

## Testing

### Unit Test Example
```typescript
describe('Device Provisioning Error Handler', () => {
  it('should handle DEVICE_NOT_FOUND error', () => {
    const response = handleDeviceProvisioningError(
      DeviceProvisioningErrorCode.DEVICE_NOT_FOUND
    );
    
    expect(response.retryable).toBe(true);
    expect(response.userMessage).toContain('No pudimos encontrar');
    expect(response.troubleshootingSteps.length).toBeGreaterThan(0);
  });

  it('should parse Firebase errors', () => {
    const firebaseError = { code: 'not-found' };
    const errorCode = parseDeviceProvisioningError(firebaseError);
    
    expect(errorCode).toBe(DeviceProvisioningErrorCode.DEVICE_NOT_FOUND);
  });
});
```

## Common Patterns

### Pattern 1: Validation Error
```typescript
if (!isValidDeviceId(deviceId)) {
  const errorCode = DeviceProvisioningErrorCode.INVALID_DEVICE_ID;
  const errorResponse = handleDeviceProvisioningError(errorCode);
  setValidationError(errorResponse.userMessage);
  return;
}
```

### Pattern 2: Network Error
```typescript
try {
  await saveWiFiConfig(config);
} catch (error) {
  if (error.code === 'unavailable') {
    const errorCode = DeviceProvisioningErrorCode.DEVICE_OFFLINE;
    const errorResponse = handleDeviceProvisioningError(errorCode);
    showError(errorResponse);
  }
}
```

### Pattern 3: Permission Error
```typescript
try {
  await updateDevice(deviceId);
} catch (error) {
  if (error.code === 'permission-denied') {
    const errorCode = DeviceProvisioningErrorCode.PERMISSION_DENIED;
    const errorResponse = handleDeviceProvisioningError(errorCode);
    showError(errorResponse);
  }
}
```

## Troubleshooting

### Issue: Error not displaying
**Solution**: Ensure you're using the DeviceProvisioningErrorDisplay component

### Issue: Wrong error message
**Solution**: Use parseDeviceProvisioningError() to map Firebase errors correctly

### Issue: No retry button
**Solution**: Pass onRetry prop to DeviceProvisioningErrorDisplay

### Issue: Support contact not showing
**Solution**: Check if error has supportContact: true in response

## Related Files

- `src/utils/deviceProvisioningErrors.ts` - Error handler logic
- `src/components/patient/provisioning/DeviceProvisioningErrorDisplay.tsx` - Display component
- `src/components/patient/provisioning/steps/DeviceIdStep.tsx` - Example usage
- `src/components/patient/provisioning/steps/VerificationStep.tsx` - Example usage
- `src/components/patient/provisioning/steps/WiFiConfigStep.tsx` - Example usage

## Support

For questions or issues with the error handler:
1. Check this guide
2. Review the implementation in wizard steps
3. Run verification script: `node test-device-provisioning-error-handler-simple.js`
4. Contact the development team

---

**Last Updated**: Task 16.1 Completion
**Requirements**: 11.4, 11.6
