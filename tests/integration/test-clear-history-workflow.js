/**
 * Integration Test Suite for History Clearing Workflow
 * 
 * This test verifies:
 * 1. Backend deletion of intake history
 * 2. Verification of empty state after deletion
 * 3. Simulation of local flag filtering logic
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Mock Firestore for environment without credentials
class MockFirestore {
  constructor() {
    this.data = {};
  }
  
  collection(name) {
    return new MockCollection(this.data, name);
  }
  
  batch() {
    return new MockBatch(this.data);
  }
}

class MockCollection {
  constructor(dbData, name) {
    this.dbData = dbData;
    this.name = name;
    if (!this.dbData[name]) this.dbData[name] = {};
  }
  
  doc(id) {
    const docId = id || `doc_${Date.now()}_${Math.random()}`;
    return new MockDoc(this.dbData, this.name, docId);
  }
  
  where(field, op, value) {
    return new MockQuery(this.dbData, this.name, [{ field, op, value }]);
  }
}

class MockDoc {
  constructor(dbData, collectionName, id) {
    this.dbData = dbData;
    this.collectionName = collectionName;
    this.id = id;
    this.ref = this; // Self-reference for batch operations
  }
  
  async get() {
    const data = this.dbData[this.collectionName][this.id];
    return {
      exists: !!data,
      id: this.id,
      data: () => data
    };
  }
}

class MockQuery {
  constructor(dbData, collectionName, filters) {
    this.dbData = dbData;
    this.collectionName = collectionName;
    this.filters = filters;
  }
  
  where(field, op, value) {
    this.filters.push({ field, op, value });
    return this;
  }
  
  async get() {
    let results = Object.entries(this.dbData[this.collectionName] || {}).map(([id, data]) => ({
      id,
      data: () => data,
      ref: { id, collectionName: this.collectionName } // simplified ref
    }));
    
    for (const filter of this.filters) {
      results = results.filter(doc => {
        const data = doc.data();
        if (filter.op === '==') return data[filter.field] === filter.value;
        return true;
      });
    }
    
    return {
      size: results.length,
      empty: results.length === 0,
      docs: results
    };
  }
}

class MockBatch {
  constructor(dbData) {
    this.dbData = dbData;
    this.ops = [];
  }
  
  set(docRef, data) {
    this.ops.push({ type: 'set', docRef, data });
  }
  
  delete(docRef) {
    this.ops.push({ type: 'delete', docRef });
  }
  
  async commit() {
    for (const op of this.ops) {
      const { collectionName, id } = op.docRef;
      if (!this.dbData[collectionName]) this.dbData[collectionName] = {};
      
      if (op.type === 'set') {
        this.dbData[collectionName][id] = op.data;
      } else if (op.type === 'delete') {
        delete this.dbData[collectionName][id];
      }
    }
  }
}

// Check if credentials exist
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let db;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://pillhelper-d8f95-default-rtdb.firebaseio.com'
    });
  }
  db = admin.firestore();
} else {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: serviceAccountKey.json not found. Using Mock Firestore.');
  db = new MockFirestore();
  // Mock Timestamp
  admin.firestore = {
    Timestamp: {
      fromDate: (date) => date
    },
    FieldValue: {
      serverTimestamp: () => new Date()
    }
  };
}

// Test configuration
const TEST_CONFIG = {
  testPatientId: 'test-patient-clear-history-' + Date.now(),
  testCaregiverId: 'test-caregiver-clear-history-' + Date.now(),
  recordCount: 20,
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, colors.cyan);
  console.log('='.repeat(80) + '\n');
}

function logTest(testName) {
  log(`\n▶ Testing: ${testName}`, colors.blue);
}

function logSuccess(message) {
  log(`  ✓ ${message}`, colors.green);
}

function logError(message) {
  log(`  ✗ ${message}`, colors.red);
}

const testResults = {
  passed: 0,
  failed: 0,
};

function recordTest(name, passed, message = '') {
  if (passed) {
    testResults.passed++;
    logSuccess(message || 'Passed');
  } else {
    testResults.failed++;
    logError(message || 'Failed');
  }
}

// Helper to create intake record
function createTestIntakeRecord(index) {
  const scheduledTime = new Date();
  scheduledTime.setDate(scheduledTime.getDate() - (index % 5)); // Spread over 5 days
  
  return {
    medicationId: `med-${index}`,
    medicationName: `Medication ${index}`,
    dosage: '10mg',
    scheduledTime: admin.firestore.Timestamp.fromDate(scheduledTime),
    status: index % 2 === 0 ? 'taken' : 'missed',
    patientId: TEST_CONFIG.testPatientId,
    caregiverId: TEST_CONFIG.testCaregiverId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function runTests() {
  logSection('HISTORY CLEARING WORKFLOW TEST');

  // 1. Setup Data
  logTest('Setting up test data');
  try {
    const batch = db.batch();
    for (let i = 0; i < TEST_CONFIG.recordCount; i++) {
      const docRef = db.collection('intakeRecords').doc(); // Note: Collection name matches slice
      batch.set(docRef, createTestIntakeRecord(i));
    }
    await batch.commit();
    recordTest('Setup data', true, `Created ${TEST_CONFIG.recordCount} records`);
  } catch (error) {
    recordTest('Setup data', false, `Error: ${error.message}`);
    return; // Stop if setup fails
  }

  // 2. Verify Data Exists
  logTest('Verifying data existence');
  try {
    const snapshot = await db.collection('intakeRecords')
      .where('patientId', '==', TEST_CONFIG.testPatientId)
      .get();
    
    if (snapshot.size === TEST_CONFIG.recordCount) {
      recordTest('Verify existence', true, `Found ${snapshot.size} records`);
    } else {
      recordTest('Verify existence', false, `Expected ${TEST_CONFIG.recordCount}, found ${snapshot.size}`);
    }
  } catch (error) {
    recordTest('Verify existence', false, `Error: ${error.message}`);
  }

  // 3. Execute Backend Deletion (Simulating logic from deleteAllIntakes thunk)
  logTest('Executing Backend Deletion');
  try {
    // Query
    const q = await db.collection('intakeRecords')
      .where('patientId', '==', TEST_CONFIG.testPatientId)
      .get();
    
    // Batch Delete
    const batch = db.batch();
    q.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    recordTest('Backend Deletion', true, `Executed deletion of ${q.size} records`);
  } catch (error) {
    recordTest('Backend Deletion', false, `Error: ${error.message}`);
  }

  // 4. Verify Empty State
  logTest('Verifying Empty State');
  try {
    const snapshot = await db.collection('intakeRecords')
      .where('patientId', '==', TEST_CONFIG.testPatientId)
      .get();
    
    if (snapshot.empty) {
      recordTest('Verify empty', true, 'Collection is empty for patient');
    } else {
      recordTest('Verify empty', false, `Found ${snapshot.size} records remaining`);
    }
  } catch (error) {
    recordTest('Verify empty', false, `Error: ${error.message}`);
  }

  // 5. Verify Local Flag Logic (Simulation)
  logTest('Verifying Local Flag Filtering Logic');
  try {
    // Simulate a "cleared timestamp"
    const clearedTimestamp = Date.now();
    
    // Create a record that is "older" than the cleared timestamp (should be filtered out)
    const oldRecordTime = new Date(clearedTimestamp - 10000);
    const newRecordTime = new Date(clearedTimestamp + 10000);
    
    const records = [
      { id: '1', scheduledTime: oldRecordTime.toISOString() }, // Should be filtered
      { id: '2', scheduledTime: newRecordTime.toISOString() }  // Should show
    ];
    
    // Filter logic
    const filtered = records.filter(r => {
      const recordTime = new Date(r.scheduledTime).getTime();
      return recordTime > clearedTimestamp;
    });
    
    if (filtered.length === 1 && filtered[0].id === '2') {
      recordTest('Local Flag Logic', true, 'Successfully filtered out old records');
    } else {
      recordTest('Local Flag Logic', false, `Filter logic failed. Expected 1 record, got ${filtered.length}`);
    }
  } catch (error) {
    recordTest('Local Flag Logic', false, `Error: ${error.message}`);
  }

  // Summary
  logSection('TEST SUMMARY');
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  
  if (testResults.failed === 0) {
    console.log('\nAll tests passed! ✓');
    process.exit(0);
  } else {
    console.log('\nSome tests failed. ✗');
    process.exit(1);
  }
}

runTests();
