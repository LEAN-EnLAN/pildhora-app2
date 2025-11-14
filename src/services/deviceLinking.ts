import { getAuthInstance, getDbInstance, getRdbInstance } from './firebase';
import { doc, setDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { ref, set, remove } from 'firebase/database';

// Error types for better error handling
export class DeviceLinkingError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'DeviceLinkingError';
  }
}

// Validation helpers
function validateDeviceId(deviceId: string): void {
  if (!deviceId || typeof deviceId !== 'string') {
    throw new DeviceLinkingError(
      'Invalid device ID: must be a non-empty string',
      'INVALID_DEVICE_ID',
      'El ID del dispositivo no es válido. Por favor, verifica el ID e intenta nuevamente.',
      false
    );
  }

  if (deviceId.trim().length < 3) {
    throw new DeviceLinkingError(
      'Invalid device ID: must be at least 3 characters',
      'DEVICE_ID_TOO_SHORT',
      'El ID del dispositivo debe tener al menos 3 caracteres.',
      false
    );
  }

  if (deviceId.length > 100) {
    throw new DeviceLinkingError(
      'Invalid device ID: must be less than 100 characters',
      'DEVICE_ID_TOO_LONG',
      'El ID del dispositivo es demasiado largo.',
      false
    );
  }

  // Check for invalid characters (allow alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(deviceId)) {
    throw new DeviceLinkingError(
      'Invalid device ID: contains invalid characters',
      'INVALID_DEVICE_ID_FORMAT',
      'El ID del dispositivo solo puede contener letras, números, guiones y guiones bajos.',
      false
    );
  }
}

function validateUserId(userId: string): void {
  if (!userId || typeof userId !== 'string') {
    throw new DeviceLinkingError(
      'Invalid user ID: must be a non-empty string',
      'INVALID_USER_ID',
      'Error de autenticación. Por favor, cierra sesión e inicia sesión nuevamente.',
      false
    );
  }
}

async function validateAuthentication(userId: string): Promise<void> {
  const auth = await getAuthInstance();
  
  if (!auth) {
    throw new DeviceLinkingError(
      'Firebase Auth not initialized',
      'AUTH_NOT_INITIALIZED',
      'Error de autenticación. Por favor, reinicia la aplicación.',
      true
    );
  }

  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new DeviceLinkingError(
      'User not authenticated',
      'NOT_AUTHENTICATED',
      'No has iniciado sesión. Por favor, inicia sesión e intenta nuevamente.',
      false
    );
  }

  if (currentUser.uid !== userId) {
    console.error('[DeviceLinking] UID mismatch', {
      authUid: currentUser.uid,
      providedUserId: userId
    });
    throw new DeviceLinkingError(
      `UID mismatch: Auth UID (${currentUser.uid}) != Provided UID (${userId})`,
      'UID_MISMATCH',
      'Error de autenticación. Por favor, cierra sesión e inicia sesión nuevamente.',
      false
    );
  }
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
      if (error instanceof DeviceLinkingError && !error.retryable) {
        throw error;
      }
      
      // Check if error is retryable based on Firebase error codes
      const retryableCodes = ['unavailable', 'deadline-exceeded', 'resource-exhausted', 'aborted'];
      const isRetryable = retryableCodes.includes(error.code);
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`[DeviceLinking] Retry attempt ${attempt}/${maxRetries} after error:`, error.code);
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}

// Convert Firebase errors to user-friendly messages
function handleFirebaseError(error: any, operation: string): never {
  console.error(`[DeviceLinking] ${operation} failed:`, {
    code: error.code,
    message: error.message
  });

  if (error instanceof DeviceLinkingError) {
    throw error;
  }

  switch (error.code) {
    case 'permission-denied':
      throw new DeviceLinkingError(
        `Permission denied for ${operation}`,
        'PERMISSION_DENIED',
        'No tienes permiso para realizar esta operación. Verifica tu conexión y permisos.',
        false
      );
    
    case 'unavailable':
      throw new DeviceLinkingError(
        `Service unavailable for ${operation}`,
        'SERVICE_UNAVAILABLE',
        'El servicio no está disponible. Por favor, verifica tu conexión a internet e intenta nuevamente.',
        true
      );
    
    case 'deadline-exceeded':
    case 'timeout':
      throw new DeviceLinkingError(
        `Operation timeout for ${operation}`,
        'TIMEOUT',
        'La operación tardó demasiado tiempo. Por favor, intenta nuevamente.',
        true
      );
    
    case 'not-found':
      throw new DeviceLinkingError(
        `Resource not found for ${operation}`,
        'NOT_FOUND',
        'El dispositivo no fue encontrado. Verifica el ID del dispositivo.',
        false
      );
    
    case 'already-exists':
      throw new DeviceLinkingError(
        `Resource already exists for ${operation}`,
        'ALREADY_EXISTS',
        'Este dispositivo ya está vinculado.',
        false
      );
    
    default:
      throw new DeviceLinkingError(
        `Unknown error during ${operation}: ${error.message}`,
        'UNKNOWN_ERROR',
        'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        true
      );
  }
}

