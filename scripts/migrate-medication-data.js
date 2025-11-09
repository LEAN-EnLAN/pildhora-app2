const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, writeBatch, doc, setDoc, getDoc } = require('firebase/firestore');
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

// Migration configuration
const MIGRATION_CONFIG = {
  backup: true,
  dryRun: false,
  validateOnly: false,
  sourceFile: null,
  targetCollections: ['medications', 'intakeRecords', 'tasks']
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Medication Data Migration Script

Usage: node migrate-medication-data.js [options]

Options:
  --backup-file <path>    Restore from a specific backup file
  --no-backup             Skip creating backup before migration
  --dry-run               Show what would be migrated without actually migrating
  --validate-only         Only validate data structure without migrating
  --collections <list>    Comma-separated list of collections to migrate
  --confirm               Skip confirmation prompt (DANGEROUS)
  --help, -h              Show this help message

Examples:
  node migrate-medication-data.js                           # Interactive migration
  node migrate-medication-data.js --dry-run                 # Preview migration
  node migrate-medication-data.js --backup-file backup.json # Restore from backup
  node migrate-medication-data.js --validate-only           # Validate data only
    `);
    process.exit(0);
  }
  
  if (args.includes('--dry-run')) {
    MIGRATION_CONFIG.dryRun = true;
    console.log('🔍 DRY RUN MODE - No data will actually be migrated');
  }
  
  if (args.includes('--no-backup')) {
    MIGRATION_CONFIG.backup = false;
  }
  
  if (args.includes('--validate-only')) {
    MIGRATION_CONFIG.validateOnly = true;
    console.log('🔍 VALIDATION MODE - Only validating data structure');
  }
  
  const backupFileIndex = args.indexOf('--backup-file');
  if (backupFileIndex !== -1 && args[backupFileIndex + 1]) {
    MIGRATION_CONFIG.sourceFile = args[backupFileIndex + 1];
  }
  
  const collectionsIndex = args.indexOf('--collections');
  if (collectionsIndex !== -1 && args[collectionsIndex + 1]) {
    MIGRATION_CONFIG.targetCollections = args[collectionsIndex + 1].split(',');
  }
  
  return args.includes('--confirm');
}

// Create backup before migration
async function createBackup() {
  if (!MIGRATION_CONFIG.backup) {
    console.log('⏭️ Skipping backup');
    return null;
  }
  
  console.log('💾 Creating backup before migration...');
  const backupDir = path.join(__dirname, '../backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `pre-migration-backup-${timestamp}.json`);
  
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backup = {
    timestamp: new Date().toISOString(),
    type: 'pre-migration',
    collections: {}
  };
  
  try {
    for (const collectionName of MIGRATION_CONFIG.targetCollections) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      backup.collections[collectionName] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`💾 Backed up ${backup.collections[collectionName].length} ${collectionName} records`);
    }
    
    // Write backup to file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup saved to: ${backupPath}`);
    return backupPath;
    
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

