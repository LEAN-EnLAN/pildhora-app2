# Error Handling Quick Reference Guide

## Quick Start

### 1. Handling Errors in Services

```typescript
import { withRetry, handleError, createNetworkError } from '../utils/errorHandling';

async function myServiceFunction() {
  try {
    // Use withRetry for operations that might fail temporarily
    const result = await withRetry(
      async () => {
        // Your operation here
        return await someFirestoreOperation();
      },
      { maxAttempts: 3, initialDelayMs: 1000 },
      { operation: 'my_operation', context: 'additional_info' }
    );
    
    return result;
  } catch (error: any) {
    // Log and categorize the error
    const appError = await handleError(
      error,
      { operation: 'my_operation' },
      false // Set to true to show alert to user
    );
    
    throw appError;
  }
}
```

### 2. Handling Errors in Components

```typescript
import { handleError, showErrorAlert } from '../../utils/errorHandling';

async function handleButtonPress() {
  try {
    setLoading(true);
    await someOperation();
    Alert.alert('Éxito', 'Operación completada');
  } catch (error: any) {
    const appError = await handleError(
      error,
      { operation: 'button_press' },
      false
    );
    
    // Show error alert with retry option
    showErrorAlert(
      appError,
      () => handleButtonPress(), // Retry callback
      () => console.log('User dismissed error')
    );
  } finally {
    setLoading(false);
  }
}
```

### 3. Validating Form Fields

```typescript
import { validateMedicationName, validateTimes, hasValidationErrors } from '../utils/validation';

function validateForm() {
  const errors: Record<string, string> = {};
  
  // Validate name
  const nameResult = validateMedicationName(formData.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  }
  
  // Validate times
  const timesResult = validateTimes(formData.times);
  if (!timesResult.isValid) {
    errors.times = timesResult.error!;
  }
  
  // Check if there are any errors
  if (hasValidationErrors(errors)) {
    setErrors(errors);
    return false;
  }
  
  return true;
}
```

### 4. Using Offline Queue

```typescript
import { offlineQueueManager } from '../services/offlineQueueManager';

async function createMedication(data: any) {
  // Enqueue the operation
  const queueId = await offlineQueueManager.enqueue(
    'medication_create',
    async () => {
      // This will be executed when online
      return await addDoc(collection(db, 'medications'), data);
    },
    data,
    3 // Max retries
  );
  
  // Operation is queued and will sync automatically
  return queueId;
}
```

### 5. Requesting Permissions

```typescript
import { showPermissionGuidance } from '../utils/errorHandling';

async function requestNotificationPermission() {
  // Show guidance before requesting
  const shouldRequest = await showPermissionGuidance('NOTIFICATIONS', false);
  
  if (!shouldRequest) {
    return false;
  }
  
  // Request the permission
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    // Show settings guidance
    await showPermissionGuidance('NOTIFICATIONS', true);
    return false;
  }
  
  return true;
}
```

### 6. Creating Custom Errors

```typescript
import { 
  createValidationError, 
  createNetworkError, 
  createPermissionError,
  createPlatformError 
} from '../utils/errorHandling';

// Validation error
throw createValidationError(
  'El nombre del medicamento es requerido',
  { field: 'name' }
);

// Network error
throw createNetworkError(
  'Failed to fetch medications',
  { operation: 'fetch_medications' }
);

// Permission error
throw createPermissionError(
  'Notification permission denied',
  'No tienes permiso para recibir notificaciones',
  { permission: 'notifications' }
);

// Platform API error
throw createPlatformError(
  'Alarm API failed',
  'No se pudo crear la alarma',
  true, // retryable
  { platform: Platform.OS }
);
```

### 7. Wrapping Components with Error Boundary

