# Testing Quick Start Guide

## Automated Integration Tests

### Prerequisites

1. **Firebase Project Setup**
   - Authentication enabled
   - Firestore database created
   - Realtime Database created
   - Security rules deployed

2. **Environment Configuration**
   
   Create a `.env` file or set environment variables:
   ```bash
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   ```

### Running Tests

```bash
# Run the complete integration test suite
node test-final-integration.js
```

### Test Output

The test suite will:
1. Initialize Firebase
2. Run 6 comprehensive test suites
3. Clean up test data automatically
4. Display results summary

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║  Final Integration and Testing Suite                      ║
║  User Onboarding & Device Provisioning System             ║
╚════════════════════════════════════════════════════════════╝

✓ Firebase initialized

=== Testing Patient Onboarding Flow ===
✅ Patient onboarding flow completed successfully

=== Testing Caregiver Onboarding Flow ===
✅ Caregiver onboarding flow completed successfully

=== Testing Multi-Caregiver Connection ===
✅ Multi-caregiver connection completed successfully

=== Testing Error Scenarios ===
✅ Error scenarios tested successfully

=== Testing Security and Permissions ===
✅ Security and permissions tested successfully

=== Testing Data Synchronization ===
✅ Data synchronization tested successfully

╔════════════════════════════════════════════════════════════╗
║  Test Summary                                              ║
╚════════════════════════════════════════════════════════════╝

Total Tests: 6
Passed: 6 ✅
Failed: 0 ❌
Success Rate: 100.0%
```

## Manual Testing

### Patient Flow Testing

1. **Create Patient Account**
   ```
   Email: test-patient@example.com
   Password: TestPassword123!
   Role: Patient
   ```

2. **Complete Device Provisioning**
   - Enter device ID (e.g., TEST-DEVICE-001)
   - Configure WiFi
   - Set preferences
   - Complete wizard

3. **Verify**
   - Redirected to patient home
   - Device status visible
   - Medications accessible

### Caregiver Flow Testing

1. **Create Caregiver Account**
   ```
   Email: test-caregiver@example.com
   Password: TestPassword123!
   Role: Caregiver
   ```

2. **Connect to Patient Device**
   - Get connection code from patient
   - Enter code in connection screen
   - Confirm connection

3. **Verify**
   - Redirected to caregiver dashboard
   - Patient visible in selector
   - Device status accessible

## Test Scenarios

### Scenario 1: New Patient Setup
1. Sign up as patient
2. Provision device
3. Configure settings
4. Access patient home

### Scenario 2: New Caregiver Setup
1. Sign up as caregiver
2. Get connection code from patient
3. Connect to patient device
4. Access caregiver dashboard

### Scenario 3: Multiple Caregivers
1. Patient generates first code
2. Caregiver 1 connects
3. Patient generates second code
4. Caregiver 2 connects
5. Both caregivers see patient

### Scenario 4: Error Handling
1. Try to provision already claimed device
2. Try to use expired connection code
3. Try to use already used code
4. Verify error messages

## Quick Verification Checklist

### Patient Onboarding ✓
- [ ] Account created
- [ ] Device provisioned
- [ ] Onboarding complete
- [ ] Redirected to home

### Caregiver Onboarding ✓
- [ ] Account created
- [ ] Code validated
- [ ] Device linked
- [ ] Redirected to dashboard

### Security ✓
- [ ] Patient can only see own device
- [ ] Caregiver can only see linked devices
- [ ] Codes expire after 24 hours
- [ ] Codes are single-use

### Performance ✓
- [ ] Sync within 5 seconds
- [ ] UI responsive
- [ ] No lag or freezing

## Troubleshooting

### Test Failures

**Firebase initialization error**
- Check environment variables
- Verify Firebase project configuration
- Ensure network connectivity

**Authentication errors**
- Verify Firebase Auth is enabled
- Check email/password settings
- Ensure test users don't already exist

**Database errors**
- Verify Firestore is enabled
- Check RTDB is enabled
- Ensure security rules allow test operations

**Cleanup errors**
- Tests automatically clean up
- Manual cleanup: Delete test users from Firebase Console
- Delete test documents from Firestore

### Common Issues

**"User already exists"**
- Test users from previous run
- Delete from Firebase Console
- Or use different email addresses

**"Permission denied"**
- Security rules too restrictive
- Ensure test environment rules allow operations
- Check authentication status

**"Network error"**
- Check internet connection
- Verify Firebase project is accessible
- Check firewall settings

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - name: Run Integration Tests
        env:
          EXPO_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          EXPO_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          EXPO_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
          EXPO_PUBLIC_FIREBASE_DATABASE_URL: ${{ secrets.FIREBASE_DATABASE_URL }}
        run: node test-final-integration.js
```

## Documentation

- **Full Testing Guide**: `TASK27_FINAL_INTEGRATION_TESTING.md`
- **Completion Summary**: `TASK27_COMPLETION_SUMMARY.md`
- **Test Suite**: `test-final-integration.js`

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review full testing documentation
3. Check Firebase Console for errors
4. Review test output for specific failures

---

**Quick Start Complete!** 🚀

Run `node test-final-integration.js` to begin testing.
