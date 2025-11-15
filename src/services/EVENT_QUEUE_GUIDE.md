# Medication Event Queue System

## Overview

The Medication Event Queue system provides robust event synchronization for medication lifecycle events (create, update, delete) with offline support, automatic retry, and background sync capabilities.

## Architecture

### Components

1. **MedicationEventService** - Core service managing the event queue
2. **MedicationEventQueue** - Wrapper class providing the public API
3. **EventSyncIndicator** - Full UI component showing sync status
4. **EventSyncBadge** - Compact badge for headers/navigation

### Features

- ✅ **Offline Queue**: Events are stored locally when offline
- ✅ **Immediate Sync**: Attempts to sync events immediately when created
- ✅ **Background Sync**: Automatic retry every 5 minutes
- ✅ **Foreground Sync**: Syncs when app comes to foreground
- ✅ **Manual Sync**: User can trigger sync via UI
- ✅ **Sync Callbacks**: Subscribe to sync completion events
- ✅ **Persistent Storage**: Queue persists across app restarts

## Usage

### Basic Usage

```typescript
import { medicationEventQueue } from '../services/medicationEventService';

// Enqueue an event
await medicationEventQueue.enqueue({
  eventType: 'created',
  medicationId: 'med_123',
  medicationName: 'Aspirin',
  medicationData: medication,
  patientId: 'patient_456',
  patientName: 'John Doe',
  caregiverId: 'caregiver_789',
  syncStatus: 'pending',
});

// Get pending count
const count = await medicationEventQueue.getPendingCount();
console.log(`${count} events pending`);

// Manual sync
await medicationEventQueue.syncPendingEvents();
```

### Using Helper Functions

```typescript
import { 
  createAndEnqueueEvent,
  generateMedicationCreatedEvent,
  generateMedicationUpdatedEvent,
  generateMedicationDeletedEvent
} from '../services/medicationEventService';

// Create and enqueue in one call
await createAndEnqueueEvent(
  medication,
  patientName,
  'created'
);

// For updates, pass both old and new medication
await createAndEnqueueEvent(
  oldMedication,
  patientName,
  'updated',
  newMedication
);
```

### Subscribing to Sync Events

```typescript
import { medicationEventQueue } from '../services/medicationEventService';

// Subscribe to sync completion
const unsubscribe = medicationEventQueue.onSyncComplete(() => {
  console.log('Sync completed!');
  // Refresh UI, show notification, etc.
});

// Later, unsubscribe
unsubscribe();
```

## UI Components

### EventSyncIndicator

Full-featured sync status indicator with pending count and last sync time.

```typescript
import { EventSyncIndicator } from '../components/screens/patient';

// In your component
<EventSyncIndicator 
  alwaysShow={false}  // Only show when there are pending events
  onPress={() => {
    // Custom action on press
    console.log('Sync indicator pressed');
  }}
/>
```

**Features:**
- Shows pending event count
- Displays sync in progress indicator
- Shows last sync time
- Tap to manually trigger sync
- Auto-refreshes every 30 seconds

### EventSyncBadge

Compact badge for headers and navigation bars.

```typescript
import { EventSyncBadge } from '../components/screens/patient';

// In your header
<EventSyncBadge 
  size="md"  // 'sm' or 'md'
  onPress={() => {
    // Custom action
  }}
/>
```

**Features:**
- Compact design for headers
- Shows pending count badge
- Sync in progress indicator
- Auto-hides when no pending events

## Integration Examples

### In Redux Thunks

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { createAndEnqueueEvent } from '../services/medicationEventService';

export const addMedication = createAsyncThunk(
  'medications/add',
  async (medication: Medication, { getState }) => {
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'medications'), medication);
    const newMedication = { ...medication, id: docRef.id };
    
    // Generate event if caregiver is assigned
    if (medication.caregiverId) {
      const state = getState() as RootState;
      const patientName = state.auth.user?.name || 'Unknown';
      
      await createAndEnqueueEvent(
        newMedication,
        patientName,
        'created'
      );
    }
    
    return newMedication;
  }
);
```

### In Patient Home Screen

```typescript
import { EventSyncIndicator } from '../components/screens/patient';

export default function PatientHome() {
  return (
    <SafeAreaView>
      {/* Other content */}
      
      {/* Add sync indicator */}
      <View style={styles.section}>
        <EventSyncIndicator alwaysShow={false} />
      </View>
      
      {/* Rest of content */}
    </SafeAreaView>
  );
}
```

### In Header

```typescript
import { EventSyncBadge } from '../components/screens/patient';

