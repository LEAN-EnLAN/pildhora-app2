# Security Rules Quick Reference

## Device Provisioning Rules

### Device Creation
```javascript
// ✅ Allowed: Patient creating their first device
{
  id: "DEVICE_123",
  primaryPatientId: currentUserId,
  provisioningStatus: "pending",
  provisionedAt: timestamp,
  provisionedBy: currentUserId,
  wifiConfigured: false,
  createdAt: timestamp,
  updatedAt: timestamp
}

// ❌ Denied: Device already exists
// ❌ Denied: primaryPatientId doesn't match current user
// ❌ Denied: Missing required fields
```

### Device Updates
```javascript
// ✅ Allowed: Device owner updating their device
// ❌ Denied: Non-owner trying to update device
```

### Device Read Access
```javascript
// ✅ Allowed: Device owner reading their device
// ✅ Allowed: Linked caregiver reading device
// ❌ Denied: Non-linked user reading device
```

## Connection Code Rules

### Code Creation
```javascript
// ✅ Allowed: Patient creating code for their device
{
  id: "ABC123",
  deviceId: "DEVICE_123",
  patientId: currentUserId,
  patientName: "John Doe",
  createdAt: timestamp,
  expiresAt: timestamp,
  used: false
}

// ❌ Denied: Creating code for device you don't own
// ❌ Denied: Code ID not 6-8 characters
// ❌ Denied: Creating code with used: true
```

### Code Validation
```javascript
// ✅ Allowed: Any authenticated user reading code
// Used for validation before linking
```

### Code Usage
```javascript
// ✅ Allowed: Marking unused code as used
{
  ...existingFields,
  used: true,
  usedBy: currentUserId,
  usedAt: timestamp
}

// ❌ Denied: Marking already-used code as used (prevents reuse)
// ❌ Denied: Modifying other fields during usage
```

### Code Revocation
```javascript
// ✅ Allowed: Patient deleting their own code
// ❌ Denied: Caregiver deleting patient's code
```

## DeviceLink Rules

### Link Creation
```javascript
// ✅ Allowed: User creating link for themselves
{
  id: "DEVICE_123_USER_456",
  deviceId: "DEVICE_123",
  userId: currentUserId,
  role: "caregiver",
  status: "active",
  linkedAt: timestamp,
  linkedBy: currentUserId
}

// ✅ Allowed: Device owner creating link for their device
// ❌ Denied: Creating link for another user without device ownership
// ❌ Denied: Invalid role or status
```

### Link Read Access
```javascript
// ✅ Allowed: User reading their own link
// ✅ Allowed: Device owner reading all links to their device
// ❌ Denied: Reading other users' links (unless device owner)
```

### Link Updates
```javascript
// ✅ Allowed: User updating their own link
// ✅ Allowed: Device owner updating links to their device
// ❌ Denied: Updating other users' links (unless device owner)
```

### Link Revocation
```javascript
// ✅ Allowed: User deleting their own link (self-disconnect)
// ✅ Allowed: Device owner deleting any link to their device
// ❌ Denied: Deleting other users' links (unless device owner)
```

## Common Patterns

### Patient Device Provisioning Flow
1. Patient creates device → ✅ Allowed (if device doesn't exist)
2. Patient creates device link → ✅ Allowed (for themselves)
3. Patient generates connection code → ✅ Allowed (for their device)

### Caregiver Connection Flow
1. Caregiver reads connection code → ✅ Allowed (any authenticated user)
2. Caregiver marks code as used → ✅ Allowed (if code not already used)
3. Caregiver creates device link → ✅ Allowed (for themselves)
4. Caregiver reads device → ✅ Allowed (now linked)

### Patient Revoking Caregiver Access
1. Patient reads caregiver's device link → ✅ Allowed (device owner)
2. Patient deletes caregiver's device link → ✅ Allowed (device owner)
3. Caregiver can no longer read device → ❌ Denied (no longer linked)

## Error Codes

| Error Code | Meaning | Common Causes |
|------------|---------|---------------|
| `permission-denied` | Operation not allowed | Not authenticated, not authorized, validation failed |
| `not-found` | Document doesn't exist | Reading non-existent document |
| `already-exists` | Document already exists | Creating device that's already claimed |

## Testing Checklist

### Device Provisioning
- [ ] Patient can create unclaimed device
- [ ] Cannot create device that already exists
- [ ] Device owner can update device
- [ ] Device owner can read device
- [ ] Non-linked caregiver cannot read device
- [ ] Non-owner cannot update device

### Connection Codes
- [ ] Patient can create code for their device
- [ ] Authenticated user can read code
- [ ] Caregiver can mark code as used
- [ ] Cannot reuse already-used code
- [ ] Caregiver cannot delete patient's code
- [ ] Patient can delete their own code

### DeviceLinks
- [ ] Patient can create link during provisioning
- [ ] Caregiver can create link after code validation
- [ ] Users can read their own links
- [ ] Device owner can read all links
- [ ] Device owner can revoke caregiver links
- [ ] Non-linked users cannot read device

## Deployment

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Test security rules locally
firebase emulators:start --only firestore

# Run test suite
node test-device-provisioning-security-rules.js
```

## Monitoring

Watch for these patterns in Firebase Console:
- Multiple failed device creation attempts
- Unusual connection code usage patterns
- Frequent link creation/deletion
- Permission denied errors

## Best Practices

1. **Always validate on client**: Don't rely solely on security rules
2. **Use transactions**: For operations that modify multiple documents
3. **Monitor usage**: Set up alerts for unusual patterns
4. **Test thoroughly**: Run test suite before deploying
5. **Document changes**: Update this guide when rules change

## Support

For issues or questions:
1. Check Firebase Console for error details
2. Review test suite for examples
3. Consult SECURITY_RULES_IMPLEMENTATION.md for detailed documentation
4. Check Firebase documentation for rule syntax
