import { getAuthInstance, getDbInstance } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { linkDeviceToUser } from './deviceLinking';

/**
 * ConnectionCodeService Error Class
 * 
 * Custom error class for connection code-related errors with user-friendly messages
 * and retry capability flags.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export class ConnectionCodeError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ConnectionCodeError';
  }
}

/**
 * ConnectionCodeData interface
 * 
 * Represents the data structure for a connection code.
 * Used for validating codes and displaying patient information to caregivers.
 * 
 * @example
 * ```typescript
 * const codeData: ConnectionCodeData = {
 *   code: 'ABC123',
 *   deviceId: 'DEVICE-001',
 *   patientId: 'patient-456',
 *   patientName: 'John Doe',
 *   expiresAt: new Date('2024-12-31'),
 *   used: false
 * };
 * ```
 */
export interface ConnectionCodeData {
  /** The connection code itself (6-8 alphanumeric characters) */
  code: string;
  /** ID of the device this code links to */
  deviceId: string;
  /** ID of the patient who owns the device */
  patientId: string;
  /** Name of the patient for display purposes */
  patientName: string;
  /** Expiration timestamp for the code */
  expiresAt: Date;
  /** Whether the code has been used */
  used: boolean;
  /** ID of the caregiver who used the code (if used) */
  usedBy?: string;
  /** Timestamp when the code was used (if used) */
  usedAt?: Date;
}

/**
 * ConnectionCode Firestore document interface
 * 
 * Represents the structure of a connection code document in Firestore.
 * 
 * Collection: connectionCodes
 */
interface ConnectionCode {
  /** The code itself (6-8 alphanumeric) - also used as document ID */
  id: string;
  /** Device ID this code links to */
  deviceId: string;
  /** Patient ID who owns the device */
  patientId: string;
  /** Patient name for display */
  patientName: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Expiration timestamp */
  expiresAt: Timestamp;
  /** Whether the code has been used */
  used: boolean;
  /** Caregiver ID who used the code */
  usedBy?: string;
  /** Timestamp when code was used */
  usedAt?: Timestamp;
}

/**
 * Validation helpers
 */
function validatePatientId(patientId: string): void {
  if (!patientId || typeof patientId !== 'string') {
    throw new ConnectionCodeError(
      'Invalid patient ID: must be a non-empty string',
      'INVALID_PATIENT_ID',
      'ID de paciente no válido.',
      false
    );
  }
}

function validateDeviceId(deviceId: string): void {
  if (!deviceId || typeof deviceId !== 'string') {
    throw new ConnectionCodeError(
      'Invalid device ID: must be a non-empty string',
      'INVALID_DEVICE_ID',
      'ID de dispositivo no válido.',
      false
    );
  }
}

function validateCodeFormat(code: string): void {
  if (!code || typeof code !== 'string') {
    throw new ConnectionCodeError(
      'Invalid code: must be a non-empty string',
      'INVALID_CODE_FORMAT',
      'Código no válido. Debe ser una cadena de 6-8 caracteres alfanuméricos.',
      false
    );
  }

  // Code must be 6-8 alphanumeric characters
  if (code.length < 6 || code.length > 8) {
    throw new ConnectionCodeError(
      'Invalid code length: must be 6-8 characters',
      'INVALID_CODE_FORMAT',
      'El código debe tener entre 6 y 8 caracteres.',
      false
    );
  }

  // Only alphanumeric characters (avoiding ambiguous characters)
  if (!/^[A-Z0-9]+$/.test(code)) {
    throw new ConnectionCodeError(
      'Invalid code format: must be alphanumeric',
      'INVALID_CODE_FORMAT',
      'El código solo puede contener letras mayúsculas y números.',
      false
    );
  }
}

/**
 * Validate authentication and return current user ID
 */
async function validateAuthentication(): Promise<string> {
  const auth = await getAuthInstance();
  
  if (!auth) {
    throw new ConnectionCodeError(
      'Firebase Auth not initialized',
      'AUTH_NOT_INITIALIZED',
      'Error de autenticación. Por favor, reinicia la aplicación.',
      true
    );
  }

  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new ConnectionCodeError(
      'User not authenticated',
      'NOT_AUTHENTICATED',
      'No has iniciado sesión. Por favor, inicia sesión e intenta nuevamente.',
      false
    );
  }

  return currentUser.uid;
}

