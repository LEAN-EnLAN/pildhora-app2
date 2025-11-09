const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, writeBatch, doc, deleteDoc, getDoc } = require('firebase/firestore');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Admin SDK for service account access
let adminDb = null;
try {
  const serviceAccount = require('../serviceAccountKey.json');
  const adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  adminDb = admin.firestore();
  console.log('✅ Firebase Admin SDK initialized with service account');
} catch (error) {
  console.warn('⚠️ Could not initialize Firebase Admin SDK:', error.message);
  console.log('⚠️ Falling back to client SDK - some operations may be limited');
}

// Configuration for what to clean
const CLEANUP_CONFIG = {
  medications: true,
  intakeRecords: true,
  tasks: true,
  backup: true,
  dryRun: false
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Firestore Cleanup Script

Usage: node clean-firestore-data.js [options]

Options:
  --no-medications    Skip cleaning medications
  --no-intake-records Skip cleaning intake records
  --no-tasks          Skip cleaning tasks
  --no-backup         Skip creating backup
  --dry-run           Show what would be deleted without actually deleting
  --confirm          Skip confirmation prompt (DANGEROUS)
  --help, -h          Show this help message

Examples:
  node clean-firestore-data.js                    # Clean all with confirmation
  node clean-firestore-data.js --dry-run          # Preview what would be deleted
  node clean-firestore-data.js --no-backup         # Clean without backup
  node clean-firestore-data.js --confirm          # Clean without confirmation
    `);
    process.exit(0);
  }
  
  if (args.includes('--dry-run')) {
    CLEANUP_CONFIG.dryRun = true;
    console.log('🔍 DRY RUN MODE - No data will actually be deleted');
  }
  
  if (args.includes('--no-medications')) {
    CLEANUP_CONFIG.medications = false;
  }
  
  if (args.includes('--no-intake-records')) {
    CLEANUP_CONFIG.intakeRecords = false;
  }
  
  if (args.includes('--no-tasks')) {
    CLEANUP_CONFIG.tasks = false;
  }
  
  if (args.includes('--no-backup')) {
    CLEANUP_CONFIG.backup = false;
  }
  
  return args.includes('--confirm');
}

// Create backup of data before deletion
async function createBackup() {
  if (!CLEANUP_CONFIG.backup) {
    console.log('⏭️ Skipping backup');
    return;
  }
  
  console.log('💾 Creating backup...');
  const backupDir = path.join(__dirname, '../backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `firestore-backup-${timestamp}.json`);
  
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backup = {
    timestamp: new Date().toISOString(),
    collections: {}
  };
  
  try {
    // Backup medications
    if (CLEANUP_CONFIG.medications) {
      const medQuery = query(collection(db, 'medications'));
      const medSnapshot = await getDocs(medQuery);
      backup.collections.medications = medSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`💾 Backed up ${backup.collections.medications.length} medication records`);
    }
    
    // Backup intake records
    if (CLEANUP_CONFIG.intakeRecords) {
      const intakeQuery = query(collection(db, 'intakeRecords'));
      const intakeSnapshot = await getDocs(intakeQuery);
      backup.collections.intakeRecords = intakeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`💾 Backed up ${backup.collections.intakeRecords.length} intake records`);
    }
    
    // Backup tasks
    if (CLEANUP_CONFIG.tasks) {
      const taskQuery = query(collection(db, 'tasks'));
      const taskSnapshot = await getDocs(taskQuery);
      backup.collections.tasks = taskSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`💾 Backed up ${backup.collections.tasks.length} task records`);
    }
    
    // Write backup to file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup saved to: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

// Delete documents in batches
async function deleteCollectionBatch(collectionName, batchSize = 500) {
  console.log(`🗑️ Cleaning ${collectionName}...`);
  
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    if (snapshot.size === 0) {
      console.log(`ℹ️ No ${collectionName} found`);
      return { deleted: 0 };
    }
    
    if (CLEANUP_CONFIG.dryRun) {
      console.log(`🔍 DRY RUN: Would delete ${snapshot.size} ${collectionName}`);
      return { deleted: snapshot.size };
    }
    
    let deletedCount = 0;
    let batchIndex = 0;
    
    while (deletedCount < snapshot.size) {
      const batch = writeBatch(db);
      const batchDocs = snapshot.docs.slice(deletedCount, deletedCount + batchSize);
      
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      deletedCount += batchDocs.length;
      batchIndex++;
      
      console.log(`📦 Batch ${batchIndex}: Deleted ${batchDocs.length} ${collectionName} (${deletedCount}/${snapshot.size})`);
    }
    
    console.log(`✅ Deleted ${deletedCount} ${collectionName}`);
    return { deleted: deletedCount };
    
  } catch (error) {
    console.error(`❌ Error cleaning ${collectionName}:`, error);
    throw error;
  }
}

// Verify what data exists before deletion
async function verifyDataExists() {
  console.log('🔍 Verifying data exists before cleanup...');
  
  const collections = [];
  
  if (CLEANUP_CONFIG.medications) {
    const medQuery = query(collection(db, 'medications'));
    const medSnapshot = await getDocs(medQuery);
    if (medSnapshot.size > 0) {
      collections.push({ name: 'medications', count: medSnapshot.size });
    }
  }
  
  if (CLEANUP_CONFIG.intakeRecords) {
    const intakeQuery = query(collection(db, 'intakeRecords'));
    const intakeSnapshot = await getDocs(intakeQuery);
    if (intakeSnapshot.size > 0) {
      collections.push({ name: 'intakeRecords', count: intakeSnapshot.size });
    }
  }
  
  if (CLEANUP_CONFIG.tasks) {
    const taskQuery = query(collection(db, 'tasks'));
    const taskSnapshot = await getDocs(taskQuery);
    if (taskSnapshot.size > 0) {
      collections.push({ name: 'tasks', count: taskSnapshot.size });
    }
  }
  
  if (collections.length === 0) {
    console.log('ℹ️ No data found to clean');
    return false;
  }
  
  console.log('\n📊 Found the following data to clean:');
  collections.forEach(col => {
    console.log(`  - ${col.name}: ${col.count} documents`);
  });
  
  return true;
}

// Prompt user for confirmation
async function promptConfirmation() {
  return new Promise((resolve) => {
    rl.question('\n⚠️  WARNING: This will permanently delete all medication-related data. Are you sure you want to continue? (type "DELETE" to confirm): ', (answer) => {
      if (answer === 'DELETE') {
        resolve(true);
      } else {
        console.log('❌ Cleanup cancelled by user');
        resolve(false);
      }
      rl.close();
    });
  });
}

// Main cleanup function
async function cleanFirestoreData() {
  console.log('🧹 Starting Firestore cleanup...');
  console.log('🔧 Configuration:', CLEANUP_CONFIG);
  
  try {
    // Verify data exists
    const hasData = await verifyDataExists();
    if (!hasData) {
      console.log('ℹ️ No data to clean. Exiting...');
      return;
    }
    
    // Create backup if enabled
    if (CLEANUP_CONFIG.backup && !CLEANUP_CONFIG.dryRun) {
      await createBackup();
    }
    
    // Show summary of what will be deleted
    console.log('\n📋 Summary of cleanup operations:');
    if (CLEANUP_CONFIG.medications) console.log('  - All medication records');
    if (CLEANUP_CONFIG.intakeRecords) console.log('  - All intake history records');
    if (CLEANUP_CONFIG.tasks) console.log('  - All task records');
    
    // Perform cleanup
    const results = {};
    
    if (CLEANUP_CONFIG.medications) {
      results.medications = await deleteCollectionBatch('medications');
    }
    
    if (CLEANUP_CONFIG.intakeRecords) {
      results.intakeRecords = await deleteCollectionBatch('intakeRecords');
    }
    
    if (CLEANUP_CONFIG.tasks) {
      results.tasks = await deleteCollectionBatch('tasks');
    }
    
    // Show results
    console.log('\n📊 Cleanup Results:');
    Object.entries(results).forEach(([collection, result]) => {
      if (CLEANUP_CONFIG.dryRun) {
        console.log(`  - ${collection}: Would delete ${result.deleted} documents`);
      } else {
        console.log(`  - ${collection}: Deleted ${result.deleted} documents`);
      }
    });
    
    if (!CLEANUP_CONFIG.dryRun) {
      console.log('\n🎉 Firestore cleanup completed successfully!');
    } else {
      console.log('\n🔍 DRY RUN completed - No data was actually deleted');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run cleanup
async function main() {
  try {
    const skipConfirmation = parseArgs();
    
    if (!skipConfirmation && !CLEANUP_CONFIG.dryRun) {
      const confirmed = await promptConfirmation();
      if (!confirmed) {
        process.exit(0);
      }
    }
    
    await cleanFirestoreData();
    
    if (!CLEANUP_CONFIG.dryRun) {
      console.log('🏁 Cleanup script finished successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Cleanup script failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();