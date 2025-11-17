# Caregiver Treatment Control - Quick Reference

## Overview
This guide provides quick reference for implementing caregiver treatment control features in the app.

## Services

### Device Actions Service
```typescript
import { deviceActionsService } from '../services/deviceActions';

// Trigger test alarm
const result = await deviceActionsService.triggerTestAlarm(deviceId, userId);

// Dispense manual dose
const result = await deviceActionsService.dispenseManualDose(deviceId, userId);

// Sync device time
const result = await deviceActionsService.syncDeviceTime(deviceId, userId);

// Check device status
const result = await deviceActionsService.checkDeviceStatus(deviceId, userId);

// Clear alarm
const result = await deviceActionsService.clearAlarm(deviceId, userId);

// Get action status
const status = await deviceActionsService.getActionStatus(deviceId, actionId);
```

### Critical Event Notifications Service
```typescript
import { criticalEventNotificationsService } from '../services/criticalEventNotifications';

// Start monitoring events
criticalEventNotificationsService.startMonitoring(caregiverId, (event) => {
  console.log('New critical event:', event);
});

// Stop monitoring
criticalEventNotificationsService.stopMonitoring(caregiverId);

// Mark event as read
await criticalEventNotificationsService.markAsRead(eventId);

// Get unread count
const count = await criticalEventNotificationsService.getUnreadCount(caregiverId);

// Create critical event
await criticalEventNotificationsService.createCriticalEvent({
  eventType: 'dose_missed',
  patientId: 'patient-123',
  patientName: 'John Doe',
  message: 'Patient missed their 8:00 AM dose',
  severity: 'high',
  caregiverId: 'caregiver-456'
});
```

## Hook

### useCaregiverTreatmentControl
```typescript
import { useCaregiverTreatmentControl } from '../hooks/useCaregiverTreatmentControl';

function MyComponent() {
  const {
    // Device actions
    triggerTestAlarm,
    dispenseManualDose,
    syncDeviceTime,
    checkDeviceStatus,
    clearAlarm,
    isActionInProgress,
    
    // Critical events
    criticalEvents,
    unreadCount,
    markEventAsRead,
  } = useCaregiverTreatmentControl(deviceId);

  return (
    <View>
      <Button 
        onPress={triggerTestAlarm}
        disabled={isActionInProgress}
      >
        Test Alarm
      </Button>
      
      <Text>Unread Events: {unreadCount}</Text>
      
      {criticalEvents.map(event => (
        <TouchableOpacity 
          key={event.id}
          onPress={() => markEventAsRead(event.id)}
        >
          <Text>{event.message}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

## Components

### DeviceActionsPanel
```typescript
import { DeviceActionsPanel } from '../components/caregiver/DeviceActionsPanel';

<DeviceActionsPanel
  deviceId="DEVICE-001"
  patientName="John Doe"
/>
```

**Features:**
- Test alarm button
- Manual dose dispensing
- Device time sync
- Status check
- Clear alarm
- Loading states
- Confirmation dialogs

### CriticalEventsPanel
```typescript
import { CriticalEventsPanel } from '../components/caregiver/CriticalEventsPanel';

<CriticalEventsPanel
  onEventPress={(event) => {
    // Handle event press
    router.push(`/caregiver/events/${event.id}`);
  }}
  maxEvents={10}
/>
```

**Features:**
- Real-time event updates
- Unread badge
- Event type icons and colors
- Relative timestamps
- Mark as read on press
- Empty state

## Medication Operations

### Create Medication
```typescript
import { useDispatch } from 'react-redux';
import { addMedication } from '../store/slices/medicationsSlice';

const dispatch = useDispatch();

const medicationData = {
  name: 'Aspirin',
  doseValue: '500',
  doseUnit: 'mg',
  quantityType: 'tablets',
  frequency: 'daily',
  times: ['08:00', '20:00'],
  patientId: 'patient-123',
  caregiverId: 'caregiver-456', // Current caregiver
  emoji: '💊',
  trackInventory: true,
  currentQuantity: 30,
  initialQuantity: 30,
  lowQuantityThreshold: 10,
};

await dispatch(addMedication(medicationData)).unwrap();
```

### Update Medication
```typescript
import { updateMedication } from '../store/slices/medicationsSlice';

await dispatch(updateMedication({
  id: 'med-123',
  updates: {
    doseValue: '1000',
    currentQuantity: 25,
  }
})).unwrap();
```

### Delete Medication
```typescript
import { deleteMedication } from '../store/slices/medicationsSlice';

await dispatch(deleteMedication('med-123')).unwrap();
```

## Event Types

### Device Action Types
```typescript
type DeviceActionType = 
  | 'test_alarm'
  | 'dispense_dose'
  | 'sync_time'
  | 'check_status'
  | 'clear_alarm';
```

### Critical Event Types
```typescript
type CriticalEventType =
  | 'dose_missed'
  | 'device_offline'
  | 'low_battery'
  | 'medication_deleted'
  | 'inventory_low'
  | 'device_error';
