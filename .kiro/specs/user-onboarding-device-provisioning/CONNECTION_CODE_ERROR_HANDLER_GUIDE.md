# Connection Code Error Handler Guide

## Overview

The Connection Code Error Handler provides comprehensive error handling for all connection code operations during caregiver device linking. It delivers user-friendly error messages, troubleshooting guidance, and actionable next steps in Spanish.

**Requirements:** 11.4

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Connection Code Error Handler                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Error Code Enumeration                          │  │
│  │  - CODE_NOT_FOUND                                │  │
│  │  - CODE_EXPIRED                                  │  │
│  │  - CODE_ALREADY_USED                             │  │
│  │  - INVALID_CODE_FORMAT                           │  │
│  │  - DEVICE_NOT_FOUND                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Error Handler Functions                         │  │
│  │  - handleConnectionCodeError()                   │  │
│  │  - createConnectionCodeError()                   │  │
│  │  - parseConnectionCodeError()                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Utility Functions                               │  │
│  │  - validateCodeFormat()                          │  │
│  │  - formatCodeForDisplay()                        │  │
│  │  - shouldPromptNewCode()                         │  │
│  │  - getRetryDelay()                               │  │
│  │  - getConnectionCodeHelpText()                   │  │
│  │  - getNewCodeInstructions()                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Error Codes

### CODE_NOT_FOUND
**When:** Connection code doesn't exist in the database
**Retryable:** Yes
**User Message:** "No pudimos encontrar el código de conexión ingresado"
**Suggested Action:** "Verifica el código e intenta nuevamente"

**Troubleshooting Steps:**
1. Verifica que el código esté escrito correctamente
2. Asegúrate de no incluir espacios antes o después del código
3. Los códigos distinguen entre mayúsculas y minúsculas
4. Confirma con el paciente que el código sea el correcto
5. Si el código fue enviado por mensaje, cópialo y pégalo directamente

### CODE_EXPIRED
**When:** Connection code has passed its expiration time (24 hours)
**Retryable:** No
**User Message:** "Este código de conexión ha expirado"
**Suggested Action:** "Solicita un nuevo código al paciente"
**Prompt New Code:** Yes

**Troubleshooting Steps:**
1. Los códigos de conexión expiran después de 24 horas por seguridad
2. Contacta al paciente y pídele que genere un nuevo código
3. El paciente puede generar un nuevo código desde su configuración de dispositivo
4. Una vez que tengas el nuevo código, ingrésalo aquí

### CODE_ALREADY_USED
**When:** Connection code has already been used to create a device link
**Retryable:** No
**User Message:** "Este código de conexión ya ha sido utilizado"
**Suggested Action:** "Solicita un nuevo código al paciente"
**Prompt New Code:** Yes

**Troubleshooting Steps:**
1. Los códigos de conexión solo pueden usarse una vez por seguridad
2. Si ya usaste este código, deberías tener acceso al dispositivo del paciente
3. Verifica en tu lista de pacientes si ya estás conectado
4. Si necesitas conectarte nuevamente, solicita un nuevo código al paciente
5. El paciente puede generar múltiples códigos si es necesario

### INVALID_CODE_FORMAT
**When:** Code doesn't match the required format (6-8 alphanumeric characters)
**Retryable:** Yes
**User Message:** "El formato del código de conexión no es válido"
**Suggested Action:** "Ingresa un código válido de 6 a 8 caracteres"

**Troubleshooting Steps:**
1. El código debe tener entre 6 y 8 caracteres
2. Solo se permiten letras mayúsculas y números
3. No incluyas espacios ni caracteres especiales
4. Ejemplo de formato válido: ABC123 o XYZ789AB
5. Si copiaste el código, asegúrate de no incluir espacios adicionales

### DEVICE_NOT_FOUND
**When:** Device associated with the code doesn't exist
**Retryable:** No
**User Message:** "No pudimos encontrar el dispositivo asociado a este código"
**Suggested Action:** "Contacta al paciente para verificar el estado del dispositivo"

