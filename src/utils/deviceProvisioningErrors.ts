/**
 * Device Provisioning Error Handler
 * 
 * Handles all error scenarios during device provisioning with
 * user-friendly messages and troubleshooting guidance.
 * 
 * Requirements: 11.4, 11.6
 */

import { ApplicationError, ErrorCategory, ErrorSeverity } from './errorHandling';

/**
 * Device provisioning error codes
 */
export enum DeviceProvisioningErrorCode {
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  DEVICE_ALREADY_CLAIMED = 'DEVICE_ALREADY_CLAIMED',
  INVALID_DEVICE_ID = 'INVALID_DEVICE_ID',
  WIFI_CONFIG_FAILED = 'WIFI_CONFIG_FAILED',
  DEVICE_OFFLINE = 'DEVICE_OFFLINE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

/**
 * Error handler response interface
 */
export interface DeviceProvisioningErrorResponse {
  userMessage: string;
  retryable: boolean;
  suggestedAction: string;
  troubleshootingSteps: string[];
  supportContact?: boolean;
}

/**
 * Handle device provisioning errors with detailed guidance
 * Requirement: 11.4, 11.6
 */
export function handleDeviceProvisioningError(
  errorCode: DeviceProvisioningErrorCode,
  _context?: Record<string, any>
): DeviceProvisioningErrorResponse {
  switch (errorCode) {
    case DeviceProvisioningErrorCode.DEVICE_NOT_FOUND:
      return {
        userMessage: 'No pudimos encontrar el dispositivo con el ID proporcionado',
        retryable: true,
        suggestedAction: 'Verifica el ID del dispositivo e intenta nuevamente',
        troubleshootingSteps: [
          'Verifica que el ID esté escrito correctamente',
          'Asegúrate de no incluir espacios antes o después del ID',
          'Revisa que el ID coincida con el que aparece en tu dispositivo',
          'El ID debe estar en la parte inferior del dispositivo o en la caja',
          'Si el problema persiste, contacta al soporte técnico',
        ],
      };

    case DeviceProvisioningErrorCode.DEVICE_ALREADY_CLAIMED:
      return {
        userMessage: 'Este dispositivo ya está registrado a otro usuario',
        retryable: false,
        suggestedAction: 'Verifica el ID del dispositivo o contacta al soporte',
        troubleshootingSteps: [
          'Confirma que el ID del dispositivo sea correcto',
          'Si compraste un dispositivo usado, el propietario anterior debe desvincularlo primero',
          'Si eres el propietario legítimo, contacta al soporte técnico con tu comprobante de compra',
          'Proporciona el ID del dispositivo y tu información de cuenta al soporte',
        ],
        supportContact: true,
      };

    case DeviceProvisioningErrorCode.INVALID_DEVICE_ID:
      return {
        userMessage: 'El formato del ID del dispositivo no es válido',
        retryable: true,
        suggestedAction: 'Ingresa un ID válido de 5 a 100 caracteres alfanuméricos',
        troubleshootingSteps: [
          'El ID debe tener entre 5 y 100 caracteres',
          'Solo se permiten letras, números, guiones (-) y guiones bajos (_)',
          'No incluyas espacios ni caracteres especiales',
          'Verifica que estés copiando el ID completo',
          'Ejemplo de formato válido: DEVICE-12345 o DEV_ABC123',
        ],
      };

    case DeviceProvisioningErrorCode.WIFI_CONFIG_FAILED:
      return {
        userMessage: 'No pudimos configurar la conexión WiFi del dispositivo',
        retryable: true,
        suggestedAction: 'Verifica las credenciales WiFi e intenta nuevamente',
        troubleshootingSteps: [
          'Verifica que el nombre de la red WiFi (SSID) sea correcto',
          'Asegúrate de que la contraseña WiFi esté escrita correctamente',
          'Confirma que tu red WiFi esté activa y funcionando',
          'El dispositivo solo soporta redes WiFi de 2.4 GHz (no 5 GHz)',
          'Verifica que tu router no tenga restricciones de dispositivos',
          'Intenta reiniciar tu router y el dispositivo',
          'Si usas caracteres especiales en la contraseña, verifica que sean compatibles',
        ],
      };

    case DeviceProvisioningErrorCode.DEVICE_OFFLINE:
      return {
        userMessage: 'El dispositivo no está conectado o no responde',
        retryable: true,
        suggestedAction: 'Verifica que el dispositivo esté encendido y conectado',
        troubleshootingSteps: [
          'Verifica que el dispositivo esté encendido (luz LED encendida)',
          'Asegúrate de que el dispositivo tenga batería o esté conectado a la corriente',
          'Confirma que el dispositivo esté dentro del alcance de tu red WiFi',
          'Intenta reiniciar el dispositivo (apagar y encender)',
          'Espera 1-2 minutos después de encender el dispositivo antes de continuar',
          'Verifica que tu red WiFi esté funcionando correctamente',
          'Si el problema persiste, intenta configurar el WiFi nuevamente',
        ],
      };

    case DeviceProvisioningErrorCode.PERMISSION_DENIED:
      return {
        userMessage: 'No tienes permiso para registrar este dispositivo',
        retryable: false,
        suggestedAction: 'Verifica tu cuenta y conexión, o contacta al soporte',
        troubleshootingSteps: [
          'Verifica que hayas iniciado sesión correctamente',
          'Asegúrate de tener una conexión a internet estable',
          'Cierra sesión y vuelve a iniciar sesión',
          'Verifica que tu cuenta esté activa y no tenga restricciones',
          'Si el problema persiste, contacta al soporte técnico',
        ],
        supportContact: true,
      };

    default:
      return {
        userMessage: 'Ocurrió un error inesperado durante la configuración',
        retryable: true,
        suggestedAction: 'Intenta nuevamente o contacta al soporte',
        troubleshootingSteps: [
          'Verifica tu conexión a internet',
          'Intenta cerrar y volver a abrir la aplicación',
          'Asegúrate de tener la última versión de la aplicación',
          'Si el problema persiste, contacta al soporte técnico',
        ],
        supportContact: true,
      };
  }
}

/**
 * Create an ApplicationError from a device provisioning error code
 */
export function createDeviceProvisioningError(
  errorCode: DeviceProvisioningErrorCode,
  context?: Record<string, any>
): ApplicationError {
  const errorResponse = handleDeviceProvisioningError(errorCode, context);

  // Determine error category
  let category: ErrorCategory;
  switch (errorCode) {
    case DeviceProvisioningErrorCode.DEVICE_NOT_FOUND:
      category = ErrorCategory.NOT_FOUND;
      break;
    case DeviceProvisioningErrorCode.INVALID_DEVICE_ID:
      category = ErrorCategory.VALIDATION;
      break;
    case DeviceProvisioningErrorCode.PERMISSION_DENIED:
      category = ErrorCategory.PERMISSION;
      break;
    case DeviceProvisioningErrorCode.DEVICE_OFFLINE:
    case DeviceProvisioningErrorCode.WIFI_CONFIG_FAILED:
      category = ErrorCategory.NETWORK;
      break;
    default:
      category = ErrorCategory.UNKNOWN;
  }

  return new ApplicationError(
    category,
    `Device provisioning error: ${errorCode}`,
    errorResponse.userMessage,
    ErrorSeverity.HIGH,
    errorResponse.retryable,
    errorCode,
    undefined,
    {
      ...context,
      suggestedAction: errorResponse.suggestedAction,
      troubleshootingSteps: errorResponse.troubleshootingSteps,
      supportContact: errorResponse.supportContact,
    }
  );
}

/**
 * Parse Firebase error to device provisioning error code
 */
export function parseDeviceProvisioningError(error: any): DeviceProvisioningErrorCode {
  // Check error code
  if (error.code) {
    switch (error.code) {
      case 'not-found':
        return DeviceProvisioningErrorCode.DEVICE_NOT_FOUND;
      case 'permission-denied':
        return DeviceProvisioningErrorCode.PERMISSION_DENIED;
      case 'unavailable':
      case 'timeout':
        return DeviceProvisioningErrorCode.DEVICE_OFFLINE;
      case 'invalid-argument':
      case 'failed-precondition':
        return DeviceProvisioningErrorCode.INVALID_DEVICE_ID;
    }
  }

  // Check error message
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('already claimed') || message.includes('ya está registrado')) {
      return DeviceProvisioningErrorCode.DEVICE_ALREADY_CLAIMED;
    }
    
