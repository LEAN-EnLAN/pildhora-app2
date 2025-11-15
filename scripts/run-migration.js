/**
 * Node.js executable script to run the medication data migration
 * 
 * Usage: node scripts/run-migration.js
 */

// Load environment variables
require('dotenv').config();

// Import Firebase Admin SDK for server-side operations
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Migration configuration
const MIGRATION_NAME = 'medication-redesign-v1';
const BATCH_SIZE = 500;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    // Check if service account key exists
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(
        'Service account key not found. Please download it from Firebase Console ' +
        'and save it as serviceAccountKey.json in the project root.'
      );
    }

    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 
                   `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
    });

    console.log('[Migration] Firebase Admin SDK initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('[Migration] Failed to initialize Firebase:', error.message);
    throw error;
  }
}

/**
 * Generate completion token for intake record
 */
function generateCompletionToken(medicationId, scheduledTime) {
  const timestamp = scheduledTime instanceof Date 
    ? scheduledTime.getTime() 
    : new Date(scheduledTime.toDate()).getTime();
  return `${medicationId}-${timestamp}`;
}

/**
 * Check if migration has already been run
 */
async function checkMigrationStatus(db) {
  try {
    const migrationDoc = await db.collection('migrations').doc(MIGRATION_NAME).get();
    
    if (migrationDoc.exists) {
      return {
        id: migrationDoc.id,
        ...migrationDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Migration] Error checking migration status:', error);
    throw error;
  }
}

/**
 * Update migration status document
 */
async function updateMigrationStatus(db, status) {
  try {
    await db.collection('migrations').doc(MIGRATION_NAME).set(
      {
        migrationName: MIGRATION_NAME,
        ...status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('[Migration] Error updating migration status:', error);
    throw error;
  }
}

/**
 * Migrate medications: add emoji and inventory tracking fields
 */
async function migrateMedications(db) {
  console.log('[Migration] Starting medication migration...');
  
  const medicationsRef = db.collection('medications');
  const snapshot = await medicationsRef.get();
  
  console.log(`[Migration] Found ${snapshot.size} medications to process`);
  
  let processedCount = 0;
  let batchCount = 0;
  let batch = db.batch();

  for (const medicationDoc of snapshot.docs) {
    const medication = medicationDoc.data();
    
    // Prepare updates
    const updates = {};
    
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
      batch.update(medicationDoc.ref, {
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      batchCount++;
      processedCount++;
      
      // Commit batch if we've reached the limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`[Migration] Committed batch of ${batchCount} medication updates`);
        batch = db.batch();
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
async function migrateIntakeRecords(db) {
  console.log('[Migration] Starting intake records migration...');
  
  const intakeRecordsRef = db.collection('intakeRecords');
  const snapshot = await intakeRecordsRef.get();
  
  console.log(`[Migration] Found ${snapshot.size} intake records to process`);
  
  let processedCount = 0;
  let batchCount = 0;
  let batch = db.batch();

  for (const recordDoc of snapshot.docs) {
    const record = recordDoc.data();
    
    // Prepare updates
    const updates = {};
    
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
      batch.update(recordDoc.ref, updates);
      
      batchCount++;
      processedCount++;
      
      // Commit batch if we've reached the limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`[Migration] Committed batch of ${batchCount} intake record updates`);
        batch = db.batch();
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
async function runMigration() {
  console.log('[Migration] Starting medication data migration...');
  console.log(`[Migration] Migration name: ${MIGRATION_NAME}`);
  
  let db;
  
  try {
    // Initialize Firebase
    db = initializeFirebase();
    
    // Check if migration has already been run
    const existingStatus = await checkMigrationStatus(db);
    
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
    await updateMigrationStatus(db, {
      status: 'in_progress',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      medicationsProcessed: 0,
      intakeRecordsProcessed: 0,
      errors: []
    });
    
    const errors = [];
    let medicationsProcessed = 0;
    let intakeRecordsProcessed = 0;
    
    // Migrate medications
    try {
      medicationsProcessed = await migrateMedications(db);
    } catch (error) {
      const errorMsg = `Medication migration failed: ${error.message}`;
      console.error(`[Migration] ${errorMsg}`);
      errors.push(errorMsg);
    }
    
    // Migrate intake records
    try {
      intakeRecordsProcessed = await migrateIntakeRecords(db);
    } catch (error) {
      const errorMsg = `Intake records migration failed: ${error.message}`;
      console.error(`[Migration] ${errorMsg}`);
      errors.push(errorMsg);
    }
    
    // Update migration status
    const finalStatus = {
      status: errors.length > 0 ? 'failed' : 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      medicationsProcessed,
      intakeRecordsProcessed,
      errors
    };
    
    await updateMigrationStatus(db, finalStatus);
    
    console.log('[Migration] Migration completed');
    console.log(`[Migration] Status: ${finalStatus.status}`);
    console.log(`[Migration] Medications processed: ${medicationsProcessed}`);
    console.log(`[Migration] Intake records processed: ${intakeRecordsProcessed}`);
    
    if (errors.length > 0) {
      console.error('[Migration] Errors encountered:');
      errors.forEach(error => console.error(`  - ${error}`));
      throw new Error('Migration completed with errors');
    }
    
  } catch (error) {
    console.error('[Migration] Migration failed:', error);
    
    // Update migration status to failed
    if (db) {
      try {
        await updateMigrationStatus(db, {
          status: 'failed',
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          errors: [error.message]
        });
      } catch (statusError) {
        console.error('[Migration] Failed to update migration status:', statusError);
      }
    }
    
    throw error;
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('[Migration] Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Migration] Migration script failed:', error);
    process.exit(1);
  });
