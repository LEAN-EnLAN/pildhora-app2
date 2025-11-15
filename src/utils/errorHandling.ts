/**
 * Centralized Error Handling Utility
 * 
 * Provides comprehensive error handling, categorization, retry logic,
 * and user-friendly error messages for the medication management system.
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Error categories
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  INITIALIZATION = 'INITIALIZATION',
  NOT_FOUND = 'NOT_FOUND',
  PLATFORM_API = 'PLATFORM_API',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',       // Non-critical, can be ignored
  MEDIUM = 'MEDIUM', // Important but not blocking
  HIGH = 'HIGH',     // Critical, blocks functionality
  CRITICAL = 'CRITICAL', // System-level failure
}

// Base error interface
export interface AppError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  retryable: boolean;
  code?: string;
  originalError?: any;
  timestamp: Date;
  context?: Record<string, any>;
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

// Error log storage key
const ERROR_LOG_KEY = '@error_log';
const MAX_ERROR_LOGS = 100;

/**
 * Custom error class for application errors
 */
export class ApplicationError extends Error implements AppError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  retryable: boolean;
  code?: string;
  originalError?: any;
  timestamp: Date;
  context?: Record<string, any>;

  constructor(
    category: ErrorCategory,
    message: string,
    userMessage: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false,
    code?: string,
    originalError?: any,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.category = category;
    this.severity = severity;
    this.userMessage = userMessage;
    this.retryable = retryable;
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date();
    this.context = context;
  }
}

/**
 * Categorize and enhance an error
 */
export function categorizeError(error: any, context?: Record<string, any>): AppError {
  // Handle ApplicationError instances
  if (error instanceof ApplicationError) {
    return error;
  }

  // Handle Firebase errors
  if (error.code) {
    switch (error.code) {
      case 'unavailable':
      case 'timeout':
      case 'deadline-exceeded':
        return new ApplicationError(
          ErrorCategory.NETWORK,
          `Network error: ${error.message}`,
          'No se pudo conectar al servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.',
          ErrorSeverity.HIGH,
          true,
          error.code,
          error,
          context
        );

      case 'permission-denied':
        return new ApplicationError(
          ErrorCategory.PERMISSION,
          `Permission denied: ${error.message}`,
          'No tienes permiso para realizar esta acción.',
          ErrorSeverity.HIGH,
          false,
          error.code,
          error,
          context
        );

      case 'not-found':
        return new ApplicationError(
          ErrorCategory.NOT_FOUND,
          `Resource not found: ${error.message}`,
          'El recurso solicitado no fue encontrado.',
          ErrorSeverity.MEDIUM,
          false,
          error.code,
          error,
          context
        );

      case 'failed-precondition':
      case 'invalid-argument':
        return new ApplicationError(
          ErrorCategory.VALIDATION,
          `Validation error: ${error.message}`,
          'Los datos proporcionados no son válidos. Por favor, verifica e intenta nuevamente.',
          ErrorSeverity.MEDIUM,
          false,
          error.code,
          error,
          context
        );

      case 'unauthenticated':
        return new ApplicationError(
          ErrorCategory.PERMISSION,
          `Authentication error: ${error.message}`,
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          ErrorSeverity.HIGH,
          false,
          error.code,
          error,
          context
        );
    }
  }

  // Handle network errors
  if (
    error.message?.includes('network') ||
    error.message?.includes('fetch') ||
    error.message?.includes('connection')
  ) {
    return new ApplicationError(
      ErrorCategory.NETWORK,
      error.message,
      'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.',
      ErrorSeverity.HIGH,
      true,
      undefined,
      error,
      context
    );
  }

  // Handle initialization errors
  if (
    error.message?.includes('Firebase') ||
    error.message?.includes('initialization') ||
    error.message?.includes('not available')
  ) {
    return new ApplicationError(
      ErrorCategory.INITIALIZATION,
      error.message,
      'Error al inicializar la aplicación. Por favor, reinicia la aplicación.',
      ErrorSeverity.CRITICAL,
      true,
      undefined,
      error,
      context
    );
  }

  // Handle platform API errors
  if (
    error.message?.includes('notification') ||
    error.message?.includes('alarm') ||
    error.message?.includes('permission')
  ) {
    return new ApplicationError(
      ErrorCategory.PLATFORM_API,
      error.message,
      'Error al acceder a las funciones del dispositivo. Por favor, verifica los permisos de la aplicación.',
      ErrorSeverity.MEDIUM,
      false,
      undefined,
      error,
      context
    );
  }

  // Default to unknown error
  return new ApplicationError(
    ErrorCategory.UNKNOWN,
    error.message || 'Unknown error',
    'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
    ErrorSeverity.MEDIUM,
    true,
    undefined,
    error,
    context
  );
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: Record<string, any>
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  let delay = retryConfig.initialDelayMs;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const appError = categorizeError(error, { ...context, attempt });

      // Don't retry if error is not retryable
      if (!appError.retryable) {
        throw appError;
      }

      // Don't retry on last attempt
      if (attempt === retryConfig.maxAttempts) {
        throw appError;
      }

      // Log retry attempt
      console.log(
        `[ErrorHandling] Retry attempt ${attempt}/${retryConfig.maxAttempts} after ${delay}ms`,
        { error: appError.message, context }
      );

      // Wait before retrying
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(
        delay * retryConfig.backoffMultiplier,
        retryConfig.maxDelayMs
      );
    }
  }

  // This should never be reached, but TypeScript needs it
  throw categorizeError(lastError, context);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log an error for debugging
 */
