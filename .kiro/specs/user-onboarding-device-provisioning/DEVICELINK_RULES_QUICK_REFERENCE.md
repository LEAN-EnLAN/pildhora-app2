# DeviceLink Security Rules - Quick Reference

## Overview
Security rules for the `deviceLinks` collection that manage relationships between users and devices.

## Rule Summary

| Operation | Who Can Do It | Conditions |
|-----------|---------------|------------|
| **Create** | Authenticated users | Must be for themselves OR device owner creating for their device |
| **Read** | Authenticated users | Can read own links OR all links to owned devices |
| **Update** | Authenticated users | Can update own links OR device owner can update any link to their device |
| **Delete** | Authenticated users | Can delete own links OR device owner can delete any link to their device |

## Key Helper Functions

### isDeviceOwner(deviceId)
Checks if the authenticated user is the primary patient (owner) of the device.

```javascript
function isDeviceOwner(deviceId) {
  return exists(/databases/$(database)/documents/devices/$(deviceId)) &&
         get(/databases/$(database)/documents/devices/$(deviceId)).data.primaryPatientId == request.auth.uid;
}
```

### isValidDeviceLinkData()
Validates the structure and content of deviceLink data.

```javascript
function isValidDeviceLinkData() {
  let data = request.resource.data;
  return data.keys().hasAll(['id', 'deviceId', 'userId', 'role', 'status', 'linkedAt', 'linkedBy']) &&
         data.id == linkId &&
         data.userId is string &&
         data.deviceId is string &&
         data.role in ['patient', 'caregiver'] &&
         data.status in ['active', 'inactive'] &&
         data.linkedAt is timestamp &&
         data.linkedBy is string;
}
```

## Required Fields

| Field | Type | Valid Values | Description |
|-------|------|--------------|-------------|
| `id` | string | `{deviceId}_{userId}` | Unique identifier for the link |
| `deviceId` | string | Any valid device ID | The device being linked |
| `userId` | string | Any valid user ID | The user being linked |
| `role` | string | `'patient'` or `'caregiver'` | User's role in this link |
| `status` | string | `'active'` or `'inactive'` | Current status of the link |
| `linkedAt` | timestamp | Any valid timestamp | When the link was created |
| `linkedBy` | string | Any valid user ID | Who created the link |

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `unlinkedAt` | timestamp | When the link was deactivated |

## Common Use Cases

### 1. Patient Creates Link During Provisioning
```javascript
const linkId = `${deviceId}_${patientId}`;
await db.collection('deviceLinks').doc(linkId).set({
  id: linkId,
  deviceId: deviceId,
  userId: patientId,
  role: 'patient',
  status: 'active',
  linkedAt: Timestamp.now(),
  linkedBy: patientId
});
```

### 2. Caregiver Creates Link via Connection Code
```javascript
const linkId = `${deviceId}_${caregiverId}`;
await db.collection('deviceLinks').doc(linkId).set({
  id: linkId,
  deviceId: deviceId,
  userId: caregiverId,
  role: 'caregiver',
  status: 'active',
  linkedAt: Timestamp.now(),
  linkedBy: patientId  // Patient who generated the code
});
```

### 3. Patient Revokes Caregiver Access
```javascript
// Option 1: Delete the link entirely
await db.collection('deviceLinks').doc(linkId).delete();

// Option 2: Mark as inactive
await db.collection('deviceLinks').doc(linkId).update({
  status: 'inactive',
  unlinkedAt: Timestamp.now()
});
```

### 4. Get All Caregivers for a Device
```javascript
const caregivers = await db.collection('deviceLinks')
  .where('deviceId', '==', deviceId)
  .where('role', '==', 'caregiver')
  .where('status', '==', 'active')
  .get();
```

### 5. Check if User is Linked to Device
```javascript
const linkId = `${deviceId}_${userId}`;
const linkDoc = await db.collection('deviceLinks').doc(linkId).get();
const isLinked = linkDoc.exists && linkDoc.data().status === 'active';
```

## Access Control Matrix

### Patient (Device Owner)
- ✅ Create links for their device
- ✅ Read all links to their device
- ✅ Update any link to their device
- ✅ Delete any link to their device (revoke access)

### Caregiver (Linked)
- ✅ Create link for themselves (via connection code)
- ✅ Read their own link
- ✅ Update their own link
- ✅ Delete their own link (self-disconnect)
- ❌ Read other caregivers' links
- ❌ Modify other caregivers' links

### Caregiver (Not Linked)
- ❌ Cannot access any links to the device

## Security Considerations

### ✅ Enforced
- Authentication required for all operations
- Users can only create links for themselves
- Device owners have full control over their device links
- Data structure validation on creation
- Role and status enum validation

### ⚠️ Application Logic Required
- Connection code validation before caregiver link creation
- Notification to patient when caregiver connects
- Notification to caregiver when access is revoked
- Rate limiting on link creation
- Audit logging of link operations

## Integration with Other Collections

### devices
- DeviceLink rules check device ownership via `devices` collection
- `primaryPatientId` field determines device owner

### medications
- Medication rules check deviceLink existence for caregiver access
- Caregivers can only access medications for linked devices

### medicationEvents
- Event rules check deviceLink existence for caregiver access
- Caregivers can only view events for linked devices

### connectionCodes
- Connection codes authorize deviceLink creation
- Code validation happens in application logic before link creation

## Testing

### Test File
`test-devicelink-security-rules.js`

### Test Coverage
- ✅ Link creation authorization
- ✅ Read access for users and device owners
- ✅ Link revocation by device owner
- ✅ Link updates
- ✅ Data validation
- ✅ All requirements (5.4, 5.5, 7.4, 12.1-12.4)

## Troubleshooting

### Common Issues

**Issue**: "Permission denied" when creating link
- **Check**: Is user authenticated?
- **Check**: Is userId in link data same as authenticated user?
- **Check**: Are all required fields present?
- **Check**: Are role and status values valid?

**Issue**: "Permission denied" when reading link
- **Check**: Is user authenticated?
- **Check**: Is user the userId in the link OR the device owner?

**Issue**: "Permission denied" when deleting link
- **Check**: Is user authenticated?
- **Check**: Is user the userId in the link OR the device owner?

**Issue**: Link creation succeeds but caregiver can't access device data
- **Check**: Is link status set to 'active'?
- **Check**: Is role set to 'caregiver'?
- **Check**: Do other collections check for deviceLink existence?

## Related Documentation

- [Task 12.3 Completion Summary](.kiro/specs/user-onboarding-device-provisioning/TASK12.3_COMPLETION_SUMMARY.md)
- [Security Rules Implementation](.kiro/specs/user-onboarding-device-provisioning/SECURITY_RULES_IMPLEMENTATION.md)
- [Device Provisioning Design](design.md)
- [Requirements Document](requirements.md)

## Quick Commands

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### Test Security Rules Locally
```bash
node test-devicelink-security-rules.js
```

### View Security Rules
```bash
cat firestore.rules
```

## Version History

- **v1.0** (Current): Initial implementation with full CRUD operations
  - Create: Authenticated users for themselves or device owner
  - Read: Users can read own links, device owners can read all
  - Update: Users can update own links, device owners can update all
  - Delete: Users can delete own links, device owners can delete all
