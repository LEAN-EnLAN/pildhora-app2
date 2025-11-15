# Task 18 Deployment Guide

## Quick Deployment Steps

### 1. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

**What this does**:
- Deploys the updated security rules to Firestore
- Adds protection for the `medicationEvents` collection
- Enforces read/write access control
- Validates event data structure

**Expected output**:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/YOUR_PROJECT/overview
```

### 2. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

**What this does**:
- Creates composite indexes for efficient queries
- Enables filtering by caregiverId, patientId, eventType, and timestamp
- Supports the rate limiting Cloud Function

**Expected output**:
```
✔  firestore: deployed indexes in firestore.indexes.json successfully
```

**Note**: Index creation can take several minutes. Monitor progress in Firebase Console.

### 3. Deploy Cloud Functions

```bash
firebase deploy --only functions:onMedicationEventRateLimit
```

**What this does**:
- Deploys the rate limiting enforcement function
- Monitors event creation in real-time
- Automatically deletes events exceeding 100/hour limit

**Expected output**:
```
✔  functions[onMedicationEventRateLimit(us-central1)]: Successful create operation.
```

### 4. Deploy All at Once (Recommended)

```bash
firebase deploy --only firestore:rules,firestore:indexes,functions:onMedicationEventRateLimit
```

## Verification Steps

### 1. Verify Security Rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** > **Rules**
4. Verify the `medicationEvents` rules are present
5. Use the **Rules Playground** to test scenarios:

**Test Scenario 1: Caregiver Reading Events**
```javascript
// Simulate authenticated caregiver
auth: { uid: 'caregiver-123' }

// Try to read event
get /databases/(default)/documents/medicationEvents/event-123

// Should succeed if caregiverId matches
```

**Test Scenario 2: Patient Creating Event**
```javascript
// Simulate authenticated patient
auth: { uid: 'patient-456' }

// Try to create event
create /databases/(default)/documents/medicationEvents/new-event
{
  eventType: 'created',
  medicationId: 'med-789',
  medicationName: 'Test Med',
  patientId: 'patient-456',
  caregiverId: 'caregiver-123',
  timestamp: request.time,
  syncStatus: 'pending'
}

// Should succeed
```

### 2. Verify Indexes in Firebase Console

1. Navigate to **Firestore Database** > **Indexes**
2. Look for indexes on `medicationEvents` collection
3. Verify status is "Enabled" (may take a few minutes)

Expected indexes:
- `patientId` (ASC) + `timestamp` (DESC)
- `caregiverId` (ASC) + `timestamp` (DESC)
- `caregiverId` (ASC) + `eventType` (ASC) + `timestamp` (DESC)
- `caregiverId` (ASC) + `patientId` (ASC) + `timestamp` (DESC)

### 3. Verify Cloud Function in Firebase Console

1. Navigate to **Functions**
2. Find `onMedicationEventRateLimit`
3. Check status is "Healthy"
4. Click on function name to view details
5. Check **Logs** tab for any errors

### 4. Test with Client Application

**Patient App Test**:
```typescript
// Create a medication event
const event = {
  eventType: 'created',
  medicationId: 'test-med-123',
  medicationName: 'Test Medication',
  medicationData: { /* medication data */ },
  patientId: currentUser.uid,
  caregiverId: 'caregiver-123',
  timestamp: Timestamp.now(),
  syncStatus: 'pending'
};

await db.collection('medicationEvents').add(event);
// Should succeed
```

**Caregiver App Test**:
```typescript
// Read events for this caregiver
const snapshot = await db.collection('medicationEvents')
  .where('caregiverId', '==', currentUser.uid)
  .orderBy('timestamp', 'desc')
  .limit(10)
  .get();