function Header() {
  return (
    <View style={styles.header}>
      <Text>My App</Text>
      
      {/* Add sync badge */}
      <EventSyncBadge size="sm" />
    </View>
  );
}
```

## Sync Behavior

### Immediate Sync
When an event is enqueued, the system immediately attempts to sync it to Firestore.

### Background Sync
Every 5 minutes, the system automatically attempts to sync all pending events.

### Foreground Sync
When the app comes to the foreground (from background), all pending events are synced.

### Manual Sync
Users can trigger manual sync by:
- Tapping the EventSyncIndicator
- Tapping the EventSyncBadge
- Calling `medicationEventQueue.syncPendingEvents()` programmatically

## Error Handling

### Network Errors
- Events remain in queue with 'pending' status
- Will retry on next sync attempt (background, foreground, or manual)

### Firestore Errors
- Events marked as 'failed'
- Will retry on next sync attempt
- Errors logged to console

### Sync Conflicts
- Events are synced in order
- Failed events don't block subsequent events
- Delivered events are removed from queue

## Storage

### AsyncStorage Keys
- `@medication_event_queue` - Event queue array
- `@medication_event_last_sync` - Last sync timestamp

### Data Persistence
- Queue persists across app restarts
- Events remain until successfully synced
- No automatic expiration (manual cleanup if needed)

## Testing

### Manual Testing

```typescript
import { medicationEventQueue } from '../services/medicationEventService';

// Check pending count
const count = await medicationEventQueue.getPendingCount();
console.log('Pending:', count);

// Check sync status
const isSyncing = medicationEventQueue.isSyncInProgress();
console.log('Syncing:', isSyncing);

// Check last sync
const lastSync = medicationEventQueue.getLastSyncAttempt();
console.log('Last sync:', lastSync);

// Trigger manual sync
await medicationEventQueue.syncPendingEvents();
```

### Simulating Offline Mode

```typescript
// 1. Turn off network/WiFi on device
// 2. Create/update/delete medications
// 3. Check pending count (should increase)
// 4. Turn network back on
// 5. Wait for background sync or trigger manual sync
// 6. Check pending count (should decrease to 0)
```

## Performance Considerations

### Memory
- Queue stored in memory and AsyncStorage
- Large queues (>100 events) may impact performance
- Consider implementing queue size limits if needed

### Network
- Batch sync processes events sequentially
- Each event is a separate Firestore write
- Consider batching if high volume expected

### Battery
- Background sync runs every 5 minutes
- Minimal battery impact
- Can be disabled if needed via `stopBackgroundSync()`

## Troubleshooting

### Events Not Syncing

1. Check network connectivity
2. Verify Firestore is initialized
3. Check console for errors
4. Verify caregiver ID is set on medication

### High Pending Count

1. Check for network issues
2. Review Firestore security rules
3. Check for repeated failures in logs
4. Consider manual sync

### Sync Callbacks Not Firing

1. Verify subscription is active
2. Check for unsubscribe calls
3. Ensure component is mounted

## API Reference

### MedicationEventQueue

#### Methods

- `enqueue(event)` - Add event to queue and attempt sync
- `dequeue()` - Remove and return next event
- `syncPendingEvents()` - Sync all pending events
- `getPendingCount()` - Get count of pending events
- `onSyncComplete(callback)` - Subscribe to sync completion
- `getLastSyncAttempt()` - Get last sync timestamp
- `isSyncInProgress()` - Check if sync is in progress

### Helper Functions

- `createAndEnqueueEvent(medication, patientName, eventType, newMedication?)` - Create and enqueue event
- `generateMedicationCreatedEvent(medication, patientName)` - Generate created event
- `generateMedicationUpdatedEvent(oldMedication, newMedication, patientName)` - Generate updated event
- `generateMedicationDeletedEvent(medication, patientName)` - Generate deleted event

## Requirements Satisfied

✅ **Requirement 6.3**: Event queue stores events when caregiver not connected
✅ **Requirement 6.4**: Events transmitted when connection established
✅ **Task 13.1**: MedicationEventQueue class with enqueue/dequeue methods
✅ **Task 13.2**: Immediate sync attempt on event creation
✅ **Task 13.3**: Background sync with 5-minute retry interval
✅ **Task 13.4**: App foreground sync trigger
✅ **Task 13.5**: Sync status tracking and error handling
✅ **Task 13.6**: Pending event count indicator in UI
