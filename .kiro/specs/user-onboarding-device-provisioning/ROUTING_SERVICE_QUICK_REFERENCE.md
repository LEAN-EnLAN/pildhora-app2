# Routing Service Quick Reference

## Import

```typescript
import { getPostAuthRoute, hasCompletedSetup } from '../services/routing';
```

## Core Functions

### getPostAuthRoute(user: User): Promise<string>

Determines post-authentication destination route.

**Returns:**
- `/patient/device-provisioning` - Patient without device
- `/caregiver/device-connection` - Caregiver without links
- `/patient/home` - Patient with device
- `/caregiver/dashboard` - Caregiver with links

**Usage:**
```typescript
const route = await getPostAuthRoute(user);
router.replace(route);
```

### hasCompletedSetup(user: User): Promise<boolean>

Checks if user has completed required setup.

**Usage:**
```typescript
const isComplete = await hasCompletedSetup(user);
if (!isComplete) {
  showOnboardingPrompt();
}
```

## Common Patterns

### After Login/Signup
```typescript
const handleAuthSuccess = async (user: User) => {
  try {
    const route = await getPostAuthRoute(user);
    router.replace(route);
  } catch (error) {
    if (error instanceof RoutingError) {
      Alert.alert('Error', error.userMessage);
    }
  }
};
```

### App Launch
```typescript
useEffect(() => {
  const checkAuth = async () => {
    const result = await dispatch(checkAuthState());
    if (checkAuthState.fulfilled.match(result) && result.payload) {
      const route = await getPostAuthRoute(result.payload);
      router.replace(route);
    }
  };
  checkAuth();
}, []);
```

### Protected Route Guard
```typescript
const ProtectedRoute = ({ user, children }) => {
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    hasCompletedSetup(user).then(setIsComplete);
  }, [user]);
  
  return isComplete ? children : <OnboardingPrompt />;
};
```

## Error Codes

| Code | User Message |
|------|--------------|
| `INVALID_USER` | Error de autenticación. Por favor, inicia sesión nuevamente. |
| `INVALID_USER_ROLE` | Rol de usuario no válido. Por favor, contacta al soporte. |
| `ROUTING_ERROR` | Ocurrió un error al determinar la ruta. Por favor, intenta nuevamente. |

## Routing Logic

```
Patient + No Device     → /patient/device-provisioning
Patient + Has Device    → /patient/home
Caregiver + No Links    → /caregiver/device-connection
Caregiver + Has Links   → /caregiver/dashboard
```

## Requirements Coverage

- ✅ 9.1: Check onboarding completion after authentication
- ✅ 9.2: Route patients without devices to provisioning
- ✅ 9.3: Route caregivers without links to connection
- ✅ 9.4: Route patients with devices to home
- ✅ 9.5: Route caregivers with links to dashboard

## Testing

```bash
npm test test-routing-service.js
```

## Troubleshooting

**Stuck in onboarding loop?**
- Check `onboardingComplete` flag in Firestore
- Verify device link exists in `deviceLinks` collection
- Check RTDB `users/{userId}/devices` mapping

**Wrong route for role?**
- Verify user role in Firestore
- Check role was set correctly during signup
- Ensure auth state is synchronized

## Related Files

- Implementation: `src/services/routing.ts`
- Tests: `test-routing-service.js`
- Full Guide: `ROUTING_SERVICE_GUIDE.md`
