/**
 * User Onboarding Migration Script
 * 
 * This script migrates existing user documents to support the new onboarding system:
 * - Adds onboardingComplete field to all existing users
 * - Sets onboardingComplete=true for users with devices (patients) or device links (caregivers)
 * - Sets onboardingComplete=false for users without devices/links
 * - Adds onboardingStep field where appropriate
 * - Tracks migration status to prevent duplicate runs
 * 
 * Requirements: 9.1, 9.2, 9.3
 */

// Load environment variables
require('dotenv').config();

// Import Firebase Admin SDK for server-side operations
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Migration configuration
const MIGRATION_NAME = 'user-onboarding-v1';
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
    return {
      db: admin.firestore(),
      rtdb: admin.database()
    };
  } catch (error) {
    console.error('[Migration] Failed to initialize Firebase:', error.message);
    throw error;
  }
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
 * Check if a patient user has a device
 */
async function hasDevice(db, rtdb, userId) {
  try {
    // Check Firestore devices collection
    const devicesSnapshot = await db.collection('devices')
      .where('primaryPatientId', '==', userId)
      .limit(1)
      .get();
    
    if (!devicesSnapshot.empty) {
      return true;
    }
    
    // Check RTDB users/{userId}/devices
    const rtdbDevicesSnapshot = await rtdb.ref(`users/${userId}/devices`).once('value');
    const rtdbDevices = rtdbDevicesSnapshot.val();
    
    if (rtdbDevices && Object.keys(rtdbDevices).length > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`[Migration] Error checking device for user ${userId}:`, error);
    return false;
  }
}

/**
 * Check if a caregiver user has device links
 */
async function hasDeviceLinks(db, userId) {
  try {
    // Check deviceLinks collection for this caregiver
    const linksSnapshot = await db.collection('deviceLinks')
      .where('userId', '==', userId)
      .where('role', '==', 'caregiver')
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    return !linksSnapshot.empty;
  } catch (error) {
    console.error(`[Migration] Error checking device links for user ${userId}:`, error);
    return false;
  }
}

/**
 * Migrate user documents: add onboarding fields
 */
async function migrateUsers(db, rtdb) {
  console.log('[Migration] Starting user migration...');
  
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  console.log(`[Migration] Found ${snapshot.size} users to process`);
  
  let processedCount = 0;
  let patientsWithDevices = 0;
  let patientsWithoutDevices = 0;
  let caregiversWithLinks = 0;
  let caregiversWithoutLinks = 0;
  let unknownRole = 0;
  let batchCount = 0;
  let batch = db.batch();

  for (const userDoc of snapshot.docs) {
    const user = userDoc.data();
    const userId = userDoc.id;
    
    // Skip if onboarding fields already exist
    if (user.onboardingComplete !== undefined) {
      console.log(`[Migration] User ${userId} already has onboarding fields, skipping`);
      continue;
    }
    
    // Prepare updates
    const updates = {};
    
    // Determine onboarding status based on role
    if (user.role === 'patient') {
      const deviceExists = await hasDevice(db, rtdb, userId);
      
      if (deviceExists) {
        // Patient has a device - onboarding complete
        updates.onboardingComplete = true;
        updates.onboardingStep = 'complete';
        patientsWithDevices++;
        console.log(`[Migration] Patient ${userId} has device - marking onboarding complete`);
      } else {
        // Patient has no device - needs onboarding
        updates.onboardingComplete = false;
        updates.onboardingStep = 'device_provisioning';
        patientsWithoutDevices++;
        console.log(`[Migration] Patient ${userId} has no device - needs onboarding`);
      }
    } else if (user.role === 'caregiver') {
      const linksExist = await hasDeviceLinks(db, userId);
      
      if (linksExist) {
        // Caregiver has device links - onboarding complete
        updates.onboardingComplete = true;
        updates.onboardingStep = 'complete';
        caregiversWithLinks++;
        console.log(`[Migration] Caregiver ${userId} has device links - marking onboarding complete`);
      } else {
        // Caregiver has no links - needs onboarding
        updates.onboardingComplete = false;
        updates.onboardingStep = 'device_connection';
        caregiversWithoutLinks++;
        console.log(`[Migration] Caregiver ${userId} has no device links - needs onboarding`);
      }
    } else {
      // Unknown role - default to needs onboarding as patient
      updates.onboardingComplete = false;
      updates.onboardingStep = 'device_provisioning';
      unknownRole++;
      console.log(`[Migration] User ${userId} has unknown role - defaulting to patient onboarding`);
    }
    
    // Add updates to batch
    batch.update(userDoc.ref, {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    batchCount++;
    processedCount++;
    
    // Commit batch if we've reached the limit
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`[Migration] Committed batch of ${batchCount} user updates`);
      batch = db.batch();
      batchCount = 0;
    }
  }
  
  // Commit any remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`[Migration] Committed final batch of ${batchCount} user updates`);
  }
  
  console.log('[Migration] Completed user migration');
  console.log(`[Migration] Total users processed: ${processedCount}`);
  console.log(`[Migration] Patients with devices: ${patientsWithDevices}`);
  console.log(`[Migration] Patients without devices: ${patientsWithoutDevices}`);
  console.log(`[Migration] Caregivers with links: ${caregiversWithLinks}`);
  console.log(`[Migration] Caregivers without links: ${caregiversWithoutLinks}`);
  console.log(`[Migration] Unknown role: ${unknownRole}`);
  
  return {
    total: processedCount,
    patientsWithDevices,
    patientsWithoutDevices,
    caregiversWithLinks,
    caregiversWithoutLinks,
    unknownRole
  };
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('[Migration] Starting user onboarding migration...');
  console.log(`[Migration] Migration name: ${MIGRATION_NAME}`);
  
  let db, rtdb;
  
  try {
    // Initialize Firebase
    const firebase = initializeFirebase();
    db = firebase.db;
    rtdb = firebase.rtdb;
    
    // Check if migration has already been run
    const existingStatus = await checkMigrationStatus(db);
    
    if (existingStatus && existingStatus.status === 'completed') {
      console.log('[Migration] Migration has already been completed');
      console.log(`[Migration] Completed at: ${existingStatus.completedAt}`);
      console.log(`[Migration] Users processed: ${existingStatus.usersProcessed}`);
      console.log(`[Migration] Details:`, existingStatus.details);
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
      usersProcessed: 0,
      errors: []
    });
    
    const errors = [];
    let migrationResults = null;
    
    // Migrate users
    try {
      migrationResults = await migrateUsers(db, rtdb);
    } catch (error) {
      const errorMsg = `User migration failed: ${error.message}`;
      console.error(`[Migration] ${errorMsg}`);
      errors.push(errorMsg);
    }
    
    // Update migration status
    const finalStatus = {
      status: errors.length > 0 ? 'failed' : 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      usersProcessed: migrationResults ? migrationResults.total : 0,
      details: migrationResults || {},
      errors
    };
    
    await updateMigrationStatus(db, finalStatus);
    
    console.log('[Migration] Migration completed');
    console.log(`[Migration] Status: ${finalStatus.status}`);
    console.log(`[Migration] Users processed: ${finalStatus.usersProcessed}`);
    
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