/**
 * Retry logic for transient failures
 */
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
      if (error instanceof ConnectionCodeError && !error.retryable) {
        throw error;
      }
      
      // Check if error is retryable based on Firebase error codes
      const retryableCodes = ['unavailable', 'deadline-exceeded', 'resource-exhausted', 'aborted'];
      const isRetryable = retryableCodes.includes(error.code);
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`[ConnectionCodeService] Retry attempt ${attempt}/${maxRetries} after error:`, error.code);
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}

/**
 * Convert Firebase errors to user-friendly messages
 */
function handleFirebaseError(error: any, operation: string): never {
  console.error(`[ConnectionCodeService] ${operation} failed:`, {
    code: error.code,
    message: error.message
  });

  if (error instanceof ConnectionCodeError) {
    throw error;
  }

  switch (error.code) {
    case 'permission-denied':
      throw new ConnectionCodeError(
        `Permission denied for ${operation}`,
        'PERMISSION_DENIED',
        'No tienes permiso para realizar esta operación.',
        false
      );
    
    case 'unavailable':
      throw new ConnectionCodeError(
        `Service unavailable for ${operation}`,
        'SERVICE_UNAVAILABLE',
        'El servicio no está disponible. Por favor, verifica tu conexión a internet e intenta nuevamente.',
        true
      );
    
    case 'deadline-exceeded':
    case 'timeout':
      throw new ConnectionCodeError(
        `Operation timeout for ${operation}`,
        'TIMEOUT',
        'La operación tardó demasiado tiempo. Por favor, intenta nuevamente.',
        true
      );
    
    case 'not-found':
      throw new ConnectionCodeError(
        `Resource not found for ${operation}`,
        'NOT_FOUND',
        'Código no encontrado.',
        false
      );
    
    case 'already-exists':
      throw new ConnectionCodeError(
        `Resource already exists for ${operation}`,
        'ALREADY_EXISTS',
        'El código ya existe.',
        false
      );
    
    default:
      throw new ConnectionCodeError(
        `Unknown error during ${operation}: ${error.message}`,
        'UNKNOWN_ERROR',
        'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        true
      );
  }
}

/**
 * Generate a random connection code
 * 
 * Generates a 6-8 character alphanumeric code avoiding ambiguous characters
 * (0/O, 1/I, etc.) for better user experience.
 * 
 * @param length - Length of the code (default: 6)
 * @returns Random alphanumeric code
 */
function generateRandomCode(length: number = 6): string {
  // Avoid ambiguous characters: 0, O, 1, I, L
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

/**
 * Generate a unique connection code
 * 
 * Generates a random code and ensures it doesn't already exist in Firestore.
 * Retries up to 5 times if collision occurs.
 * 
 * @param db - Firestore instance
 * @returns Unique connection code
 */
async function generateUniqueCode(db: any): Promise<string> {
  const maxAttempts = 5;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRandomCode(6);
    const codeRef = doc(db, 'connectionCodes', code);
    const codeDoc = await getDoc(codeRef);
    
    if (!codeDoc.exists()) {
      return code;
    }
    
    console.log(`[ConnectionCodeService] Code collision, retrying... (attempt ${attempt + 1}/${maxAttempts})`);
  }
  
  throw new ConnectionCodeError(
    'Failed to generate unique code after multiple attempts',
    'CODE_GENERATION_FAILED',
    'No se pudo generar un código único. Por favor, intenta nuevamente.',
    true
  );
}

/**
 * Generate a new connection code for a patient's device
 * 
 * Creates a time-limited connection code that caregivers can use to link
 * to a patient's device. Codes expire after the specified duration (default 24 hours).
 * 
 * Requirements: 5.1, 5.2
 * 
 * @param patientId - ID of the patient who owns the device
 * @param deviceId - ID of the device to link
 * @param expiresInHours - Hours until code expires (default: 24)
 * @returns Promise<string> - The generated connection code
 * 
 * @example
 * ```typescript
 * const code = await generateCode('patient-123', 'DEVICE-001', 24);
 * console.log('Share this code with your caregiver:', code);
 * ```
 */
