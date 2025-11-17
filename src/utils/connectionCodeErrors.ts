/**
 * Connection Code Error Handler
 * 
 * Handles all error scenarios during connection code operations with
 * user-friendly messages and troubleshooting guidance.
 * 
 * Requirements: 11.4
 */

import { ApplicationError, ErrorCategory, ErrorSeverity } from './errorHandling';

/**
 * Connection code error codes
 */
export enum ConnectionCodeErrorCode {
  CODE_NOT_FOUND = 'CODE_NOT_FOUND',
  CODE_EXPIRED = 'CODE_EXPIRED',
  CODE_ALREADY_USED = 'CODE_ALREADY_USED',
  INVALID_CODE_FORMAT = 'INVALID_CODE_FORMAT',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
}

/**
 * Error handler response interface
 */
export interface ConnectionCodeErrorResponse {
  userMessage: string;
  retryable: boolean;
  suggestedAction: string;
  troubleshootingSteps: string[];
  promptNewCode?: boolean;
}

/**
 * Handle connection code errors with detailed guidance
 * Requirement: 11.4
 */
export function handleConnectionCodeError(
  errorCode: ConnectionCodeErrorCode,
  context?: Record<string, any>
): ConnectionCodeErrorResponse {
  switch (errorCode) {
    case ConnectionCodeErrorCode.CODE_NOT_FOUND:
      return {
        userMessage: 'No pudimos encontrar el código de conexión ingresado',
        retryable: true,
        suggestedAction: 'Verifica el código e intenta nuevamente',
        troubleshootingSteps: [
          'Verifica que el código esté escrito correctamente',
          'Asegúrate de no incluir espacios antes o después del código',
          'Los códigos distinguen entre mayúsculas y minúsculas',
          'Confirma con el paciente que el código sea el correcto',
          'Si el código fue enviado por mensaje, cópialo y pégalo directamente',
        ],
      };

    case ConnectionCodeErrorCode.CODE_EXPIRED:
      return {
        userMessage: 'Este código de conexión ha expirado',
        retryable: false,
        suggestedAction: 'Solicita un nuevo código al paciente',
        troubleshootingSteps: [
          'Los códigos de conexión expiran después de 24 horas por seguridad',
          'Contacta al paciente y pídele que genere un nuevo código',
          'El paciente puede generar un nuevo código desde su configuración de dispositivo',
          'Una vez que tengas el nuevo código, ingrésalo aquí',
        ],
        promptNewCode: true,
      };

    case ConnectionCodeErrorCode.CODE_ALREADY_USED:
      return {
        userMessage: 'Este código de conexión ya ha sido utilizado',
        retryable: false,
        suggestedAction: 'Solicita un nuevo código al paciente',
        troubleshootingSteps: [
          'Los códigos de conexión solo pueden usarse una vez por seguridad',
          'Si ya usaste este código, deberías tener acceso al dispositivo del paciente',
          'Verifica en tu lista de pacientes si ya estás conectado',
          'Si necesitas conectarte nuevamente, solicita un nuevo código al paciente',
          'El paciente puede generar múltiples códigos si es necesario',
        ],
        promptNewCode: true,
      };

    case ConnectionCodeErrorCode.INVALID_CODE_FORMAT:
      return {
        userMessage: 'El formato del código de conexión no es válido',
        retryable: true,
        suggestedAction: 'Ingresa un código válido de 6 a 8 caracteres',
        troubleshootingSteps: [
          'El código debe tener entre 6 y 8 caracteres',
          'Solo se permiten letras mayúsculas y números',
          'No incluyas espacios ni caracteres especiales',
          'Ejemplo de formato válido: ABC123 o XYZ789AB',
          'Si copiaste el código, asegúrate de no incluir espacios adicionales',
        ],
      };

    case ConnectionCodeErrorCode.DEVICE_NOT_FOUND:
      return {
        userMessage: 'No pudimos encontrar el dispositivo asociado a este código',
        retryable: false,
        suggestedAction: 'Contacta al paciente para verificar el estado del dispositivo',
        troubleshootingSteps: [
          'El dispositivo asociado a este código no existe o fue eliminado',
          'Contacta al paciente para confirmar que su dispositivo esté registrado',
          'El paciente debe verificar su dispositivo en la configuración',
          'Si el problema persiste, el paciente debe contactar al soporte técnico',
        ],
      };

    default:
      return {
        userMessage: 'Ocurrió un error inesperado al procesar el código',
        retryable: true,
        suggestedAction: 'Intenta nuevamente o contacta al soporte',
        troubleshootingSteps: [
          'Verifica tu conexión a internet',
          'Intenta cerrar y volver a abrir la aplicación',
          'Asegúrate de tener la última versión de la aplicación',
          'Si el problema persiste, contacta al soporte técnico',
        ],
      };
  }
}

/**
 * Create an ApplicationError from a connection code error code
 */
