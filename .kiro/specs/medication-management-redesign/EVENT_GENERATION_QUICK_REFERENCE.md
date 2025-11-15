# Event Generation Quick Reference

## Overview
This document provides a quick reference for the event generation integration in the medication lifecycle.

## Event Generation Pattern

All medication lifecycle operations (create, update, delete) follow this pattern:

```typescript
// After successful medication operation
try {
  if (medication.caregiverId && user?.name) {
    await createAndEnqueueEvent(
      medication,
      user.name,
      'eventType',
      newMedication // Only for updates
    );
    console.log('[MedicationsSlice] Event enqueued');
  }
} catch (eventError) {
  console.error('[MedicationsSlice] Failed to create event:', eventError);
}
```

## Key Features

### 1. Caregiver Validation
- Events are only created when `caregiverId` is present
- Prevents unnecessary event creation
- Reduces database writes

### 2. Non-Blocking Error Handling
- Event creation errors don't fail medication operations
- Errors are logged for debugging
- User experience remains smooth

### 3. Change Tracking (Updates)
- Old and new medication passed to event service
- Change diff calculated automatically
- Only changed fields included in event

## Event Types

### Created Event
```typescript
await createAndEnqueueEvent(
  savedMedication,
  user.name,
  'created'
);
```

### Updated Event
```typescript
await createAndEnqueueEvent(
  medicationData,      // Old medication
  user.name,
  'updated',
  updatedMedication    // New medication
);
```

### Deleted Event
```typescript
await createAndEnqueueEvent(
  medicationData,
  user.name,
  'deleted'
);
```

## Implementation Locations

### addMedication Thunk
- **File**: `src/store/slices/medicationsSlice.ts`
- **Lines**: 263-273, 323-333
- **Event Type**: 'created'

### updateMedication Thunk
- **File**: `src/store/slices/medicationsSlice.ts`
- **Lines**: 445-455, 512-522
- **Event Type**: 'updated'
- **Special**: Passes both old and new medication

### deleteMedication Thunk
- **File**: `src/store/slices/medicationsSlice.ts`
- **Lines**: 573-583
- **Event Type**: 'deleted'
- **Special**: Captures snapshot before deletion

## Event Service API

### createAndEnqueueEvent Function
```typescript
async function createAndEnqueueEvent(
  medication: Medication,
  patientName: string,
  eventType: 'created' | 'updated' | 'deleted',
  newMedication?: Medication
): Promise<void>
```

**Parameters**:
- `medication`: The medication object (or old medication for updates)
- `patientName`: The name of the patient (from `user.name`)
- `eventType`: The type of event ('created', 'updated', 'deleted')
- `newMedication`: The new medication data (required for 'updated' events)

**Behavior**:
- Validates caregiver ID
- Generates event with proper structure
- Queues event for sync
- Attempts immediate sync
- Falls back to background sync if needed

## Event Data Structure

```typescript
interface MedicationEvent {
  id: string;                          // Auto-generated
  eventType: 'created' | 'updated' | 'deleted';
  medicationId: string;
  medicationName: string;
  medicationData: Partial<Medication>; // Full snapshot
  patientId: string;
  patientName: string;
  caregiverId: string;
  timestamp: string;                   // ISO string
  syncStatus: 'pending' | 'delivered' | 'failed';
  changes?: MedicationEventChange[];   // Only for updates
}
```

## Change Tracking (Updates Only)

```typescript
interface MedicationEventChange {
  field: string;      // Field name that changed
  oldValue: any;      // Previous value
  newValue: any;      // New value
}
```

**Tracked Fields**:
- name
- doseValue
- doseUnit
- quantityType
- frequency
- times
- emoji
- trackInventory
- currentQuantity
- lowQuantityThreshold

## Sync Behavior

### Immediate Sync
- Attempted when event is enqueued
- Non-blocking (errors logged)
- Best effort delivery

### Background Sync
- Runs every 5 minutes
- Retries failed events
- Exponential backoff

### Foreground Sync
- Triggered when app comes to foreground
- Syncs all pending events
- Ensures delivery after offline period

## Error Handling

### Event Creation Errors
- Logged to console
- Don't block medication operations
- Event queued for retry

### Sync Errors
- Marked as 'failed' in queue
- Retried on next sync attempt
- Max 3 retry attempts with backoff

### Network Errors
- Events queued locally
- Synced when connection restored
- No data loss

## Testing

Run the test suite:
```bash
node test-medication-lifecycle-events.js
```

**Expected Results**:
- 10/10 tests passing
- All event types verified
- Caregiver validation confirmed
- Non-blocking error handling verified

## Troubleshooting

### Events Not Being Created
1. Check if caregiver is assigned to medication
2. Verify user name is available in Redux state
3. Check console for event creation errors

### Events Not Syncing
1. Check network connection
2. Verify Firestore is initialized
3. Check event queue status
4. Review sync logs in console

### Events Missing Data
1. Verify medication object is complete
2. Check user name is passed correctly
3. Review event structure in Firestore

## Best Practices

1. **Always validate caregiver ID** before creating events
2. **Use try-catch** to prevent blocking medication operations
3. **Log errors** for debugging and monitoring
4. **Pass complete medication objects** to ensure full snapshots
5. **Include user name** for patient identification
6. **Let event service handle sync** - don't implement custom sync logic

## Related Files

- `src/store/slices/medicationsSlice.ts` - Redux thunks with event generation
- `src/services/medicationEventService.ts` - Event service implementation
- `src/types/index.ts` - Type definitions
- `test-medication-lifecycle-events.js` - Test suite
- `.kiro/specs/medication-management-redesign/TASK14_VERIFICATION_SUMMARY.md` - Detailed verification

## Requirements Coverage

- ✅ Requirement 6.1: Medication events generated for create/update/delete
- ✅ Requirement 6.5: Events include medication details, timestamp, and event type