**Troubleshooting Steps:**
1. El dispositivo asociado a este código no existe o fue eliminado
2. Contacta al paciente para confirmar que su dispositivo esté registrado
3. El paciente debe verificar su dispositivo en la configuración
4. Si el problema persiste, el paciente debe contactar al soporte técnico

## Core Functions

### handleConnectionCodeError()

Handles connection code errors and returns detailed error information.

```typescript
function handleConnectionCodeError(
  errorCode: ConnectionCodeErrorCode,
  context?: Record<string, any>
): ConnectionCodeErrorResponse

interface ConnectionCodeErrorResponse {
  userMessage: string;
  retryable: boolean;
  suggestedAction: string;
  troubleshootingSteps: string[];
  promptNewCode?: boolean;
}
```

**Usage:**
```typescript
const errorResponse = handleConnectionCodeError(
  ConnectionCodeErrorCode.CODE_EXPIRED
);

console.log(errorResponse.userMessage);
// "Este código de conexión ha expirado"

console.log(errorResponse.promptNewCode);
// true
```

### createConnectionCodeError()

Creates an ApplicationError from a connection code error code.

```typescript
function createConnectionCodeError(
  errorCode: ConnectionCodeErrorCode,
  context?: Record<string, any>
): ApplicationError
```

**Usage:**
```typescript
const error = createConnectionCodeError(
  ConnectionCodeErrorCode.CODE_NOT_FOUND,
  { code: 'ABC123' }
);

throw error;
```

### parseConnectionCodeError()

Parses service errors to connection code error codes.

```typescript
function parseConnectionCodeError(error: any): ConnectionCodeErrorCode
```

**Usage:**
```typescript
try {
  await connectionCodeService.validateCode(code);
} catch (error) {
  const errorCode = parseConnectionCodeError(error);
  const errorResponse = handleConnectionCodeError(errorCode);
  // Display error to user
}
```

## Utility Functions

### validateCodeFormat()

Validates code format before submission.

```typescript
function validateCodeFormat(code: string): string | null
```

**Returns:** `null` if valid, error message if invalid

**Usage:**
```typescript
const error = validateCodeFormat('ABC123');
if (error) {
  console.log(error); // null - valid code
}

const error2 = validateCodeFormat('AB');
console.log(error2); // "El código debe tener al menos 6 caracteres"
```

### formatCodeForDisplay()

Formats code for better readability by adding spacing.

```typescript
function formatCodeForDisplay(code: string): string
```

**Usage:**
```typescript
const formatted = formatCodeForDisplay('ABC123');
console.log(formatted); // "ABC 123"

const formatted2 = formatCodeForDisplay('ABCD1234');
console.log(formatted2); // "ABCD 1234"
```

### shouldPromptNewCode()

Checks if error should prompt for new code generation.

```typescript
function shouldPromptNewCode(errorCode: ConnectionCodeErrorCode): boolean
```

**Usage:**
```typescript
const shouldPrompt = shouldPromptNewCode(ConnectionCodeErrorCode.CODE_EXPIRED);
console.log(shouldPrompt); // true

const shouldPrompt2 = shouldPromptNewCode(ConnectionCodeErrorCode.CODE_NOT_FOUND);
console.log(shouldPrompt2); // false
```

### getRetryDelay()

Gets retry delay based on error type (in milliseconds).

```typescript
function getRetryDelay(errorCode: ConnectionCodeErrorCode): number
```

**Usage:**
```typescript
const delay = getRetryDelay(ConnectionCodeErrorCode.CODE_NOT_FOUND);
console.log(delay); // 0 - no delay for validation errors

const delay2 = getRetryDelay(ConnectionCodeErrorCode.DEVICE_NOT_FOUND);
console.log(delay2); // 2000 - 2 second delay
```

### getConnectionCodeHelpText()

Gets help text for connection code entry.

```typescript
function getConnectionCodeHelpText(): string
```

**Usage:**
```typescript
const helpText = getConnectionCodeHelpText();
// "Ingresa el código de 6-8 caracteres que el paciente generó para ti..."
```

### getNewCodeInstructions()

Gets instructions for generating a new code.

```typescript
function getNewCodeInstructions(): {
  title: string;
  steps: string[];
}
```

