import { getAuthInstance, getDbInstance } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { NotificationPreferences } from '../types';

// Error types for notification preferences
export class NotificationPreferencesError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'NotificationPreferencesError';
  }
}

// Validation helpers
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== 'string') {
    throw new NotificationPreferencesError(
      'Invalid user ID: must be a non-empty string',
      'INVALID_USER_ID',
      'Error de autenticación. Por favor, cierra sesión e inicia sesión nuevamente.',
      false
    );
  }
}

function validatePermissionStatus(status: string): void {
  const validStatuses = ['granted', 'denied', 'undetermined'];
  if (!validStatuses.includes(status)) {
    throw new NotificationPreferencesError(
      `Invalid permission status: ${status}`,
      'INVALID_PERMISSION_STATUS',
      'El estado de permisos no es válido.',
      false
    );
  }
}

function validateHierarchy(hierarchy: string[]): void {
  if (!Array.isArray(hierarchy)) {
    throw new NotificationPreferencesError(
      'Invalid hierarchy: must be an array',
      'INVALID_HIERARCHY',
      'La jerarquía de notificaciones no es válida.',
      false
    );
  }

  // Check for duplicates
  const uniqueItems = new Set(hierarchy);
  if (uniqueItems.size !== hierarchy.length) {
    throw new NotificationPreferencesError(
      'Invalid hierarchy: contains duplicate items',
      'DUPLICATE_HIERARCHY_ITEMS',
      'La jerarquía de notificaciones contiene elementos duplicados.',
      false
    );
  }

  // Validate each item is a non-empty string
  for (const item of hierarchy) {
    if (!item || typeof item !== 'string' || item.trim().length === 0) {
      throw new NotificationPreferencesError(
        'Invalid hierarchy: all items must be non-empty strings',
        'INVALID_HIERARCHY_ITEM',
        'Todos los elementos de la jerarquía deben ser texto válido.',
        false
      );
    }
  }
}

function validateCustomModalities(modalities: string[]): void {
  if (!Array.isArray(modalities)) {
    throw new NotificationPreferencesError(
      'Invalid custom modalities: must be an array',
      'INVALID_CUSTOM_MODALITIES',
      'Las modalidades personalizadas no son válidas.',
      false
    );
  }

  // Check for duplicates
  const uniqueItems = new Set(modalities);
  if (uniqueItems.size !== modalities.length) {
    throw new NotificationPreferencesError(
      'Invalid custom modalities: contains duplicate items',
      'DUPLICATE_MODALITY_ITEMS',
      'Las modalidades personalizadas contienen elementos duplicados.',
      false
    );
  }

  // Validate each item is a non-empty string
  for (const item of modalities) {
    if (!item || typeof item !== 'string' || item.trim().length === 0) {
      throw new NotificationPreferencesError(
        'Invalid custom modalities: all items must be non-empty strings',
        'INVALID_MODALITY_ITEM',
        'Todas las modalidades deben ser texto válido.',
        false
      );
    }

    if (item.length > 50) {
      throw new NotificationPreferencesError(
        `Invalid custom modality: "${item}" is too long (max 50 characters)`,
        'MODALITY_TOO_LONG',
        'Las modalidades personalizadas deben tener menos de 50 caracteres.',
        false
      );
    }
  }
}

function validatePreferences(preferences: Partial<NotificationPreferences>): void {
  if (!preferences || typeof preferences !== 'object') {
    throw new NotificationPreferencesError(
      'Invalid preferences: must be an object',
      'INVALID_PREFERENCES',
      'Las preferencias de notificación no son válidas.',
      false
    );
  }

  if (preferences.userId) {
    validateUserId(preferences.userId);
  }

  if (preferences.enabled !== undefined && typeof preferences.enabled !== 'boolean') {
    throw new NotificationPreferencesError(
      'Invalid enabled flag: must be a boolean',
      'INVALID_ENABLED_FLAG',
      'El estado de notificaciones debe ser verdadero o falso.',
      false
    );
  }

  if (preferences.permissionStatus) {
    validatePermissionStatus(preferences.permissionStatus);
  }

  if (preferences.hierarchy) {
    validateHierarchy(preferences.hierarchy);
  }

  if (preferences.customModalities) {
    validateCustomModalities(preferences.customModalities);
  }
}

