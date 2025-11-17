/**
 * Test script for user onboarding migration
 * 
 * This script tests the migration logic with sample data to ensure it works correctly
 * before running on production data.
 * 
 * Usage: node scripts/test-user-migration.js
 */

// Load environment variables
require('dotenv').config();

// Import Firebase Admin SDK
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  try {
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

    console.log('[Test] Firebase Admin SDK initialized successfully');
    return {
      db: admin.firestore(),
      rtdb: admin.database()
    };
  } catch (error) {
    console.error('[Test] Failed to initialize Firebase:', error.message);
    throw error;
  }
}

/**
 * Test migration logic without actually updating data
 */
async function testMigration(db, rtdb) {
  console.log('[Test] Starting migration test...');
  
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  console.log(`[Test] Found ${snapshot.size} users to analyze`);
  
  const results = {
    total: 0,
    alreadyMigrated: 0,
    patientsWithDevices: 0,
    patientsWithoutDevices: 0,
    caregiversWithLinks: 0,
    caregiversWithoutLinks: 0,
    unknownRole: 0,
    errors: []
  };

  for (const userDoc of snapshot.docs) {
    const user = userDoc.data();
    const userId = userDoc.id;
    
    results.total++;
    
    // Check if already migrated
    if (user.onboardingComplete !== undefined) {
      results.alreadyMigrated++;
      console.log(`[Test] User ${userId} (${user.role}) already has onboarding fields`);
      continue;
    }
    
    try {
      // Determine what would happen in migration
      if (user.role === 'patient') {
        // Check for device in Firestore
        const devicesSnapshot = await db.collection('devices')
          .where('primaryPatientId', '==', userId)
          .limit(1)
          .get();
        
        const hasFirestoreDevice = !devicesSnapshot.empty;
        
        // Check for device in RTDB
        const rtdbDevicesSnapshot = await rtdb.ref(`users/${userId}/devices`).once('value');
        const rtdbDevices = rtdbDevicesSnapshot.val();
        const hasRtdbDevice = rtdbDevices && Object.keys(rtdbDevices).length > 0;
        
        const hasDevice = hasFirestoreDevice || hasRtdbDevice;
        
        if (hasDevice) {
          results.patientsWithDevices++;
          console.log(`[Test] Patient ${userId} has device - would mark onboarding complete`);
          console.log(`  - Firestore device: ${hasFirestoreDevice}`);
          console.log(`  - RTDB device: ${hasRtdbDevice}`);
        } else {
          results.patientsWithoutDevices++;
          console.log(`[Test] Patient ${userId} has no device - would need onboarding`);
        }
      } else if (user.role === 'caregiver') {
        // Check for device links
        const linksSnapshot = await db.collection('deviceLinks')
          .where('userId', '==', userId)
          .where('role', '==', 'caregiver')
          .where('status', '==', 'active')
          .limit(1)
          .get();
        
        const hasLinks = !linksSnapshot.empty;
        
        if (hasLinks) {
          results.caregiversWithLinks++;
          console.log(`[Test] Caregiver ${userId} has device links - would mark onboarding complete`);
        } else {
          results.caregiversWithoutLinks++;
          console.log(`[Test] Caregiver ${userId} has no device links - would need onboarding`);
        }
      } else {
        results.unknownRole++;
        console.log(`[Test] User ${userId} has unknown role: ${user.role} - would default to patient onboarding`);
      }
    } catch (error) {
      results.errors.push({
        userId,
        error: error.message
      });
      console.error(`[Test] Error processing user ${userId}:`, error.message);
    }
  }
  
  return results;
}

/**
 * Display test results
 */
function displayResults(results) {
  console.log('\n========================================');
  console.log('MIGRATION TEST RESULTS');
  console.log('========================================\n');
  
  console.log(`Total users: ${results.total}`);
  console.log(`Already migrated: ${results.alreadyMigrated}`);
  console.log(`Would be migrated: ${results.total - results.alreadyMigrated}\n`);
  
  console.log('Breakdown:');
  console.log(`  Patients with devices: ${results.patientsWithDevices} (onboarding complete)`);
  console.log(`  Patients without devices: ${results.patientsWithoutDevices} (needs onboarding)`);
  console.log(`  Caregivers with links: ${results.caregiversWithLinks} (onboarding complete)`);
  console.log(`  Caregivers without links: ${results.caregiversWithoutLinks} (needs onboarding)`);
  console.log(`  Unknown role: ${results.unknownRole} (default to patient onboarding)\n`);
  
  if (results.errors.length > 0) {
    console.log('Errors encountered:');
    results.errors.forEach(({ userId, error }) => {
      console.log(`  - User ${userId}: ${error}`);
    });
  } else {
    console.log('No errors encountered ✓');
  }
  
  console.log('\n========================================');
  console.log('TEST COMPLETE');
  console.log('========================================\n');
  
  if (results.errors.length === 0) {
    console.log('✓ Migration test passed successfully');
    console.log('✓ Ready to run actual migration with: node scripts/migrate-user-onboarding.js');
  } else {
    console.log('✗ Migration test encountered errors');
    console.log('✗ Please review and fix errors before running actual migration');
  }
}

/**
 * Main test function
 */
async function runTest() {
  console.log('[Test] Starting user onboarding migration test...\n');
  
  try {
    // Initialize Firebase
    const { db, rtdb } = initializeFirebase();
    
    // Run test
    const results = await testMigration(db, rtdb);
    
    // Display results
    displayResults(results);
    
    process.exit(results.errors.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('[Test] Test failed:', error);
    process.exit(1);
  }
}

// Run test
runTest();
