# Data Synchronization Quick Reference

## Quick Start

### 1. Import Hooks and Components

```typescript
import { useMedicationSync, useDeviceEventSync, useSyncStatus } from '../../hooks/useSyncStatus';
import { SyncStatusIndicator, SyncStatusBadge } from '../../components/shared/SyncStatusIndicator';
```

### 2. Start Syncing in Your Screen

```typescript
function MyScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Start medication sync (app → device)
  useMedicationSync(user?.id, user?.deviceId);
  
  // Start device event sync (device → app)
  useDeviceEventSync(user?.deviceId, user?.id);
  
  return <View>{/* Your UI */}</View>;
}
```

### 3. Show Sync Status

```typescript
// In header
<SyncStatusBadge />

// In settings
<SyncStatusIndicator detailed showSyncButton />
```

## Common Patterns

### Patient Home Screen

```typescript
function PatientHome() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  useMedicationSync(user?.id, user?.deviceId);
  useDeviceEventSync(user?.deviceId, user?.id);
  
  return (
    <View>
      <View style={styles.header}>
        <Text>Home</Text>
        <SyncStatusBadge />
      </View>
      {/* Rest of UI */}
    </View>
  );
}
```

### Caregiver Dashboard

```typescript
function CaregiverDashboard() {
  const selectedPatient = useSelector(
    (state: RootState) => state.caregiver.selectedPatient
  );
  
  useMedicationSync(selectedPatient?.id, selectedPatient?.deviceId);
  useDeviceEventSync(selectedPatient?.deviceId, selectedPatient?.id);
  
  return (
    <View>
      <SyncStatusIndicator detailed showSyncButton />
      {/* Rest of UI */}
    </View>
  );
}
```

### Settings Screen

```typescript
function SettingsScreen() {
  return (
    <ScrollView>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sincronización</Text>
        <SyncStatusIndicator detailed showSyncButton />
      </View>
    </ScrollView>
  );
}
```

### Manual Sync Button

```typescript
function SyncButton() {
  const { forceSyncAll, isSyncing } = useForceSyncAll();
  
  return (
    <Button onPress={forceSyncAll} disabled={isSyncing}>
      {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
    </Button>
  );
}
```

### Custom Sync Status Display

```typescript
function CustomSyncStatus() {
  const {
    medicationSyncStatus,
    deviceEventSyncStatus,
    pendingMedicationOps,
    pendingDeviceEventOps,
    lastMedicationSync,
    isSyncing,
  } = useSyncStatus();
  
  return (
    <View>
      <Text>Medication Sync: {medicationSyncStatus}</Text>
      <Text>Device Event Sync: {deviceEventSyncStatus}</Text>
      <Text>Pending: {pendingMedicationOps + pendingDeviceEventOps}</Text>
      {lastMedicationSync && (
        <Text>Last sync: {lastMedicationSync.toLocaleTimeString()}</Text>
      )}
    </View>
  );
}
```

## Sync Status Values

| Status | Meaning | Color |
|--------|---------|-------|
| `synced` | All operations complete | 🟢 Green |
| `syncing` | Operations in progress | 🔵 Blue |
| `pending` | Operations queued | 🟠 Orange |
| `error` | Sync failed | 🔴 Red |
| `offline` | No network connection | ⚫ Gray |

## Hook Reference

### `useSyncStatus()`

Returns real-time sync status:

```typescript
const {
  medicationSyncStatus,      // Current medication sync status
  deviceEventSyncStatus,     // Current device event sync status
  pendingMedicationOps,      // Number of pending medication operations
  pendingDeviceEventOps,     // Number of pending device event operations
  lastMedicationSync,        // Date of last successful medication sync
  lastDeviceEventSync,       // Date of last successful device event sync
  overallStatus,             // Worst case of both statuses
  isSyncing,                 // Boolean: any sync in progress
  hasPendingOps,             // Boolean: any pending operations
  totalPendingOps,           // Total pending operations
} = useSyncStatus();
```

### `useMedicationSync(patientId, deviceId, enabled?)`

Starts medication sync (app → device):

```typescript
useMedicationSync(
  user?.id,           // Patient ID
  user?.deviceId,     // Device ID
  true                // Optional: enable/disable (default: true)
);
```

### `useDeviceEventSync(deviceId, patientId, enabled?)`

Starts device event sync (device → app):

```typescript
useDeviceEventSync(
  user?.deviceId,     // Device ID
  user?.id,           // Patient ID
  true                // Optional: enable/disable (default: true)
);
```

### `useForceSyncAll()`

Provides manual sync trigger:

```typescript
const { forceSyncAll, isSyncing } = useForceSyncAll();

// Call to force sync
await forceSyncAll();
```

## Component Reference

### `<SyncStatusIndicator />`

Full-featured sync status display:

```typescript
// Simple
<SyncStatusIndicator />

// Detailed
<SyncStatusIndicator detailed />

// With sync button
<SyncStatusIndicator detailed showSyncButton />

// Custom styling
<SyncStatusIndicator className="my-4" />
```

