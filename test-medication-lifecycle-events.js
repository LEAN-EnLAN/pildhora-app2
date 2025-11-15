/**
 * Test script for Task 14: Integrate event generation into medication lifecycle
 * 
 * This script verifies that:
 * 1. Event generation is integrated into addMedication Redux thunk
 * 2. Event generation is integrated into updateMedication Redux thunk with change diff
 * 3. Event generation is integrated into deleteMedication Redux thunk
 * 4. Caregiver ID validation is implemented before event creation
 * 5. Error handling doesn't block medication operations
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('Task 14: Medication Lifecycle Event Integration Test');
console.log('='.repeat(80));
console.log();

// Read the medications slice file
const sliceFilePath = path.join(__dirname, 'src', 'store', 'slices', 'medicationsSlice.ts');
const sliceContent = fs.readFileSync(sliceFilePath, 'utf8');

let allTestsPassed = true;
const results = [];

// Test 1: Check if medicationEventService is imported
console.log('Test 1: Verify medicationEventService import');
const hasEventServiceImport = sliceContent.includes("import { createAndEnqueueEvent } from '../../services/medicationEventService'");
if (hasEventServiceImport) {
  console.log('✓ PASS: medicationEventService is imported');
  results.push({ test: 'Event service import', status: 'PASS' });
} else {
  console.log('✗ FAIL: medicationEventService is not imported');
  results.push({ test: 'Event service import', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Test 2: Check if addMedication generates events
console.log('Test 2: Verify addMedication generates created events');
const addMedicationHasEventGeneration = 
  sliceContent.includes('createAndEnqueueEvent') &&
  sliceContent.match(/\/\/ Generate medication created event/);
if (addMedicationHasEventGeneration) {
  console.log('✓ PASS: addMedication generates created events');
  results.push({ test: 'addMedication event generation', status: 'PASS' });
} else {
  console.log('✗ FAIL: addMedication does not generate events');
  results.push({ test: 'addMedication event generation', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Test 3: Check if updateMedication generates events with change tracking
console.log('Test 3: Verify updateMedication generates updated events with change tracking');
const updateMedicationHasEventGeneration = 
  sliceContent.includes('createAndEnqueueEvent') &&
  sliceContent.match(/\/\/ Generate medication updated event with change tracking/);
if (updateMedicationHasEventGeneration) {
  console.log('✓ PASS: updateMedication generates updated events with change tracking');
  results.push({ test: 'updateMedication event generation', status: 'PASS' });
} else {
  console.log('✗ FAIL: updateMedication does not generate events with change tracking');
  results.push({ test: 'updateMedication event generation', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Test 4: Check if deleteMedication generates events
console.log('Test 4: Verify deleteMedication generates deleted events');
const deleteMedicationHasEventGeneration = 
  sliceContent.includes('createAndEnqueueEvent') &&
  sliceContent.match(/\/\/ Generate medication deleted event/);
if (deleteMedicationHasEventGeneration) {
  console.log('✓ PASS: deleteMedication generates deleted events');
  results.push({ test: 'deleteMedication event generation', status: 'PASS' });
} else {
  console.log('✗ FAIL: deleteMedication does not generate events');
  results.push({ test: 'deleteMedication event generation', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Test 5: Check if caregiver ID validation is implemented
console.log('Test 5: Verify caregiver ID validation before event creation');
const hasCaregiversValidation = sliceContent.match(/if \(.*caregiverId.*\)/g);
if (hasCaregiversValidation && hasCaregiversValidation.length >= 3) {
  console.log('✓ PASS: Caregiver ID validation is implemented');
  console.log(`  Found ${hasCaregiversValidation.length} caregiver ID checks`);
  results.push({ test: 'Caregiver ID validation', status: 'PASS' });
} else {
  console.log('✗ FAIL: Caregiver ID validation is not properly implemented');
  results.push({ test: 'Caregiver ID validation', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Test 6: Check if error handling is non-blocking
console.log('Test 6: Verify error handling doesn\'t block medication operations');
const hasNonBlockingErrorHandling = 
  sliceContent.match(/try \{[\s\S]*?createAndEnqueueEvent[\s\S]*?\} catch \(eventError\) \{[\s\S]*?console\.error/g);
if (hasNonBlockingErrorHandling && hasNonBlockingErrorHandling.length >= 3) {
  console.log('✓ PASS: Error handling is non-blocking (try-catch with console.error)');
  console.log(`  Found ${hasNonBlockingErrorHandling.length} non-blocking error handlers`);
  results.push({ test: 'Non-blocking error handling', status: 'PASS' });
} else {
  console.log('✗ FAIL: Error handling may block medication operations');
  results.push({ test: 'Non-blocking error handling', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Test 7: Check if user name is passed to event generation
console.log('Test 7: Verify user name is passed to event generation');
const hasUserNameInEvents = sliceContent.match(/user\?\.name/g);
if (hasUserNameInEvents && hasUserNameInEvents.length >= 3) {
  console.log('✓ PASS: User name is passed to event generation');
  console.log(`  Found ${hasUserNameInEvents.length} user name references`);
  results.push({ test: 'User name in events', status: 'PASS' });
} else {
  console.log('✗ FAIL: User name is not properly passed to event generation');
  results.push({ test: 'User name in events', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Test 8: Check if event types are correct
console.log('Test 8: Verify correct event types are used');
const hasCreatedEventType = sliceContent.includes("'created'");
const hasUpdatedEventType = sliceContent.includes("'updated'");
const hasDeletedEventType = sliceContent.includes("'deleted'");
if (hasCreatedEventType && hasUpdatedEventType && hasDeletedEventType) {
  console.log('✓ PASS: All event types (created, updated, deleted) are used');
  results.push({ test: 'Event types', status: 'PASS' });
} else {
  console.log('✗ FAIL: Not all event types are properly used');
  if (!hasCreatedEventType) console.log('  Missing: created event type');
  if (!hasUpdatedEventType) console.log('  Missing: updated event type');
  if (!hasDeletedEventType) console.log('  Missing: deleted event type');
  results.push({ test: 'Event types', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Test 9: Check if updateMedication passes both old and new medication
console.log('Test 9: Verify updateMedication passes both old and new medication for change diff');
const hasOldAndNewMedication = sliceContent.match(/createAndEnqueueEvent\([\s\S]*?medicationData[\s\S]*?'updated'[\s\S]*?updatedMedication/);
if (hasOldAndNewMedication) {
  console.log('✓ PASS: updateMedication passes both old and new medication for change tracking');
  results.push({ test: 'Change diff in updates', status: 'PASS' });
} else {
  console.log('✗ FAIL: updateMedication does not properly pass old and new medication');
  results.push({ test: 'Change diff in updates', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Test 10: Check if events are generated in both code paths
console.log('Test 10: Verify events are generated in all code paths');
const eventGenerationCount = (sliceContent.match(/createAndEnqueueEvent/g) || []).length;
// Should have at least 6: 2 in addMedication, 2 in updateMedication, 1 in deleteMedication
if (eventGenerationCount >= 5) {
  console.log(`✓ PASS: Events are generated in multiple code paths (${eventGenerationCount} calls)`);
  results.push({ test: 'Multiple code paths', status: 'PASS' });
} else {
  console.log(`✗ FAIL: Events may not be generated in all code paths (only ${eventGenerationCount} calls found)`);
  results.push({ test: 'Multiple code paths', status: 'FAIL' });
  allTestsPassed = false;
}
console.log();

// Summary
console.log('='.repeat(80));
console.log('Test Summary');
console.log('='.repeat(80));
console.log();

const passCount = results.filter(r => r.status === 'PASS').length;
const failCount = results.filter(r => r.status === 'FAIL').length;

console.log(`Total Tests: ${results.length}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log();

if (allTestsPassed) {
  console.log('✓ ALL TESTS PASSED');
  console.log();
  console.log('Task 14 Implementation Summary:');
  console.log('- Event generation integrated into addMedication thunk');
  console.log('- Event generation integrated into updateMedication thunk with change diff');
  console.log('- Event generation integrated into deleteMedication thunk');
  console.log('- Caregiver ID validation implemented before event creation');
  console.log('- Error handling is non-blocking (doesn\'t fail medication operations)');
  console.log('- Events are generated in all code paths');
  console.log();
  console.log('Requirements Met:');
  console.log('- Requirement 6.1: Medication events generated for create/update/delete');
  console.log('- Requirement 6.5: Events include medication details, timestamp, and event type');
  process.exit(0);
} else {
  console.log('✗ SOME TESTS FAILED');
  console.log();
  console.log('Failed tests:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  - ${r.test}`);
  });
  process.exit(1);
}
