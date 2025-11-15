# Medication Data Migration Guide

This guide explains how to run the data migration script for the medication management redesign.

## Overview

The migration script updates existing medication and intake record data to support new features:

1. **Medications**: Adds default emoji (💊) and sets `trackInventory: false`
2. **Intake Records**: Generates `completionToken` and backfills `deviceSource: 'manual'`
3. **Migration Tracking**: Prevents duplicate runs by tracking migration status

## Prerequisites

### Required Files

1. **Service Account Key**: Download from Firebase Console
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in the project root

2. **Environment Variables**: Ensure `.env` file has Firebase configuration
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=...
   ```

### Required Dependencies

The migration script uses Firebase Admin SDK. Install it if not already present:

```bash
npm install firebase-admin dotenv
```

## Running the Migration

### Option 1: Node.js Script (Recommended)

This method uses Firebase Admin SDK for server-side operations:

```bash
node scripts/run-migration.js
```

**Advantages:**
- Runs server-side with admin privileges
- No authentication required
- Faster batch operations
- Better for large datasets

### Option 2: TypeScript Script

This method uses the client SDK (requires compilation):

```bash
# Compile TypeScript
npx tsc scripts/migrate-medication-data.ts --outDir scripts/dist --module commonjs --target es2017 --lib es2017 --esModuleInterop

# Run compiled script
node scripts/dist/migrate-medication-data.js
```

**Note:** This method requires user authentication and may be slower.

## Migration Process

The script performs the following steps:

1. **Initialize Firebase**: Connects to Firestore using service account
2. **Check Status**: Verifies if migration has already been run
3. **Create Status Document**: Tracks migration progress in `migrations` collection
4. **Migrate Medications**:
   - Adds `emoji: '💊'` if not present
   - Sets `trackInventory: false` if not present
   - Updates `updatedAt` timestamp
5. **Migrate Intake Records**:
   - Generates `completionToken` from `medicationId` and `scheduledTime`
   - Sets `deviceSource: 'manual'` if not present
6. **Update Status**: Marks migration as completed or failed

## Migration Status

The script creates a document in the `migrations` collection:

```
/migrations/medication-redesign-v1
  - migrationName: "medication-redesign-v1"
  - status: "completed" | "in_progress" | "failed"
  - startedAt: Timestamp
  - completedAt: Timestamp
  - medicationsProcessed: number
  - intakeRecordsProcessed: number
  - errors: string[]
```

## Safety Features

### Idempotency

The migration is idempotent - it can be run multiple times safely:
- Only updates documents that need changes
- Skips documents that already have the new fields
- Tracks completion status to prevent duplicate runs

### Batch Operations

- Uses Firestore batch writes (500 documents per batch)
- Commits in chunks to avoid timeout errors
- Logs progress after each batch

### Error Handling

- Continues processing even if individual updates fail
- Logs all errors to migration status document
- Marks migration as "failed" if any errors occur
- Does not rollback successful updates

## Verification

After running the migration, verify the results:

### Check Migration Status

```javascript
// In Firebase Console or using Admin SDK
const migrationDoc = await db.collection('migrations')
  .doc('medication-redesign-v1')
  .get();

console.log(migrationDoc.data());
```

### Verify Medications

```javascript
// Check that medications have emoji and trackInventory
const medications = await db.collection('medications').limit(10).get();
medications.forEach(doc => {
  const data = doc.data();
  console.log({
    id: doc.id,
    name: data.name,
    emoji: data.emoji, // Should be '💊'
    trackInventory: data.trackInventory // Should be false
  });
});
```

### Verify Intake Records

```javascript
// Check that intake records have completionToken and deviceSource
const intakeRecords = await db.collection('intakeRecords').limit(10).get();
intakeRecords.forEach(doc => {
  const data = doc.data();
  console.log({
    id: doc.id,
    completionToken: data.completionToken, // Should exist
    deviceSource: data.deviceSource // Should be 'manual'
  });
});
```

## Troubleshooting

### Migration Already Completed

If you see "Migration has already been completed", the script has already run successfully. To re-run:

1. Delete the migration status document:
   ```javascript
   await db.collection('migrations').doc('medication-redesign-v1').delete();
   ```
2. Run the script again

### Service Account Key Not Found

Error: `Service account key not found`

**Solution:**
1. Download service account key from Firebase Console
2. Save as `serviceAccountKey.json` in project root
3. Ensure file is not in `.gitignore` (or add to `.gitignore` after migration)

### Permission Denied

Error: `Permission denied` or `PERMISSION_DENIED`

**Solution:**
- Ensure service account has Firestore permissions
- Check Firebase Security Rules allow admin access
- Verify project ID in service account key matches your project

### Timeout Errors

Error: `Deadline exceeded` or timeout

**Solution:**
- The script uses batch operations to avoid timeouts
- If you have a very large dataset (>10,000 documents), consider:
  - Running during off-peak hours
  - Increasing batch size (up to 500)
  - Running migration in stages (by date range)

## Rollback

If you need to rollback the migration:

### Remove Emoji Field

```javascript
const medications = await db.collection('medications').get();
const batch = db.batch();

medications.forEach(doc => {
  batch.update(doc.ref, {
    emoji: admin.firestore.FieldValue.delete(),
    trackInventory: admin.firestore.FieldValue.delete()
  });
});

await batch.commit();
```

### Remove Intake Record Fields

```javascript
const intakeRecords = await db.collection('intakeRecords').get();
const batch = db.batch();

intakeRecords.forEach(doc => {
  batch.update(doc.ref, {
    completionToken: admin.firestore.FieldValue.delete(),
    deviceSource: admin.firestore.FieldValue.delete()
  });
});

await batch.commit();
```

## Support

If you encounter issues:

1. Check the migration status document for error details
2. Review Firebase Console logs
3. Verify service account permissions
4. Contact the development team with:
   - Error messages
   - Migration status document data
   - Number of documents in collections

## Related Documentation

- [Design Document](.kiro/specs/medication-management-redesign/design.md)
- [Requirements Document](.kiro/specs/medication-management-redesign/requirements.md)
- [Task List](.kiro/specs/medication-management-redesign/tasks.md)
