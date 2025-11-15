# Medication Event Service - Quick Reference Guide

## Overview
The Medication Event Service manages medication lifecycle events (create, update, delete) for caregiver notifications. It provides offline queue management and automatic synchronization with Firestore.

## Import

```typescript
import { 
  medicationEventService,
  createAndEnqueueEvent,
  generateMedicationCreatedEvent,
  generateMedicationUpdatedEvent,
  generateMedicationDeletedEvent
} from '@/services/medicationEventService';
```

## Basic Usage

### 1. Creating a Medication Event

```typescript
// Simple way - using convenience function
await createAndEnqueueEvent(
  medication,
  patientName,
  'created'
);

// Manual way - more control
const event = generateMedicationCreatedEvent(medication, patientName);
await medicationEventService.enqueue(event);
```

### 2. Updating a Medication Event

```typescript
// Simple way - automatically tracks changes
await createAndEnqueueEvent(
  oldMedication,
  patientName,
  'updated',
  newMedication
);

// Manual way - with change tracking
const event = generateMedicationUpdatedEvent(
  oldMedication,
  newMedication,
  patientName
);
await medicationEventService.enqueue(event);
```

### 3. Deleting a Medication Event

```typescript
// Simple way
await createAndEnqueueEvent(
  medication,
  patientName,
  'deleted'
);

// Manual way
const event = generateMedicationDeletedEvent(medication, patientName);
await medicationEventService.enqueue(event);
```

## Queue Management

### Check Pending Events

```typescript
const pendingCount = await medicationEventService.getPendingCount();
console.log(`${pendingCount} events waiting to sync`);
```

### Manual Sync

```typescript
// Trigger sync manually
await medicationEventService.syncPendingEvents();
```

### Check Sync Status

```typescript
const isSyncing = medicationEventService.isSyncInProgress();
const lastSync = medicationEventService.getLastSyncAttempt();

console.log('Syncing:', isSyncing);
console.log('Last sync:', lastSync?.toISOString());
```

### Get All Events (Debugging)

```typescript
const allEvents = await medicationEventService.getAllEvents();
console.log('Total events:', allEvents.length);
```

## Integration with Redux

### In medicationsSlice.ts

```typescript
import { createAndEnqueueEvent } from '@/services/medicationEventService';

// Add medication
export const addMedication = createAsyncThunk(
  'medications/add',
  async (medication: Omit<Medication, 'id'>, { getState }) => {
    // ... create medication in Firestore
    
    // Generate event
    const state = getState() as RootState;
    const patientName = state.auth.user?.name || 'Unknown';
    
    await createAndEnqueueEvent(
      newMedication,
      patientName,
      'created'
    );
    
    return newMedication;
  }
);

// Update medication
export const updateMedication = createAsyncThunk(
  'medications/update',
  async ({ id, updates }: { id: string; updates: Partial<Medication> }, { getState }) => {
    // ... get old medication
    // ... update medication in Firestore
    
    // Generate event with changes
    const state = getState() as RootState;
    const patientName = state.auth.user?.name || 'Unknown';
    
    await createAndEnqueueEvent(
      oldMedication,
      patientName,
      'updated',
      updatedMedication
    );
    
    return updatedMedication;
  }
);

// Delete medication
export const deleteMedication = createAsyncThunk(
  'medications/delete',
  async (medicationId: string, { getState }) => {
    // ... get medication
    // ... delete from Firestore
    
    // Generate event
    const state = getState() as RootState;
    const patientName = state.auth.user?.name || 'Unknown';
    
    await createAndEnqueueEvent(
      medication,
      patientName,
      'deleted'
    );
    
    return medicationId;
  }
);
```

## Background Sync Setup

### App.tsx or Root Component

```typescript
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { medicationEventService } from '@/services/medicationEventService';

function App() {
  useEffect(() => {
    // Sync when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        medicationEventService.syncPendingEvents();
      }
    });

    // Initial sync
    medicationEventService.syncPendingEvents();

    return () => {
      subscription.remove();
    };
  }, []);

  // ... rest of app
}
```

