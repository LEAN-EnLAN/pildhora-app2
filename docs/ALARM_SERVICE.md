# Alarm Service Documentation

## Overview

The Alarm Service provides a unified interface for creating, updating, and deleting medication alarms across iOS and Android platforms using `expo-notifications`. It handles platform-specific implementations, permission management, and provides fallback mechanisms when permissions are denied.

## Architecture

### Components

1. **AlarmService** (`src/services/alarmService.ts`)
   - Core service class that manages alarm lifecycle
   - Handles permission requests and status tracking
   - Provides platform-specific alarm creation
   - Manages alarm ID storage and retrieval

2. **Alarm Utilities** (`src/utils/alarmUtils.ts`)
   - Helper functions for time and frequency conversions
   - Medication-to-alarm configuration mapping
   - Next alarm time calculations

3. **Redux Integration** (`src/store/slices/medicationsSlice.ts`)
   - Automatic alarm creation when medications are added
   - Automatic alarm updates when medication schedules change
   - Automatic alarm deletion when medications are removed

## Features

### 1. Platform-Specific Alarm Creation

The service uses `expo-notifications` with platform-specific triggers:

- **iOS**: Uses `UNCalendarNotificationTrigger` for recurring alarms
- **Android**: Uses calendar triggers with `AlarmManager` integration

### 2. Permission Management

```typescript
// Check if alarms can be scheduled
const canSchedule = await alarmService.canScheduleAlarms();

// Request permissions with user guidance
const status = await alarmService.requestPermissions();

// Show settings guidance if permissions denied
alarmService.showSettingsGuidance();
```

### 3. Alarm Lifecycle Management

#### Create Alarm

```typescript
import { alarmService } from './src/services/alarmService';

const config = {
  medicationId: 'med_123',
  medicationName: 'Aspirin',
  time: '08:00', // 24-hour format
  days: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday)
  emoji: '💊',
};

const result = await alarmService.createAlarm(config);
// result: { alarmId: string, success: boolean, fallbackToInApp: boolean }
```

#### Update Alarm

```typescript
await alarmService.updateAlarm('med_123', newConfig);
```

#### Delete Alarm

```typescript
await alarmService.deleteAlarm('med_123');
```

### 4. Fallback to In-App Notifications

If notification permissions are denied, the service automatically falls back to in-app notifications:

```typescript
const result = await alarmService.createAlarm(config);
if (result.fallbackToInApp) {
  console.log('Using in-app notifications instead of native alarms');
}
```

### 5. Alarm ID Storage

Alarm IDs are stored in:
- AsyncStorage for persistence across app restarts
- Medication records (`nativeAlarmIds` field) for easy retrieval

## Utility Functions

### Frequency Conversion

```typescript
import { frequencyToDays, daysToFrequency } from './src/utils/alarmUtils';

// Convert frequency string to day numbers
const days = frequencyToDays('Daily'); // [0, 1, 2, 3, 4, 5, 6]
const weekdays = frequencyToDays('Weekdays'); // [1, 2, 3, 4, 5]
const custom = frequencyToDays('Mon,Wed,Fri'); // [1, 3, 5]

// Convert day numbers to frequency string
const freq = daysToFrequency([0, 1, 2, 3, 4, 5, 6]); // 'Daily'
```

### Time Format Conversion

```typescript
import { formatTo24Hour, formatTo12Hour, isValidTimeFormat } from './src/utils/alarmUtils';

// Validate time format
isValidTimeFormat('09:30'); // true
isValidTimeFormat('25:00'); // false

// Convert to 24-hour format
formatTo24Hour('9:30 AM'); // '09:30'
formatTo24Hour('2:45 PM'); // '14:45'

// Convert to 12-hour format
formatTo12Hour('09:30'); // '9:30 AM'
formatTo12Hour('14:45'); // '2:45 PM'
```

### Medication to Alarm Config

```typescript
import { medicationToAlarmConfigs } from './src/utils/alarmUtils';

const medication = {
  id: 'med_123',
  name: 'Aspirin',
  emoji: '💊',
  times: ['08:00', '14:00', '20:00'],
  frequency: 'Daily',
  // ... other fields
};

const configs = medicationToAlarmConfigs(medication);
// Returns array of AlarmConfig objects (one per scheduled time)
```

### Next Alarm Calculation

```typescript
import { getNextAlarmTime, hasAlarmsToday, getAlarmTimesForToday } from './src/utils/alarmUtils';

// Check if medication has alarms today
const hasAlarms = hasAlarmsToday(medication); // true/false

// Get alarm times for today
const times = getAlarmTimesForToday(medication); // ['08:00', '14:00', '20:00']

// Get next alarm time
const nextAlarm = getNextAlarmTime(medication); // Date object or null
```

## Redux Integration

The alarm service is automatically integrated with the medications Redux slice:

### Automatic Alarm Creation

When a medication is added, alarms are automatically created:

```typescript
dispatch(addMedication({
  name: 'Aspirin',
  times: ['08:00', '20:00'],
  frequency: 'Daily',
  emoji: '💊',
  // ... other fields
}));
// Alarms are created automatically
```