```

### Event Severity
```typescript
type EventSeverity = 'high' | 'medium' | 'low';
```

## RTDB Structure

### Device Actions
```
/devices/{deviceId}/actions/{actionId}
{
  actionType: string,
  requestedBy: string,
  requestedAt: number,
  status: 'pending' | 'completed' | 'failed',
  completedAt?: number,
  error?: string
}
```

### Device State
```
/devices/{deviceId}/state
{
  is_online: boolean,
  battery_level: number,
  current_status: string,
  last_seen: number,
  time_synced: boolean
}
```

## Firestore Collections

### Critical Events
```typescript
// Collection: criticalEvents
{
  eventType: CriticalEventType,
  patientId: string,
  patientName: string,
  deviceId?: string,
  medicationId?: string,
  medicationName?: string,
  message: string,
  severity: EventSeverity,
  timestamp: Timestamp,
  caregiverId: string,
  read: boolean,
  notificationSent: boolean
}
```

### Medication Events
```typescript
// Collection: medicationEvents
{
  eventType: 'created' | 'updated' | 'deleted',
  medicationId: string,
  medicationName: string,
  medicationData: Partial<Medication>,
  patientId: string,
  patientName: string,
  caregiverId: string,
  timestamp: Timestamp,
  syncStatus: 'pending' | 'delivered' | 'failed',
  changes?: Array<{
    field: string,
    oldValue: any,
    newValue: any
  }>
}
```

## Security Rules

### Critical Events
```javascript
// Caregivers can read events assigned to them
allow read: if isSignedIn() && 
  resource.data.caregiverId == request.auth.uid;

// Caregivers can update events to mark as read
allow update: if isSignedIn() && 
  resource.data.caregiverId == request.auth.uid &&
  request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read', 'notificationSent']);
```

### Medications
```javascript
// Caregivers can read/write medications they manage
allow read, write: if isSignedIn() &&
  (request.auth.uid == resource.data.caregiverId ||
   request.auth.uid == request.resource.data.caregiverId);
```

## Error Handling

### Device Actions
```typescript
const result = await triggerTestAlarm();

if (result.success) {
  Alert.alert('Success', result.message);
} else {
  Alert.alert('Error', result.message);
}
```

### Medication Operations
```typescript
try {
  await dispatch(addMedication(medicationData)).unwrap();
  Alert.alert('Success', 'Medication added');
} catch (error) {
  Alert.alert('Error', error.message);
}
```

## Best Practices

1. **Always check device online status before triggering actions**
   ```typescript
   if (!deviceState?.is_online) {
     Alert.alert('Error', 'Device is offline');
     return;
   }
   ```

2. **Show loading states during actions**
   ```typescript
   const [loading, setLoading] = useState(false);
   
   const handleAction = async () => {
     setLoading(true);
     try {
       await triggerTestAlarm();
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Confirm destructive actions**
   ```typescript
   Alert.alert(
     'Confirm',
     'Are you sure you want to delete this medication?',
     [
       { text: 'Cancel', style: 'cancel' },
       { text: 'Delete', onPress: handleDelete, style: 'destructive' }
     ]
   );
   ```

4. **Handle offline scenarios**
   ```typescript
   import NetInfo from '@react-native-community/netinfo';
   
   const netInfo = await NetInfo.fetch();
   if (!netInfo.isConnected) {
     Alert.alert('Offline', 'Please check your internet connection');
     return;
   }
   ```

5. **Clean up listeners on unmount**
   ```typescript
   useEffect(() => {
     criticalEventNotificationsService.startMonitoring(caregiverId);
     
     return () => {
       criticalEventNotificationsService.stopMonitoring(caregiverId);
     };
   }, [caregiverId]);
   ```

## Testing

### Run Tests
```bash
node test-caregiver-treatment-control.js
```

### Test Coverage
- ✅ Medication creation
- ✅ Medication reading
- ✅ Medication updating
- ✅ Medication deletion
- ✅ Medication events
- ✅ Device actions
- ✅ Critical event creation
- ✅ Critical event reading
- ✅ Critical event marking as read
- ✅ Unread event queries

## Troubleshooting

### Device actions not working
1. Check device is online: `deviceState.is_online === true`
2. Verify RTDB connection
3. Check action is written to correct path
4. Verify device firmware is monitoring actions node

### Critical events not appearing
1. Check Firestore security rules
2. Verify caregiver ID matches
3. Check notification permissions
4. Verify listener is active

### Medication operations failing
1. Check device link exists
2. Verify caregiver has permission
3. Check Firestore security rules
4. Verify medication data structure

## Related Documentation

- [Task 15 Completion Summary](./TASK15_COMPLETION_SUMMARY.md)
- [Requirements Document](./requirements.md)
- [Design Document](./design.md)
- [Tasks Document](./tasks.md)
