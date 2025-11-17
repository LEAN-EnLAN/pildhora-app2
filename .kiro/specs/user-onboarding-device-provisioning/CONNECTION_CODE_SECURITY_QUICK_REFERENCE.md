# Connection Code Security Rules - Quick Reference

## Overview
Security rules for the `connectionCodes` collection that enable secure caregiver-patient device linking through time-limited codes.

## Rule Summary

| Operation | Who Can Do It | Conditions |
|-----------|---------------|------------|
| **Read** | Any authenticated user | Must be signed in |
| **Create** | Patients only | Must be for their own device, code must be unused |
| **Update** | Authenticated users | Can mark as used (one-time only) OR patient can update their own codes |
| **Delete** | Patients only | Must be their own code |

## Key Security Features

### 🔒 Code Reuse Prevention
```javascript
!resource.data.used  // Code must not already be used
```

### 🔑 Patient Authorization
```javascript
request.resource.data.patientId == request.auth.uid
```

### ✅ One-Time Usage
```javascript
data.used == true &&
data.usedBy == request.auth.uid &&
data.usedAt is timestamp
```

### 🛡️ Immutable Fields Protection
During code usage, these fields cannot be changed:
- `id`
- `deviceId`
- `patientId`
- `patientName`
- `createdAt`
- `expiresAt`

## Common Operations

### Generate Code (Patient)
```typescript
// Service: connectionCode.generateCode()
await setDoc(doc(db, 'connectionCodes', code), {
  id: code,
  deviceId: 'DEVICE-001',
  patientId: 'patient-123',
  patientName: 'John Doe',
  createdAt: serverTimestamp(),
  expiresAt: Timestamp.fromDate(expiresAt),
  used: false
});
```

### Validate Code (Any User)
```typescript
// Service: connectionCode.validateCode()
const codeDoc = await getDoc(doc(db, 'connectionCodes', code));
if (codeDoc.exists() && !codeDoc.data().used) {
  // Code is valid
}
```

### Use Code (Caregiver)
```typescript
// Service: connectionCode.useCode()
await updateDoc(doc(db, 'connectionCodes', code), {
  used: true,
  usedBy: caregiverId,
  usedAt: serverTimestamp()
});
```

### Revoke Code (Patient)
```typescript
// Service: connectionCode.revokeCode()
await deleteDoc(doc(db, 'connectionCodes', code));
```

## Data Structure

```typescript
interface ConnectionCode {
  id: string;              // 6-8 alphanumeric characters
  deviceId: string;        // Device this code links to
  patientId: string;       // Patient who created the code
  patientName: string;     // Patient name for display
  createdAt: Timestamp;    // Creation time
  expiresAt: Timestamp;    // Expiration time
  used: boolean;           // Usage status
  usedBy?: string;         // Caregiver who used it
  usedAt?: Timestamp;      // When it was used
}
```

## Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| `permission-denied` on create | Not the patient | Only patients can create codes |
| `permission-denied` on update | Code already used | Cannot reuse codes |
| `permission-denied` on delete | Not the code owner | Only patient can delete their codes |
| `CODE_ALREADY_USED` | Code was used | Request new code from patient |
| `CODE_EXPIRED` | Code past expiration | Request new code from patient |

## Testing

Run security rules tests:
```bash
node test-device-provisioning-security-rules.js
```

Expected results for Task 12.2:
```
✓ Test 1: Patient can create connection code for their device
✓ Test 2: Authenticated user can read connection code
✓ Test 3: Caregiver can read connection code for validation
✓ Test 4: Caregiver can mark connection code as used
✓ Test 5: Cannot reuse already-used connection code
✓ Test 6: Caregiver cannot delete connection code
✓ Test 7: Patient can delete their own connection code
```

## Best Practices

### For Patients
1. Generate codes only when needed
2. Set appropriate expiration times (default: 24 hours)
3. Revoke unused codes when no longer needed
4. Monitor active codes regularly

### For Caregivers
1. Validate codes before attempting to use
2. Handle expired codes gracefully
3. Inform patient if code is invalid
4. Use codes immediately after validation

### For Developers
1. Always validate code format client-side first
2. Handle all error codes appropriately
3. Provide clear user feedback
4. Log security-relevant operations
5. Never expose sensitive code data in logs

## Security Considerations

### ✅ Implemented Protections
- Single-use codes (reuse prevention)
- Patient-only code creation
- Patient-only code deletion
- Authenticated-only access
- Immutable field protection
- Audit trail (usedBy, usedAt)

### ⚠️ Additional Recommendations
- Implement rate limiting for code generation (max 5 per hour)
- Clean up expired codes automatically
- Monitor for suspicious patterns
- Log all code operations for audit
- Consider shorter expiration times for sensitive environments

## Related Documentation

- **Design Document**: `.kiro/specs/user-onboarding-device-provisioning/design.md`
- **Requirements**: `.kiro/specs/user-onboarding-device-provisioning/requirements.md`
- **Service Implementation**: `src/services/connectionCode.ts`
- **Security Rules**: `firestore.rules` (lines 233-298)
- **Tests**: `test-device-provisioning-security-rules.js`

## Quick Troubleshooting

### Code Creation Fails
1. Verify user is authenticated
2. Check patientId matches current user
3. Ensure code is 6-8 characters
4. Verify all required fields are present

### Code Usage Fails
1. Check if code already used
2. Verify code hasn't expired
3. Ensure user is authenticated
4. Confirm code exists

### Code Deletion Fails
1. Verify user is the patient who created it
2. Check user is authenticated
3. Confirm code exists

---

**Last Updated**: November 17, 2025
**Status**: Production Ready
**Test Coverage**: 7/7 tests passing
