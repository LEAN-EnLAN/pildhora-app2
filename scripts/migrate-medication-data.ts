/**
 * Data Migration Script for Medication Management Redesign
 * 
 * This script migrates existing medication and intake record data to support
 * the new medication management features:
 * - Adds default emoji (💊) to existing medications
 * - Sets trackInventory: false for all existing medications
 * - Generates completionToken for existing intake records
 * - Backfills deviceSource: 'manual' for existing intake records
 * - Tracks migration status to prevent duplicate runs
 * 
 * Requirements: 1.1, 7.5, 8.1
 */

import { getDbInstance, waitForFirebaseInitialization } from '../src/services/firebase';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  writeBatch,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { Medication, IntakeRecord } from '../src/types';

// Migration status tracking
interface MigrationStatus {
  id: string;
  migrationName: string;
  startedAt: Date | string;
  completedAt?: Date | string;
  status: 'in_progress' | 'completed' | 'failed';
  medicationsProcessed: number;
  intakeRecordsProcessed: number;
  errors: string[];
}

const MIGRATION_NAME = 'medication-redesign-v1';
const BATCH_SIZE = 500; // Firestore batch write limit

/**
 * Check if migration has already been run
 */
async function checkMigrationStatus(): Promise<MigrationStatus | null> {
  try {
    const db = await getDbInstance();
    if (!db) {
      throw new Error('Firestore database not available');
    }

    const migrationDoc = await getDoc(doc(db, 'migrations', MIGRATION_NAME));
    
    if (migrationDoc.exists()) {
      const data = migrationDoc.data() as MigrationStatus;
      return {
        ...data,
        id: migrationDoc.id
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Migration] Error checking migration status:', error);
    throw error;
  }
}

/**
 * Create or update migration status document
 */
async function updateMigrationStatus(status: Partial<MigrationStatus>): Promise<void> {
  try {
    const db = await getDbInstance();
    if (!db) {
      throw new Error('Firestore database not available');
    }

    await setDoc(
      doc(db, 'migrations', MIGRATION_NAME),
      {
        migrationName: MIGRATION_NAME,
        ...status,
        updatedAt: Timestamp.now()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('[Migration] Error updating migration status:', error);
    throw error;
  }
}

/**
 * Generate completion token for intake record
 */
function generateCompletionToken(medicationId: string, scheduledTime: Date | string): string {
  const timestamp = scheduledTime instanceof Date 
    ? scheduledTime.getTime() 
    : new Date(scheduledTime).getTime();
  return `${medicationId}-${timestamp}`;
}

/**
 * Migrate medications: add emoji and inventory tracking fields
 */
async function migrateMedications(): Promise<number> {
  console.log('[Migration] Starting medication migration...');
  
  const db = await getDbInstance();
  if (!db) {
    throw new Error('Firestore database not available');
  }

  const medicationsRef = collection(db, 'medications');
  const snapshot = await getDocs(medicationsRef);
  
  console.log(`[Migration] Found ${snapshot.size} medications to process`);
  
  let processedCount = 0;
  let batchCount = 0;
  let batch = writeBatch(db);

  for (const medicationDoc of snapshot.docs) {
    const medication = medicationDoc.data() as Medication;
    
    // Prepare updates
    const updates: Partial<Medication> = {};
    
    // Add default emoji if not present
    if (!medication.emoji) {
      updates.emoji = '💊';
    }
    
    // Set trackInventory to false if not present
    if (medication.trackInventory === undefined) {
      updates.trackInventory = false;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      batch.update(doc(db, 'medications', medicationDoc.id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      batchCount++;
      processedCount++;
      
      // Commit batch if we've reached the limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`[Migration] Committed batch of ${batchCount} medication updates`);
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
  }
  
  // Commit any remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`[Migration] Committed final batch of ${batchCount} medication updates`);
  }
  
  console.log(`[Migration] Completed medication migration: ${processedCount} medications updated`);
  return processedCount;
}

/**
 * Migrate intake records: add completionToken and deviceSource
 */
async function migrateIntakeRecords(): Promise<number> {
  console.log('[Migration] Starting intake records migration...');
  
  const db = await getDbInstance();
  if (!db) {
    throw new Error('Firestore database not available');
  }

  const intakeRecordsRef = collection(db, 'intakeRecords');
  const snapshot = await getDocs(intakeRecordsRef);
  
  console.log(`[Migration] Found ${snapshot.size} intake records to process`);
  
  let processedCount = 0;
  let batchCount = 0;
  let batch = writeBatch(db);

  for (const recordDoc of snapshot.docs) {
    const record = recordDoc.data() as IntakeRecord;
    
    // Prepare updates
    const updates: any = {};
    
    // Generate completionToken if not present
    if (!record.completionToken && record.medicationId && record.scheduledTime) {
      updates.completionToken = generateCompletionToken(
        record.medicationId,
        record.scheduledTime
      );
    }
    
    // Backfill deviceSource as 'manual' if not present
    if (!record.deviceSource) {
      updates.deviceSource = 'manual';
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      batch.update(doc(db, 'intakeRecords', recordDoc.id), updates);
      
      batchCount++;
      processedCount++;
      
      // Commit batch if we've reached the limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`[Migration] Committed batch of ${batchCount} intake record updates`);
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
  }
  
  // Commit any remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`[Migration] Committed final batch of ${batchCount} intake record updates`);
  }
  
  console.log(`[Migration] Completed intake records migration: ${processedCount} records updated`);
  return processedCount;
}

/**
 * Main migration function
 */
export async function runMigration(): Promise<void> {
  console.log('[Migration] Starting medication data migration...');
  console.log(`[Migration] Migration name: ${MIGRATION_NAME}`);
  
  try {
    // Wait for Firebase to initialize
    await waitForFirebaseInitialization();
    console.log('[Migration] Firebase initialized successfully');
    
    // Check if migration has already been run
    const existingStatus = await checkMigrationStatus();
    
    if (existingStatus && existingStatus.status === 'completed') {
      console.log('[Migration] Migration has already been completed');
      console.log(`[Migration] Completed at: ${existingStatus.completedAt}`);
      console.log(`[Migration] Medications processed: ${existingStatus.medicationsProcessed}`);
      console.log(`[Migration] Intake records processed: ${existingStatus.intakeRecordsProcessed}`);
      return;
    }
    
    if (existingStatus && existingStatus.status === 'in_progress') {
      console.log('[Migration] Migration is already in progress');
      console.log('[Migration] If this is an error, manually delete the migration document and try again');
      return;
    }
    
    // Create migration status document
    await updateMigrationStatus({
      status: 'in_progress',
      startedAt: new Date(),
      medicationsProcessed: 0,
      intakeRecordsProcessed: 0,
      errors: []
    });
    
    const errors: string[] = [];
    let medicationsProcessed = 0;
    let intakeRecordsProcessed = 0;
    
    // Migrate medications
    try {
      medicationsProcessed = await migrateMedications();
    } catch (error: any) {
      const errorMsg = `Medication migration failed: ${error.message}`;
      console.error(`[Migration] ${errorMsg}`);
      errors.push(errorMsg);
    }
    
    // Migrate intake records
    try {
      intakeRecordsProcessed = await migrateIntakeRecords();
    } catch (error: any) {
      const errorMsg = `Intake records migration failed: ${error.message}`;
      console.error(`[Migration] ${errorMsg}`);
      errors.push(errorMsg);
    }
    
    // Update migration status
    const finalStatus: Partial<MigrationStatus> = {
      status: errors.length > 0 ? 'failed' : 'completed',
      completedAt: new Date(),
      medicationsProcessed,
      intakeRecordsProcessed,
      errors
    };
    
    await updateMigrationStatus(finalStatus);
    
    console.log('[Migration] Migration completed');
    console.log(`[Migration] Status: ${finalStatus.status}`);
    console.log(`[Migration] Medications processed: ${medicationsProcessed}`);
    console.log(`[Migration] Intake records processed: ${intakeRecordsProcessed}`);
    
    if (errors.length > 0) {
      console.error('[Migration] Errors encountered:');
      errors.forEach(error => console.error(`  - ${error}`));
      throw new Error('Migration completed with errors');
    }
    
  } catch (error: any) {
    console.error('[Migration] Migration failed:', error);
    
    // Update migration status to failed
    try {
      await updateMigrationStatus({
        status: 'failed',
        completedAt: new Date(),
        errors: [error.message]
      });
    } catch (statusError) {
      console.error('[Migration] Failed to update migration status:', statusError);
    }
    
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('[Migration] Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Migration script failed:', error);
      process.exit(1);
    });
}
