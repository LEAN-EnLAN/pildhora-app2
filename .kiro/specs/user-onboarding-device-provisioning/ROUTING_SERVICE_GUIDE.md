# Routing Service Implementation Guide

## Overview

The Routing Service provides intelligent post-authentication navigation based on user role and onboarding status. It determines where users should be directed after login or signup to ensure they complete necessary setup steps before accessing the main application.

## Requirements Coverage

This implementation addresses the following requirements:

- **Requirement 9.1**: Check if user has completed onboarding after authentication
- **Requirement 9.2**: Route patients without devices to provisioning wizard
- **Requirement 9.3**: Route caregivers without links to connection interface
- **Requirement 9.4**: Route patients with devices to home dashboard
- **Requirement 9.5**: Route caregivers with links to dashboard

## Architecture

### Service Location
- **File**: `src/services/routing.ts`
- **Dependencies**: 
  - `src/types/index.ts` (User interface)
  - `src/services/onboarding.ts` (needsOnboarding function)

### Key Components

1. **RoutingService Interface**: Defines the contract for routing operations
2. **getPostAuthRoute()**: Determines destination route after authentication
3. **hasCompletedSetup()**: Checks if user has finished required setup
4. **RoutingError**: Custom error class for routing failures

## API Reference

### getPostAuthRoute(user: User): Promise<string>

Determines where to route a user after successful authentication.

**Parameters:**
- `user` (User): The authenticated user object

**Returns:**
- Promise<string>: The route path to navigate to

**Routing Logic:**

```typescript
// Patient without device
if (role === 'patient' && !deviceId) {
  return '/patient/device-provisioning';
}

// Caregiver without links
if (role === 'caregiver' && patients.length === 0) {
  return '/caregiver/device-connection';
}

// Patient with device
if (role === 'patient' && deviceId) {
  return '/patient/home';
}

// Caregiver with links
if (role === 'caregiver' && patients.length > 0) {
  return '/caregiver/dashboard';
}
```

**Example Usage:**

```typescript
import { getPostAuthRoute } from '../services/routing';

// After successful login
const handleLoginSuccess = async (user: User) => {
  try {
    const route = await getPostAuthRoute(user);
    router.push(route);
  } catch (error) {
    console.error('Routing error:', error);
    // Show error message to user
  }
};
```

### hasCompletedSetup(user: User): Promise<boolean>

Checks if a user has completed all required onboarding steps.

**Parameters:**
- `user` (User): The user object to check

**Returns:**
- Promise<boolean>: true if setup is complete, false otherwise

**Logic:**

```typescript
// If onboarding is marked complete
if (user.onboardingComplete) {
  return true;
}

// Check if user needs onboarding
const needsSetup = await needsOnboarding(user.id, user.role);
return !needsSetup;
```

**Example Usage:**

```typescript
import { hasCompletedSetup } from '../services/routing';

// Check setup status
const checkSetupStatus = async (user: User) => {
  const isComplete = await hasCompletedSetup(user);
  
  if (!isComplete) {
    // Show onboarding prompt
    showOnboardingPrompt();
  }
};
```

## Error Handling

### RoutingError Class

Custom error class with user-friendly messages:

```typescript
export class RoutingError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'RoutingError';
  }
}
```

### Error Codes

| Code | Description | User Message (Spanish) |
|------|-------------|------------------------|
| `INVALID_USER` | User object is null/undefined | Error de autenticación. Por favor, inicia sesión nuevamente. |
| `INVALID_USER_ID` | User ID is missing or invalid | Error de autenticación. Por favor, inicia sesión nuevamente. |
| `INVALID_USER_ROLE` | User role is not 'patient' or 'caregiver' | Rol de usuario no válido. Por favor, contacta al soporte. |
| `UNKNOWN_ROUTE` | Unable to determine route | No se pudo determinar la ruta. Por favor, contacta al soporte. |
| `ROUTING_ERROR` | General routing error | Ocurrió un error al determinar la ruta. Por favor, intenta nuevamente. |
| `SETUP_CHECK_ERROR` | Error checking setup status | Ocurrió un error al verificar el estado de configuración. Por favor, intenta nuevamente. |

### Error Handling Example