    if (message.includes('not found') || message.includes('no encontrado')) {
      return DeviceProvisioningErrorCode.DEVICE_NOT_FOUND;
    }
    
    if (message.includes('invalid') || message.includes('inválido')) {
      return DeviceProvisioningErrorCode.INVALID_DEVICE_ID;
    }
    
    if (message.includes('wifi') || message.includes('network')) {
      return DeviceProvisioningErrorCode.WIFI_CONFIG_FAILED;
    }
    
    if (message.includes('offline') || message.includes('not responding')) {
      return DeviceProvisioningErrorCode.DEVICE_OFFLINE;
    }
    
    if (message.includes('permission') || message.includes('denied')) {
      return DeviceProvisioningErrorCode.PERMISSION_DENIED;
    }
  }

  // Default to device not found for unknown errors
  return DeviceProvisioningErrorCode.DEVICE_NOT_FOUND;
}

/**
 * Format troubleshooting steps for display
 */
export function formatTroubleshootingSteps(steps: string[]): string {
  return steps.map((step, index) => `${index + 1}. ${step}`).join('\n\n');
}

/**
 * Get support contact information
 */
export function getSupportContactInfo(): {
  email: string;
  phone?: string;
  hours: string;
} {
  return {
    email: 'soporte@pillhub.com',
    phone: '+1-800-PILLHUB',
    hours: 'Lunes a Viernes, 9:00 AM - 6:00 PM',
  };
}
