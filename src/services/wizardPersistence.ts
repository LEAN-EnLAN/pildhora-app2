/**
 * Wizard Persistence Service
 * 
 * Handles saving and restoring wizard progress to AsyncStorage.
 * Allows users to resume device provisioning if they exit the wizard.
 * 
 * Requirements: 11.5
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceProvisioningFormData } from '../components/patient/provisioning/DeviceProvisioningWizard';

const WIZARD_STORAGE_KEY = '@device_provisioning_wizard';
const WIZARD_TIMESTAMP_KEY = '@device_provisioning_wizard_timestamp';

/**
 * Wizard progress data stored in AsyncStorage
 */
export interface WizardProgress {
  currentStep: number;
  formData: DeviceProvisioningFormData;
  userId: string;
  timestamp: number;
}

/**
 * Wizard Persistence Service
 * 
 * Provides methods to save, restore, and clear wizard progress.
 */
export const wizardPersistenceService = {
  /**
   * Save wizard progress to AsyncStorage
   * 
   * @param progress - Current wizard state to save
   * @returns Promise that resolves when save is complete
   * 
   * @example
   * ```typescript
   * await wizardPersistenceService.saveProgress({
   *   currentStep: 2,
   *   formData: { deviceId: 'ABC123', ... },
   *   userId: 'user123',
   *   timestamp: Date.now()
   * });
   * ```
   */
  async saveProgress(progress: WizardProgress): Promise<void> {
    try {
      const progressData = JSON.stringify(progress);
      await AsyncStorage.setItem(WIZARD_STORAGE_KEY, progressData);
      await AsyncStorage.setItem(WIZARD_TIMESTAMP_KEY, progress.timestamp.toString());
      
      console.log('[WizardPersistence] Progress saved:', {
        step: progress.currentStep,
        userId: progress.userId,
        timestamp: new Date(progress.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('[WizardPersistence] Error saving progress:', error);
      throw new Error('Failed to save wizard progress');
    }
  },

  /**
   * Restore wizard progress from AsyncStorage
   * 
   * @param userId - User ID to verify the saved progress belongs to current user
   * @returns Saved wizard progress or null if none exists or expired
   * 
   * @example
   * ```typescript
   * const progress = await wizardPersistenceService.restoreProgress('user123');
   * if (progress) {
   *   // Resume from saved step
   *   setCurrentStep(progress.currentStep);
   *   setFormData(progress.formData);
   * }
   * ```
   */
  async restoreProgress(userId: string): Promise<WizardProgress | null> {
    try {
      const progressData = await AsyncStorage.getItem(WIZARD_STORAGE_KEY);
      
      if (!progressData) {
        console.log('[WizardPersistence] No saved progress found');
        return null;
      }

      const progress: WizardProgress = JSON.parse(progressData);

      // Verify the progress belongs to the current user
      if (progress.userId !== userId) {
        console.log('[WizardPersistence] Saved progress belongs to different user, clearing');
        await this.clearProgress();
        return null;
      }

      // Check if progress is expired (older than 7 days)
      const EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      const age = Date.now() - progress.timestamp;
      
      if (age > EXPIRATION_TIME) {
        console.log('[WizardPersistence] Saved progress expired, clearing');
        await this.clearProgress();
        return null;
      }

      console.log('[WizardPersistence] Progress restored:', {
        step: progress.currentStep,
        userId: progress.userId,
        age: Math.round(age / (60 * 60 * 1000)) + ' hours',
      });

      return progress;
    } catch (error) {
      console.error('[WizardPersistence] Error restoring progress:', error);
      return null;
    }
  },

  /**
   * Clear wizard progress from AsyncStorage
   * 
   * Should be called when:
   * - Wizard is completed successfully
   * - User explicitly cancels the wizard
   * - Progress is expired or invalid
   * 
   * @returns Promise that resolves when clear is complete
   * 
   * @example
   * ```typescript
   * // On wizard completion
   * await wizardPersistenceService.clearProgress();
   * ```
   */
  async clearProgress(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([WIZARD_STORAGE_KEY, WIZARD_TIMESTAMP_KEY]);
      console.log('[WizardPersistence] Progress cleared');
    } catch (error) {
      console.error('[WizardPersistence] Error clearing progress:', error);
      throw new Error('Failed to clear wizard progress');
    }
  },

  /**
   * Check if there is saved wizard progress
   * 
   * @param userId - User ID to check for saved progress
   * @returns True if valid progress exists for the user
   * 
   * @example
   * ```typescript
   * const hasProgress = await wizardPersistenceService.hasProgress('user123');
   * if (hasProgress) {
   *   // Show "Continue Setup" prompt
   * }
   * ```
   */
  async hasProgress(userId: string): Promise<boolean> {
    try {
      const progress = await this.restoreProgress(userId);
      return progress !== null;
    } catch (error) {
      console.error('[WizardPersistence] Error checking progress:', error);
      return false;
    }
  },

  /**
   * Get the age of saved progress in milliseconds
   * 
   * @returns Age in milliseconds or null if no progress exists
   * 
   * @example
   * ```typescript
   * const age = await wizardPersistenceService.getProgressAge();
   * if (age && age < 24 * 60 * 60 * 1000) {
   *   // Progress is less than 24 hours old
   * }
   * ```
   */
  async getProgressAge(): Promise<number | null> {
    try {
      const timestampStr = await AsyncStorage.getItem(WIZARD_TIMESTAMP_KEY);
      
      if (!timestampStr) {
        return null;
      }

      const timestamp = parseInt(timestampStr, 10);
      return Date.now() - timestamp;
    } catch (error) {
      console.error('[WizardPersistence] Error getting progress age:', error);
      return null;
    }
  },
};
