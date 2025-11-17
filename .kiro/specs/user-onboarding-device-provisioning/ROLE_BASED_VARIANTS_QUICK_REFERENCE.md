# Role-Based Screen Variants - Quick Reference

## Quick Start

### Import the Hook
```typescript
import { useUserRole } from '../hooks/useUserRole';
```

### Use in Component
```typescript
const { role, isPatient, isCaregiver, user } = useUserRole();
```

### Conditional Rendering
```typescript
{isPatient && <PatientFeature />}
{isCaregiver && <CaregiverFeature />}
```

## Permission Functions

### Import
```typescript
import {
  canManageDevices,
  canSelectPatients,
  ownsDevice,
  canModifyDeviceSettings,
  canManageMedications,
} from '../utils/rolePermissions';
```

### Usage
```typescript
// Check if user can manage devices
if (canManageDevices(user)) {
  // Show device management UI
}

// Check if user can select patients
if (canSelectPatients(user)) {
  // Show patient selector
}

// Check if user owns a device
if (ownsDevice(user)) {
  // Show device owner features
}

// Check if user can modify device settings
if (canModifyDeviceSettings(user)) {
  // Show device configuration
}

// Check if user can manage medications
if (canManageMedications(user, deviceOnline)) {
  // Show medication management
}
```

## Common Patterns

### Pattern 1: Role-Based Component
```typescript
function MyScreen() {
  const { isPatient, isCaregiver } = useUserRole();
  
  if (isPatient) {
    return <PatientView />;
  }
  
  if (isCaregiver) {
    return <CaregiverView />;
  }
  
  return <LoadingView />;
}
```

### Pattern 2: Conditional Feature
```typescript
function FeatureScreen() {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <View>
      <CommonFeatures />
      
      {canManageDevices(user) && (
        <DeviceManagement />
      )}
      
      {canSelectPatients(user) && (
        <PatientSelector />
      )}
    </View>
  );
}
```

### Pattern 3: Navigation
```typescript
import { getHomeRoute } from '../utils/rolePermissions';

function NavigateHome() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  
  const handleNavigate = () => {
    router.push(getHomeRoute(user));
  };
  
  return <Button onPress={handleNavigate}>Home</Button>;
}
```

## Permission Matrix

| Function | Patient (No Device) | Patient (With Device) | Caregiver |
|----------|--------------------|-----------------------|-----------|
| `canManageDevices()` | ❌ | ✅ | ❌ |
| `canSelectPatients()` | ❌ | ❌ | ✅ |
| `ownsDevice()` | ❌ | ✅ | ❌ |
| `canModifyDeviceSettings()` | ❌ | ✅ | ❌ |
| `canViewDeviceState()` | ❌ | ✅ | ✅ |
| `canManageMedications()` | ✅ | ❌ (if online) | ✅ |

## Component Reference

### RoleBasedSettings
```typescript
import { RoleBasedSettings } from '../components/shared/RoleBasedSettings';

// Use in screen
export default function Settings() {
  return <RoleBasedSettings />;
}
```

**Features:**
- Automatic role detection
- Patient variant: Device management
- Caregiver variant: Patient management
- Shared: Notifications, profile, device info

## File Locations

```
src/
├── hooks/
│   └── useUserRole.ts              # Role detection hook
├── utils/
│   └── rolePermissions.ts          # Permission utilities
└── components/
    └── shared/
        └── RoleBasedSettings.tsx   # Unified settings component

app/
├── patient/
│   └── settings.tsx                # Patient settings (uses RoleBasedSettings)
└── caregiver/
    └── settings.tsx                # Caregiver settings (uses RoleBasedSettings)
```

## Common Use Cases

### Use Case 1: Show Device Management
```typescript
const { user } = useSelector((state) => state.auth);

{canManageDevices(user) && (
  <Button onPress={() => router.push('/patient/device-settings')}>
    Manage Device
  </Button>
)}
```

### Use Case 2: Show Patient Selector
```typescript
const { isCaregiver } = useUserRole();

{isCaregiver && (
  <PatientSelector
    patients={linkedPatients}
    selectedPatientId={selectedId}
    onSelectPatient={setSelectedId}
  />
)}
```

### Use Case 3: Conditional Medication Management
```typescript
const { user } = useSelector((state) => state.auth);
const deviceOnline = deviceState?.is_online;

{canManageMedications(user, deviceOnline) && (
  <Button onPress={() => router.push('/patient/medications')}>
    Manage Medications
  </Button>
)}
```

### Use Case 4: Role-Based Welcome Message
```typescript
const { isPatient, isCaregiver, user } = useUserRole();

<Text>
  Hola, {user?.name || (isPatient ? 'Paciente' : 'Cuidador')}
</Text>
```

## Testing Checklist

- [ ] Hook returns correct role for patient
- [ ] Hook returns correct role for caregiver
- [ ] Permission functions work for all user states
- [ ] Components render patient variant correctly
- [ ] Components render caregiver variant correctly
- [ ] Device management shown only to device owners
- [ ] Patient selection shown only to caregivers
- [ ] Navigation routes correctly for each role

## Troubleshooting

### Problem: Role not detected
**Solution:** Check that user is authenticated and auth state is populated

### Problem: Permission denied incorrectly
**Solution:** Verify user.deviceId is set for patients with devices

### Problem: Wrong variant rendering
**Solution:** Check that useUserRole is called and role is checked correctly

### Problem: Features not showing
**Solution:** Verify permission function is used and returns true

## Best Practices

✅ **DO:**
- Use `useUserRole` hook for role detection
- Use permission utilities for feature checks
- Check device ownership before showing device features
- Use role-based routing helpers

❌ **DON'T:**
- Check `user?.role` directly in components
- Duplicate permission logic
- Hardcode routes
- Assume user is authenticated

## Quick Commands

### Run Tests
```bash
node test-role-based-screen-variants.js
```

### Check TypeScript
```bash
npx tsc --noEmit
```

### View Documentation
- Completion Summary: `.kiro/specs/user-onboarding-device-provisioning/TASK14_COMPLETION_SUMMARY.md`
- Visual Guide: `.kiro/specs/user-onboarding-device-provisioning/ROLE_BASED_VARIANTS_VISUAL_GUIDE.md`
- This Quick Reference: `.kiro/specs/user-onboarding-device-provisioning/ROLE_BASED_VARIANTS_QUICK_REFERENCE.md`

## Related Requirements

- **6.1**: Patient variant rendering for shared screens
- **6.2**: Caregiver variant rendering for shared screens
- **6.3**: Role detection from authenticated user's role
- **6.4**: Device management features restricted to device owners
- **6.5**: Patient selection features restricted to caregivers

## Support

For questions or issues:
1. Check the Visual Guide for detailed explanations
2. Review the Completion Summary for implementation details
3. Run the test suite to verify functionality
4. Check TypeScript diagnostics for type errors
