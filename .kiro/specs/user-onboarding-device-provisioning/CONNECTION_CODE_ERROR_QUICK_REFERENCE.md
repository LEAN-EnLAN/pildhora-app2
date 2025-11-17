# Connection Code Error Handler - Quick Reference

## Error Codes

| Code | Retryable | Prompt New Code | Description |
|------|-----------|-----------------|-------------|
| `CODE_NOT_FOUND` | ✅ Yes | ❌ No | Code doesn't exist |
| `CODE_EXPIRED` | ❌ No | ✅ Yes | Code expired (24h) |
| `CODE_ALREADY_USED` | ❌ No | ✅ Yes | Code already used |
| `INVALID_CODE_FORMAT` | ✅ Yes | ❌ No | Invalid format |
| `DEVICE_NOT_FOUND` | ❌ No | ❌ No | Device doesn't exist |

## Quick Usage

### Handle Error
```typescript
import { handleConnectionCodeError, ConnectionCodeErrorCode } from '@/utils/connectionCodeErrors';

const error = handleConnectionCodeError(ConnectionCodeErrorCode.CODE_EXPIRED);
console.log(error.userMessage);
console.log(error.suggestedAction);
console.log(error.troubleshootingSteps);
```

### Validate Code Format
```typescript
import { validateCodeFormat } from '@/utils/connectionCodeErrors';

const error = validateCodeFormat('ABC123');
if (error) {
  console.log(error); // Error message
} else {
  // Valid code
}
```

### Parse Service Error
```typescript
import { parseConnectionCodeError } from '@/utils/connectionCodeErrors';

try {
  await connectionCodeService.validateCode(code);
} catch (error) {
  const errorCode = parseConnectionCodeError(error);
  // Handle errorCode
}
```

### Display Error UI
```tsx
import { ConnectionCodeErrorDisplay } from '@/components/caregiver/ConnectionCodeErrorDisplay';

<ConnectionCodeErrorDisplay
  errorCode={ConnectionCodeErrorCode.CODE_EXPIRED}
  onRetry={handleRetry}
  onRequestNewCode={handleRequestNewCode}
/>
```

## Code Format Rules

- **Length:** 6-8 characters
- **Characters:** Uppercase letters (A-Z) and numbers (0-9) only
- **No spaces or special characters**
- **Examples:** `ABC123`, `XYZ789AB`

## Utility Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `validateCodeFormat(code)` | Validate format | `null` or error message |
| `formatCodeForDisplay(code)` | Add spacing | Formatted string |
| `shouldPromptNewCode(errorCode)` | Check if need new code | boolean |
| `getRetryDelay(errorCode)` | Get retry delay | milliseconds |
| `getConnectionCodeHelpText()` | Get help text | string |
| `getNewCodeInstructions()` | Get instructions | object |

## Error Messages (Spanish)

### CODE_NOT_FOUND
**Message:** "No pudimos encontrar el código de conexión ingresado"
**Action:** "Verifica el código e intenta nuevamente"

### CODE_EXPIRED
**Message:** "Este código de conexión ha expirado"
**Action:** "Solicita un nuevo código al paciente"

### CODE_ALREADY_USED
**Message:** "Este código de conexión ya ha sido utilizado"
**Action:** "Solicita un nuevo código al paciente"

### INVALID_CODE_FORMAT
**Message:** "El formato del código de conexión no es válido"
**Action:** "Ingresa un código válido de 6 a 8 caracteres"

### DEVICE_NOT_FOUND
**Message:** "No pudimos encontrar el dispositivo asociado a este código"
**Action:** "Contacta al paciente para verificar el estado del dispositivo"

## Integration Pattern

```typescript
async function connectWithCode(code: string) {
  // 1. Validate format
  const formatError = validateCodeFormat(code);
  if (formatError) {
    setError(ConnectionCodeErrorCode.INVALID_CODE_FORMAT);
    return;
  }

  try {
    // 2. Validate with service
    const codeData = await connectionCodeService.validateCode(code);
    
    // 3. Use code
    await connectionCodeService.useCode(code, caregiverId);
    
    // Success!
    onSuccess();
    
  } catch (error) {
    // 4. Parse and handle error
    const errorCode = parseConnectionCodeError(error);
    setError(errorCode);
  }
}
```

## Files

- **Utilities:** `src/utils/connectionCodeErrors.ts`
- **UI Component:** `src/components/caregiver/ConnectionCodeErrorDisplay.tsx`
- **Guide:** `CONNECTION_CODE_ERROR_HANDLER_GUIDE.md`