async function validateAuthentication(): Promise<string> {
  const auth = await getAuthInstance();
  
  if (!auth) {
    throw new NotificationPreferencesError(
      'Firebase Auth not initialized',
      'AUTH_NOT_INITIALIZED',
      'Error de autenticación. Por favor, reinicia la aplicación.',
      true
    );
  }

  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new NotificationPreferencesError(
      'User not authenticated',
      'NOT_AUTHENTICATED',
      'No has iniciado sesión. Por favor, inicia sesión e intenta nuevamente.',
      false
    );
  }

  return currentUser.uid;
}

// Retry logic for transient failures
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on non-retryable errors
      if (error instanceof NotificationPreferencesError && !error.retryable) {
        throw error;
      }
      
      // Check if error is retryable based on Firebase error codes
      const retryableCodes = ['unavailable', 'deadline-exceeded', 'resource-exhausted', 'aborted'];
      const isRetryable = retryableCodes.includes(error.code);
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`[NotificationPreferences] Retry attempt ${attempt}/${maxRetries} after error:`, error.code);
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}

// Convert Firebase errors to user-friendly messages
function handleFirebaseError(error: any, operation: string): never {
  console.error(`[NotificationPreferences] ${operation} failed:`, {
    code: error.code,
    message: error.message
  });

  if (error instanceof NotificationPreferencesError) {
    throw error;
  }

  switch (error.code) {
    case 'permission-denied':
      throw new NotificationPreferencesError(
        `Permission denied for ${operation}`,
        'PERMISSION_DENIED',
        'No tienes permiso para modificar las preferencias de notificación.',
        false
      );
    
    case 'unavailable':
      throw new NotificationPreferencesError(
        `Service unavailable for ${operation}`,
        'SERVICE_UNAVAILABLE',
        'El servicio no está disponible. Por favor, verifica tu conexión a internet.',
        true
      );
    
    case 'deadline-exceeded':
    case 'timeout':
      throw new NotificationPreferencesError(
        `Operation timeout for ${operation}`,
        'TIMEOUT',
        'La operación tardó demasiado tiempo. Por favor, intenta nuevamente.',
        true
      );
    
    case 'not-found':
      throw new NotificationPreferencesError(
        `Preferences not found for ${operation}`,
        'NOT_FOUND',
        'No se encontraron preferencias de notificación.',
        false
      );
    
    default:
      throw new NotificationPreferencesError(
        `Unknown error during ${operation}: ${error.message}`,
        'UNKNOWN_ERROR',
        'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        true
      );
  }
}

/**
 * Save notification preferences to Firestore
 * @param userId - The user ID
 * @param preferences - Partial notification preferences to save
 * @returns Promise that resolves when preferences are saved
 */
