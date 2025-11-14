import { getAuthInstance, getDbInstance, getRdbInstance } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';
import { DeviceConfig } from '../types';

// Error types for device configuration
export class DeviceConfigError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'DeviceConfigError';
  }
}

// Validation helpers
function validateDeviceId(deviceId: string): void {
  if (!deviceId || typeof deviceId !== 'string') {
    throw new DeviceConfigError(
      'Invalid device ID: must be a non-empty string',
      'INVALID_DEVICE_ID',
      'El ID del dispositivo no es válido.',
      false
    );
  }

  if (deviceId.trim().length < 3) {
    throw new DeviceConfigError(
      'Invalid device ID: must be at least 3 characters',
      'DEVICE_ID_TOO_SHORT',
      'El ID del dispositivo debe tener al menos 3 caracteres.',
      false
    );
  }
}

function validateAlarmMode(alarmMode: string): void {
  const validModes = ['off', 'sound', 'led', 'both'];
  if (!validModes.includes(alarmMode)) {
    throw new DeviceConfigError(
      `Invalid alarm mode: ${alarmMode}`,
      'INVALID_ALARM_MODE',
      'El modo de alarma seleccionado no es válido.',
      false
    );
  }
}

function validateLedIntensity(intensity: number): void {
  if (typeof intensity !== 'number' || isNaN(intensity)) {
    throw new DeviceConfigError(
      'Invalid LED intensity: must be a number',
      'INVALID_LED_INTENSITY',
      'La intensidad del LED debe ser un número.',
      false
    );
  }

  if (intensity < 0 || intensity > 1023) {
    throw new DeviceConfigError(
      `Invalid LED intensity: ${intensity} (must be 0-1023)`,
      'LED_INTENSITY_OUT_OF_RANGE',
      'La intensidad del LED debe estar entre 0 y 1023.',
      false
    );
  }
}

function validateLedColor(color: { r: number; g: number; b: number }): void {
  if (!color || typeof color !== 'object') {
    throw new DeviceConfigError(
      'Invalid LED color: must be an object with r, g, b properties',
      'INVALID_LED_COLOR',
      'El color del LED no es válido.',
      false
    );
  }

  const { r, g, b } = color;

  if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
    throw new DeviceConfigError(
      'Invalid LED color: r, g, b must be numbers',
      'INVALID_LED_COLOR_VALUES',
      'Los valores de color deben ser números.',
      false
    );
  }

  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new DeviceConfigError(
      `Invalid LED color values: r=${r}, g=${g}, b=${b} (must be 0-255)`,
      'LED_COLOR_OUT_OF_RANGE',
      'Los valores de color deben estar entre 0 y 255.',
      false
    );
  }
}

function validateDeviceConfig(config: Partial<DeviceConfig>): void {
  if (!config || typeof config !== 'object') {
    throw new DeviceConfigError(
      'Invalid device config: must be an object',
      'INVALID_CONFIG',
      'La configuración del dispositivo no es válida.',
      false
    );
  }

  if (config.deviceId) {
    validateDeviceId(config.deviceId);
  }

  if (config.alarmMode) {
    validateAlarmMode(config.alarmMode);
  }

  if (config.ledIntensity !== undefined) {
    validateLedIntensity(config.ledIntensity);
  }

  if (config.ledColor) {
    validateLedColor(config.ledColor);
  }
}

async function validateAuthentication(): Promise<string> {
  const auth = await getAuthInstance();
  
  if (!auth) {
    throw new DeviceConfigError(
      'Firebase Auth not initialized',
      'AUTH_NOT_INITIALIZED',
      'Error de autenticación. Por favor, reinicia la aplicación.',
      true
    );
  }

  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new DeviceConfigError(
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
      if (error instanceof DeviceConfigError && !error.retryable) {
        throw error;
      }
      
      // Check if error is retryable based on Firebase error codes
      const retryableCodes = ['unavailable', 'deadline-exceeded', 'resource-exhausted', 'aborted'];
      const isRetryable = retryableCodes.includes(error.code);
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`[DeviceConfig] Retry attempt ${attempt}/${maxRetries} after error:`, error.code);
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}