export function createConnectionCodeError(
  errorCode: ConnectionCodeErrorCode,
  context?: Record<string, any>
): ApplicationError {
  const errorResponse = handleConnectionCodeError(errorCode, context);

  // Determine error category
  let category: ErrorCategory;
  switch (errorCode) {
    case ConnectionCodeErrorCode.CODE_NOT_FOUND:
    case ConnectionCodeErrorCode.DEVICE_NOT_FOUND:
      category = ErrorCategory.NOT_FOUND;
      break;
    case ConnectionCodeErrorCode.INVALID_CODE_FORMAT:
      category = ErrorCategory.VALIDATION;
      break;
    case ConnectionCodeErrorCode.CODE_EXPIRED:
    case ConnectionCodeErrorCode.CODE_ALREADY_USED:
      category = ErrorCategory.VALIDATION;
      break;
    default:
      category = ErrorCategory.UNKNOWN;
  }

  return new ApplicationError(
    category,
    `Connection code error: ${errorCode}`,
    errorResponse.userMessage,
    ErrorSeverity.MEDIUM,
    errorResponse.retryable,
    errorCode,
    undefined,
    {
      ...context,
      suggestedAction: errorResponse.suggestedAction,
      troubleshootingSteps: errorResponse.troubleshootingSteps,
      promptNewCode: errorResponse.promptNewCode,
    }
  );
}

/**
 * Parse connection code service error to error code
 */
export function parseConnectionCodeError(error: any): ConnectionCodeErrorCode {
  // Check if it's a ConnectionCodeError from the service
  if (error.code) {
    switch (error.code) {
      case 'CODE_NOT_FOUND':
        return ConnectionCodeErrorCode.CODE_NOT_FOUND;
      case 'CODE_EXPIRED':
        return ConnectionCodeErrorCode.CODE_EXPIRED;
      case 'CODE_ALREADY_USED':
        return ConnectionCodeErrorCode.CODE_ALREADY_USED;
      case 'INVALID_CODE_FORMAT':
        return ConnectionCodeErrorCode.INVALID_CODE_FORMAT;
      case 'DEVICE_NOT_FOUND':
      case 'PATIENT_NOT_FOUND':
        return ConnectionCodeErrorCode.DEVICE_NOT_FOUND;
    }
  }

  // Check error message
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('not found') || message.includes('no encontrado')) {
      return ConnectionCodeErrorCode.CODE_NOT_FOUND;
    }
    
    if (message.includes('expired') || message.includes('expirado')) {
      return ConnectionCodeErrorCode.CODE_EXPIRED;
    }
    
    if (message.includes('already used') || message.includes('ya ha sido utilizado')) {
      return ConnectionCodeErrorCode.CODE_ALREADY_USED;
    }
    
    if (message.includes('invalid') || message.includes('inválido') || message.includes('format')) {
      return ConnectionCodeErrorCode.INVALID_CODE_FORMAT;
    }
    
    if (message.includes('device') && message.includes('not found')) {
      return ConnectionCodeErrorCode.DEVICE_NOT_FOUND;
    }
  }

  // Default to code not found for unknown errors
  return ConnectionCodeErrorCode.CODE_NOT_FOUND;
}

/**
 * Format code for display (adds spacing for readability)
 * Example: ABC123 -> ABC 123
 */
export function formatCodeForDisplay(code: string): string {
  if (!code || code.length < 4) {
    return code;
  }
  
  // Split code in half for better readability
  const midpoint = Math.ceil(code.length / 2);
  return `${code.substring(0, midpoint)} ${code.substring(midpoint)}`;
}

/**
 * Validate code format before submission
 * Returns null if valid, error message if invalid
 */
export function validateCodeFormat(code: string): string | null {
  if (!code || code.trim().length === 0) {
    return 'El código de conexión es requerido';
  }

  // Remove spaces for validation
  const cleanCode = code.replace(/\s/g, '');

  if (cleanCode.length < 6) {
    return 'El código debe tener al menos 6 caracteres';
  }

  if (cleanCode.length > 8) {
    return 'El código no puede tener más de 8 caracteres';
  }

  // Check for invalid characters (only uppercase letters and numbers)
  if (!/^[A-Z0-9]+$/.test(cleanCode)) {
    return 'El código solo puede contener letras mayúsculas y números';
  }

  return null;
}

/**
 * Get instructions for generating a new code
 */
export function getNewCodeInstructions(): {
  title: string;
  steps: string[];
} {
  return {
    title: 'Cómo solicitar un nuevo código',
    steps: [
      'Contacta al paciente y pídele que abra la aplicación',
      'El paciente debe ir a Configuración > Dispositivo',
      'Seleccionar "Generar Código de Conexión"',
      'El paciente te compartirá el nuevo código de 6-8 caracteres',
      'Ingresa el código aquí para conectarte',
    ],
  };
}

/**
 * Get help text for connection code entry
 */
export function getConnectionCodeHelpText(): string {
  return 'Ingresa el código de 6-8 caracteres que el paciente generó para ti. ' +
    'Los códigos expiran después de 24 horas y solo pueden usarse una vez.';
}

/**
 * Check if error should prompt for new code generation
 */
export function shouldPromptNewCode(errorCode: ConnectionCodeErrorCode): boolean {
  return errorCode === ConnectionCodeErrorCode.CODE_EXPIRED ||
         errorCode === ConnectionCodeErrorCode.CODE_ALREADY_USED;
}

/**
 * Get retry delay based on error type (in milliseconds)
 */
export function getRetryDelay(errorCode: ConnectionCodeErrorCode): number {
  switch (errorCode) {
    case ConnectionCodeErrorCode.CODE_NOT_FOUND:
    case ConnectionCodeErrorCode.INVALID_CODE_FORMAT:
      return 0; // No delay for validation errors
    case ConnectionCodeErrorCode.DEVICE_NOT_FOUND:
      return 2000; // 2 second delay
    default:
      return 1000; // 1 second delay
  }
}
