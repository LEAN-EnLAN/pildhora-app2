# Onboarding Analytics - Quick Reference

## Import

```typescript
import {
  // Event types
  OnboardingEventType,
  OnboardingFlowType,
  WizardStep,
  
  // Tracking functions
  trackWizardStarted,
  trackStepEntered,
  trackStepCompleted,
  trackStepAbandoned,
  trackWizardCompleted,
  trackWizardAbandoned,
  trackDeviceValidationStarted,
  trackDeviceValidationSuccess,
  trackDeviceValidationFailed,
  trackDeviceProvisioningSuccess,
  trackDeviceProvisioningFailed,
  trackConnectionCodeGenerated,
  trackConnectionCodeValidationStarted,
  trackConnectionCodeValidationSuccess,
  trackConnectionCodeValidationFailed,
  trackConnectionEstablished,
  trackConnectionFailed,
  trackError,
  getAnalyticsEvents,
} from '../services/onboardingAnalytics';
```

## Common Usage Patterns

### Patient Provisioning Wizard

```typescript
// On wizard start
await trackWizardStarted(
  userId,
  OnboardingFlowType.PATIENT_PROVISIONING
);

// On each step
await trackStepEntered(
  userId,
  OnboardingFlowType.PATIENT_PROVISIONING,
  WizardStep.DEVICE_ID_ENTRY,
  1
);

// On step completion
await trackStepCompleted(
  userId,
  OnboardingFlowType.PATIENT_PROVISIONING,
  WizardStep.DEVICE_ID_ENTRY,
  1,
  { deviceIdLength: 8 }
);

// On wizard completion
await trackWizardCompleted(
  userId,
  OnboardingFlowType.PATIENT_PROVISIONING
);
```

### Device Validation

```typescript
// Start validation
await trackDeviceValidationStarted(userId, deviceId);

// On success
await trackDeviceValidationSuccess(userId, deviceId);

// On failure
await trackDeviceValidationFailed(
  userId,
  deviceId,
  'DEVICE_NOT_FOUND',
  'Device not found in system'
);
```

### Connection Code Flow

```typescript
// Patient generates code
await trackConnectionCodeGenerated(
  patientId,
  code,
  24, // expires in 24 hours
  { deviceId }
);

// Caregiver validates code
await trackConnectionCodeValidationStarted(caregiverId, code);

// On success
await trackConnectionCodeValidationSuccess(
  caregiverId,
  code,
  patientId
);

// Establish connection
await trackConnectionEstablished(
  caregiverId,
  patientId,
  deviceId
);
```

### Error Tracking

```typescript
await trackError(
  userId,
  OnboardingFlowType.PATIENT_PROVISIONING,
  'WIFI_CONFIG_FAILED',
  'Failed to configure WiFi',
  WizardStep.WIFI_CONFIG,
  { attemptNumber: 2 }
);
```

## Wizard Steps

### Patient Provisioning
- `WizardStep.WELCOME` (0)
- `WizardStep.DEVICE_ID_ENTRY` (1)
- `WizardStep.DEVICE_VERIFICATION` (2)
- `WizardStep.WIFI_CONFIG` (3)
- `WizardStep.PREFERENCES` (4)
- `WizardStep.COMPLETION` (5)

### Caregiver Connection
- `WizardStep.CODE_ENTRY` (0)
- `WizardStep.PATIENT_INFO` (1)
- `WizardStep.CONNECTION_CONFIRM` (2)
- `WizardStep.CONNECTION_SUCCESS` (3)

## Event Types

### Wizard Events
- `WIZARD_STARTED`
- `STEP_ENTERED`
- `STEP_COMPLETED`
- `STEP_ABANDONED`
- `WIZARD_COMPLETED`
- `WIZARD_ABANDONED`

### Device Events
- `DEVICE_VALIDATION_STARTED`
- `DEVICE_VALIDATION_SUCCESS`
- `DEVICE_VALIDATION_FAILED`
- `DEVICE_PROVISIONING_SUCCESS`
- `DEVICE_PROVISIONING_FAILED`

