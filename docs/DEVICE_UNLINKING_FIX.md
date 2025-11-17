# Device Unlinking Permission Fix

## Problem Summary

Users were unable to unlink devices due to Firestore security rule permission errors. The logs showed:

```
ERROR [DeviceLinking] unlinkDeviceFromUser failed: {"code": "permission-denied", "message": "Missing or insufficient permissions."}
```

## Root Cause

The issue had two parts:

### 1. Missing Device Documents
- Devices existed in RTDB (`users/{userId}/devices/{deviceId}`)
- But corresponding Firestore documents were missing in `devices` collection
- This caused security rules to fail when checking device ownership

### 2. Overly Restrictive Security Rules
The original security rule for deleting deviceLinks required:
```javascript
allow delete: if isSignedIn() &&
  (resource.data.userId == request.auth.uid ||
   isDeviceOwner(resource.data.deviceId));
```

The `isDeviceOwner()` function would fail if the device document didn't exist, preventing users from deleting their own deviceLinks even though they should be allowed to.

## Solution

### 1. Updated Security Rules
Modified the deviceLinks delete rule to allow users to delete their own links even if the device document doesn't exist:

```javascript
allow delete: if isSignedIn() &&
  (resource.data.userId == request.auth.uid ||
   (exists(/databases/$(database)/documents/devices/$(resource.data.deviceId)) &&
    isDeviceOwner(resource.data.deviceId)));
```

This change:
- ✅ Allows users to always delete their own deviceLinks
- ✅ Checks device ownership only if device document exists
- ✅ Prevents orphaned deviceLinks from being undeletable

### 2. Created Missing Device Documents
Created a script (`scripts/fix-missing-device-document.js`) that:
- Scans all users for devices in RTDB
- Creates missing device documents in Firestore
- Creates missing deviceLink documents
- Ensures data consistency between RTDB and Firestore

**Results:**
- Created 1 device document (DEVICE-001)
- Created 2 deviceLink documents
- Fixed data inconsistency for 2 users

## How to Prevent This Issue

### 1. Always Create Device Documents
When linking a device, ensure both operations succeed:

```typescript
// ✅ CORRECT: Create device document first
await setDoc(doc(db, 'devices', deviceId), {
  id: deviceId,
  primaryPatientId: userId,
  provisioningStatus: 'active',
  // ... other fields
});

// Then create deviceLink
await setDoc(doc(db, 'deviceLinks', `${deviceId}_${userId}`), {
  deviceId,
  userId,
  role: userRole,
  status: 'active',
  // ... other fields
});

// Finally update RTDB
await set(ref(rdb, `users/${userId}/devices/${deviceId}`), true);
```

### 2. Use Transactions for Atomic Operations
For critical operations, use Firestore transactions:

```typescript
await db.runTransaction(async (transaction) => {
  // Create device document
  transaction.set(deviceRef, deviceData);
  
  // Create deviceLink
  transaction.set(deviceLinkRef, deviceLinkData);
});

// Then update RTDB
await set(rtdbRef, true);
```

### 3. Regular Data Consistency Checks
Run the fix script periodically to catch inconsistencies:

```bash
node scripts/fix-missing-device-document.js
```

### 4. Improved Error Handling
The `deviceLinking.ts` service now includes:
- ✅ Input validation
- ✅ Authentication checks
- ✅ Retry logic for transient failures
- ✅ User-friendly error messages
- ✅ Detailed logging

## Testing

After the fix, test device unlinking:

1. **Patient unlinking their own device:**
   ```typescript
   await unlinkDeviceFromUser(userId, deviceId);
   // Should succeed without permission errors
   ```

2. **Device owner revoking caregiver access:**
   ```typescript
   await unlinkDeviceFromUser(caregiverId, deviceId);
   // Should succeed if user is device owner
   ```

3. **Orphaned deviceLinks:**
   ```typescript
   // Even if device document is deleted
   await unlinkDeviceFromUser(userId, deviceId);
   // Should still allow user to delete their own link
   ```

## Files Modified

1. **firestore.rules** - Updated deviceLinks delete rule
2. **scripts/fix-missing-device-document.js** - New script to fix data inconsistencies
3. **src/services/deviceLinking.ts** - Already had good error handling

## Deployment

1. Deploy updated security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Run fix script:
   ```bash
   node scripts/fix-missing-device-document.js
   ```

3. Verify in app:
   - Try unlinking devices
   - Check for permission errors
   - Verify RTDB and Firestore are in sync

## Monitoring

Watch for these log patterns:

**Success:**
```
LOG [DeviceLinking] Device unlinking completed successfully
```

**Failure (should not occur now):**
```
ERROR [DeviceLinking] unlinkDeviceFromUser failed: {"code": "permission-denied"}
```

If permission errors still occur:
1. Check if user is authenticated
2. Verify deviceLink document exists
3. Confirm userId matches authenticated user
4. Check Firebase console for rule evaluation logs

## Related Documentation

- [Device Linking Service](../src/services/deviceLinking.ts)
- [Firestore Security Rules](../firestore.rules)
- [Device Sync Flow](./DEVICE_SYNC_FLOW_DIAGRAM.md)
- [Device Management Guide](./CAREGIVER_DEVICE_UNLINK.md)