console.log(`Found ${snapshot.size} events`);
// Should only return events for this caregiver
```

## Monitoring

### 1. Monitor Cloud Function Logs

```bash
firebase functions:log --only onMedicationEventRateLimit
```

**Look for**:
- Warning messages when patients approach 80 events/hour
- Error messages when rate limit is exceeded
- Successful event processing

### 2. Set Up Alerts (Optional)

In Firebase Console:
1. Navigate to **Functions** > **onMedicationEventRateLimit**
2. Click **Alerts** tab
3. Set up alerts for:
   - Error rate > 5%
   - Execution time > 5 seconds
   - Invocation count spikes

### 3. Monitor Firestore Usage

1. Navigate to **Firestore Database** > **Usage**
2. Monitor:
   - Document reads/writes
   - Index usage
   - Storage usage

## Troubleshooting

### Issue: "Missing or insufficient permissions"

**Cause**: User is not authenticated or not the assigned caregiver

**Solution**:
1. Verify user is logged in
2. Check that `caregiverId` in event matches authenticated user
3. Review security rules in Firebase Console

### Issue: "Index not found"

**Cause**: Indexes are still being created

**Solution**:
1. Wait for index creation to complete (can take 5-10 minutes)
2. Check index status in Firebase Console
3. If stuck, try redeploying: `firebase deploy --only firestore:indexes`

### Issue: "Rate limit exceeded"

**Cause**: Patient created more than 100 events in the last hour

**Solution**:
1. This is expected behavior - rate limiting is working
2. Check Cloud Function logs to see which patient
3. Investigate why so many events are being created
4. Wait for the hour window to pass

### Issue: "Cloud Function not triggering"

**Cause**: Function deployment failed or trigger not configured

**Solution**:
1. Redeploy function: `firebase deploy --only functions:onMedicationEventRateLimit`
2. Check function logs for errors
3. Verify function is "Healthy" in Firebase Console

## Rollback Procedure

If you need to rollback the changes:

### 1. Rollback Security Rules

```bash
# View previous versions
firebase firestore:rules:list

# Rollback to previous version
firebase firestore:rules:release <RULESET_ID>
```

### 2. Rollback Cloud Function

```bash
# Delete the function
firebase functions:delete onMedicationEventRateLimit

# Or redeploy previous version from git
git checkout <previous-commit>
firebase deploy --only functions:onMedicationEventRateLimit
```

### 3. Remove Indexes (if needed)

Manually delete indexes in Firebase Console:
1. Navigate to **Firestore Database** > **Indexes**
2. Find `medicationEvents` indexes
3. Click delete icon for each index

## Performance Considerations

### Expected Performance:

- **Security Rules**: < 1ms validation time
- **Cloud Function**: 100-500ms execution time
- **Index Queries**: < 100ms for typical queries

### Optimization Tips:

1. **Batch Event Creation**: Create events in batches when possible
2. **Client-Side Throttling**: Implement client-side rate limiting to avoid hitting server limits
3. **Index Monitoring**: Monitor index usage and add/remove as needed
4. **Function Optimization**: Consider caching recent event counts if performance becomes an issue

## Cost Implications

### Firestore Costs:

- **Document Reads**: Caregivers reading events
- **Document Writes**: Patients creating events
- **Index Writes**: Automatic index updates
- **Storage**: Event documents (minimal)

### Cloud Function Costs:

- **Invocations**: One per event created
- **Compute Time**: ~100-500ms per invocation
- **Network**: Minimal

**Estimated Cost** (for 1000 events/day):
- Firestore: ~$0.10/day
- Cloud Functions: ~$0.05/day
- **Total**: ~$0.15/day or ~$4.50/month

## Next Steps After Deployment

1. ✅ Monitor Cloud Function logs for 24 hours
2. ✅ Test event creation from patient app
3. ✅ Test event reading from caregiver app
4. ✅ Verify rate limiting works correctly
5. ✅ Set up alerts for rate limit violations
6. ✅ Document any issues or edge cases
7. ✅ Update team on new security rules

## Support

If you encounter issues:

1. Check Firebase Console logs
2. Review security rules in Rules Playground
3. Test with the provided test script: `node test-medication-event-security-rules.js`
4. Consult the documentation: `TASK18_SECURITY_RULES.md`
5. Check Firebase Status: https://status.firebase.google.com/

## Deployment Checklist

- [ ] Backup current security rules
- [ ] Deploy security rules
- [ ] Deploy indexes
- [ ] Deploy Cloud Function
- [ ] Verify in Firebase Console
- [ ] Test with patient app
- [ ] Test with caregiver app
- [ ] Monitor logs for 24 hours
- [ ] Set up alerts
- [ ] Update team documentation
- [ ] Mark task as complete

## Success Criteria

Deployment is successful when:

- ✅ Security rules are active in Firebase Console
- ✅ Indexes are enabled and healthy
- ✅ Cloud Function is deployed and healthy
- ✅ Patient can create events
- ✅ Caregiver can read their assigned events
- ✅ Rate limiting prevents excessive events
- ✅ No errors in Cloud Function logs
- ✅ Client apps work correctly
