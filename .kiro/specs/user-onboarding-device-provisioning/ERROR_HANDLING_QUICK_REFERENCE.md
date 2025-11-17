# Error Handling Quick Reference

## Device Provisioning Errors

### Import
```typescript
import { 
  DeviceProvisioningErrorCode,
  handleDeviceProvisioningError,
  createDeviceProvisioningError,
  parseDeviceProvisioningError 
} from '../utils/deviceProvisioningErrors';
```

### Error Codes

| Code | Description | Retryable |
|------|-------------|-----------|
| `DEVICE_NOT_FOUND` | Device ID not in system | ✅ Yes |
| `DEVICE_ALREADY_CLAIMED` | Device owned by another user | ❌ No |
| `INVALID_DEVICE_ID` | Invalid ID format | ✅ Yes |
| `WIFI_CONFIG_FAILED` | WiFi setup failed | ✅ Yes |
| `DEVICE_OFFLINE` | Device not responding | ✅ Yes |
| `PERMISSION_DENIED` | Authorization error | ❌ No |

### Quick Usage

```typescript
// Parse and handle error
try {
  await provisionDevice(deviceId);
} catch (error) {
  const errorCode = parseDeviceProvisioningError(error);
  const appError = createDeviceProvisioningError(errorCode);
  
  // Show to user
  alert(appError.userMessage);
  
  // Show troubleshooting
  console.log(appError.context.troubleshootingSteps);
  
  // Check if retryable
  if (appError.retryable) {
    showRetryButton();
  }
}
```

## Connection Code Errors

### Import
```typescript
import { 
  ConnectionCodeErrorCode,
  handleConnectionCodeError,
  createConnectionCodeError,
  parseConnectionCodeError,
  validateCodeFormat,
  shouldPromptNewCode 
} from '../utils/connectionCodeErrors';
```

### Error Codes

| Code | Description | Retryable | Prompt New Code |
|------|-------------|-----------|-----------------|
| `CODE_NOT_FOUND` | Code doesn't exist | ✅ Yes | ❌ No |
| `CODE_EXPIRED` | Code expired (>24h) | ❌ No | ✅ Yes |
| `CODE_ALREADY_USED` | Code used once | ❌ No | ✅ Yes |
| `INVALID_CODE_FORMAT` | Invalid format | ✅ Yes | ❌ No |
| `DEVICE_NOT_FOUND` | Device not found | ❌ No | ❌ No |

### Quick Usage

```typescript
// Validate format first
const formatError = validateCodeFormat(code);
if (formatError) {
  setError(formatError);
  return;
}

// Try to use code
try {
  await useConnectionCode(code);
} catch (error) {
  const errorCode = parseConnectionCodeError(error);
  const response = handleConnectionCodeError(errorCode);
  
  // Show error
  alert(response.userMessage);
  
  // Check if should prompt for new code
  if (shouldPromptNewCode(errorCode)) {
    const instructions = getNewCodeInstructions();
    showInstructions(instructions);
  }
}
```

## Helper Functions

### Device Provisioning

```typescript
// Format troubleshooting steps
const formatted = formatTroubleshootingSteps(steps);

// Get support info
const support = getSupportContactInfo();
// { email: 'soporte@pillhub.com', phone: '+1-800-PILLHUB', hours: '...' }
```

### Connection Code

```typescript
// Format code for display
formatCodeForDisplay('ABC123'); // "ABC 123"

// Validate format
validateCodeFormat('ABC123'); // null (valid)
validateCodeFormat('AB'); // "El código debe tener al menos 6 caracteres"

// Get help text
const helpText = getConnectionCodeHelpText();

// Get new code instructions
const instructions = getNewCodeInstructions();
// { title: '...', steps: ['...', '...'] }

// Check if should prompt
shouldPromptNewCode(ConnectionCodeErrorCode.CODE_EXPIRED); // true

// Get retry delay
getRetryDelay(ConnectionCodeErrorCode.CODE_NOT_FOUND); // 0ms
```

## Common Patterns

### Pattern 1: Validate Before Submit

```typescript
// Connection code validation
const error = validateCodeFormat(code);
if (error) {
  setValidationError(error);
  return;
}

// Device ID validation (in component)
if (deviceId.length < 5) {
  setError('El ID debe tener al menos 5 caracteres');
  return;
}
```

### Pattern 2: Parse and Display Error

```typescript
try {
  await operation();
} catch (error) {
  const errorCode = parseError(error);
  const response = handleError(errorCode);
  
  setErrorMessage(response.userMessage);
  setTroubleshootingSteps(response.troubleshootingSteps);
  setSuggestedAction(response.suggestedAction);
}
```

### Pattern 3: Retry Logic

```typescript
const handleRetry = async () => {
  setIsRetrying(true);
  setError(null);
  
  try {
    await operation();
    setSuccess(true);
  } catch (error) {
    const errorCode = parseError(error);
    const appError = createError(errorCode);
    
    setError(appError.userMessage);
    setCanRetry(appError.retryable);
  } finally {
    setIsRetrying(false);
  }
};
```

### Pattern 4: Conditional UI

```typescript
{error && (
  <View style={styles.errorContainer}>
    <Text style={styles.errorMessage}>{error}</Text>
    
    {troubleshootingSteps && (
      <View style={styles.troubleshooting}>
        {troubleshootingSteps.map((step, index) => (
          <Text key={index}>• {step}</Text>
        ))}
      </View>
    )}
    
    {canRetry && (
      <Button onPress={handleRetry}>Reintentar</Button>
    )}
    
    {promptNewCode && (
      <Button onPress={showNewCodeInstructions}>
        Solicitar Nuevo Código
      </Button>
    )}
  </View>
)}
```

## Error Message Examples

### Device Provisioning

```
❌ DEVICE_NOT_FOUND
"No pudimos encontrar el dispositivo con el ID proporcionado"
→ Verifica el ID del dispositivo e intenta nuevamente

❌ DEVICE_ALREADY_CLAIMED
"Este dispositivo ya está registrado a otro usuario"
→ Verifica el ID del dispositivo o contacta al soporte

❌ WIFI_CONFIG_FAILED
"No pudimos configurar la conexión WiFi del dispositivo"
→ Verifica las credenciales WiFi e intenta nuevamente
```

### Connection Code

```
❌ CODE_NOT_FOUND
"No pudimos encontrar el código de conexión ingresado"
→ Verifica el código e intenta nuevamente

❌ CODE_EXPIRED
"Este código de conexión ha expirado"
→ Solicita un nuevo código al paciente

❌ CODE_ALREADY_USED
"Este código de conexión ya ha sido utilizado"
→ Solicita un nuevo código al paciente
```

## Testing Checklist

- [ ] Test each error code with mock data
- [ ] Verify error messages are in Spanish
- [ ] Check troubleshooting steps are helpful
- [ ] Test retry logic for retryable errors
- [ ] Verify non-retryable errors don't show retry
- [ ] Test new code prompt for expired/used codes
- [ ] Validate code format validation
- [ ] Test error parsing from Firebase errors
- [ ] Verify ApplicationError integration
- [ ] Test error display in UI components

## Support Information

```typescript
const support = getSupportContactInfo();

Email: soporte@pillhub.com
Phone: +1-800-PILLHUB
Hours: Lunes a Viernes, 9:00 AM - 6:00 PM
```
