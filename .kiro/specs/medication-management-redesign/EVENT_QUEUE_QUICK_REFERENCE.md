# Event Queue System - Quick Reference

## Quick Start

### Import the Queue

```typescript
import { medicationEventQueue } from '../services/medicationEventService';
```

### Check Pending Events

```typescript
const count = await medicationEventQueue.getPendingCount();
console.log(`${count} events pending`);
```

### Manual Sync

```typescript
await medicationEventQueue.syncPendingEvents();
```

### Subscribe to Sync Events

```typescript
const unsubscribe = medicationEventQueue.onSyncComplete(() => {
  console.log('Sync completed!');
  // Refresh UI, update counts, etc.
});

// Later, cleanup
unsubscribe();
```

## UI Components

### EventSyncIndicator (Full Display)

```typescript
import { EventSyncIndicator } from '../components/screens/patient';

<EventSyncIndicator 
  alwaysShow={false}  // Only show when pending events exist
  onPress={() => {
    // Optional custom action
  }}
/>
```

**Use in**: Patient home screen, settings screen

### EventSyncBadge (Compact)

```typescript
import { EventSyncBadge } from '../components/screens/patient';

<EventSyncBadge 
  size="sm"  // 'sm' or 'md'
  onPress={() => {
    // Optional custom action
  }}
/>
```

**Use in**: Headers, navigation bars

## Helper Functions

### Create and Enqueue Event

```typescript
import { createAndEnqueueEvent } from '../services/medicationEventService';

// For create events
await createAndEnqueueEvent(
  medication,
  patientName,
  'created'
);

// For update events
await createAndEnqueueEvent(
  oldMedication,
  patientName,
  'updated',
  newMedication
);

// For delete events
await createAndEnqueueEvent(
  medication,
  patientName,
  'deleted'
);
```

### Generate Events Manually

```typescript
import { 
  generateMedicationCreatedEvent,
  generateMedicationUpdatedEvent,
  generateMedicationDeletedEvent,
  medicationEventQueue
} from '../services/medicationEventService';

// Create event
const event = generateMedicationCreatedEvent(medication, patientName);
await medicationEventQueue.enqueue(event);

// Update event
const event = generateMedicationUpdatedEvent(oldMedication, newMedication, patientName);
await medicationEventQueue.enqueue(event);

// Delete event
const event = generateMedicationDeletedEvent(medication, patientName);
await medicationEventQueue.enqueue(event);
```

## Sync Behavior

| Trigger | When | Automatic |
|---------|------|-----------|
| **Immediate** | On event creation | ✅ Yes |
| **Background** | Every 5 minutes | ✅ Yes |
| **Foreground** | App comes to foreground | ✅ Yes |
| **Manual** | User taps UI or calls API | ❌ No |

## Status Tracking

### Check Sync Status

```typescript
// Is sync currently running?
const isSyncing = medicationEventQueue.isSyncInProgress();

// When was last sync attempt?
const lastSync = medicationEventQueue.getLastSyncAttempt();

// How many events are pending?
const count = await medicationEventQueue.getPendingCount();
```

## Common Patterns

### In Redux Thunks

```typescript
export const addMedication = createAsyncThunk(
  'medications/add',
  async (medication: Medication, { getState }) => {
    // 1. Save to Firestore
    const docRef = await addDoc(collection(db, 'medications'), medication);
    const newMedication = { ...medication, id: docRef.id };
    
    // 2. Generate event (only if caregiver assigned)
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

### In React Components

```typescript
import { useEffect, useState } from 'react';
import { medicationEventQueue } from '../services/medicationEventService';

function MyComponent() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Load initial count
    medicationEventQueue.getPendingCount().then(setPendingCount);

    // Subscribe to updates
    const unsubscribe = medicationEventQueue.onSyncComplete(() => {
      medicationEventQueue.getPendingCount().then(setPendingCount);
    });

    return unsubscribe;
  }, []);

  return (
    <View>
      <Text>{pendingCount} events pending</Text>
    </View>
  );
}
```

## Error Handling

### Network Errors
- Events stay in queue with 'pending' status
- Automatic retry on next sync
- No user-facing errors

### Firestore Errors
- Events marked as 'failed'
- Automatic retry on next sync
- Logged to console

### Best Practice
```typescript
try {
  await createAndEnqueueEvent(medication, patientName, 'created');
} catch (error) {
  // Event creation failed (rare)
  // Medication was still saved, just event wasn't queued
  console.error('Failed to queue event:', error);
  // Optionally show user message
}
```

## Troubleshooting

### Events Not Syncing?

1. Check network connectivity
2. Verify Firestore is initialized
3. Check console for errors
4. Verify caregiver ID is set on medication

```typescript
// Debug info
console.log('Pending:', await medicationEventQueue.getPendingCount());
console.log('Syncing:', medicationEventQueue.isSyncInProgress());
console.log('Last sync:', medicationEventQueue.getLastSyncAttempt());
```

### High Pending Count?

```typescript
// Trigger manual sync
await medicationEventQueue.syncPendingEvents();

// Check for errors in console
// Review Firestore security rules
```

## Performance Tips

- ✅ Queue is lightweight (minimal memory)
- ✅ Sync is non-blocking (doesn't freeze UI)
- ✅ Background sync is battery-efficient
- ✅ Automatic cleanup of delivered events

## Important Notes

1. **Caregiver Required**: Events only created if `medication.caregiverId` is set
2. **Non-Blocking**: Sync failures don't block medication operations
3. **Persistent**: Queue survives app restarts
4. **Automatic**: Most sync happens automatically
5. **Safe**: Error handling prevents data loss

## Full Documentation

See `src/services/EVENT_QUEUE_GUIDE.md` for complete documentation.

## API Reference

### MedicationEventQueue

```typescript
interface MedicationEventQueue {
  enqueue(event: Omit<MedicationEvent, 'id' | 'timestamp'>): Promise<void>;
  dequeue(): Promise<MedicationEvent | null>;
  syncPendingEvents(): Promise<void>;
  getPendingCount(): Promise<number>;
  onSyncComplete(callback: () => void): () => void;
  getLastSyncAttempt(): Date | null;
  isSyncInProgress(): boolean;
}
```

### Helper Functions

```typescript
function createAndEnqueueEvent(
  medication: Medication,
  patientName: string,
  eventType: MedicationEventType,
  newMedication?: Medication
): Promise<void>;

function generateMedicationCreatedEvent(
  medication: Medication,
  patientName: string
): Omit<MedicationEvent, 'id' | 'timestamp'>;

function generateMedicationUpdatedEvent(
  oldMedication: Medication,
  newMedication: Medication,
  patientName: string
): Omit<MedicationEvent, 'id' | 'timestamp'>;

function generateMedicationDeletedEvent(
  medication: Medication,
  patientName: string
): Omit<MedicationEvent, 'id' | 'timestamp'>;
```

---

**Need Help?** Check the full guide at `src/services/EVENT_QUEUE_GUIDE.md`