```typescript
import { ErrorBoundary, withErrorBoundary } from '../components/shared/ErrorBoundary';

// Option 1: Wrap with component
function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}

// Option 2: Use HOC
export default withErrorBoundary(MyComponent);

// Option 3: Custom fallback
function App() {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, retry) => (
        <View>
          <Text>Something went wrong</Text>
          <Button onPress={retry}>Retry</Button>
        </View>
      )}
      onError={(error, errorInfo) => {
        console.log('Error caught:', error);
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Common Patterns

### Pattern 1: Service Operation with Retry

```typescript
async function serviceOperation() {
  try {
    return await withRetry(
      async () => {
        const db = await getDbInstance();
        if (!db) {
          throw new ApplicationError(
            ErrorCategory.INITIALIZATION,
            'Firestore not available',
            'No se pudo conectar a la base de datos',
            ErrorSeverity.HIGH,
            true
          );
        }
        return await someOperation(db);
      },
      { maxAttempts: 3, initialDelayMs: 1000 },
      { operation: 'service_operation' }
    );
  } catch (error: any) {
    const appError = await handleError(error, { operation: 'service_operation' }, false);
    throw appError;
  }
}
```

### Pattern 2: Component Action with User Feedback

```typescript
async function handleAction() {
  try {
    setLoading(true);
    await someOperation();
    Alert.alert('Éxito', 'Operación completada exitosamente');
  } catch (error: any) {
    const appError = await handleError(error, { action: 'user_action' }, true);
    // Error alert is shown automatically by handleError
  } finally {
    setLoading(false);
  }
}
```

### Pattern 3: Non-Blocking Error

```typescript
async function nonCriticalOperation() {
  try {
    await someOperation();
  } catch (error: any) {
    // Log error but don't block main flow
    await handleError(error, { operation: 'non_critical' }, false);
    console.warn('Non-critical operation failed, continuing...');
  }
}
```

### Pattern 4: Fail-Open Strategy

```typescript
async function checkSomething(): Promise<boolean> {
  try {
    return await withRetry(
      async () => await performCheck(),
      { maxAttempts: 2 },
      { operation: 'check' }
    );
  } catch (error: any) {
    // Log error but return safe default
    await handleError(error, { operation: 'check' }, false);
    return true; // Fail open - allow operation
  }
}
```

### Pattern 5: Graceful Degradation

```typescript
async function createAlarm(config: AlarmConfig) {
  try {
    // Try to create native alarm
    return await nativeAlarmAPI.create(config);
  } catch (error: any) {
    // Log error
    await handleError(error, { operation: 'create_alarm' }, false);
    
    // Fallback to in-app notification
    console.log('Falling back to in-app notification');
    return await inAppNotification.create(config);
  }
}
```

## Error Categories

| Category | When to Use | Retryable | Example |
|----------|-------------|-----------|---------|
| `NETWORK` | Network/connection errors | Yes | Firestore timeout, fetch failed |
| `PERMISSION` | Permission denied | No | Notification permission denied |
| `VALIDATION` | Invalid input data | No | Empty required field, invalid format |
| `INITIALIZATION` | App/service init failed | Yes | Firebase not initialized |
| `NOT_FOUND` | Resource not found | No | Medication not found |
| `PLATFORM_API` | Platform API failed | Maybe | Alarm API error, notification error |
| `UNKNOWN` | Unexpected errors | Yes | Uncategorized errors |

## Error Severity Levels

| Severity | Impact | User Action | Example |
|----------|--------|-------------|---------|
| `LOW` | Non-critical, can ignore | None | Optional feature unavailable |
| `MEDIUM` | Important but not blocking | Inform user | Validation error, resource not found |
| `HIGH` | Critical, blocks functionality | Show error, offer retry | Network error, permission denied |
| `CRITICAL` | System-level failure | Show error, suggest restart | Firebase initialization failed |

## Validation Error Messages

All validation errors are in Spanish and user-friendly:

```typescript
// Required field
"El campo 'Nombre' es requerido."

// Invalid format
"El formato de hora no es válido. Usa HH:MM."

// Length constraints
"El campo 'Nombre' debe tener al menos 2 caracteres."
"El campo 'Nombre' no puede tener más de 50 caracteres."

// Value constraints
"La cantidad debe ser al menos 0.01."
"La cantidad no puede ser mayor a 9999."

// Specific validations
"Debes seleccionar un emoji para el medicamento."
"Debes configurar al menos un horario."
"El correo electrónico no es válido."
```

## Permission Guidance Messages

```typescript
// Notifications
{
  title: 'Permisos de Notificación',
  message: 'Para recibir recordatorios de medicamentos, necesitamos tu permiso para enviar notificaciones.',
  settingsMessage: 'Los permisos de notificación están desactivados. Para recibir recordatorios, por favor activa las notificaciones en la configuración de tu dispositivo.'
}

// Alarms
{
  title: 'Permisos de Alarmas',
  message: 'Para crear alarmas de medicamentos, necesitamos tu permiso para programar alarmas en tu dispositivo.',
  settingsMessage: 'Los permisos de alarmas están desactivados. Para crear alarmas, por favor activa los permisos en la configuración de tu dispositivo.'
}
```

## Retry Configuration

```typescript
// Default configuration
{
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
}