### Periodic Background Sync (Optional)

```typescript
import { useEffect } from 'react';
import { medicationEventService } from '@/services/medicationEventService';

function useBackgroundSync(intervalMinutes: number = 5) {
  useEffect(() => {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    const interval = setInterval(() => {
      medicationEventService.syncPendingEvents();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMinutes]);
}

// Usage in component
function App() {
  useBackgroundSync(5); // Sync every 5 minutes
  // ...
}
```

## Event Structure

### MedicationEvent Interface

```typescript
interface MedicationEvent {
  id: string;                          // Unique event ID
  eventType: 'created' | 'updated' | 'deleted';
  medicationId: string;                // Reference to medication
  medicationName: string;              // Name for display
  medicationData: Partial<Medication>; // Snapshot of medication
  patientId: string;                   // Patient who owns medication
  patientName: string;                 // Patient name for display
  caregiverId: string;                 // Assigned caregiver
  timestamp: Date | string;            // When event occurred
  syncStatus: 'pending' | 'delivered' | 'failed';
  changes?: MedicationEventChange[];   // For updates only
}
```

### Change Tracking (Update Events)

```typescript
interface MedicationEventChange {
  field: string;    // Field name that changed
  oldValue: any;    // Previous value
  newValue: any;    // New value
}

// Example changes array
[
  { field: 'name', oldValue: 'Aspirin', newValue: 'Aspirin 500mg' },
  { field: 'times', oldValue: ['08:00'], newValue: ['08:00', '20:00'] },
  { field: 'currentQuantity', oldValue: 30, newValue: 25 }
]
```

## Error Handling

### Caregiver Not Assigned

```typescript
// Service automatically skips event creation if no caregiver
const medication = { /* ... no caregiverId ... */ };
await createAndEnqueueEvent(medication, patientName, 'created');
// No event created, no error thrown
```

### Network Errors

```typescript
// Events are queued locally and synced when network available
await createAndEnqueueEvent(medication, patientName, 'created');
// Event added to queue even if offline
// Will sync automatically when online
```

### Sync Failures

```typescript
// Failed events are marked and can be retried
await medicationEventService.syncPendingEvents();
// Failed events remain in queue with status 'failed'
// Next sync attempt will retry them
```

## Best Practices

1. **Always use createAndEnqueueEvent()** - It handles caregiver validation
2. **Don't block on sync** - Events are queued immediately, sync happens async
3. **Check pending count** - Display to user if many events are pending
4. **Sync on app foreground** - Ensures events are delivered promptly
5. **Handle errors gracefully** - Event creation should never block medication operations

## Debugging

### Enable Logging

All operations are logged with `[MedicationEventService]` prefix:

```typescript
// Check console for:
// - Queue operations
// - Sync attempts
// - Success/failure messages
```

### Inspect Queue

```typescript
const events = await medicationEventService.getAllEvents();
console.log('Queue contents:', JSON.stringify(events, null, 2));
```

### Clear Queue (Testing Only)

```typescript
await medicationEventService.clearQueue();
console.log('Queue cleared');
```

## Firestore Collection

Events are stored in the `medicationEvents` collection:

```
/medicationEvents/{eventId}
  - All fields from MedicationEvent interface
  - timestamp is Firestore Timestamp type
  - Indexed by caregiverId for efficient queries
```

## Security Rules (To be implemented)

```javascript
match /medicationEvents/{eventId} {
  // Caregivers can read their assigned events
  allow read: if request.auth != null && 
    resource.data.caregiverId == request.auth.uid;
  
  // Patients can create events
  allow write: if request.auth != null && 
    request.resource.data.patientId == request.auth.uid;
}
```

## Next Steps

- **Task 13**: Background sync with retry intervals
- **Task 14**: Integration with medication Redux actions
- **Task 15-17**: Caregiver event registry UI
- **Task 18**: Firestore security rules
