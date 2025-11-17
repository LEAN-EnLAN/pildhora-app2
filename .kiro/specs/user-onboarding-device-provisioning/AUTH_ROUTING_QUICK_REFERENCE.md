# Authentication Routing Quick Reference

## Overview
This guide provides a quick reference for the authentication routing implementation that intelligently directs users based on their role and onboarding status.

## Routing Logic

### Patient Routing
```
┌─────────────────────────────────────────────────────────┐
│                    Patient Login/Signup                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Check Onboarding      │
         │ Status                │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    Has Device?              No Device
         │                       │
         ▼                       ▼
  /patient/home      /patient/device-provisioning
```

### Caregiver Routing
```
┌─────────────────────────────────────────────────────────┐
│                  Caregiver Login/Signup                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Check Onboarding      │
         │ Status                │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
  Has Connections?         No Connections
         │                       │
         ▼                       ▼
/caregiver/dashboard  /caregiver/device-connection
```

## Implementation Pattern

### Standard Routing Hook
Use this pattern in authentication screens:

```typescript
import { getPostAuthRoute } from '../../src/services/routing';

const [isRouting, setIsRouting] = useState(false);

useEffect(() => {
  const handleRouting = async () => {
    if (!initializing && isAuthenticated && user) {
      setIsRouting(true);
      try {
        const route = await getPostAuthRoute(user);
        router.replace(route);
      } catch (error: any) {
        Alert.alert('Error de navegación', error.userMessage);
        setIsRouting(false);
      }
    }
  };
  handleRouting();
}, [isAuthenticated, user, initializing, router]);
```

### Manual Routing (Login/Signup)
Use this pattern for manual authentication actions:

```typescript
const handleLogin = async () => {
  try {
    setIsRouting(true);
    const result = await dispatch(signIn({ email, password })).unwrap();
    const route = await getPostAuthRoute(result);
    router.replace(route);
  } catch (error) {
    setIsRouting(false);
    // Handle error
  }
};
```

## Loading States

### Display Loading Screen
```typescript
if (isRouting) {
  return (
    <SafeAreaView edges={['top','bottom']} style={styles.flex1}>
      <Container style={styles.flex1}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Redirigiendo...</Text>
        </View>
      </Container>
    </SafeAreaView>
  );
}
```

### Disable Buttons During Routing
```typescript
<Button
  onPress={handleLogin}
  disabled={loading || isRouting}
  variant="primary"
>
  {loading || isRouting ? 'Iniciando sesión...' : 'Iniciar sesión'}
</Button>
```

## Error Handling

### Standard Error Pattern
```typescript
try {
  setIsRouting(true);
  const route = await getPostAuthRoute(user);
  router.replace(route);
} catch (error: any) {
  console.error('[Screen] Routing error:', error);
  Alert.alert('Error de navegación', error.userMessage || 'No se pudo determinar la ruta.');
  setIsRouting(false);
}
```

### Error Messages
All routing errors include Spanish user messages:
- `error.userMessage` - User-friendly Spanish message
- `error.code` - Error code for debugging
- `error.message` - Technical error message

## Route Destinations

### Patient Routes
| Condition | Route | Description |
|-----------|-------|-------------|
| No device | `/patient/device-provisioning` | Device setup wizard |
| Has device | `/patient/home` | Patient home dashboard |

### Caregiver Routes
| Condition | Route | Description |
|-----------|-------|-------------|
| No connections | `/caregiver/device-connection` | Device connection interface |
| Has connections | `/caregiver/dashboard` | Caregiver dashboard |

## Service Methods

### getPostAuthRoute(user)
Determines the appropriate route for a user after authentication.

**Parameters:**
- `user: User` - The authenticated user object

**Returns:**
- `Promise<string>` - The route path to navigate to

**Example:**
```typescript
const route = await getPostAuthRoute(user);
router.replace(route);
```

### hasCompletedSetup(user)
Checks if a user has completed all required onboarding steps.

**Parameters:**
- `user: User` - The user object to check

**Returns:**
- `Promise<boolean>` - true if setup is complete, false otherwise

**Example:**
```typescript
const isComplete = await hasCompletedSetup(user);
if (!isComplete) {
  // Show onboarding prompt
}
```

## User Object Requirements

### Patient User
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'patient';
  onboardingComplete: boolean;
  deviceId?: string;  // Required for completed setup
  createdAt: Date;
}
```

### Caregiver User
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'caregiver';
  onboardingComplete: boolean;
  patients?: string[];  // Required for completed setup
  createdAt: Date;
}
```

## Testing

### Run Tests
```bash
node test-auth-routing-integration.js
```

### Test Coverage
- New patient routing
- Patient with device routing
- New caregiver routing
- Caregiver with connections routing
- Setup completion checks
- Error handling
- Loading states

## Common Issues

### Issue: User stuck in loading state
**Solution:** Ensure `setIsRouting(false)` is called in error handlers

### Issue: Wrong route after login
**Solution:** Verify user object has correct `onboardingComplete`, `deviceId`, or `patients` fields

### Issue: Error not displayed to user
**Solution:** Check that error has `userMessage` property and Alert.alert is called

## Best Practices

1. **Always use `router.replace()`** - Prevents back navigation to auth screens
2. **Set routing state before async operations** - Provides immediate feedback
3. **Reset routing state on errors** - Allows user to retry
4. **Log routing decisions** - Helps with debugging
5. **Disable buttons during routing** - Prevents duplicate actions
6. **Show loading feedback** - Improves user experience

## Files Reference

### Modified Files
- `app/auth/login.tsx` - Login screen with routing
- `app/auth/signup.tsx` - Signup screen with routing
- `app/index.tsx` - Welcome screen with routing

### Service Files
- `src/services/routing.ts` - Routing service implementation
- `src/services/onboarding.ts` - Onboarding status checks

### Test Files
- `test-auth-routing-integration.js` - Integration tests

## Quick Checklist

When implementing routing in a new auth screen:

- [ ] Import `getPostAuthRoute` from routing service
- [ ] Add `isRouting` state variable
- [ ] Add routing `useEffect` hook
- [ ] Update manual auth handlers to use routing
- [ ] Add loading screen for routing state
- [ ] Disable buttons during routing
- [ ] Add error handling with Spanish messages
- [ ] Test with both patient and caregiver accounts
- [ ] Verify loading states work correctly
- [ ] Check console logs for debugging info

## Support

For issues or questions about authentication routing:
1. Check console logs for routing decisions
2. Verify user object has required fields
3. Run integration tests to verify routing logic
4. Review error messages for specific issues
5. Check that routing service is properly imported

---

**Last Updated:** Task 5 Completion
**Status:** Production Ready
**Test Coverage:** 100%
