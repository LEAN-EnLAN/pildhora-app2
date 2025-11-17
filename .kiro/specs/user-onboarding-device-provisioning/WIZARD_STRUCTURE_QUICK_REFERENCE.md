# Device Provisioning Wizard - Quick Reference

## 🚀 Quick Start

### Using the Wizard

```typescript
import { DeviceProvisioningWizard } from '@/components/patient/provisioning';

<DeviceProvisioningWizard
  userId={user.id}
  onComplete={handleComplete}
  onCancel={handleCancel}
/>
```

### Creating a Step Component

```typescript
import { useWizardContext } from '@/components/patient/provisioning';

export function MyStep() {
  const { formData, updateFormData, setCanProceed } = useWizardContext();
  
  // Update form data
  const handleChange = (value: string) => {
    updateFormData({ deviceId: value });
    setCanProceed(value.length > 0); // Enable/disable Next button
  };
  
  return (
    <View>
      <Input 
        value={formData.deviceId} 
        onChangeText={handleChange} 
      />
    </View>
  );
}
```

## 📁 File Structure

```
app/patient/
  └── device-provisioning.tsx          # Entry screen

src/components/patient/provisioning/
  ├── index.ts                         # Exports
  ├── DeviceProvisioningWizard.tsx     # Main wizard container
  ├── WizardProgressIndicator.tsx      # Progress UI
  ├── WizardContext.tsx                # State management
  └── ExitConfirmationDialog.tsx       # Exit dialog
```

## 🎯 Wizard Steps

| Step | Label | Purpose |
|------|-------|---------|
| 0 | Bienvenida | Welcome and instructions |
| 1 | ID del Dispositivo | Device ID entry |
| 2 | Verificación | Device verification |
| 3 | WiFi | WiFi configuration |
| 4 | Preferencias | Device preferences |
| 5 | Completado | Completion summary |

## 📊 Form Data

```typescript
interface DeviceProvisioningFormData {
  deviceId: string;              // Required
  wifiSSID?: string;             // Optional
  wifiPassword?: string;         // Optional
  alarmMode: 'sound' | 'vibrate' | 'both' | 'silent';
  ledIntensity: number;          // 0-100
  ledColor: string;              // Hex color
  volume: number;                // 0-100
}
```

## 🔧 Context API

### Available Methods

```typescript
const {
  formData,           // Current form data
  updateFormData,     // Update form data
  setCanProceed,      // Enable/disable Next button
  userId              // Current user ID
} = useWizardContext();
```

### Updating Form Data

```typescript
// Single field
updateFormData({ deviceId: 'DEVICE-001' });

// Multiple fields
updateFormData({
  wifiSSID: 'MyNetwork',
  wifiPassword: 'password123'
});
```

### Controlling Navigation

```typescript
// Enable Next button
setCanProceed(true);

// Disable Next button (validation failed)
setCanProceed(false);
```

## 🎨 Styling

### Using Theme Tokens

```typescript
import { colors, spacing, typography, borderRadius } from '@/theme/tokens';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
});
```

## ♿ Accessibility

### Required Props

```typescript
<Button
  accessibilityLabel="Clear description"
  accessibilityHint="What happens when pressed"
  accessibilityRole="button"
/>
```

### Announcements

```typescript
import { announceForAccessibility } from '@/utils/accessibility';

announceForAccessibility('Device verified successfully');
```

### Haptic Feedback

```typescript
import { triggerHapticFeedback, HapticFeedbackType } from '@/utils/accessibility';

await triggerHapticFeedback(HapticFeedbackType.SUCCESS);
```

## 🔄 Navigation Flow

```
┌─────────────┐
│   Welcome   │ ← Cancel exits wizard
└──────┬──────┘
       │ Next
       ▼
┌─────────────┐
│  Device ID  │ ← Back to Welcome
└──────┬──────┘
       │ Next (if valid)
       ▼
┌─────────────┐
│Verification │ ← Back to Device ID
└──────┬──────┘
       │ Next
       ▼
┌─────────────┐
│    WiFi     │ ← Back to Verification
└──────┬──────┘
       │ Next
       ▼
┌─────────────┐
│ Preferences │ ← Back to WiFi
└──────┬──────┘
       │ Next
       ▼
┌─────────────┐
│ Completion  │ ← Back to Preferences
└──────┬──────┘
       │ Complete
       ▼
   [Home Screen]
```

## 🧪 Testing

### Run Tests

```bash
node test-device-provisioning-wizard.js
```

### Test Coverage

- ✅ File structure
- ✅ Component exports
- ✅ Navigation logic
- ✅ State management
- ✅ Accessibility features
- ✅ Validation logic

## 🐛 Common Issues

### TypeScript Errors

If you see "Cannot find module" errors:
1. Restart TypeScript server
2. Check file paths are correct
3. Verify imports use correct casing

### Navigation Not Working

Check that:
1. `setCanProceed(true)` is called when step is valid
2. Form data is updated via `updateFormData()`
3. Validation logic is correct

### Context Not Available

Ensure component is wrapped in `WizardProvider`:
```typescript
<WizardProvider value={contextValue}>
  <YourComponent />
</WizardProvider>
```

## 📚 Related Documentation

- [Task 6 Completion Summary](.kiro/specs/user-onboarding-device-provisioning/TASK6_COMPLETION_SUMMARY.md)
- [Design Document](.kiro/specs/user-onboarding-device-provisioning/design.md)
- [Requirements](.kiro/specs/user-onboarding-device-provisioning/requirements.md)

## 🎯 Next Steps

1. Implement Step 1: Welcome & Instructions
2. Implement Step 2: Device ID Entry
3. Implement Step 3: Device Verification
4. Implement Step 4: WiFi Configuration
5. Implement Step 5: Device Preferences
6. Implement Step 6: Completion

See Task 7 in tasks.md for details.
