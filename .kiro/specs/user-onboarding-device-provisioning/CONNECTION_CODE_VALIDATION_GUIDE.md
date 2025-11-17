# Connection Code Validation Quick Reference

## Overview

Connection code validation ensures that caregivers can only connect to patient devices using valid, unexpired, and unused codes.

## Validation Points

### 1. Entry Screen (`device-connection.tsx`)
- **Format validation**: Real-time as user types
- **Server validation**: On submit button press
- **Navigation**: To confirmation screen on success

### 2. Confirmation Screen (`device-connection-confirm.tsx`)
- **Re-validation**: On screen load (Task 9.1)
- **Security**: Prevents URL parameter tampering
- **User feedback**: Loading and error states

## Error Types

### CODE_EXPIRED
**When**: Code expiration date has passed
**Message**: "Este código ha expirado. Solicita un nuevo código al paciente."
**Action**: User must request new code from patient

### CODE_ALREADY_USED
**When**: Code has been used to create a connection
**Message**: "Este código ya ha sido utilizado y no puede usarse nuevamente."
**Action**: User must request new code from patient

### CODE_NOT_FOUND
**When**: Code doesn't exist in database
**Message**: "Código no encontrado. Verifica el código e intenta nuevamente."
**Action**: User should verify code and retry

### INVALID_CODE_FORMAT
**When**: Code doesn't meet format requirements (6-8 alphanumeric)
**Message**: "Formato de código no válido."
**Action**: User should enter valid format

## Validation Flow

```typescript
// 1. Call validateCode service
const codeData = await validateCode(code);

// 2. Handle errors
if (error instanceof ConnectionCodeError) {
  switch (error.code) {
    case 'CODE_EXPIRED':
      // Show expiration message
      break;
    case 'CODE_ALREADY_USED':
      // Show already used message
      break;
    case 'CODE_NOT_FOUND':
      // Show not found message
      break;
    case 'INVALID_CODE_FORMAT':
      // Show format error
      break;
  }
}

// 3. Use valid code data
if (codeData) {
  // Proceed with connection
}
```

## UI States

### Loading
```typescript
if (isValidating) {
  return <LoadingSpinner message="Validando código de conexión..." />;
}
```

### Error
```typescript
if (validationError) {
  return (
    <ErrorState
      title="Error de Validación"
      message={validationError}
      suggestions={[
        "Solicita un nuevo código al paciente",
        "Verifica que no haya expirado (24 horas)",
        "Asegúrate de que no haya sido usado"
      ]}
      action="Volver e Intentar Nuevamente"
    />
  );
}
```

### Success
```typescript
return (
  <ConfirmationScreen
    patientName={params.patientName}
    deviceId={params.deviceId}
    code={params.code}
  />
);
```

## Code Format Requirements

- **Length**: 6-8 characters
- **Characters**: Uppercase letters and numbers only
- **Excluded**: Ambiguous characters (0, O, 1, I, L)
- **Example**: `ABC123`, `XYZ789`, `HELLO42`

## Testing

Run validation tests:
```bash
node test-connection-code-validation.js
```

## Common Issues

### Issue: Code validates in entry screen but fails in confirmation
**Cause**: Code was used or expired between screens
**Solution**: Re-validation catches this and shows error

### Issue: User manipulates URL parameters
**Cause**: Direct navigation to confirmation screen
**Solution**: Re-validation ensures code is still valid

### Issue: Network error during validation
**Cause**: Poor connectivity
**Solution**: Retry logic with exponential backoff

## Best Practices

1. **Always re-validate**: Don't trust URL parameters
2. **Clear messages**: Use Spanish, be specific about the issue
3. **Actionable guidance**: Tell users what to do next
4. **Loading states**: Show feedback during async operations
5. **Error logging**: Log errors for debugging and monitoring

## Requirements Mapping

- **5.3**: Code validation with expiration checking ✅
- **5.4**: Connection code usage and validation ✅

## Related Files

- `src/services/connectionCode.ts` - Validation service
- `app/caregiver/device-connection.tsx` - Entry screen
- `app/caregiver/device-connection-confirm.tsx` - Confirmation screen
- `test-connection-code-validation.js` - Test suite
