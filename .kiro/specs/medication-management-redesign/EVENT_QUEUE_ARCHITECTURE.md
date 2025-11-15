# Event Queue System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Patient Application                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Redux Medication Actions                    │   │
│  │  (addMedication, updateMedication, deleteMedication)    │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                          │
│                       ▼                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         MedicationEventService (Core)                    │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │  Event Queue (In-Memory + AsyncStorage)           │  │   │
│  │  │  - Pending events                                 │  │   │
│  │  │  - Failed events                                  │  │   │
│  │  │  - Sync status                                    │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │  Sync Mechanisms                                  │  │   │
│  │  │  1. Immediate Sync (on enqueue)                   │  │   │
│  │  │  2. Background Sync (every 5 min)                 │  │   │
│  │  │  3. Foreground Sync (app activation)              │  │   │
│  │  │  4. Manual Sync (user triggered)                  │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │  Sync Callbacks                                   │  │   │
│  │  │  - Notify UI components                           │  │   │
│  │  │  - Update pending counts                          │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────┬───────────────────────────────────┘   │
│                        │                                         │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         MedicationEventQueue (Wrapper)                   │   │
│  │  - Public API                                            │   │
│  │  - enqueue(), dequeue()                                  │   │
│  │  - syncPendingEvents()                                   │   │
│  │  - getPendingCount()                                     │   │
│  │  - onSyncComplete()                                      │   │
│  └─────────────────────┬───────────────────────────────────┘   │
│                        │                                         │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              UI Components                               │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐    │   │
│  │  │ EventSyncIndicator   │  │  EventSyncBadge      │    │   │
│  │  │ - Full status card   │  │  - Compact badge     │    │   │
│  │  │ - Pending count      │  │  - Header/nav use    │    │   │
│  │  │ - Last sync time     │  │  - Auto-hide         │    │   │
│  │  │ - Manual sync button │  │  - Tap to sync       │    │   │
│  │  └──────────────────────┘  └──────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Firebase Backend                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Firestore Collection: medicationEvents                  │   │
│  │  - eventType: 'created' | 'updated' | 'deleted'         │   │
│  │  - medicationId, medicationName                          │   │
│  │  - medicationData (snapshot)                             │   │
│  │  - patientId, patientName                                │   │
│  │  - caregiverId                                           │   │
│  │  - timestamp                                             │   │
│  │  - changes[] (for updates)                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Caregiver Application                          │
├─────────────────────────────────────────────────────────────────┤
│  - Real-time event listener                                      │
│  - Event registry UI                                             │
│  - Filtering and search                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Sync Flow Diagram

```
┌─────────────────┐
│  Event Created  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Enqueue to Local Queue │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Persist to AsyncStorage │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Immediate Sync Attempt │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────────┐
│ ✓   │   │ ✗       │
│Success│ │ Failure │
└──┬──┘   └────┬────┘
   │           │
   │           ▼
   │      ┌──────────────┐
   │      │ Mark Pending │
   │      └──────┬───────┘
   │             │
   │             ▼
   │      ┌──────────────────────┐
   │      │ Background Sync      │
   │      │ (Every 5 minutes)    │
   │      └──────┬───────────────┘
   │             │
   │             ▼
   │      ┌──────────────────────┐
   │      │ Foreground Sync      │
   │      │ (App activation)     │
   │      └──────┬───────────────┘
   │             │
   │             ▼
   │      ┌──────────────────────┐
   │      │ Manual Sync          │
   │      │ (User triggered)     │
   │      └──────┬───────────────┘
   │             │
   │             ▼
   │      ┌──────────────────────┐
   │      │ Retry Sync           │
   │      └──────┬───────────────┘
   │             │
   └─────────────┘
         │
         ▼
┌─────────────────────────┐
│ Remove from Queue       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Notify Callbacks        │
└─────────────────────────┘
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────┐
│                    Patient Home Screen                    │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Header                                             │  │
│  │  ┌──────────────┐                  ┌─────────────┐ │  │
│  │  │ PILDHORA     │                  │ [Badge: 3]  │ │  │
│  │  └──────────────┘                  └─────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  EventSyncIndicator                                 │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ [☁️] 3 eventos pendientes                    │  │  │
│  │  │     Toca para sincronizar                    │  │  │
│  │  │                                         [3]  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  [Other content...]                                        │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

## State Management

```
MedicationEventService State:
├── queue: MedicationEvent[]
│   ├── Pending events
│   ├── Failed events
│   └── Delivered events (removed)
├── syncInProgress: boolean
├── lastSyncAttempt: Date | null
├── syncIntervalId: Timer | null
├── appStateSubscription: Subscription | null
└── syncCallbacks: Set<Function>