// Convert Firebase errors to user-friendly messages
function handleFirebaseError(error: any, operation: string): never {
  console.error(`[DeviceConfig] ${operation} failed:`, {
    code: error.code,
    message: error.message
  });

  if (error instanceof DeviceConfigError) {
    throw error;
  }

  switch (error.code) {
    case 'permission-denied':
      throw new DeviceConfigError(
        `Permission denied for ${operation}`,
        'PERMISSION_DENIED',
        'No tienes permiso para modificar la configuración del dispositivo.',
        false
      );
    
    case 'unavailable':
      throw new DeviceConfigError(
        `Service unavailable for ${operation}`,
        'SERVICE_UNAVAILABLE',
        'El servicio no está disponible. Por favor, verifica tu conexión a internet.',
        true
      );
    
    case 'deadline-exceeded':
    case 'timeout':
      throw new DeviceConfigError(
        `Operation timeout for ${operation}`,
        'TIMEOUT',
        'La operación tardó demasiado tiempo. Por favor, intenta nuevamente.',
        true
      );
    
    case 'not-found':
      throw new DeviceConfigError(
        `Device not found for ${operation}`,
        'NOT_FOUND',
        'El dispositivo no fue encontrado.',
        false
      );
    
    default:
      throw new DeviceConfigError(
        `Unknown error during ${operation}: ${error.message}`,
        'UNKNOWN_ERROR',
        'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        true
      );
  }
}

/**
 * Save device configuration to Firestore and RTDB
 * @param deviceId - The device ID
 * @param config - Partial device configuration to save
 * @returns Promise that resolves when configuration is saved
 */
