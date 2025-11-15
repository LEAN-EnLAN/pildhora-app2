# Alarm Service Quick Start Guide

## Overview

The Alarm Service automatically manages medication reminders through native device alarms. This guide provides a quick reference for common use cases.

## Automatic Integration

**Good news!** If you're using the Redux medication management system, alarms are handled automatically. You don't need to manually create, update, or delete alarms.

### Automatic Alarm Creation

```typescript
import { useDispatch } from 'react-redux';
import { addMedication } from '../store/slices/medicationsSlice';

// Create a medication
dispatch(addMedication({
  name: 'Aspirin',
  emoji: '💊',
  times: ['08:00', '14:00', '20:00'],
  frequency: 'Daily',
  doseValue: '500',
  doseUnit: 'mg',
  quantityType: 'tablets',
  patientId: 'patient_123',
  caregiverId: 'caregiver_456',
  trackInventory: false,
}));

// ✅ Alarms are automatically created for 08:00, 14:00, and 20:00 daily
```

### Automatic Alarm Updates

```typescript
// Update medication schedule
dispatch(updateMedication({
  id: 'med_123',
  updates: {
    times: ['09:00', '15:00', '21:00'], // New times
  }
}));

// ✅ Old alarms are deleted, new alarms are created automatically
```

### Automatic Alarm Deletion

```typescript
// Delete medication
dispatch(deleteMedication('med_123'));

// ✅ All associated alarms are automatically deleted
```

## Manual Usage (Advanced)

If you need to manually manage alarms outside of Redux:

### Check Permissions

```typescript
import { alarmService } from '../services/alarmService';

const canSchedule = await alarmService.canScheduleAlarms();
if (!canSchedule) {
  const status = await alarmService.requestPermissions();
  if (status !== 'granted') {
    alarmService.showSettingsGuidance();
  }
}
```

### Create Alarm

```typescript
import { alarmService } from '../services/alarmService';

const result = await alarmService.createAlarm({
  medicationId: 'med_123',
  medicationName: 'Aspirin',
  time: '08:00', // 24-hour format
  days: [1, 2, 3, 4, 5], // Monday to Friday
  emoji: '💊',
});

if (result.success) {
  console.log('Alarm created:', result.alarmId);
  if (result.fallbackToInApp) {
    console.log('Using in-app notifications (permissions denied)');
  }
}
```

### Update Alarm

```typescript
// Delete old alarm
await alarmService.deleteAlarm('med_123');

// Create new alarm
await alarmService.createAlarm(newConfig);
```

### Delete Alarm

```typescript
await alarmService.deleteAlarm('med_123');
```

## Utility Functions

### Convert Frequency to Days

```typescript
import { frequencyToDays } from '../utils/alarmUtils';

const days = frequencyToDays('Daily'); // [0, 1, 2, 3, 4, 5, 6]
const weekdays = frequencyToDays('Weekdays'); // [1, 2, 3, 4, 5]
const custom = frequencyToDays('Mon,Wed,Fri'); // [1, 3, 5]
```

### Convert Time Formats

```typescript
import { formatTo24Hour, formatTo12Hour } from '../utils/alarmUtils';

const time24 = formatTo24Hour('9:30 AM'); // '09:30'
const time12 = formatTo12Hour('14:45'); // '2:45 PM'
```

### Get Next Alarm

```typescript
import { getNextAlarmTime } from '../utils/alarmUtils';

const nextAlarm = getNextAlarmTime(medication);
if (nextAlarm) {
  console.log('Next alarm:', nextAlarm.toLocaleString());
}
```

## Common Patterns

### Check if Medication Has Alarms Today

```typescript
import { hasAlarmsToday, getAlarmTimesForToday } from '../utils/alarmUtils';

if (hasAlarmsToday(medication)) {
  const times = getAlarmTimesForToday(medication);
  console.log('Today\'s alarms:', times); // ['08:00', '14:00', '20:00']
}
```

### Convert Medication to Alarm Configs

