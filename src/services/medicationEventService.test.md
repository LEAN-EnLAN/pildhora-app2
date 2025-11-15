# MedicationEventService Test Documentation

## Overview
This document describes the implementation and testing approach for the MedicationEventService, which manages medication lifecycle events for caregiver notifications.

## Implementation Summary

### 1. Data Model (src/types/index.ts)
✅ **MedicationEvent Interface** - Defined with all required fields:
- `id`: Unique event identifier
- `eventType`: 'created' | 'updated' | 'deleted'
- `medicationId`: Reference to the medication
- `medicationName`: Name of the medication
- `medicationData`: Snapshot of medication data
- `patientId`: Patient who owns the medication
- `patientName`: Name of the patient
- `caregiverId`: Assigned caregiver
- `timestamp`: When the event occurred
- `syncStatus`: 'pending' | 'delivered' | 'failed'
- `changes`: Optional array of field changes (for updates)

### 2. EventQueueService (src/services/medicationEventService.ts)
✅ **Core Service Class** - MedicationEventService with methods:
- `enqueue()`: Add new events to the queue
- `dequeue()`: Remove and return the next event
- `syncPendingEvents()`: Sync all pending events to Firestore
- `getPendingCount()`: Get count of pending events
- `getAllEvents()`: Get all events (for debugging)
- `clearQueue()`: Clear all events (for testing)
- `getLastSyncAttempt()`: Get last sync timestamp
- `isSyncInProgress()`: Check if sync is running

✅ **Local Persistence** - Uses AsyncStorage:
- Events stored at key: `@medication_event_queue`
- Last sync timestamp at: `@medication_event_last_sync`
- Automatic persistence on queue changes

✅ **Firestore Integration**:
- Collection: `medicationEvents`
- Converts timestamps to Firestore Timestamp format
- Handles sync errors gracefully
- Marks events as 'delivered' or 'failed'

### 3. Event Generation Helpers
✅ **Helper Functions** for creating events:
- `generateMedicationCreatedEvent()`: Create event for new medications
- `generateMedicationUpdatedEvent()`: Create event with change tracking
- `generateMedicationDeletedEvent()`: Create event for deletions
- `createAndEnqueueEvent()`: Convenience function to create and enqueue

✅ **Change Tracking** for updates:
- Compares old and new medication data
- Tracks changes in key fields: name, dose, schedule, inventory
- Handles array comparisons (times, frequency)

### 4. Sync Strategy
✅ **Multi-level Sync Approach**:
1. **Immediate Sync**: Attempts to sync when event is enqueued
2. **Background Sync**: Can be triggered periodically (5-minute intervals)
3. **App Foreground**: Can sync when app comes to foreground
4. **Manual Sync**: Can be triggered by user

✅ **Error Handling**:
- Prevents concurrent sync operations
- Marks failed events for retry
- Removes delivered events from queue
- Logs all operations for debugging

## Testing Approach

### Unit Tests (To be implemented in integration)
The service is designed to be tested with the following scenarios:

1. **Event Generation**:
   - Create events with all required fields
   - Update events with change tracking
   - Delete events with medication snapshot

2. **Queue Management**:
   - Enqueue multiple events
   - Dequeue events in order
   - Persist queue to AsyncStorage
   - Load queue on service initialization

3. **Sync Operations**:
   - Sync pending events to Firestore
   - Handle sync failures gracefully
   - Mark events as delivered/failed
   - Remove delivered events from queue

4. **Edge Cases**:
   - No caregiver assigned (skip event creation)
   - Firestore unavailable (defer sync)
   - Concurrent sync attempts (prevent)
   - Empty queue (handle gracefully)

### Integration Tests (Task 14)
The service will be integrated with the medication management flow in Task 14:
- Test event generation on medication create
- Test event generation on medication update
- Test event generation on medication delete
- Test offline queue and sync when online
- Test caregiver event reception

## Usage Example

```typescript
import { 
  medicationEventService, 
  createAndEnqueueEvent 
} from './services/medicationEventService';

// When creating a medication
await createAndEnqueueEvent(
  newMedication,
  patientName,
  'created'
);

// When updating a medication
await createAndEnqueueEvent(
  oldMedication,
  patientName,
  'updated',
  newMedication
);

// When deleting a medication
await createAndEnqueueEvent(
  medication,
  patientName,
  'deleted'
);

// Check pending events
const pendingCount = await medicationEventService.getPendingCount();

// Manually trigger sync
await medicationEventService.syncPendingEvents();
```

## Firestore Collection Structure

```
/medicationEvents/{eventId}
  - id: string
  - eventType: 'created' | 'updated' | 'deleted'
  - medicationId: string
  - medicationName: string
  - medicationData: object (medication snapshot)
  - patientId: string
  - patientName: string
  - caregiverId: string
  - timestamp: Timestamp
  - syncStatus: 'pending' | 'delivered' | 'failed'
  - changes: array (optional, for updates)
```

## Security Considerations

### Firestore Security Rules (To be implemented in Task 18)
```javascript
// Only assigned caregiver can read events
match /medicationEvents/{eventId} {
  allow read: if request.auth != null && 
    resource.data.caregiverId == request.auth.uid;
  
  // Only authenticated patients can write events
  allow write: if request.auth != null && 
    request.resource.data.patientId == request.auth.uid;
}
```

## Requirements Coverage

✅ **Requirement 6.1**: Event generation for create/update/delete operations
✅ **Requirement 6.2**: Immediate transmission when caregiver connected
✅ **Requirement 6.3**: Event queue for offline storage
✅ **Requirement 6.4**: Sync when caregiver connection established
✅ **Requirement 6.5**: Event includes medication details, timestamp, and type

## Next Steps

1. **Task 13**: Implement event queue and sync system with background sync
2. **Task 14**: Integrate event generation into medication lifecycle
3. **Task 18**: Implement Firestore security rules for medicationEvents collection

## Notes

- The service uses a singleton pattern for easy access throughout the app
- AsyncStorage ensures events persist across app restarts
- The sync mechanism is designed to be resilient to network failures
- Change tracking provides detailed audit trail for caregivers