export async function logError(error: AppError): Promise<void> {
  try {
    // Get existing logs
    const logsJson = await AsyncStorage.getItem(ERROR_LOG_KEY);
    const logs: AppError[] = logsJson ? JSON.parse(logsJson) : [];

    // Add new error
    logs.unshift(error);

    // Keep only the most recent errors
    const trimmedLogs = logs.slice(0, MAX_ERROR_LOGS);

    // Save back to storage
    await AsyncStorage.setItem(ERROR_LOG_KEY, JSON.stringify(trimmedLogs));

    // Also log to console
    console.error('[ErrorLog]', {
      category: error.category,
      severity: error.severity,
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
      context: error.context,
    });
  } catch (storageError) {
    // If we can't log to storage, at least log to console
    console.error('[ErrorLog] Failed to save error log:', storageError);
    console.error('[ErrorLog] Original error:', error);
  }
}

/**
 * Get error logs for debugging
 */
export async function getErrorLogs(): Promise<AppError[]> {
  try {
    const logsJson = await AsyncStorage.getItem(ERROR_LOG_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('[ErrorLog] Failed to retrieve error logs:', error);
    return [];
  }
}

/**
 * Clear error logs
 */
export async function clearErrorLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ERROR_LOG_KEY);
    console.log('[ErrorLog] Error logs cleared');
  } catch (error) {
    console.error('[ErrorLog] Failed to clear error logs:', error);
  }
}

/**
 * Show error alert to user
 */
export function showErrorAlert(
  error: AppError,
  onRetry?: () => void,
  onDismiss?: () => void
): void {
  const buttons: any[] = [];

  // Add retry button if error is retryable and callback provided
  if (error.retryable && onRetry) {
    buttons.push({
      text: 'Reintentar',
      onPress: onRetry,
    });
  }

  // Add dismiss button
  buttons.push({
    text: 'Entendido',
    style: 'cancel',
    onPress: onDismiss,
  });

  Alert.alert(
    getErrorTitle(error.category),
    error.userMessage,
    buttons
  );
}

/**
 * Get user-friendly error title based on category
 */
function getErrorTitle(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Error de Conexión';
    case ErrorCategory.PERMISSION:
      return 'Permiso Denegado';
    case ErrorCategory.VALIDATION:
      return 'Datos Inválidos';
    case ErrorCategory.INITIALIZATION:
      return 'Error de Inicialización';
    case ErrorCategory.NOT_FOUND:
      return 'No Encontrado';
    case ErrorCategory.PLATFORM_API:
      return 'Error del Sistema';
    default:
      return 'Error';
  }
}

/**
 * Handle error with logging and optional user notification
 */
export async function handleError(
  error: any,
  context?: Record<string, any>,
  showAlert: boolean = false,
  onRetry?: () => void
): Promise<AppError> {
  // Categorize the error
  const appError = categorizeError(error, context);

  // Log the error
  await logError(appError);

  // Show alert if requested
  if (showAlert) {
    showErrorAlert(appError, onRetry);
  }

  return appError;
}

/**
 * Validation error messages
 */
