# Onboarding Service - Quick Reference

## Import

```typescript
import {
  needsOnboarding,
  getOnboardingStep,
  updateOnboardingStep,
  completeOnboarding,
  OnboardingError
} from '@/services/onboarding';
```

## Methods

### `needsOnboarding(userId, role)`
Check if user needs to complete onboarding.

```typescript
const needsSetup = await needsOnboarding(user.id, user.role);
// Returns: boolean
```

**Logic**:
- Returns `false` if `onboardingComplete === true`
- **Patients**: Returns `true` if no `deviceId`
- **Caregivers**: Returns `true` if no linked patients

---

### `getOnboardingStep(userId)`
Get current onboarding step.

```typescript
const step = await getOnboardingStep(user.id);
// Returns: 'device_provisioning' | 'device_connection' | 'complete' | null
```

**Returns**:
- `null` if onboarding is complete
- Current step value otherwise

---

### `updateOnboardingStep(userId, step)`
Update onboarding progress.

```typescript
await updateOnboardingStep(user.id, 'device_provisioning');
// Returns: void
```

**Valid Steps**:
- `'device_provisioning'`
- `'device_connection'`
- `'complete'`

**Security**: User can only update their own onboarding.

---

### `completeOnboarding(userId)`
Mark onboarding as complete.

```typescript
await completeOnboarding(user.id);
// Returns: void
```

**Effects**:
- Sets `onboardingComplete = true`
- Sets `onboardingStep = 'complete'`

**Security**: User can only complete their own onboarding.

---

## Error Handling

### Error Codes
- `INVALID_USER_ID` - Invalid user ID
- `INVALID_ONBOARDING_STEP` - Invalid step value
- `AUTH_NOT_INITIALIZED` - Firebase not ready
- `NOT_AUTHENTICATED` - User not logged in
- `USER_ID_MISMATCH` - Wrong user
- `FIRESTORE_NOT_INITIALIZED` - Firestore not ready
- `USER_NOT_FOUND` - User doesn't exist
- `PERMISSION_DENIED` - No permission
- `SERVICE_UNAVAILABLE` - Network issue
- `TIMEOUT` - Operation timeout
- `UNKNOWN_ERROR` - Unexpected error

### Catching Errors

```typescript
try {
  await needsOnboarding(user.id, user.role);
} catch (error) {
  if (error instanceof OnboardingError) {
    console.error('Code:', error.code);
    console.error('User message:', error.userMessage);
    console.error('Retryable:', error.retryable);
  }
}
```

---

## Common Patterns

### Post-Login Routing

```typescript
// In login/signup success handler
const user = await getCurrentUser();
const needsSetup = await needsOnboarding(user.id, user.role);

if (needsSetup) {
  if (user.role === 'patient') {
    router.push('/patient/device-provisioning');
  } else {
    router.push('/caregiver/device-connection');
  }
} else {
  router.push(user.role === 'patient' ? '/patient/home' : '/caregiver/dashboard');
}
```

### Wizard Progress Tracking

```typescript
// At the start of each wizard step
await updateOnboardingStep(user.id, 'device_provisioning');

// When wizard completes
await completeOnboarding(user.id);
router.push('/patient/home');
```

### Resume Interrupted Onboarding

```typescript
// On app startup
const step = await getOnboardingStep(user.id);

if (step === 'device_provisioning') {
  router.push('/patient/device-provisioning');
} else if (step === 'device_connection') {
  router.push('/caregiver/device-connection');
}
```

### Check Before Showing Features

```typescript
// Before showing device-dependent features
const needsSetup = await needsOnboarding(user.id, 'patient');

if (needsSetup) {
  showSetupPrompt();
} else {
  showDeviceFeatures();
}
```

---

## Integration with Redux

```typescript
// In authSlice or onboardingSlice
import { needsOnboarding, completeOnboarding } from '@/services/onboarding';

export const checkOnboardingStatus = createAsyncThunk(
  'onboarding/checkStatus',
  async (_, { getState }) => {
    const { user } = getState().auth;
    const needsSetup = await needsOnboarding(user.id, user.role);
    return { needsSetup };
  }
);

export const finishOnboarding = createAsyncThunk(
  'onboarding/finish',
  async (_, { getState }) => {
    const { user } = getState().auth;
    await completeOnboarding(user.id);
  }
);
```

---

## Testing

### Mock for Tests

```typescript
jest.mock('@/services/onboarding', () => ({
  needsOnboarding: jest.fn(),
  getOnboardingStep: jest.fn(),
  updateOnboardingStep: jest.fn(),
  completeOnboarding: jest.fn(),
}));

// In test
import * as onboardingService from '@/services/onboarding';

onboardingService.needsOnboarding.mockResolvedValue(true);
```

---

## Requirements Mapping

| Method | Requirements |
|--------|-------------|
| `needsOnboarding` | 9.1, 9.2, 9.3 |
| `getOnboardingStep` | 9.2, 9.3 |
| `updateOnboardingStep` | 9.2, 9.3 |
| `completeOnboarding` | 9.4, 9.5 |

---

## Performance Notes

- All methods use retry logic (3 attempts with exponential backoff)
- Firestore reads are cached by Firebase SDK
- Methods are async - use `await` or `.then()`
- No local caching - always reads from Firestore

---

## Security Notes

- ✅ User can only modify their own onboarding
- ✅ Authentication required for update operations
- ✅ Input validation on all parameters
- ✅ Firestore security rules should enforce ownership
- ✅ No sensitive data exposed in error messages