```typescript
try {
  const route = await getPostAuthRoute(user);
  router.push(route);
} catch (error) {
  if (error instanceof RoutingError) {
    // Show user-friendly message
    Alert.alert('Error', error.userMessage);
    
    // Log technical details
    console.error('Routing error:', {
      code: error.code,
      message: error.message
    });
  } else {
    // Handle unexpected errors
    Alert.alert('Error', 'Ocurrió un error inesperado');
  }
}
```

## Integration Points

### 1. Authentication Screens

Update login and signup screens to use routing service:

```typescript
// app/auth/login.tsx
import { getPostAuthRoute } from '../../src/services/routing';

const handleLogin = async () => {
  try {
    const result = await dispatch(signIn({ email, password }));
    
    if (signIn.fulfilled.match(result)) {
      const user = result.payload;
      const route = await getPostAuthRoute(user);
      router.replace(route);
    }
  } catch (error) {
    // Handle error
  }
};
```

### 2. App Entry Point

Check onboarding status on app launch:

```typescript
// app/index.tsx
import { getPostAuthRoute } from '../src/services/routing';

useEffect(() => {
  const checkAuth = async () => {
    const result = await dispatch(checkAuthState());
    
    if (checkAuthState.fulfilled.match(result)) {
      const user = result.payload;
      
      if (user) {
        const route = await getPostAuthRoute(user);
        router.replace(route);
      } else {
        router.replace('/auth/welcome');
      }
    }
  };
  
  checkAuth();
}, []);
```

### 3. Protected Routes

Use hasCompletedSetup to guard routes:

```typescript
// Protected route component
const ProtectedRoute = ({ children, user }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const complete = await hasCompletedSetup(user);
        setIsComplete(complete);
      } catch (error) {
        console.error('Setup check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSetup();
  }, [user]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isComplete) {
    return <OnboardingPrompt />;
  }
  
  return children;
};
```

## Testing

### Unit Tests

The routing service includes comprehensive unit tests:

```bash
npm test test-routing-service.js
```

### Test Coverage

- ✅ Patient without device → provisioning wizard
- ✅ Caregiver without links → connection interface
- ✅ Patient with device → home
- ✅ Caregiver with links → dashboard
- ✅ Invalid user validation
- ✅ Invalid role validation
- ✅ Setup completion checks

### Manual Testing Checklist

1. **New Patient Signup**
   - [ ] Create new patient account
   - [ ] Verify redirect to `/patient/device-provisioning`
   - [ ] Complete device provisioning
   - [ ] Verify redirect to `/patient/home`

2. **New Caregiver Signup**
   - [ ] Create new caregiver account
   - [ ] Verify redirect to `/caregiver/device-connection`
   - [ ] Connect to patient device
   - [ ] Verify redirect to `/caregiver/dashboard`

3. **Existing User Login**
   - [ ] Login as patient with device
   - [ ] Verify redirect to `/patient/home`
   - [ ] Login as caregiver with links
   - [ ] Verify redirect to `/caregiver/dashboard`

4. **Incomplete Onboarding**
   - [ ] Login as patient without device
   - [ ] Verify redirect to `/patient/device-provisioning`
   - [ ] Login as caregiver without links
   - [ ] Verify redirect to `/caregiver/device-connection`

## Flow Diagrams

### Post-Authentication Routing Flow

```
┌─────────────────┐
│  User Logs In   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get User Data   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ getPostAuthRoute(user)  │
└────────┬────────────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Patient        │  │ Caregiver      │  │ Completed      │
│ No Device      │  │ No Links       │  │ Setup          │
└────────┬───────┘  └────────┬───────┘  └────────┬───────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ /patient/      │  │ /caregiver/    │  │ /patient/home  │
│ device-        │  │ device-        │  │ or             │
│ provisioning   │  │ connection     │  │ /caregiver/    │
│                │  │                │  │ dashboard      │
└────────────────┘  └────────────────┘  └────────────────┘
```

### Setup Completion Check Flow

```
┌─────────────────────┐
│ hasCompletedSetup() │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ onboarding   │ Yes
    │ Complete?    ├────────► Return true
    └──────┬───────┘
           │ No
           ▼
    ┌──────────────┐
    │ needsOnboard │
    │ ing()?       │
    └──────┬───────┘
           │
           ├─────────┬─────────┐
           │         │         │
           ▼         ▼         ▼
        ┌─────┐  ┌─────┐  ┌─────┐
        │ Yes │  │ No  │  │Error│
        └──┬──┘  └──┬──┘  └──┬──┘
           │        │        │
           ▼        ▼        ▼
      Return    Return    Throw
      false     true      Error
```