export const ValidationErrors = {
  REQUIRED_FIELD: (fieldName: string) => `El campo "${fieldName}" es requerido.`,
  INVALID_FORMAT: (fieldName: string) => `El formato del campo "${fieldName}" no es válido.`,
  MIN_LENGTH: (fieldName: string, minLength: number) =>
    `El campo "${fieldName}" debe tener al menos ${minLength} caracteres.`,
  MAX_LENGTH: (fieldName: string, maxLength: number) =>
    `El campo "${fieldName}" no puede tener más de ${maxLength} caracteres.`,
  MIN_VALUE: (fieldName: string, minValue: number) =>
    `El campo "${fieldName}" debe ser al menos ${minValue}.`,
  MAX_VALUE: (fieldName: string, maxValue: number) =>
    `El campo "${fieldName}" no puede ser mayor a ${maxValue}.`,
  INVALID_EMAIL: 'El correo electrónico no es válido.',
  INVALID_PHONE: 'El número de teléfono no es válido.',
  INVALID_TIME: 'El formato de hora no es válido. Usa HH:MM.',
  INVALID_DATE: 'La fecha no es válida.',
  EMOJI_REQUIRED: 'Debes seleccionar un emoji para el medicamento.',
  NAME_REQUIRED: 'El nombre del medicamento es requerido.',
  DOSE_VALUE_REQUIRED: 'La cantidad de dosis es requerida.',
  DOSE_UNIT_REQUIRED: 'La unidad de dosis es requerida.',
  SCHEDULE_REQUIRED: 'Debes configurar al menos un horario.',
  INVALID_QUANTITY: 'La cantidad debe ser un número positivo.',
};

/**
 * Permission error guidance messages
 */
export const PermissionGuidance = {
  NOTIFICATIONS: {
    title: 'Permisos de Notificación',
    message:
      'Para recibir recordatorios de medicamentos, necesitamos tu permiso para enviar notificaciones.',
    settingsMessage:
      'Los permisos de notificación están desactivados. Para recibir recordatorios, por favor activa las notificaciones en la configuración de tu dispositivo:\n\n' +
      '1. Abre Configuración\n' +
      '2. Busca esta aplicación\n' +
      '3. Activa Notificaciones',
  },
  ALARMS: {
    title: 'Permisos de Alarmas',
    message:
      'Para crear alarmas de medicamentos, necesitamos tu permiso para programar alarmas en tu dispositivo.',
    settingsMessage:
      'Los permisos de alarmas están desactivados. Para crear alarmas, por favor activa los permisos en la configuración de tu dispositivo.',
  },
  STORAGE: {
    title: 'Permisos de Almacenamiento',
    message:
      'Para guardar tus datos localmente, necesitamos acceso al almacenamiento de tu dispositivo.',
    settingsMessage:
      'Los permisos de almacenamiento están desactivados. Por favor, activa los permisos en la configuración de tu dispositivo.',
  },
};

/**
 * Show permission guidance dialog
 */
export function showPermissionGuidance(
  permissionType: keyof typeof PermissionGuidance,
  isDenied: boolean = false
): Promise<boolean> {
  const guidance = PermissionGuidance[permissionType];
  const message = isDenied ? guidance.settingsMessage : guidance.message;

  return new Promise(resolve => {
    if (isDenied) {
      // Show settings guidance
      Alert.alert(guidance.title, message, [
        {
          text: 'Entendido',
          style: 'cancel',
          onPress: () => resolve(false),
        },
      ]);
    } else {
      // Show permission request guidance
      Alert.alert(guidance.title, message, [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Permitir',
          onPress: () => resolve(true),
        },
      ]);
    }
  });
}

/**
 * Create a validation error
 */
export function createValidationError(
  message: string,
  context?: Record<string, any>
): ApplicationError {
  return new ApplicationError(
    ErrorCategory.VALIDATION,
    message,
    message,
    ErrorSeverity.MEDIUM,
    false,
    'VALIDATION_ERROR',
    undefined,
    context
  );
}

/**
 * Create a network error
 */
export function createNetworkError(
  message: string = 'Network request failed',
  context?: Record<string, any>
): ApplicationError {
  return new ApplicationError(
    ErrorCategory.NETWORK,
    message,
    'No se pudo conectar al servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.',
    ErrorSeverity.HIGH,
    true,
    'NETWORK_ERROR',
    undefined,
    context
  );
}

/**
 * Create a permission error
 */
export function createPermissionError(
  message: string,
  userMessage: string,
  context?: Record<string, any>
): ApplicationError {
  return new ApplicationError(
    ErrorCategory.PERMISSION,
    message,
    userMessage,
    ErrorSeverity.HIGH,
    false,
    'PERMISSION_ERROR',
    undefined,
    context
  );
}

/**
 * Create a platform API error
 */
export function createPlatformError(
  message: string,
  userMessage: string,
  retryable: boolean = false,
  context?: Record<string, any>
): ApplicationError {
  return new ApplicationError(
    ErrorCategory.PLATFORM_API,
    message,
    userMessage,
    ErrorSeverity.MEDIUM,
    retryable,
    'PLATFORM_API_ERROR',
    undefined,
    context
  );
}
