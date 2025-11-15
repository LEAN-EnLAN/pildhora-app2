# Event Queue Quick Start

## 🚀 Quick Usage

### Import

```typescript
import { medicationEventQueue } from '../services/medicationEventService';
import { EventSyncIndicator, EventSyncBadge } from '../components/screens/patient';
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

### Subscribe to Sync

```typescript
const unsubscribe = medicationEventQueue.onSyncComplete(() => {
  console.log('Sync completed!');
  // Refresh UI
});

// Later
unsubscribe();
```

## 🎨 UI Components

### Full Indicator

```tsx
<EventSyncIndicator 
  alwaysShow={false}  // Only show when pending
  onPress={() => {
    // Custom action
  }}
/>
```

### Compact Badge

```tsx
<EventSyncBadge 
  size="md"  // 'sm' or 'md'
  onPress={() => {
    // Custom action
  }}
/>
```

## ⚙️ How It Works

1. **Immediate Sync**: Events sync immediately when created
2. **Background Sync**: Auto-retry every 5 minutes
3. **Foreground Sync**: Syncs when app comes to foreground
4. **Manual Sync**: User can trigger via UI

## 📊 Sync Status

```typescript
// Check if syncing
const isSyncing = medicationEventQueue.isSyncInProgress();

// Get last sync time
const lastSync = medicationEventQueue.getLastSyncAttempt();
```

## 🔧 Integration with Redux

```typescript
import { createAndEnqueueEvent } from '../services/medicationEventService';

// In your thunk
await createAndEnqueueEvent(
  medication,
  patientName,
  'created'  // or 'updated', 'deleted'
);
```

## 📚 Full Documentation

See [EVENT_QUEUE_GUIDE.md](./EVENT_QUEUE_GUIDE.md) for complete documentation.