## Best Practices

### 1. Always Validate User Object

```typescript
// ✅ Good
const route = await getPostAuthRoute(user);

// ❌ Bad - no validation
const route = `/patient/home`; // Hardcoded
```

### 2. Handle Errors Gracefully

```typescript
// ✅ Good
try {
  const route = await getPostAuthRoute(user);
  router.push(route);
} catch (error) {
  if (error instanceof RoutingError) {
    showError(error.userMessage);
  }
}

// ❌ Bad - no error handling
const route = await getPostAuthRoute(user);
router.push(route);
```

### 3. Use Replace Instead of Push

```typescript
// ✅ Good - prevents back navigation to auth screens
router.replace(route);

// ❌ Bad - allows back navigation
router.push(route);
```

### 4. Check Setup Status Before Protected Actions

```typescript
// ✅ Good
const isComplete = await hasCompletedSetup(user);
if (!isComplete) {
  showOnboardingPrompt();
  return;
}
performProtectedAction();

// ❌ Bad - no setup check
performProtectedAction();
```

## Troubleshooting

### Issue: User stuck in onboarding loop

**Symptoms**: User is redirected to onboarding screen even after completing setup

**Solution**:
1. Check if `onboardingComplete` flag is set in Firestore
2. Verify device link exists in `deviceLinks` collection
3. Check RTDB `users/{userId}/devices` mapping

```typescript
// Debug helper
const debugOnboardingStatus = async (user: User) => {
  console.log('User data:', {
    id: user.id,
    role: user.role,
    onboardingComplete: user.onboardingComplete,
    deviceId: user.deviceId,
    patients: user.patients
  });
  
  const needsSetup = await needsOnboarding(user.id, user.role);
  console.log('Needs onboarding:', needsSetup);
  
  const route = await getPostAuthRoute(user);
  console.log('Determined route:', route);
};
```

### Issue: Wrong route for user role

**Symptoms**: Patient routed to caregiver screens or vice versa

**Solution**:
1. Verify user role in Firestore user document
2. Check if role was set correctly during signup
3. Ensure auth state is properly synchronized

```typescript
// Verify user role
const verifyUserRole = async (userId: string) => {
  const db = await getDbInstance();
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    console.log('User role:', userData.role);
  }
};
```

### Issue: Routing service throws errors

**Symptoms**: RoutingError exceptions during navigation

**Solution**:
1. Check network connectivity
2. Verify Firebase initialization
3. Ensure user object is properly loaded

```typescript
// Error recovery
const safeGetPostAuthRoute = async (user: User) => {
  try {
    return await getPostAuthRoute(user);
  } catch (error) {
    if (error instanceof RoutingError) {
      // Log error and provide fallback
      console.error('Routing error:', error);
      
      // Fallback to default route based on role
      return user.role === 'patient' 
        ? '/patient/home' 
        : '/caregiver/dashboard';
    }
    throw error;
  }
};
```

## Future Enhancements

### Phase 2 Features

1. **Route History Tracking**
   - Track user navigation history
   - Provide "resume where you left off" functionality
   - Analytics on routing patterns

2. **Dynamic Route Configuration**
   - Configure routes via remote config
   - A/B test different onboarding flows
   - Feature flags for route variations

3. **Smart Routing**
   - ML-based route prediction
   - Personalized onboarding paths
   - Context-aware navigation

4. **Deep Linking Support**
   - Handle deep links with onboarding checks
   - Preserve intended destination after onboarding
   - Share-to-app functionality

## Conclusion

The Routing Service provides a robust, maintainable solution for post-authentication navigation. It ensures users complete necessary setup steps while providing a smooth, intuitive experience. The service is designed to be extensible and can easily accommodate future routing requirements.

## Related Documentation

- [Onboarding Service Guide](./ONBOARDING_SERVICE_QUICK_REFERENCE.md)
- [Task 1 Completion Summary](./TASK1_COMPLETION_SUMMARY.md)
- [Task 2 Completion Summary](./TASK2_COMPLETION_SUMMARY.md)
- [Task 3 Completion Summary](./TASK3_COMPLETION_SUMMARY.md)
- [Design Document](./design.md)
- [Requirements Document](./requirements.md)