// Custom configuration
await withRetry(
  operation,
  {
    maxAttempts: 5,        // Try up to 5 times
    initialDelayMs: 500,   // Start with 500ms delay
    maxDelayMs: 30000,     // Cap at 30 seconds
    backoffMultiplier: 3   // Triple delay each time
  },
  context
);
```

## Offline Queue

```typescript
// Enqueue operation
const queueId = await offlineQueueManager.enqueue(
  'medication_create',
  async () => await createMedication(data),
  data,
  3 // max retries
);

// Get queue status
const status = offlineQueueManager.getQueueStatus();
console.log('Pending:', status.pending);
console.log('Failed:', status.failed);
console.log('Is online:', status.isOnline);

// Subscribe to sync events
const unsubscribe = offlineQueueManager.onSyncComplete((success) => {
  console.log('Sync completed:', success);
});

// Retry failed items
await offlineQueueManager.retryFailed();

// Clear completed items
await offlineQueueManager.clearCompleted();
```

## Error Logging

```typescript
import { getErrorLogs, clearErrorLogs, logError } from '../utils/errorHandling';

// Get all error logs
const logs = await getErrorLogs();
console.log('Total errors:', logs.length);

// Log custom error
await logError({
  category: ErrorCategory.NETWORK,
  severity: ErrorSeverity.HIGH,
  message: 'Custom error message',
  userMessage: 'Mensaje para el usuario',
  retryable: true,
  timestamp: new Date(),
  context: { custom: 'data' }
});

// Clear all logs
await clearErrorLogs();
```

## Best Practices

### DO ✅

1. **Always use try-catch** for async operations
2. **Use withRetry** for network operations
3. **Log errors** with context for debugging
4. **Show user-friendly messages** in Spanish
5. **Provide retry options** for retryable errors
6. **Use validation** before submitting data
7. **Handle permissions** with guidance dialogs
8. **Implement graceful degradation** for platform APIs
9. **Use offline queue** for critical operations
10. **Test error scenarios** thoroughly

### DON'T ❌

1. **Don't expose technical details** to users
2. **Don't block operations** unnecessarily
3. **Don't retry non-retryable errors**
4. **Don't ignore errors** silently
5. **Don't show generic error messages**
6. **Don't request permissions** without explanation
7. **Don't assume network is always available**
8. **Don't let errors crash the app**
9. **Don't retry indefinitely**
10. **Don't log sensitive data** in errors

## Testing Error Handling

```typescript
// Test network error
jest.mock('../services/firebase', () => ({
  getDbInstance: jest.fn().mockRejectedValue(new Error('Network error'))
}));

// Test validation error
const result = validateMedicationName('');
expect(result.isValid).toBe(false);
expect(result.error).toContain('requerido');

// Test retry logic
let attempts = 0;
await withRetry(
  async () => {
    attempts++;
    if (attempts < 3) throw new Error('Temporary error');
    return 'success';
  },
  { maxAttempts: 3 }
);
expect(attempts).toBe(3);

// Test error categorization
const error = new Error('unavailable');
error.code = 'unavailable';
const appError = categorizeError(error);
expect(appError.category).toBe(ErrorCategory.NETWORK);
expect(appError.retryable).toBe(true);
```

## Troubleshooting

### Error: "Firestore not available"
- **Cause:** Firebase not initialized
- **Solution:** Check Firebase configuration, ensure app is initialized
- **Retry:** Yes, automatic

### Error: "Permission denied"
- **Cause:** User denied permission or not authenticated
- **Solution:** Show permission guidance, check authentication
- **Retry:** No

### Error: "Network request failed"
- **Cause:** No internet connection or server unavailable
- **Solution:** Queue operation, retry when online
- **Retry:** Yes, automatic

### Error: "Validation failed"
- **Cause:** Invalid input data
- **Solution:** Show validation errors, fix input
- **Retry:** No

### Error: "Platform API failed"
- **Cause:** Native API unavailable or failed
- **Solution:** Use fallback, show guidance
- **Retry:** Maybe, depends on error

## Resources

- Full Implementation: `.kiro/specs/medication-management-redesign/TASK22_ERROR_HANDLING_IMPLEMENTATION.md`
- Error Handling Utility: `src/utils/errorHandling.ts`
- Offline Queue Manager: `src/services/offlineQueueManager.ts`
- Validation Utility: `src/utils/validation.ts`
- Error Boundary: `src/components/shared/ErrorBoundary.tsx`