// Load data from backup file
async function loadBackupFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file not found: ${filePath}`);
    }
    
    console.log(`📂 Loading backup from: ${filePath}`);
    const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!backupData.collections) {
      throw new Error('Invalid backup file format - missing collections');
    }
    
    console.log(`✅ Loaded backup from ${backupData.timestamp}`);
    return backupData;
    
  } catch (error) {
    console.error('❌ Error loading backup file:', error);
    throw error;
  }
}

// Validate medication data structure
function validateMedicationData(medication) {
  const requiredFields = ['name', 'patientId', 'caregiverId'];
  const missingFields = requiredFields.filter(field => !medication[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    };
  }
  
  // Check for new medication structure
  const hasNewStructure = medication.doseValue && medication.doseUnit && medication.quantityType;
  const hasLegacyStructure = medication.dosage;
  
  if (!hasNewStructure && !hasLegacyStructure) {
    return {
      isValid: false,
      missingFields: ['dose information'],
      errors: ['Medication must have either new structure (doseValue, doseUnit, quantityType) or legacy dosage field']
    };
  }
  
  return {
    isValid: true,
    missingFields: [],
    errors: []
  };
}

// Validate intake record data structure
function validateIntakeRecordData(intake) {
  const requiredFields = ['medicationName', 'patientId', 'scheduledTime', 'status'];
  const missingFields = requiredFields.filter(field => !intake[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    };
  }
  
  const validStatuses = ['pending', 'taken', 'missed'];
  if (!validStatuses.includes(intake.status)) {
    return {
      isValid: false,
      missingFields: [],
      errors: [`Invalid status: ${intake.status}. Must be one of: ${validStatuses.join(', ')}`]
    };
  }
  
  return {
    isValid: true,
    missingFields: [],
    errors: []
  };
}

// Validate task data structure
function validateTaskData(task) {
  const requiredFields = ['title', 'patientId', 'caregiverId'];
  const missingFields = requiredFields.filter(field => !task[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    };
  }
  
  return {
    isValid: true,
    missingFields: [],
    errors: []
  };
}

// Validate all data in a collection
async function validateCollection(collectionName, documents) {
  console.log(`🔍 Validating ${collectionName}...`);
  
  const validationResults = {
    valid: 0,
    invalid: 0,
    errors: []
  };
  
  for (const doc of documents) {
    let validation;
    
    switch (collectionName) {
      case 'medications':
        validation = validateMedicationData(doc);
        break;
      case 'intakeRecords':
        validation = validateIntakeRecordData(doc);
        break;
      case 'tasks':
        validation = validateTaskData(doc);
        break;
      default:
        validation = { isValid: true, missingFields: [], errors: [] };
    }
    
    if (validation.isValid) {
      validationResults.valid++;
    } else {
      validationResults.invalid++;
      validationResults.errors.push({
        documentId: doc.id,
        errors: validation.errors
      });
    }
  }
  
  console.log(`✅ ${collectionName}: ${validationResults.valid} valid, ${validationResults.invalid} invalid`);
  
  if (validationResults.invalid > 0) {
    console.log(`❌ Validation errors in ${collectionName}:`);
    validationResults.errors.slice(0, 5).forEach(error => {
      console.log(`  - Document ${error.documentId}: ${error.errors.join(', ')}`);
    });
    if (validationResults.errors.length > 5) {
      console.log(`  ... and ${validationResults.errors.length - 5} more errors`);
    }
  }
  
  return validationResults;
}

// Migrate collection data
async function migrateCollection(collectionName, documents) {
  console.log(`📦 Migrating ${collectionName}...`);
  
  if (MIGRATION_CONFIG.dryRun) {
    console.log(`🔍 DRY RUN: Would migrate ${documents.length} ${collectionName}`);
    return { migrated: documents.length, errors: [] };
  }
  
  const results = {
    migrated: 0,
    errors: []
  };
  
  // Process in batches
  const batchSize = 500;
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const batchIndex = Math.floor(i / batchSize) + 1;
    
    console.log(`📦 Processing batch ${batchIndex} (${batch.length} documents)...`);
    
    for (const doc of batch) {
      try {
        const docRef = doc(db, collectionName, doc.id);
        await setDoc(docRef, doc, { merge: true });
        results.migrated++;
      } catch (error) {
        results.errors.push({
          documentId: doc.id,
          error: error.message
        });
        console.error(`❌ Error migrating document ${doc.id}:`, error.message);
      }
    }
  }
  
  console.log(`✅ ${collectionName}: ${results.migrated} migrated, ${results.errors.length} errors`);
  return results;
}

// Main migration function
async function migrateMedicationData() {
  console.log('🚀 Starting medication data migration...');
  console.log('🔧 Configuration:', MIGRATION_CONFIG);
  
  try {
    let dataToMigrate = null;
    
    // Load data from backup file if specified
    if (MIGRATION_CONFIG.sourceFile) {
      dataToMigrate = await loadBackupFile(MIGRATION_CONFIG.sourceFile);
    } else {
      // Load current data from Firestore
      console.log('📂 Loading current data from Firestore...');
      dataToMigrate = {
        timestamp: new Date().toISOString(),
        type: 'current-data',
        collections: {}
      };
      
      for (const collectionName of MIGRATION_CONFIG.targetCollections) {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        dataToMigrate.collections[collectionName] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`📂 Loaded ${dataToMigrate.collections[collectionName].length} ${collectionName} records`);
      }
    }
    
    // Validate data
    console.log('\n🔍 Validating data structure...');
    const validationResults = {};
    
    for (const collectionName of MIGRATION_CONFIG.targetCollections) {
      if (dataToMigrate.collections[collectionName]) {
        validationResults[collectionName] = await validateCollection(
          collectionName, 
          dataToMigrate.collections[collectionName]
        );
      }
    }
    
    // Check if validation failed
    const totalInvalid = Object.values(validationResults).reduce((sum, result) => sum + result.invalid, 0);
    if (totalInvalid > 0 && !MIGRATION_CONFIG.dryRun) {
      console.log(`\n⚠️ Found ${totalInvalid} invalid documents. Continue with migration? (y/N):`);
      const continueMigration = await new Promise(resolve => {
        rl.question('', (answer) => {
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
      });
      
      if (!continueMigration) {
        console.log('❌ Migration cancelled due to validation errors');
        return;
      }
    }
    
    // If validation only mode, exit here
    if (MIGRATION_CONFIG.validateOnly) {
      console.log('\n✅ Validation completed');
      return;
    }
    
    // Create backup before migration
    if (!MIGRATION_CONFIG.sourceFile && MIGRATION_CONFIG.backup && !MIGRATION_CONFIG.dryRun) {
      await createBackup();
    }
    
    // Perform migration
    console.log('\n📋 Starting migration...');
    const migrationResults = {};
    
    for (const collectionName of MIGRATION_CONFIG.targetCollections) {
      if (dataToMigrate.collections[collectionName]) {
        migrationResults[collectionName] = await migrateCollection(
          collectionName,
          dataToMigrate.collections[collectionName]
        );
      }
    }
    
    // Show results
    console.log('\n📊 Migration Results:');
    Object.entries(migrationResults).forEach(([collection, result]) => {
      if (MIGRATION_CONFIG.dryRun) {
        console.log(`  - ${collection}: Would migrate ${result.migrated} documents`);
      } else {
        console.log(`  - ${collection}: ${result.migrated} migrated, ${result.errors.length} errors`);
      }
    });
    
    if (!MIGRATION_CONFIG.dryRun) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n🔍 DRY RUN completed - No data was actually migrated');
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

// Prompt user for confirmation
async function promptConfirmation() {
  return new Promise((resolve) => {
    rl.question('\n⚠️  WARNING: This will migrate medication data. Are you sure you want to continue? (type "MIGRATE" to confirm): ', (answer) => {
      if (answer === 'MIGRATE') {
        resolve(true);
      } else {
        console.log('❌ Migration cancelled by user');
        resolve(false);
      }
      rl.close();
    });
  });
}

// Main function
async function main() {
  try {
    const skipConfirmation = parseArgs();
    
    if (!skipConfirmation && !MIGRATION_CONFIG.dryRun && !MIGRATION_CONFIG.validateOnly) {
      const confirmed = await promptConfirmation();
      if (!confirmed) {
        process.exit(0);
      }
    }
    
    await migrateMedicationData();
    
    if (!MIGRATION_CONFIG.dryRun && !MIGRATION_CONFIG.validateOnly) {
      console.log('🏁 Migration script finished successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();