**Props**:
- `detailed?: boolean` - Show detailed sync information
- `showSyncButton?: boolean` - Show manual sync button
- `className?: string` - Custom styling

### `<SyncStatusBadge />`

Compact badge for headers:

```typescript
<SyncStatusBadge />
```

**Features**:
- Icon-only display
- Pending count badge
- Minimal space usage

## Service Reference

### Direct Service Access

```typescript
import { dataSyncService } from '../../services/dataSyncService';

// Get current statistics
const stats = dataSyncService.getSyncStatistics();

// Force sync all pending operations
await dataSyncService.forceSyncAll();

// Clear all pending operations (testing only)
await dataSyncService.clearPendingOperations();

// Subscribe to sync status changes
const unsubscribe = dataSyncService.onSyncStatusChange((stats) => {
  console.log('Sync status changed:', stats);
});

// Cleanup
unsubscribe();
```

## Troubleshooting

### Sync Not Working

1. **Check network connection**
   ```typescript
   const { overallStatus } = useSyncStatus();
   if (overallStatus === 'offline') {
     // Show offline message
   }
   ```

2. **Check pending operations**
   ```typescript
   const { totalPendingOps } = useSyncStatus();
   console.log('Pending operations:', totalPendingOps);
   ```

3. **Force sync manually**
   ```typescript
   const { forceSyncAll } = useForceSyncAll();
   await forceSyncAll();
   ```

### Sync Taking Too Long

1. **Check sync status**
   ```typescript
   const { isSyncing, lastMedicationSync } = useSyncStatus();
   console.log('Is syncing:', isSyncing);
   console.log('Last sync:', lastMedicationSync);
   ```

2. **Check for errors**
   ```typescript
   const { medicationSyncStatus, deviceEventSyncStatus } = useSyncStatus();
   if (medicationSyncStatus === 'error' || deviceEventSyncStatus === 'error') {
     // Show error message
   }
   ```

### Operations Stuck in Queue

1. **Check retry count** (requires service access)
   ```typescript
   const stats = dataSyncService.getSyncStatistics();
   console.log('Pending medication ops:', stats.pendingMedicationOps);
   console.log('Pending device event ops:', stats.pendingDeviceEventOps);
   ```

2. **Clear queue** (testing only)
   ```typescript
   await dataSyncService.clearPendingOperations();
   ```

## Performance Tips

1. **Only sync when needed**
   ```typescript
   // Disable sync when screen is not focused
   const isFocused = useIsFocused();
   useMedicationSync(user?.id, user?.deviceId, isFocused);
   ```

2. **Use simple indicators in lists**
   ```typescript
   // Use badge instead of full indicator in list items
   <SyncStatusBadge />
   ```

3. **Debounce manual sync**
   ```typescript
   const { forceSyncAll, isSyncing } = useForceSyncAll();
   
   // Disable button while syncing
   <Button onPress={forceSyncAll} disabled={isSyncing}>
     Sync
   </Button>
   ```

## Testing

### Manual Testing

1. **Create medication** → Check RTDB within 5 seconds
2. **Update medication** → Check RTDB within 5 seconds
3. **Delete medication** → Check RTDB within 5 seconds
4. **Go offline** → Create medication → Go online → Check sync
5. **Device event** → Check Firestore within 5 seconds

### Automated Testing

```typescript
import { dataSyncService } from '../../services/dataSyncService';

describe('Data Sync', () => {
  it('should queue medication sync', async () => {
    await dataSyncService.queueMedicationSync(
      'med-123',
      'device-456',
      'create',
      medication
    );
    
    const stats = dataSyncService.getSyncStatistics();
    expect(stats.pendingMedicationOps).toBe(1);
  });
});
```

## Best Practices

1. **Always use hooks in screens** - Don't access service directly
2. **Show sync status in settings** - Let users see sync health
3. **Handle offline gracefully** - Show offline indicator
4. **Test offline scenarios** - Ensure queue works correctly
5. **Monitor sync performance** - Track sync times and failures

## Common Mistakes

❌ **Don't**: Access service directly in components
```typescript
// Bad
dataSyncService.startMedicationSync(patientId, deviceId);
```

✅ **Do**: Use hooks
```typescript
// Good
useMedicationSync(patientId, deviceId);
```

❌ **Don't**: Forget to handle offline
```typescript
// Bad
<Text>Synced</Text>
```

✅ **Do**: Show offline status
```typescript
// Good
<SyncStatusIndicator />
```

❌ **Don't**: Start sync without cleanup
```typescript
// Bad
useEffect(() => {
  dataSyncService.startMedicationSync(patientId, deviceId);
}, []);
```

✅ **Do**: Use hooks with automatic cleanup
```typescript
// Good
useMedicationSync(patientId, deviceId);
```

## Support

For issues or questions:
1. Check console logs for `[DataSyncService]` messages
2. Check sync statistics via `dataSyncService.getSyncStatistics()`
3. Review this quick reference
4. Check full documentation in `TASK13_DATA_SYNC_IMPLEMENTATION.md`