**Usage:**
```typescript
const instructions = getNewCodeInstructions();
console.log(instructions.title);
// "Cómo solicitar un nuevo código"

console.log(instructions.steps);
// Array of 5 step-by-step instructions
```

## UI Component

### ConnectionCodeErrorDisplay

React component that displays connection code errors with full troubleshooting guidance.

```typescript
interface ConnectionCodeErrorDisplayProps {
  errorCode: ConnectionCodeErrorCode;
  onRetry?: () => void;
  onRequestNewCode?: () => void;
  style?: any;
}
```

**Features:**
- Error icon and title
- User-friendly error message
- Suggested action card
- Numbered troubleshooting steps
- New code instructions (for expired/used codes)
- Retry button (for retryable errors)
- Help text

**Usage:**
```tsx
import { ConnectionCodeErrorDisplay } from '@/components/caregiver/ConnectionCodeErrorDisplay';
import { ConnectionCodeErrorCode } from '@/utils/connectionCodeErrors';

function ConnectionScreen() {
  const [error, setError] = useState<ConnectionCodeErrorCode | null>(null);

  const handleRetry = () => {
    setError(null);
    // Retry connection logic
  };

  const handleRequestNewCode = () => {
    setError(null);
    // Navigate back to code entry
  };

  if (error) {
    return (
      <ConnectionCodeErrorDisplay
        errorCode={error}
        onRetry={handleRetry}
        onRequestNewCode={handleRequestNewCode}
      />
    );
  }

  // Normal connection UI
}
```

## Integration Example

### Complete Error Handling Flow

```typescript
import {
  ConnectionCodeErrorCode,
  parseConnectionCodeError,
  handleConnectionCodeError,
  validateCodeFormat,
  shouldPromptNewCode,
} from '@/utils/connectionCodeErrors';
import { connectionCodeService } from '@/services/connectionCode';

async function connectToDevice(code: string) {
  try {
    // 1. Validate format first
    const formatError = validateCodeFormat(code);
    if (formatError) {
      throw new Error(formatError);
    }

    // 2. Validate code with service
    const codeData = await connectionCodeService.validateCode(code);
    
    if (!codeData) {
      throw { code: 'CODE_NOT_FOUND' };
    }

    // 3. Use code to create connection
    await connectionCodeService.useCode(code, caregiverId);
    
    // Success!
    return { success: true };

  } catch (error) {
    // 4. Parse error to error code
    const errorCode = parseConnectionCodeError(error);
    
    // 5. Get error details
    const errorResponse = handleConnectionCodeError(errorCode);
    
    // 6. Check if should prompt for new code
    const promptNewCode = shouldPromptNewCode(errorCode);
    
    // 7. Return error information
    return {
      success: false,
      errorCode,
      errorResponse,
      promptNewCode,
    };
  }
}
```

## Error Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Caregiver Enters Code                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Validate Code Format                           │
│           (validateCodeFormat)                           │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────┐           ┌──────────┐
    │ Invalid │           │  Valid   │
    └────┬────┘           └────┬─────┘
         │                     │
         │                     ▼
         │         ┌─────────────────────────┐
         │         │  Call Service           │
         │         │  validateCode()         │
         │         └────────┬────────────────┘
         │                  │
         │      ┌───────────┴───────────┐
         │      │                       │
         │      ▼                       ▼
         │  ┌────────┐            ┌─────────┐
         │  │ Error  │            │ Success │
         │  └───┬────┘            └────┬────┘
         │      │                      │
         ▼      ▼                      ▼
┌─────────────────────────────────────────────────────────┐
│           Parse Error Code                               │
│           (parseConnectionCodeError)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Handle Error                                   │
│           (handleConnectionCodeError)                    │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────┐           ┌──────────────┐
    │ Expired │           │ Other Errors │
    │  Used   │           │              │
    └────┬────┘           └──────┬───────┘
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ Prompt New Code  │    │  Show Error +    │
│   Instructions   │    │  Retry Option    │
└──────────────────┘    └──────────────────┘
```

## Best Practices

### 1. Always Validate Format First
```typescript
// ✅ Good
const formatError = validateCodeFormat(code);
if (formatError) {
  // Show format error immediately
  return;
}
// Then call service