### Automatic Alarm Updates

When a medication's schedule changes, alarms are automatically updated:

```typescript
dispatch(updateMedication({
  id: 'med_123',
  updates: {
    times: ['09:00', '21:00'], // Changed times
  }
}));
// Old alarms are deleted, new alarms are created
```

### Automatic Alarm Deletion

When a medication is deleted, alarms are automatically removed:

```typescript
dispatch(deleteMedication('med_123'));
// Alarms are deleted automatically
```

## Error Handling

The service uses custom error types for better error handling:

```typescript
try {
  await alarmService.createAlarm(config);
} catch (error) {
  if (error instanceof AlarmServiceError) {
    console.error('Error code:', error.code);
    console.error('User message:', error.userMessage);
    console.error('Retryable:', error.retryable);
  }
}
```

### Error Codes

- `PERMISSION_REQUEST_FAILED`: Failed to request notification permissions
- `INVALID_TIME_FORMAT`: Invalid time format provided
- `ALARM_CREATION_FAILED`: Failed to create alarm
- `ALARM_UPDATE_FAILED`: Failed to update alarm
- `ALARM_DELETION_FAILED`: Failed to delete alarm
- `CANCEL_ALL_FAILED`: Failed to cancel all alarms

## Data Model

### AlarmConfig

```typescript
interface AlarmConfig {
  medicationId: string;
  medicationName: string;
  time: string; // Format: "HH:MM" (24-hour)
  days: number[]; // 0-6, where 0 is Sunday
  emoji?: string;
}
```

### AlarmResult

```typescript
interface AlarmResult {
  alarmId: string;
  success: boolean;
  fallbackToInApp: boolean;
}
```

### Medication Type Extension

The `Medication` type has been extended with:

```typescript
interface Medication {
  // ... existing fields
  emoji?: string; // Emoji icon for visual identification
  nativeAlarmIds?: string[]; // Platform-specific alarm identifiers
}
```

## Testing

Run the test script to verify alarm service functionality:

```bash
node test-alarm-service.js
```

This tests:
- Utility functions (frequency conversion, time formatting)
- Medication to alarm config conversion
- Next alarm calculations
- Permission status

For full integration testing, run the app in a React Native environment and test:
1. Creating a medication with alarms
2. Updating medication schedule
3. Deleting a medication
4. Permission request flow
5. Fallback to in-app notifications

## Best Practices

1. **Always check permissions before creating alarms**
   ```typescript
   const canSchedule = await alarmService.canScheduleAlarms();
   if (!canSchedule) {
     // Show permission guidance
   }
   ```

2. **Handle fallback gracefully**
   ```typescript
   const result = await alarmService.createAlarm(config);
   if (result.fallbackToInApp) {
     // Inform user that in-app notifications will be used
   }
   ```

3. **Use 24-hour time format**
   ```typescript
   // Good
   time: '08:00'
   
   // Bad
   time: '8:00 AM'
   ```

4. **Store alarm IDs in medication records**
   ```typescript
   // Alarm IDs are automatically stored in medication.nativeAlarmIds
   // Use them for manual alarm management if needed
   ```

5. **Don't block medication operations on alarm failures**
   ```typescript
   // The Redux integration handles this automatically
   // Alarm creation/update/deletion errors are logged but don't fail the medication operation
   ```

## Troubleshooting

### Alarms not triggering

1. Check notification permissions:
   ```typescript
   const status = await alarmService.getPermissionStatus();
   console.log('Permission status:', status);
   ```

2. Verify alarm IDs are stored:
   ```typescript
   const alarmIds = await alarmService.getAlarmsForMedication('med_123');
   console.log('Alarm IDs:', alarmIds);
   ```

3. Check scheduled notifications:
   ```typescript
   const scheduled = await alarmService.getAllScheduledNotifications();
   console.log('Scheduled notifications:', scheduled);
   ```

### Permission issues

1. If permissions are denied, guide user to settings:
   ```typescript
   alarmService.showSettingsGuidance();
   ```

2. Check if fallback is being used:
   ```typescript
   // Check medication.nativeAlarmIds
   // If IDs start with 'fallback_', in-app notifications are being used
   ```

### Alarm IDs not persisting

1. Check AsyncStorage:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   const stored = await AsyncStorage.getItem('medication_alarms');
   console.log('Stored alarms:', stored);
   ```

2. Verify medication records have nativeAlarmIds:
   ```typescript
   // Check medication.nativeAlarmIds field in Firestore
   ```

## Future Enhancements

1. **Snooze functionality**: Allow users to snooze alarms
2. **Custom notification sounds**: Support custom sounds per medication
3. **Alarm history**: Track when alarms were triggered
4. **Smart scheduling**: Suggest optimal times based on user behavior
5. **Batch operations**: Optimize alarm creation for multiple medications
6. **Alarm analytics**: Track alarm effectiveness and user response

## References

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [iOS UNCalendarNotificationTrigger](https://developer.apple.com/documentation/usernotifications/uncalendarnotificationtrigger)
- [Android AlarmManager](https://developer.android.com/reference/android/app/AlarmManager)
