# User Onboarding Migration - Quick Reference

## Quick Start

### Test Migration (Dry Run)
```bash
node scripts/test-user-migration.js
```

### Run Actual Migration
```bash
node scripts/migrate-user-onboarding.js
```

## What Gets Added

Every user document gets:
- `onboardingComplete`: boolean
- `onboardingStep`: string

## Migration Logic

| User Type | Has Device/Links | onboardingComplete | onboardingStep |
|-----------|------------------|-------------------|----------------|
| Patient | ✓ Has device | `true` | `'complete'` |
| Patient | ✗ No device | `false` | `'device_provisioning'` |
| Caregiver | ✓ Has links | `true` | `'complete'` |
| Caregiver | ✗ No links | `false` | `'device_connection'` |
| Unknown | N/A | `false` | `'device_provisioning'` |

## Device Detection

### Patients
Checks for device in:
1. Firestore `devices` collection (`primaryPatientId === userId`)
2. RTDB `users/{userId}/devices`

### Caregivers
Checks for active links in:
- Firestore `deviceLinks` collection
  - `userId === userId`
  - `role === 'caregiver'`
  - `status === 'active'`

## Safety Features

✓ Duplicate prevention (won't run twice)  
✓ Idempotent (safe to run multiple times)  
✓ Batch processing (500 users per batch)  
✓ Error handling (continues on individual failures)  
✓ Dry run testing (test before actual migration)

## Common Commands

### Check Migration Status
```javascript
// In Firebase Console
// Navigate to: Firestore > migrations > user-onboarding-v1
```

### Rollback (if needed)
```bash
# Delete onboarding fields from all users
# Delete migrations/user-onboarding-v1 document
# See full guide for rollback script
```

## Expected Output

### Test Script
```
Total users: 150
Already migrated: 0
Would be migrated: 150

Breakdown:
  Patients with devices: 85 (onboarding complete)
  Patients without devices: 15 (needs onboarding)
  Caregivers with links: 40 (onboarding complete)
  Caregivers without links: 10 (needs onboarding)
  Unknown role: 0

✓ Migration test passed successfully
```

### Migration Script
```
[Migration] Found 150 users to process
[Migration] Committed batch of 150 user updates
[Migration] Total users processed: 150
[Migration] Status: completed
[Migration] Migration script completed successfully
```

## Verification Checklist

- [ ] Test script runs without errors
- [ ] Migration completes successfully
- [ ] Migration status shows 'completed'
- [ ] Spot check user documents
- [ ] Test app login for each user type
- [ ] Verify routing works correctly

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Migration already in progress" | Delete `migrations/user-onboarding-v1` and retry |
| "Service account key not found" | Add `serviceAccountKey.json` to project root |
| "Permission denied" | Check service account permissions |
| Timeout errors | Reduce `BATCH_SIZE` in script |

## Files

- `scripts/migrate-user-onboarding.js` - Main migration script
- `scripts/test-user-migration.js` - Test/dry run script
- `.kiro/specs/user-onboarding-device-provisioning/TASK26_MIGRATION_GUIDE.md` - Full guide

## Requirements

**Requirements: 9.1, 9.2, 9.3**

- Check onboarding status after authentication
- Route patients without devices to provisioning
- Route caregivers without links to connection interface