// ❌ Bad
// Call service without validation
await connectionCodeService.validateCode(code);
```

### 2. Use Parsed Error Codes
```typescript
// ✅ Good
try {
  await validateCode(code);
} catch (error) {
  const errorCode = parseConnectionCodeError(error);
  const errorResponse = handleConnectionCodeError(errorCode);
  showError(errorResponse);
}

// ❌ Bad
try {
  await validateCode(code);
} catch (error) {
  showError(error.message); // Raw error message
}
```

### 3. Provide Contextual Actions
```typescript
// ✅ Good
if (shouldPromptNewCode(errorCode)) {
  return (
    <ConnectionCodeErrorDisplay
      errorCode={errorCode}
      onRequestNewCode={handleRequestNewCode}
    />
  );
}

// ❌ Bad
// Always show same retry button
return (
  <ConnectionCodeErrorDisplay
    errorCode={errorCode}
    onRetry={handleRetry}
  />
);
```

### 4. Format Codes for Display
```typescript
// ✅ Good
const displayCode = formatCodeForDisplay(code);
console.log(`Código: ${displayCode}`); // "Código: ABC 123"

// ❌ Bad
console.log(`Código: ${code}`); // "Código: ABC123"
```

## Testing

### Unit Tests
```typescript
describe('Connection Code Error Handler', () => {
  it('handles CODE_NOT_FOUND error', () => {
    const response = handleConnectionCodeError(
      ConnectionCodeErrorCode.CODE_NOT_FOUND
    );
    expect(response.retryable).toBe(true);
    expect(response.promptNewCode).toBeFalsy();
  });

  it('handles CODE_EXPIRED error', () => {
    const response = handleConnectionCodeError(
      ConnectionCodeErrorCode.CODE_EXPIRED
    );
    expect(response.retryable).toBe(false);
    expect(response.promptNewCode).toBe(true);
  });

  it('validates code format', () => {
    expect(validateCodeFormat('ABC123')).toBeNull();
    expect(validateCodeFormat('AB')).toBeTruthy();
    expect(validateCodeFormat('ABC-123')).toBeTruthy();
  });

  it('formats code for display', () => {
    expect(formatCodeForDisplay('ABC123')).toBe('ABC 123');
    expect(formatCodeForDisplay('ABCD1234')).toBe('ABCD 1234');
  });
});
```

## Accessibility

### Screen Reader Support
- Error messages are announced automatically
- Troubleshooting steps are numbered and clearly labeled
- Action buttons have descriptive labels
- Help text provides context

### Visual Design
- High contrast error colors
- Clear visual hierarchy
- Large touch targets for buttons
- Readable font sizes

## Localization

All error messages, troubleshooting steps, and instructions are in Spanish:
- User-friendly language
- Clear, actionable guidance
- Culturally appropriate tone
- Consistent terminology

## Requirements Satisfied

✅ **11.4** - Error handling with helpful messages
- CODE_NOT_FOUND errors handled
- CODE_EXPIRED errors with new code generation prompt
- CODE_ALREADY_USED errors handled
- INVALID_CODE_FORMAT errors with format guidance
- DEVICE_NOT_FOUND errors handled

## Files

### Core Implementation
- `src/utils/connectionCodeErrors.ts` - Error handler utilities
- `src/components/caregiver/ConnectionCodeErrorDisplay.tsx` - UI component

### Documentation
- `.kiro/specs/user-onboarding-device-provisioning/CONNECTION_CODE_ERROR_HANDLER_GUIDE.md` - This guide

### Tests
- `test-connection-code-error-handler.js` - Verification tests

## Summary

The Connection Code Error Handler provides:
- ✅ Comprehensive error handling for all connection code scenarios
- ✅ User-friendly Spanish error messages
- ✅ Detailed troubleshooting steps
- ✅ Contextual actions (retry vs. request new code)
- ✅ Format validation and display utilities
- ✅ Accessible UI component
- ✅ Complete integration examples