AsyncStorage:
├── @medication_event_queue
│   └── Serialized queue array
└── @medication_event_last_sync
    └── ISO timestamp string
```

## Sync Triggers

```
┌─────────────────────────────────────────────────────────┐
│                    Sync Triggers                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Immediate (on enqueue)                               │
│     ├── Triggered: When event is enqueued               │
│     ├── Delay: None (immediate)                         │
│     └── Purpose: Sync ASAP if online                    │
│                                                           │
│  2. Background (timer)                                   │
│     ├── Triggered: Every 5 minutes                      │
│     ├── Delay: 300,000ms                                │
│     └── Purpose: Retry failed/pending events            │
│                                                           │
│  3. Foreground (app state)                              │
│     ├── Triggered: App becomes active                   │
│     ├── Delay: None (immediate)                         │
│     └── Purpose: Sync after app was backgrounded        │
│                                                           │
│  4. Manual (user action)                                │
│     ├── Triggered: User taps sync button               │
│     ├── Delay: None (immediate)                         │
│     └── Purpose: User-initiated sync                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│  Sync Attempt   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ Success │ │ Error        │
└────┬────┘ └──────┬───────┘
     │             │
     │        ┌────┴────┐
     │        │         │
     │        ▼         ▼
     │   ┌────────┐ ┌──────────┐
     │   │Network │ │Firestore │
     │   │Error   │ │Error     │
     │   └───┬────┘ └────┬─────┘
     │       │           │
     │       └─────┬─────┘
     │             │
     │             ▼
     │      ┌──────────────┐
     │      │ Mark Failed  │
     │      └──────┬───────┘
     │             │
     │             ▼
     │      ┌──────────────┐
     │      │ Log Error    │
     │      └──────┬───────┘
     │             │
     │             ▼
     │      ┌──────────────┐
     │      │ Keep in Queue│
     │      └──────┬───────┘
     │             │
     │             ▼
     │      ┌──────────────┐
     │      │ Retry Later  │
     │      └──────────────┘
     │
     ▼
┌──────────────────┐
│ Remove from Queue│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Notify Callbacks │
└──────────────────┘
```

## Data Flow

```
Patient Action (Create/Update/Delete Medication)
    ↓
Redux Thunk (medicationsSlice)
    ↓
Save to Firestore (medications collection)
    ↓
Generate Event (createAndEnqueueEvent)
    ↓
Enqueue Event (medicationEventQueue.enqueue)
    ↓
Persist to AsyncStorage
    ↓
Immediate Sync Attempt
    ↓
    ├─→ Success → Remove from Queue → Notify UI
    │
    └─→ Failure → Keep in Queue → Background Retry
                                      ↓
                                  Foreground Retry
                                      ↓
                                  Manual Retry
                                      ↓
                                  Success → Remove → Notify UI
```

## UI Update Flow

```
Sync Completion
    ↓
notifySyncComplete()
    ↓
Invoke all registered callbacks
    ↓
    ├─→ EventSyncIndicator
    │   ├─→ Update pending count
    │   ├─→ Update last sync time
    │   └─→ Update sync status
    │
    └─→ EventSyncBadge
        ├─→ Update pending count
        └─→ Show/hide badge
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────┐
│                  Performance Metrics                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Memory Usage:                                           │
│  ├── Queue in memory: ~1KB per event                    │
│  ├── AsyncStorage: ~1KB per event                       │
│  └── Typical: <100KB for 100 events                     │
│                                                           │
│  Network Usage:                                          │
│  ├── Per event: 1 Firestore write (~1KB)               │
│  ├── Sync frequency: Every 5 minutes                    │
│  └── Typical: <10KB per sync cycle                      │
│                                                           │
│  Battery Impact:                                         │
│  ├── Background timer: Minimal                          │
│  ├── Foreground sync: Negligible                        │
│  └── Overall: <1% battery per day                       │
│                                                           │
│  UI Responsiveness:                                      │
│  ├── Enqueue: <10ms                                     │
│  ├── Sync: Async (non-blocking)                        │
│  └── UI update: <50ms                                   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```