/**
 * Link a device to the authenticated user by updating the mapping under users/{uid}/devices.
 * Note: Writing devices/{deviceID}/ownerUserId should be done server-side for security.
 * The Cloud Function will resolve ownership by scanning users/{uid}/devices.
 */
export async function linkDeviceToUser(userId: string, deviceId: string): Promise<void> {
  console.log('[DeviceLinking] linkDeviceToUser called', { userId, deviceId: deviceId.substring(0, 8) + '...' });
  
  try {
    // Input validation
    validateUserId(userId);
    validateDeviceId(deviceId);
    
    // Authentication validation
    await validateAuthentication(userId);
    
    // Get Firebase instances
    const rdb = await getRdbInstance();
    if (!rdb) {
      throw new DeviceLinkingError(
        'Firebase Realtime Database not initialized',
        'RTDB_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Write to RTDB with retry logic
    const deviceRef = ref(rdb, `users/${userId}/devices/${deviceId}`);
    
    await retryOperation(async () => {
      console.log('[DeviceLinking] Writing to RTDB:', `users/${userId}/devices/${deviceId}`);
      await set(deviceRef, true);
      console.log('[DeviceLinking] Successfully wrote device link to RTDB');
    });
    
    // The Cloud Function will handle mirroring this to Firestore
  } catch (error: any) {
    handleFirebaseError(error, 'linkDeviceToUser');
  }
}

/**
 * Diagnostic function to check if the temporary development rule should be active
 */
export async function checkDevelopmentRuleStatus(): Promise<void> {
  console.log('[DeviceLinking] Checking development rule status...');
  console.log('[DeviceLinking] Current system time:', new Date().toISOString());
  console.log('[DeviceLinking] Development rule expires: 2025-12-31T23:59:59.999Z');
  
  try {
    const auth = await getAuthInstance();
    const db = await getDbInstance();

    if (!auth || !db) {
      console.warn('[DeviceLinking] Firebase services not available for rule status check.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('[DeviceLinking] No authenticated user, skipping rule check.');
      return;
    }

    console.log('[DeviceLinking] Authentication state:', {
      isAuthenticated: !!currentUser,
      uid: currentUser.uid
    });
    
    // Check if we can read a test document to verify rule evaluation
    const testDocRef = doc(db, 'deviceLinks', 'test-diagnostic');
    const testDoc = await getDoc(testDocRef);
    
    if (testDoc.exists()) {
      console.log('[DeviceLinking] Test document exists and is readable');
      console.log('[DeviceLinking] ✅ Development rule is working correctly');
    } else {
      console.log('[DeviceLinking] Test document does not exist, creating it...');
      // Create the test document if it doesn't exist
      await setDoc(testDocRef, {
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        purpose: 'development-rule-diagnostic',
        test: true
      });
      console.log('[DeviceLinking] Test document created successfully');
      
      // Try reading it again to verify
      const testDocAfterCreate = await getDoc(testDocRef);
      if (testDocAfterCreate.exists()) {
        console.log('[DeviceLinking] ✅ Development rule is working correctly');
      } else {
        console.log('[DeviceLinking] ❌ Development rule issue - document created but not readable');
      }
    }
  } catch (error: any) {
    console.error('[DeviceLinking] Failed to check development rule:', {
      code: error.code,
      message: error.message
    });
    
    // Provide specific guidance based on error code
    if (error.code === 'permission-denied') {
      console.log('[DeviceLinking] ❌ Permission denied - development rule may not be active');
    } else if (error.code === 'unavailable') {
      console.log('[DeviceLinking] ❌ Service unavailable - check network connection');
    } else {
      console.log('[DeviceLinking] ❌ Unexpected error - check Firebase configuration');
    }
  }
}

/**
 * Unlink a device from the user by removing the mapping.
 */
export async function unlinkDeviceFromUser(userId: string, deviceId: string): Promise<void> {
  console.log('[DeviceLinking] unlinkDeviceFromUser called', { userId, deviceId: deviceId.substring(0, 8) + '...' });
  
  try {
    // Input validation
    validateUserId(userId);
    validateDeviceId(deviceId);
    
    // Authentication validation
    await validateAuthentication(userId);
    
    // Get Firebase instances
    const rdb = await getRdbInstance();
    if (!rdb) {
      throw new DeviceLinkingError(
        'Firebase Realtime Database not initialized',
        'RTDB_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Remove the device from RTDB with retry logic
    const deviceRef = ref(rdb, `users/${userId}/devices/${deviceId}`);
    
    await retryOperation(async () => {
      console.log('[DeviceLinking] Removing from RTDB:', `users/${userId}/devices/${deviceId}`);
      await remove(deviceRef);
      console.log('[DeviceLinking] Successfully removed device link from RTDB');
    });
    
    // The Cloud Function will handle updating the mirrored Firestore document
  } catch (error: any) {
    handleFirebaseError(error, 'unlinkDeviceFromUser');
  }
}