export async function saveDeviceConfig(
  deviceId: string,
  config: Partial<Omit<DeviceConfig, 'deviceId' | 'lastUpdated'>>
): Promise<void> {
  console.log('[DeviceConfig] saveDeviceConfig called', { deviceId: deviceId.substring(0, 8) + '...' });
  
  try {
    // Validate authentication
    const userId = await validateAuthentication();
    
    // Validate inputs
    validateDeviceId(deviceId);
    validateDeviceConfig({ ...config, deviceId });
    
    // Get Firebase instances
    const db = await getDbInstance();
    const rdb = await getRdbInstance();
    
    if (!db) {
      throw new DeviceConfigError(
        'Firebase Firestore not initialized',
        'FIRESTORE_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }

    if (!rdb) {
      throw new DeviceConfigError(
        'Firebase Realtime Database not initialized',
        'RTDB_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Prepare configuration data
    const configData = {
      ...config,
      lastUpdated: serverTimestamp(),
      syncStatus: 'pending'
    };
    
    // Save to Firestore with retry logic
    await retryOperation(async () => {
      const configRef = doc(db, 'deviceConfigs', deviceId);
      console.log('[DeviceConfig] Saving to Firestore:', `deviceConfigs/${deviceId}`);
      await setDoc(configRef, configData, { merge: true });
      console.log('[DeviceConfig] Successfully saved to Firestore');
    });
    
    // Save to RTDB for real-time sync with device
    if (config.alarmMode !== undefined || config.ledIntensity !== undefined || config.ledColor !== undefined) {
      await retryOperation(async () => {
        const rtdbConfig: any = {};
        
        if (config.alarmMode !== undefined) {
          rtdbConfig.alarm_mode = config.alarmMode;
        }
        
        if (config.ledIntensity !== undefined) {
          rtdbConfig.led_intensity = config.ledIntensity;
        }
        
        if (config.ledColor !== undefined) {
          rtdbConfig.led_color = config.ledColor;
        }
        
        const deviceConfigRef = ref(rdb, `devices/${deviceId}/config`);
        console.log('[DeviceConfig] Saving to RTDB:', `devices/${deviceId}/config`);
        await set(deviceConfigRef, rtdbConfig);
        console.log('[DeviceConfig] Successfully saved to RTDB');
      });
    }
    
  } catch (error: any) {
    handleFirebaseError(error, 'saveDeviceConfig');
  }
}

/**
 * Get device configuration from Firestore
 * @param deviceId - The device ID
 * @returns Promise that resolves with the device configuration
 */
export async function getDeviceConfig(deviceId: string): Promise<DeviceConfig | null> {
  console.log('[DeviceConfig] getDeviceConfig called', { deviceId: deviceId.substring(0, 8) + '...' });
  
  try {
    // Validate authentication
    await validateAuthentication();
    
    // Validate inputs
    validateDeviceId(deviceId);
    
    // Get Firebase instances
    const db = await getDbInstance();
    
    if (!db) {
      throw new DeviceConfigError(
        'Firebase Firestore not initialized',
        'FIRESTORE_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Get from Firestore with retry logic
    const config = await retryOperation(async () => {
      const configRef = doc(db, 'deviceConfigs', deviceId);
      console.log('[DeviceConfig] Reading from Firestore:', `deviceConfigs/${deviceId}`);
      const configDoc = await getDoc(configRef);
      
      if (!configDoc.exists()) {
        console.log('[DeviceConfig] No configuration found for device');
        return null;
      }
      
      const data = configDoc.data();
      console.log('[DeviceConfig] Successfully retrieved configuration');
      
      return {
        deviceId,
        alarmMode: data.alarmMode || 'both',
        ledIntensity: data.ledIntensity ?? 512,
        ledColor: data.ledColor || { r: 255, g: 255, b: 255 },
        lastUpdated: data.lastUpdated?.toDate?.() || new Date(),
        syncStatus: data.syncStatus || 'synced'
      } as DeviceConfig;
    });
    
    return config;
    
  } catch (error: any) {
    handleFirebaseError(error, 'getDeviceConfig');
  }
}

/**
 * Get device configuration from RTDB (real-time)
 * @param deviceId - The device ID
 * @returns Promise that resolves with the device configuration from RTDB
 */
export async function getDeviceConfigFromRTDB(deviceId: string): Promise<Partial<DeviceConfig> | null> {
  console.log('[DeviceConfig] getDeviceConfigFromRTDB called', { deviceId: deviceId.substring(0, 8) + '...' });
  
  try {
    // Validate authentication
    await validateAuthentication();
    
    // Validate inputs
    validateDeviceId(deviceId);
    
    // Get Firebase instances
    const rdb = await getRdbInstance();
    
    if (!rdb) {
      throw new DeviceConfigError(
        'Firebase Realtime Database not initialized',
        'RTDB_NOT_INITIALIZED',
        'Error de conexión. Por favor, reinicia la aplicación.',
        true
      );
    }
    
    // Get from RTDB with retry logic
    const config = await retryOperation(async () => {
      const deviceConfigRef = ref(rdb, `devices/${deviceId}/config`);
      console.log('[DeviceConfig] Reading from RTDB:', `devices/${deviceId}/config`);
      const snapshot = await get(deviceConfigRef);
      
      if (!snapshot.exists()) {
        console.log('[DeviceConfig] No configuration found in RTDB');
        return null;
      }
      
      const data = snapshot.val();
      console.log('[DeviceConfig] Successfully retrieved configuration from RTDB');
      
      return {
        deviceId,
        alarmMode: data.alarm_mode,
        ledIntensity: data.led_intensity,
        ledColor: data.led_color
      } as Partial<DeviceConfig>;
    });
    
    return config;
    
  } catch (error: any) {
    handleFirebaseError(error, 'getDeviceConfigFromRTDB');
  }
}