### Connection Events
- `CONNECTION_CODE_GENERATED`
- `CONNECTION_CODE_VALIDATION_STARTED`
- `CONNECTION_CODE_VALIDATION_SUCCESS`
- `CONNECTION_CODE_VALIDATION_FAILED`
- `CONNECTION_ESTABLISHED`
- `CONNECTION_FAILED`

### Error Events
- `ERROR_OCCURRED`

## Querying Analytics

```typescript
// Get all wizard abandonments
const abandonments = await getAnalyticsEvents({
  eventType: OnboardingEventType.WIZARD_ABANDONED,
  flowType: OnboardingFlowType.PATIENT_PROVISIONING,
});

// Get events for specific user
const userEvents = await getAnalyticsEvents({
  userId: 'user-123',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
});

// Get errors by type
const errors = await getAnalyticsEvents({
  eventType: OnboardingEventType.ERROR_OCCURRED,
  flowType: OnboardingFlowType.PATIENT_PROVISIONING,
});
```

## Key Metrics

### Completion Rate
```typescript
const started = events.filter(e => e.eventType === 'wizard_started').length;
const completed = events.filter(e => e.eventType === 'wizard_completed').length;
const rate = (completed / started) * 100;
```

### Average Time Per Step
```typescript
const stepEvents = events.filter(e => 
  e.eventType === 'step_completed' && 
  e.step === WizardStep.DEVICE_ID_ENTRY
);
const avgTime = stepEvents.reduce((sum, e) => sum + (e.timeSpentMs || 0), 0) / stepEvents.length;
```

### Error Frequency
```typescript
const errorCounts = errors.reduce((acc, e) => {
  acc[e.errorCode] = (acc[e.errorCode] || 0) + 1;
  return acc;
}, {});
```

## Best Practices

1. **Always track wizard start**: Call `trackWizardStarted` when wizard mounts
2. **Track step changes**: Call `trackStepEntered` on every step change
3. **Include metadata**: Add relevant context to help with analysis
4. **Don't block UI**: All tracking is async and non-blocking
5. **Handle errors gracefully**: Analytics failures shouldn't affect UX
6. **Track abandonment**: Call `trackWizardAbandoned` when user exits
7. **Use session IDs**: Automatically managed for you

## Common Metadata Fields

```typescript
// Device validation
{ deviceId, attemptNumber, validationDuration }

// WiFi config
{ wifiConfigured, ssidLength, connectionTestPassed }

// Preferences
{ alarmMode, volume, ledIntensity, ledColor }

// Connection code
{ codeLength, expiresInHours, deviceId }

// Errors
{ errorCode, errorMessage, attemptNumber, userAgent }
```

## Integration Checklist

- [ ] Import analytics functions
- [ ] Track wizard start on mount
- [ ] Track step changes
- [ ] Track step completions with metadata
- [ ] Track wizard completion
- [ ] Track wizard abandonment on exit
- [ ] Track device validation events
- [ ] Track connection code events
- [ ] Track all errors
- [ ] Add relevant metadata to events
- [ ] Test analytics in development
- [ ] Verify events in Firestore console

## Troubleshooting

**Events not appearing in Firestore?**
- Check Firestore initialization
- Verify user is authenticated
- Check browser console for errors
- Ensure Firestore rules allow writes

**Time measurements seem off?**
- Verify session is created on wizard start
- Check that step tracking is called correctly
- Ensure no duplicate tracking calls

**Missing metadata?**
- Verify metadata object is passed correctly
- Check for undefined values
- Ensure metadata is serializable

## Support

For questions or issues:
1. Check implementation guide: `TASK20_ANALYTICS_IMPLEMENTATION.md`
2. Review test file: `test-onboarding-analytics.js`
3. Check Firestore console for events
4. Review browser console for errors
