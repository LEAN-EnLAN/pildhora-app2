# User Onboarding Migration Guide

## Overview

This guide covers the migration of existing user documents to support the new onboarding system. The migration adds onboarding fields to all existing users and determines their onboarding status based on whether they have devices (patients) or device links (caregivers).

## Requirements

**Requirements: 9.1, 9.2, 9.3**

- 9.1: WHEN a user completes authentication, THE Routing System SHALL check if the user has completed onboarding
- 9.2: WHEN a patient has not provisioned a device, THE Routing System SHALL redirect to the device provisioning wizard
- 9.3: WHEN a caregiver has no device connections, THE Routing System SHALL redirect to the device connection interface

## Migration Details

### What Gets Migrated

The migration script adds the following fields to existing user documents:

1. **onboardingComplete** (boolean)
   - `true` if user has completed setup (has device/links)
   - `false` if user needs to complete onboarding

2. **onboardingStep** (string)
   - `'complete'` if onboarding is done
   - `'device_provisioning'` for patients without devices
   - `'device_connection'` for caregivers without links

### Migration Logic

#### For Patients

```javascript
if (user.role === 'patient') {
  const hasDevice = checkFirestoreDevices() || checkRTDBDevices();
  
  if (hasDevice) {
    onboardingComplete = true;
    onboardingStep = 'complete';
  } else {
    onboardingComplete = false;
    onboardingStep = 'device_provisioning';
  }
}
```

**Device Check:**
- Checks Firestore `devices` collection for `primaryPatientId === userId`
- Checks RTDB `users/{userId}/devices` for any device entries
- If either exists, user has a device

#### For Caregivers

```javascript
if (user.role === 'caregiver') {
  const hasLinks = checkDeviceLinks();
  
  if (hasLinks) {
    onboardingComplete = true;
    onboardingStep = 'complete';
  } else {
    onboardingComplete = false;
    onboardingStep = 'device_connection';
  }
}
```

**Device Link Check:**
- Checks Firestore `deviceLinks` collection for:
  - `userId === userId`
  - `role === 'caregiver'`
  - `status === 'active'`
- If any active links exist, user has completed onboarding

#### For Unknown Roles

```javascript
if (!user.role || user.role !== 'patient' && user.role !== 'caregiver') {
  // Default to patient onboarding
  onboardingComplete = false;
  onboardingStep = 'device_provisioning';
}
```

## Files Created

### 1. Migration Script
**File:** `scripts/migrate-user-onboarding.js`

Main migration script that:
- Initializes Firebase Admin SDK
- Checks migration status to prevent duplicate runs
- Processes all user documents in batches
- Updates users with onboarding fields
- Tracks migration progress and errors

### 2. Test Script
**File:** `scripts/test-user-migration.js`

Test script that:
- Analyzes existing user data without making changes
- Reports what would happen during migration
- Identifies potential issues before running actual migration
- Provides detailed breakdown of user categories

### 3. Documentation
**File:** `.kiro/specs/user-onboarding-device-provisioning/TASK26_MIGRATION_GUIDE.md`

This comprehensive guide covering:
- Migration overview and requirements
- Detailed migration logic
- Usage instructions
- Testing procedures
- Rollback procedures

## Usage Instructions

### Step 1: Prerequisites

Ensure you have:
1. Firebase Admin SDK service account key (`serviceAccountKey.json`)
2. Environment variables configured (`.env` file)
3. Node.js installed
4. All dependencies installed (`npm install`)

### Step 2: Test Migration (Recommended)

Before running the actual migration, test it first:

```bash
node scripts/test-user-migration.js
```

This will:
- Analyze all existing users
- Report what would be changed
- Identify any potential issues
- NOT make any actual changes

**Expected Output:**
```
========================================
MIGRATION TEST RESULTS
========================================

Total users: 150
Already migrated: 0
Would be migrated: 150

Breakdown:
  Patients with devices: 85 (onboarding complete)
  Patients without devices: 15 (needs onboarding)
  Caregivers with links: 40 (onboarding complete)
  Caregivers without links: 10 (needs onboarding)
  Unknown role: 0 (default to patient onboarding)

No errors encountered ✓

========================================
TEST COMPLETE
========================================

✓ Migration test passed successfully
✓ Ready to run actual migration
```

### Step 3: Run Migration

Once testing is successful, run the actual migration:

```bash
node scripts/migrate-user-onboarding.js
```

The script will:
1. Check if migration has already been run
2. Create a migration status document
3. Process all users in batches of 500
4. Update each user with onboarding fields
5. Track progress and errors
6. Mark migration as complete

**Expected Output:**
```
[Migration] Starting user onboarding migration...
[Migration] Migration name: user-onboarding-v1
[Migration] Firebase Admin SDK initialized successfully
[Migration] Starting user migration...
[Migration] Found 150 users to process
[Migration] Patient user-123 has device - marking onboarding complete
[Migration] Caregiver user-456 has device links - marking onboarding complete
[Migration] Patient user-789 has no device - needs onboarding
...
[Migration] Committed batch of 150 user updates
[Migration] Completed user migration
[Migration] Total users processed: 150
[Migration] Patients with devices: 85
[Migration] Patients without devices: 15
[Migration] Caregivers with links: 40
[Migration] Caregivers without links: 10
[Migration] Unknown role: 0
[Migration] Migration completed
[Migration] Status: completed
[Migration] Users processed: 150
[Migration] Migration script completed successfully
```

### Step 4: Verify Migration

After migration, verify the results:

1. **Check Migration Status:**
   - Open Firebase Console
   - Navigate to Firestore
   - Check `migrations/user-onboarding-v1` document
   - Verify `status: 'completed'`