export async function generateCode(
  patientId: string,
  deviceId: string,
  expiresInHours: number = 24
): Promise<string> {
  console.log('[ConnectionCodeService] generateCode called', { patientId, deviceId, expiresInHours });
  
  try {
    // Validate inputs
    validatePatientId(patientId);
    validateDeviceId(deviceId);
    
    if (expiresInHours <= 0 || expiresInHours > 168) { // Max 7 days
      throw new ConnectionCodeError(
        'Invalid expiration time',
        'INVALID_EXPIRATION',
        'El tiempo de expiración debe estar entre 1 y 168 horas.',
        false
      );
    }
    
    // Validate authentication
    const currentUserId = await validateAuthentication();
    
    // Ensure patient is generating code for their own device
    if (currentUserId !== patientId) {
      throw new ConnectionCodeError(
        'User ID mismatch',
        'USER_ID_MISMATCH',
        'No puedes generar códigos para otros pacientes.',
        false
      );
    }
    
    // Get Firebase instances
    const db = await getDbInstance();
    
    if (!db) {
      throw new ConnectionCodeError(
        'Firebase Firestore not initialized',
        'FIRESTORE_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Get patient name from user document
    const userDoc = await retryOperation(async () => {
      const docRef = doc(db, 'users', patientId);
      return await getDoc(docRef);
    });
    
    if (!userDoc.exists()) {
      throw new ConnectionCodeError(
        'Patient not found',
        'PATIENT_NOT_FOUND',
        'Paciente no encontrado.',
        false
      );
    }
    
    const patientName = userDoc.data()?.name || 'Unknown Patient';
    
    // Generate unique code
    const code = await generateUniqueCode(db);
    
    // Calculate expiration time
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    
    // Create connection code document
    await retryOperation(async () => {
      const codeRef = doc(db, 'connectionCodes', code);
      console.log('[ConnectionCodeService] Creating connection code document:', code);
      await setDoc(codeRef, {
        id: code,
        deviceId,
        patientId,
        patientName,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        used: false
      });
      console.log('[ConnectionCodeService] Successfully created connection code');
    });
    
    console.log('[ConnectionCodeService] Code generation completed successfully');
    return code;
    
  } catch (error: any) {
    handleFirebaseError(error, 'generateCode');
  }
}

/**
 * Validate and retrieve connection code data
 * 
 * Checks if a connection code exists, is not expired, and has not been used.
 * Returns the code data if valid, or null if invalid.
 * 
 * Requirements: 5.2, 5.3
 * 
 * @param code - The connection code to validate
 * @returns Promise<ConnectionCodeData | null> - Code data if valid, null otherwise
 * 
 * @example
 * ```typescript
 * const codeData = await validateCode('ABC123');
 * if (codeData) {
 *   console.log('Valid code for patient:', codeData.patientName);
 * } else {
 *   console.log('Invalid or expired code');
 * }
 * ```
 */
export async function validateCode(code: string): Promise<ConnectionCodeData | null> {
  console.log('[ConnectionCodeService] validateCode called', { code });
  
  try {
    // Validate input
    validateCodeFormat(code);
    
    // Validate authentication
    await validateAuthentication();
    
    // Get Firebase instances
    const db = await getDbInstance();
    
    if (!db) {
      throw new ConnectionCodeError(
        'Firebase Firestore not initialized',
        'FIRESTORE_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Get connection code document
    const codeDoc = await retryOperation(async () => {
      const codeRef = doc(db, 'connectionCodes', code.toUpperCase());
      return await getDoc(codeRef);
    });
    
    if (!codeDoc.exists()) {
      console.log('[ConnectionCodeService] Code not found');
      throw new ConnectionCodeError(
        'Code not found',
        'CODE_NOT_FOUND',
        'Código no encontrado. Verifica el código e intenta nuevamente.',
        false
      );
    }
    
    const codeData = codeDoc.data() as ConnectionCode;
    
    // Check if code has been used
    if (codeData.used) {
      console.log('[ConnectionCodeService] Code already used');
      throw new ConnectionCodeError(
        'Code already used',
        'CODE_ALREADY_USED',
        'Este código ya ha sido utilizado.',
        false
      );
    }
    
    // Check if code is expired
    const now = new Date();
    const expiresAt = codeData.expiresAt.toDate();
    
    if (now > expiresAt) {
      console.log('[ConnectionCodeService] Code expired');
      throw new ConnectionCodeError(
        'Code expired',
        'CODE_EXPIRED',
        'Este código ha expirado. Solicita un nuevo código al paciente.',
        false
      );
    }
    
    // Return valid code data
    const result: ConnectionCodeData = {
      code: codeData.id,
      deviceId: codeData.deviceId,
      patientId: codeData.patientId,
      patientName: codeData.patientName,
      expiresAt: expiresAt,
      used: codeData.used,
      usedBy: codeData.usedBy,
      usedAt: codeData.usedAt?.toDate()
    };
    
    console.log('[ConnectionCodeService] Code validation successful');
    return result;
    
  } catch (error: any) {
    // If it's a ConnectionCodeError, rethrow it
    if (error instanceof ConnectionCodeError) {
      throw error;
    }
    handleFirebaseError(error, 'validateCode');
  }
}

/**
 * Mark code as used and create device link
 * 
 * Uses a connection code to create a device link between a caregiver and
 * a patient's device. Marks the code as used to prevent reuse.
 * 
 * Requirements: 5.4, 5.5, 5.6
 * 
 * @param code - The connection code to use
 * @param caregiverId - ID of the caregiver using the code
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await useCode('ABC123', 'caregiver-456');
 * console.log('Successfully linked to patient device');
 * ```
 */
export async function useCode(code: string, caregiverId: string): Promise<void> {
  console.log('[ConnectionCodeService] useCode called', { code, caregiverId });
  
  try {
    // Validate inputs
    validateCodeFormat(code);
    
    if (!caregiverId || typeof caregiverId !== 'string') {
      throw new ConnectionCodeError(
        'Invalid caregiver ID',
        'INVALID_CAREGIVER_ID',
        'ID de cuidador no válido.',
        false
      );
    }
    
    // Validate authentication
    const currentUserId = await validateAuthentication();
    
    // Ensure caregiver is using code for themselves
    if (currentUserId !== caregiverId) {
      throw new ConnectionCodeError(
        'User ID mismatch',
        'USER_ID_MISMATCH',
        'No puedes usar códigos para otros cuidadores.',
        false
      );
    }
    
    // Get Firebase instances
    const db = await getDbInstance();
    
    if (!db) {
      throw new ConnectionCodeError(
        'Firebase Firestore not initialized',
        'FIRESTORE_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Validate the code first
    const codeData = await validateCode(code);
    
    if (!codeData) {
      throw new ConnectionCodeError(
        'Invalid code',
        'INVALID_CODE',
        'Código no válido.',
        false
      );
    }
    
    // Mark code as used
    await retryOperation(async () => {
      const codeRef = doc(db, 'connectionCodes', code.toUpperCase());
      console.log('[ConnectionCodeService] Marking code as used');
      await setDoc(
        codeRef,
        {
          used: true,
          usedBy: caregiverId,
          usedAt: serverTimestamp()
        },
        { merge: true }
      );
      console.log('[ConnectionCodeService] Successfully marked code as used');
    });
    
    // Create device link using deviceLinking service
    console.log('[ConnectionCodeService] Creating device link');
    await linkDeviceToUser(caregiverId, codeData.deviceId);
    
    console.log('[ConnectionCodeService] Code usage completed successfully');
    
  } catch (error: any) {
    handleFirebaseError(error, 'useCode');
  }
}

/**
 * Revoke/invalidate a connection code
 * 
 * Deletes a connection code to prevent it from being used.
 * Only the patient who created the code can revoke it.
 * 
 * Requirements: 5.5
 * 
 * @param code - The connection code to revoke
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await revokeCode('ABC123');
 * console.log('Code revoked successfully');
 * ```
 */
export async function revokeCode(code: string): Promise<void> {
  console.log('[ConnectionCodeService] revokeCode called', { code });
  
  try {
    // Validate input
    validateCodeFormat(code);
    
    // Validate authentication
    const currentUserId = await validateAuthentication();
    
    // Get Firebase instances
    const db = await getDbInstance();
    
    if (!db) {
      throw new ConnectionCodeError(
        'Firebase Firestore not initialized',
        'FIRESTORE_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Get connection code document to verify ownership
    const codeDoc = await retryOperation(async () => {
      const codeRef = doc(db, 'connectionCodes', code.toUpperCase());
      return await getDoc(codeRef);
    });
    
    if (!codeDoc.exists()) {
      throw new ConnectionCodeError(
        'Code not found',
        'CODE_NOT_FOUND',
        'Código no encontrado.',
        false
      );
    }
    
    const codeData = codeDoc.data() as ConnectionCode;
    
    // Ensure patient is revoking their own code
    if (codeData.patientId !== currentUserId) {
      throw new ConnectionCodeError(
        'Permission denied',
        'PERMISSION_DENIED',
        'No puedes revocar códigos de otros pacientes.',
        false
      );
    }
    
    // Delete the code document
    await retryOperation(async () => {
      const codeRef = doc(db, 'connectionCodes', code.toUpperCase());
      console.log('[ConnectionCodeService] Deleting connection code');
      await deleteDoc(codeRef);
      console.log('[ConnectionCodeService] Successfully deleted connection code');
    });
    
    console.log('[ConnectionCodeService] Code revocation completed successfully');
    
  } catch (error: any) {
    handleFirebaseError(error, 'revokeCode');
  }
}

/**
 * Get active connection codes for a patient
 * 
 * Retrieves all active (non-expired, non-used) connection codes
 * created by a patient for their device.
 * 
 * Requirements: 5.6
 * 
 * @param patientId - ID of the patient
 * @returns Promise<ConnectionCodeData[]> - Array of active connection codes
 * 
 * @example
 * ```typescript
 * const activeCodes = await getActiveCodes('patient-123');
 * console.log(`You have ${activeCodes.length} active codes`);
 * ```
 */
export async function getActiveCodes(patientId: string): Promise<ConnectionCodeData[]> {
  console.log('[ConnectionCodeService] getActiveCodes called', { patientId });
  
  try {
    // Validate input
    validatePatientId(patientId);
    
    // Validate authentication
    const currentUserId = await validateAuthentication();
    
    // Ensure patient is getting their own codes
    if (currentUserId !== patientId) {
      throw new ConnectionCodeError(
        'User ID mismatch',
        'USER_ID_MISMATCH',
        'No puedes ver códigos de otros pacientes.',
        false
      );
    }
    
    // Get Firebase instances
    const db = await getDbInstance();
    
    if (!db) {
      throw new ConnectionCodeError(
        'Firebase Firestore not initialized',
        'FIRESTORE_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Query for active codes
    const codesQuery = query(
      collection(db, 'connectionCodes'),
      where('patientId', '==', patientId),
      where('used', '==', false)
    );
    
    const querySnapshot = await retryOperation(async () => {
      console.log('[ConnectionCodeService] Querying active codes');
      return await getDocs(codesQuery);
    });
    
    const now = new Date();
    const activeCodes: ConnectionCodeData[] = [];
    
    querySnapshot.forEach((doc) => {
      const codeData = doc.data() as ConnectionCode;
      const expiresAt = codeData.expiresAt.toDate();
      
      // Only include non-expired codes
      if (expiresAt > now) {
        activeCodes.push({
          code: codeData.id,
          deviceId: codeData.deviceId,
          patientId: codeData.patientId,
          patientName: codeData.patientName,
          expiresAt: expiresAt,
          used: codeData.used,
          usedBy: codeData.usedBy,
          usedAt: codeData.usedAt?.toDate()
        });
      }
    });
    
    console.log('[ConnectionCodeService] Found active codes:', activeCodes.length);
    return activeCodes;
    
  } catch (error: any) {
    handleFirebaseError(error, 'getActiveCodes');
  }
}

/**
 * ConnectionCodeService interface
 * 
 * Provides methods for managing connection codes that allow caregivers
 * to link to patient devices.
 */
export interface ConnectionCodeService {
  generateCode(patientId: string, deviceId: string, expiresInHours?: number): Promise<string>;
  validateCode(code: string): Promise<ConnectionCodeData | null>;
  useCode(code: string, caregiverId: string): Promise<void>;
  revokeCode(code: string): Promise<void>;
  getActiveCodes(patientId: string): Promise<ConnectionCodeData[]>;
}

/**
 * Default export of connection code service methods
 */
export default {
  generateCode,
  validateCode,
  useCode,
  revokeCode,
  getActiveCodes
};