export async function savePreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, 'userId' | 'lastUpdated'>>
): Promise<void> {
  console.log('[NotificationPreferences] savePreferences called', { userId });
  
  try {
    // Validate authentication
    const authenticatedUserId = await validateAuthentication();
    
    // Ensure the user can only modify their own preferences
    if (authenticatedUserId !== userId) {
      throw new NotificationPreferencesError(
        `User ${authenticatedUserId} cannot modify preferences for user ${userId}`,
        'UNAUTHORIZED',
        'No tienes permiso para modificar estas preferencias.',
        false
      );
    }
    
    // Validate inputs
    validateUserId(userId);
    validatePreferences({ ...preferences, userId });
    
    // Get Firebase instances
    const db = await getDbInstance();
    
    if (!db) {
      throw new NotificationPreferencesError(
        'Firebase Firestore not initialized',
        'FIRESTORE_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Prepare preferences data
    const preferencesData = {
      ...preferences,
      lastUpdated: serverTimestamp()
    };
    
    // Save to Firestore with retry logic
    await retryOperation(async () => {
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      console.log('[NotificationPreferences] Saving to Firestore:', `notificationPreferences/${userId}`);
      await setDoc(preferencesRef, preferencesData, { merge: true });
      console.log('[NotificationPreferences] Successfully saved preferences');
    });
    
  } catch (error: any) {
    handleFirebaseError(error, 'savePreferences');
  }
}

/**
 * Get notification preferences from Firestore
 * @param userId - The user ID
 * @returns Promise that resolves with the notification preferences
 */
export async function getPreferences(userId: string): Promise<NotificationPreferences | null> {
  console.log('[NotificationPreferences] getPreferences called', { userId });
  
  try {
    // Validate authentication
    const authenticatedUserId = await validateAuthentication();
    
    // Ensure the user can only read their own preferences
    if (authenticatedUserId !== userId) {
      throw new NotificationPreferencesError(
        `User ${authenticatedUserId} cannot read preferences for user ${userId}`,
        'UNAUTHORIZED',
        'No tienes permiso para ver estas preferencias.',
        false
      );
    }
    
    // Validate inputs
    validateUserId(userId);
    
    // Get Firebase instances
    const db = await getDbInstance();
    
    if (!db) {
      throw new NotificationPreferencesError(
        'Firebase Firestore not initialized',
        'FIRESTORE_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Get from Firestore with retry logic
    const preferences = await retryOperation(async () => {
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      console.log('[NotificationPreferences] Reading from Firestore:', `notificationPreferences/${userId}`);
      const preferencesDoc = await getDoc(preferencesRef);
      
      if (!preferencesDoc.exists()) {
        console.log('[NotificationPreferences] No preferences found, returning defaults');
        // Return default preferences
        return {
          userId,
          enabled: true,
          permissionStatus: 'undetermined' as const,
          hierarchy: ['urgent', 'medication', 'general'],
          customModalities: [],
          lastUpdated: new Date()
        };
      }
      
      const data = preferencesDoc.data();
      console.log('[NotificationPreferences] Successfully retrieved preferences');
      
      return {
        userId,
        enabled: data.enabled ?? true,
        permissionStatus: data.permissionStatus || 'undetermined',
        hierarchy: data.hierarchy || ['urgent', 'medication', 'general'],
        customModalities: data.customModalities || [],
        lastUpdated: data.lastUpdated?.toDate?.() || new Date()
      } as NotificationPreferences;
    });
    
    return preferences;
    
  } catch (error: any) {
    handleFirebaseError(error, 'getPreferences');
  }
}

/**
 * Update notification permission status
 * @param userId - The user ID
 * @param status - The permission status
 * @returns Promise that resolves when status is updated
 */
export async function updatePermissionStatus(
  userId: string,
  status: 'granted' | 'denied' | 'undetermined'
): Promise<void> {
  console.log('[NotificationPreferences] updatePermissionStatus called', { userId, status });
  
  await savePreferences(userId, { permissionStatus: status });
}

/**
 * Add a custom modality to the user's preferences
 * @param userId - The user ID
 * @param modality - The custom modality to add
 * @returns Promise that resolves when modality is added
 */
export async function addCustomModality(userId: string, modality: string): Promise<void> {
  console.log('[NotificationPreferences] addCustomModality called', { userId, modality });
  
  try {
    // Get current preferences
    const currentPreferences = await getPreferences(userId);
    
    if (!currentPreferences) {
      throw new NotificationPreferencesError(
        'Cannot add modality: preferences not found',
        'PREFERENCES_NOT_FOUND',
        'No se pudieron cargar las preferencias.',
        false
      );
    }
    
    // Check if modality already exists
    if (currentPreferences.customModalities.includes(modality)) {
      throw new NotificationPreferencesError(
        `Modality "${modality}" already exists`,
        'MODALITY_EXISTS',
        'Esta modalidad ya existe.',
        false
      );
    }
    
    // Add the new modality
    const updatedModalities = [...currentPreferences.customModalities, modality];
    
    // Save updated preferences
    await savePreferences(userId, { customModalities: updatedModalities });
    
  } catch (error: any) {
    if (error instanceof NotificationPreferencesError) {
      throw error;
    }
    handleFirebaseError(error, 'addCustomModality');
  }
}

/**
 * Remove a custom modality from the user's preferences
 * @param userId - The user ID
 * @param modality - The custom modality to remove
 * @returns Promise that resolves when modality is removed
 */
export async function removeCustomModality(userId: string, modality: string): Promise<void> {
  console.log('[NotificationPreferences] removeCustomModality called', { userId, modality });
  
  try {
    // Get current preferences
    const currentPreferences = await getPreferences(userId);
    
    if (!currentPreferences) {
      throw new NotificationPreferencesError(
        'Cannot remove modality: preferences not found',
        'PREFERENCES_NOT_FOUND',
        'No se pudieron cargar las preferencias.',
        false
      );
    }
    
    // Remove the modality
    const updatedModalities = currentPreferences.customModalities.filter(m => m !== modality);
    
    // Also remove from hierarchy if present
    const updatedHierarchy = currentPreferences.hierarchy.filter(h => h !== modality);
    
    // Save updated preferences
    await savePreferences(userId, {
      customModalities: updatedModalities,
      hierarchy: updatedHierarchy
    });
    
  } catch (error: any) {
    if (error instanceof NotificationPreferencesError) {
      throw error;
    }
    handleFirebaseError(error, 'removeCustomModality');
  }
}