2. **Spot Check Users:**
   - Open Firebase Console
   - Navigate to Firestore `users` collection
   - Check a few user documents
   - Verify they have `onboardingComplete` and `onboardingStep` fields

3. **Test Application:**
   - Log in as a patient with a device → should go to home
   - Log in as a patient without a device → should go to provisioning wizard
   - Log in as a caregiver with links → should go to dashboard
   - Log in as a caregiver without links → should go to connection interface

## Migration Status Tracking

The migration creates a status document at `migrations/user-onboarding-v1`:

```javascript
{
  migrationName: 'user-onboarding-v1',
  status: 'completed', // 'in_progress', 'completed', or 'failed'
  startedAt: Timestamp,
  completedAt: Timestamp,
  usersProcessed: 150,
  details: {
    total: 150,
    patientsWithDevices: 85,
    patientsWithoutDevices: 15,
    caregiversWithLinks: 40,
    caregiversWithoutLinks: 10,
    unknownRole: 0
  },
  errors: [],
  updatedAt: Timestamp
}
```

## Safety Features

### 1. Duplicate Prevention
- Migration checks if it has already been run
- Will not run again if status is 'completed'
- Prevents accidental double-migration

### 2. Idempotent Updates
- Skips users that already have onboarding fields
- Safe to run multiple times if needed
- Only updates users that need migration

### 3. Batch Processing
- Processes users in batches of 500
- Prevents timeout issues with large datasets
- Provides progress feedback

### 4. Error Handling
- Catches and logs errors for individual users
- Continues processing other users if one fails
- Records all errors in migration status document

### 5. Dry Run Testing
- Test script analyzes without making changes
- Identifies issues before actual migration
- Provides detailed preview of changes

## Rollback Procedure

If you need to rollback the migration:

### Option 1: Manual Rollback (Small Dataset)

1. Open Firebase Console
2. Navigate to Firestore `users` collection
3. For each user document:
   - Delete `onboardingComplete` field
   - Delete `onboardingStep` field
4. Delete `migrations/user-onboarding-v1` document

### Option 2: Script Rollback (Large Dataset)

Create a rollback script:

```javascript
// scripts/rollback-user-migration.js
const admin = require('firebase-admin');
// ... initialize Firebase

async function rollback() {
  const db = admin.firestore();
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  let batch = db.batch();
  let count = 0;
  
  for (const doc of snapshot.docs) {
    batch.update(doc.ref, {
      onboardingComplete: admin.firestore.FieldValue.delete(),
      onboardingStep: admin.firestore.FieldValue.delete()
    });
    
    count++;
    if (count >= 500) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }
  
  if (count > 0) {
    await batch.commit();
  }
  
  // Delete migration status
  await db.collection('migrations').doc('user-onboarding-v1').delete();
}

rollback().then(() => process.exit(0));
```

Run with: `node scripts/rollback-user-migration.js`

## Troubleshooting

### Migration Already In Progress

**Error:** "Migration is already in progress"

**Solution:**
1. Check if migration is actually running
2. If stuck, manually delete `migrations/user-onboarding-v1` document
3. Run migration again

### Service Account Key Not Found

**Error:** "Service account key not found"

**Solution:**
1. Download service account key from Firebase Console
2. Save as `serviceAccountKey.json` in project root
3. Ensure file is in `.gitignore`

### Permission Denied

**Error:** "Permission denied"

**Solution:**
1. Verify service account has proper permissions
2. Check Firebase security rules
3. Ensure service account has Firestore and RTDB access

### Timeout Errors

**Error:** "Operation timeout"

**Solution:**
1. Migration uses batching to prevent timeouts
2. If still occurring, reduce `BATCH_SIZE` constant
3. Check network connectivity

## Testing with Production Data Snapshot

To test with a production data snapshot:

### 1. Export Production Data

```bash
# Export Firestore data
firebase firestore:export gs://your-bucket/firestore-backup

# Export RTDB data
firebase database:get / > rtdb-backup.json
```

### 2. Import to Test Environment

```bash
# Import to test project
firebase firestore:import gs://your-bucket/firestore-backup --project test-project

# Import RTDB data
firebase database:set / rtdb-backup.json --project test-project
```

### 3. Run Test Migration

```bash
# Update .env to point to test project
EXPO_PUBLIC_FIREBASE_PROJECT_ID=test-project

# Run test
node scripts/test-user-migration.js

# Run actual migration on test data
node scripts/migrate-user-onboarding.js
```

### 4. Verify Results

- Check migration status document
- Spot check user documents
- Test application with test data
- Verify routing logic works correctly

## Post-Migration Verification Checklist

- [ ] Migration status document shows 'completed'
- [ ] All users have `onboardingComplete` field
- [ ] All users have `onboardingStep` field
- [ ] Patients with devices have `onboardingComplete: true`
- [ ] Patients without devices have `onboardingComplete: false`
- [ ] Caregivers with links have `onboardingComplete: true`
- [ ] Caregivers without links have `onboardingComplete: false`
- [ ] No errors in migration status document
- [ ] Application routing works correctly for all user types
- [ ] Existing users can log in successfully
- [ ] New users follow onboarding flow correctly

## Summary

The user onboarding migration is a critical step in enabling the new onboarding system. By following this guide and using the provided test script, you can safely migrate existing users while ensuring data integrity and preventing issues.

**Key Points:**
- Always test before running actual migration
- Migration is idempotent and safe to run multiple times
- Rollback procedure available if needed
- Comprehensive error handling and logging
- Batch processing for large datasets

**Next Steps:**
After successful migration, existing users will be automatically routed based on their onboarding status when they next log in.
