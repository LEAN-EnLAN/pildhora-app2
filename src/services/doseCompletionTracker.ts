import { getDbInstance } from './firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { IntakeStatus } from '../types';
import {
  withRetry,
  handleError,
  createValidationError,
  ApplicationError,
  ErrorCategory,
  ErrorSeverity,
} from '../utils/errorHandling';

/**
 * Service for tracking and preventing duplicate dose recordings
 */

export interface CanTakeDoseResult {
  canTake: boolean;
  reason?: string;
  existingIntakeId?: string;
  takenAt?: Date;
}

/**
 * Checks if a dose can be taken by querying existing intake records
 * @param medicationId - The medication ID
 * @param scheduledTime - The scheduled time for the dose
 * @returns Result indicating if the dose can be taken and why
 */
export async function canTakeDose(
  medicationId: string,
  scheduledTime: Date
): Promise<CanTakeDoseResult> {
  try {
    // Validate input
    if (!medicationId) {
      throw createValidationError('Medication ID is required', { operation: 'can_take_dose' });
    }
    if (!scheduledTime || !(scheduledTime instanceof Date) || isNaN(scheduledTime.getTime())) {
      throw createValidationError('Valid scheduled time is required', { operation: 'can_take_dose' });
    }

    const result = await withRetry(
      async () => {
        const db = await getDbInstance();
        if (!db) {
          throw new ApplicationError(
            ErrorCategory.INITIALIZATION,
            'Firestore no disponible',
            'No se pudo conectar a la base de datos. Por favor, intenta nuevamente.',
            ErrorSeverity.HIGH,
            true
          );
        }

        // Define time window for the same day
        const startOfDay = new Date(scheduledTime);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(scheduledTime);
        endOfDay.setHours(23, 59, 59, 999);

        // Query for intake records on the same day for this medication
        const q = query(
          collection(db, 'intakeRecords'),
          where('medicationId', '==', medicationId),
          where('scheduledTime', '>=', Timestamp.fromDate(startOfDay)),
          where('scheduledTime', '<=', Timestamp.fromDate(endOfDay)),
          where('status', '==', IntakeStatus.TAKEN)
        );

        const snapshot = await getDocs(q);

        // Check if any existing intake matches the scheduled time (within 1 minute tolerance)
        const existingIntake = snapshot.docs.find(doc => {
          const data = doc.data();
          const existingTime = data.scheduledTime.toDate();
          const timeDiff = Math.abs(existingTime.getTime() - scheduledTime.getTime());
          return timeDiff < 60000; // 1 minute tolerance
        });

        if (existingIntake) {
          const data = existingIntake.data();
          const takenAt = data.takenAt?.toDate();
          const timeStr = takenAt 
            ? takenAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            : 'hora desconocida';
          
          return {
            canTake: false,
            reason: `Esta dosis ya fue registrada a las ${timeStr}`,
            existingIntakeId: existingIntake.id,
            takenAt: takenAt
          };
        }

        return { canTake: true };
      },
      { maxAttempts: 2, initialDelayMs: 500 },
      { operation: 'can_take_dose', medicationId }
    );

    return result;
  } catch (error: any) {
    const appError = await handleError(
      error,
      { operation: 'can_take_dose', medicationId },
      false
    );
    console.error('[DoseCompletionTracker] Error checking dose:', appError.message);
    
    // In case of error, allow the dose to be taken (fail open)
    // This prevents blocking legitimate dose recordings due to temporary issues
    return { canTake: true };
  }
}

/**
 * Checks if a specific dose is already completed
 * @param medicationId - The medication ID
 * @param scheduledTime - The scheduled time for the dose
 * @returns True if the dose is already completed
 */
export async function isDoseCompleted(
  medicationId: string,
  scheduledTime: Date
): Promise<boolean> {
  const result = await canTakeDose(medicationId, scheduledTime);
  return !result.canTake;
}

/**
 * Gets all completed doses for today for a specific medication
 * @param medicationId - The medication ID
 * @returns Array of scheduled times for completed doses
 */
export async function getCompletedDosesForToday(
  medicationId: string
): Promise<Date[]> {
  try {
    const db = await getDbInstance();
    if (!db) {
      return [];
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'intakeRecords'),
      where('medicationId', '==', medicationId),
      where('scheduledTime', '>=', Timestamp.fromDate(startOfDay)),
      where('scheduledTime', '<=', Timestamp.fromDate(endOfDay)),
      where('status', '==', IntakeStatus.TAKEN)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data().scheduledTime.toDate());
  } catch (error) {
    console.error('[DoseCompletionTracker] Error getting completed doses:', error);
    return [];
  }
}