```typescript
import { medicationToAlarmConfigs } from '../utils/alarmUtils';

const configs = medicationToAlarmConfigs(medication);
// Returns array of AlarmConfig objects (one per scheduled time)
```

### Handle Permission Denied

```typescript
const result = await alarmService.createAlarm(config);

if (result.fallbackToInApp) {
  // Show message to user
  Alert.alert(
    'Notificaciones en la App',
    'Se usarán notificaciones dentro de la aplicación porque los permisos de notificación están desactivados.'
  );
}
```

## Troubleshooting

### Alarms Not Triggering

1. Check permissions:
   ```typescript
   const status = alarmService.getPermissionStatus();
   console.log('Permission status:', status);
   ```

2. Verify alarms are scheduled:
   ```typescript
   const scheduled = await alarmService.getAllScheduledNotifications();
   console.log('Scheduled notifications:', scheduled.length);
   ```

3. Check alarm IDs:
   ```typescript
   const alarmIds = await alarmService.getAlarmsForMedication('med_123');
   console.log('Alarm IDs:', alarmIds);
   ```

### Permission Issues

If permissions are denied, guide user to settings:
```typescript
alarmService.showSettingsGuidance();
```

### Alarm IDs Not Persisting

Check if alarm IDs are stored in medication record:
```typescript
console.log('Alarm IDs:', medication.nativeAlarmIds);
```

## Best Practices

1. **Use Redux for medication management** - Alarms are handled automatically
2. **Always use 24-hour time format** - Use 'HH:MM' format (e.g., '08:00', '14:00')
3. **Handle fallback gracefully** - Inform users when in-app notifications are used
4. **Don't block on alarm failures** - Medication operations should succeed even if alarms fail
5. **Check permissions before creating alarms** - Request permissions if needed

## Time Format Reference

### Valid Time Formats

✅ Good:
- `'08:00'` - 8:00 AM
- `'14:30'` - 2:30 PM
- `'23:59'` - 11:59 PM

❌ Bad:
- `'8:00'` - Missing leading zero
- `'8:00 AM'` - 12-hour format (use formatTo24Hour first)
- `'25:00'` - Invalid hour

### Day Numbers

- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

### Frequency Strings

- `'Daily'` - Every day
- `'Weekdays'` - Monday to Friday
- `'Weekends'` - Saturday and Sunday
- `'Mon,Wed,Fri'` - Custom days (comma-separated)

## Example: Complete Medication Flow

```typescript
import { useDispatch } from 'react-redux';
import { addMedication, updateMedication, deleteMedication } from '../store/slices/medicationsSlice';

// 1. Create medication with alarms
dispatch(addMedication({
  name: 'Aspirin',
  emoji: '💊',
  times: ['08:00', '20:00'],
  frequency: 'Daily',
  doseValue: '500',
  doseUnit: 'mg',
  quantityType: 'tablets',
  patientId: 'patient_123',
  caregiverId: 'caregiver_456',
  trackInventory: true,
  currentQuantity: 30,
}));
// ✅ Alarms created automatically

// 2. Update medication schedule
dispatch(updateMedication({
  id: 'med_123',
  updates: {
    times: ['09:00', '21:00'], // Changed times
    frequency: 'Weekdays', // Changed frequency
  }
}));
// ✅ Alarms updated automatically

// 3. Delete medication
dispatch(deleteMedication('med_123'));
// ✅ Alarms deleted automatically
```

## Need More Help?

- See [ALARM_SERVICE.md](./ALARM_SERVICE.md) for comprehensive documentation
- See [AlarmServiceExample.tsx](../src/components/examples/AlarmServiceExample.tsx) for a working example
- Run `node test-alarm-service.js` to test utility functions

## Summary

- ✅ Alarms are managed automatically through Redux
- ✅ No manual alarm management needed for normal use
- ✅ Fallback to in-app notifications if permissions denied
- ✅ Non-blocking error handling
- ✅ Comprehensive utility functions available
