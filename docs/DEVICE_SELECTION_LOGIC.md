# Device Selection Logic

## Overview

When a patient has multiple devices linked to their account, the app needs to determine which device to display and monitor on the home screen. This document explains the device selection algorithm.

## Current Implementation

### Device ID Source

The device ID displayed in the `DeviceStatusCard` comes from:
1. **Firebase Realtime Database**: `users/${patientId}/devices`
2. **Local State**: `activeDeviceId` (stored in component state)
3. **Redux State**: `deviceSlice` (for real-time device state)

### Selection Algorithm

The app uses a smart selection algorithm with the following priority:

#### 1. Single Device (Simple Case)
```typescript
if (deviceIds.length === 1) {
  setActiveDeviceId(deviceIds[0]);
  dispatch(startDeviceListener(deviceIds[0]));
}
```
- If only one device is linked, use it
- No complex logic needed

#### 2. Multiple Devices (Priority-Based Selection)
```typescript
// Get state for all devices
const deviceStates = await Promise.all(
  deviceIds.map(async (id) => {
    const stateSnap = await rdbGet(ref(rdb, `devices/${id}/state`));
    const state = stateSnap.val() || {};
    return {
      id,
      isOnline: state.is_online || false,
      lastSeen: state.last_seen || 0,
    };
  })
);

// Sort by: 1) Online status, 2) Last seen timestamp
const sortedDevices = deviceStates.sort((a, b) => {
  if (a.isOnline && !b.isOnline) return -1;  // Online first
  if (!a.isOnline && b.isOnline) return 1;
  return b.lastSeen - a.lastSeen;            // Most recent first
});

const selectedDevice = sortedDevices[0].id;
```

**Priority Order**:
1. **Online devices** take precedence over offline devices
2. Among devices with the same online status, **most recently seen** wins
3. If all else is equal, the first device in the sorted list is selected

### Example Scenarios

#### Scenario 1: One Online, Two Offline
```
Device A: Online, last_seen: 1000
Device B: Offline, last_seen: 2000
Device C: Offline, last_seen: 3000

Selected: Device A (online takes priority)
```

#### Scenario 2: All Offline
```
Device A: Offline, last_seen: 1000
Device B: Offline, last_seen: 3000
Device C: Offline, last_seen: 2000

Selected: Device B (most recent last_seen)
```

#### Scenario 3: Multiple Online
```
Device A: Online, last_seen: 1000
Device B: Online, last_seen: 3000
Device C: Offline, last_seen: 5000

Selected: Device B (online + most recent)
```

## Device State Structure

### Firebase Realtime Database Structure

```
users/
  {patientId}/
    devices/
      DEVICE-001: true
      DEVICE-002: true
      DEVICE-003: true

devices/
  DEVICE-001/
    state/
      is_online: true
      last_seen: 1699564800000
      battery_level: 85
      current_status: "idle"
  DEVICE-002/
    state/
      is_online: false
      last_seen: 1699478400000
      battery_level: 45
      current_status: "offline"
```

### Redux State (deviceSlice)

```typescript
{
  deviceID: "DEVICE-001",
  listening: true,
  state: {
    is_online: true,
    battery_level: 85,
    current_status: "idle",
    last_seen: 1699564800000
  }
}
```

## Device Status Display

### DeviceStatusCard Props

```typescript
<DeviceStatusCard
  deviceId={deviceStatus.deviceId || undefined}  // "DEVICE-001" or undefined
  batteryLevel={deviceStatus.batteryLevel}       // 85 or null
  status={deviceStatus.status}                   // "idle" | "dispensing" | "error" | "offline"
  isOnline={deviceStatus.isOnline}               // true or false
/>
```

### Computed Device Status

```typescript
const deviceStatus = useMemo(() => {
  if (!deviceSlice?.state) {
    return {
      deviceId: activeDeviceId,      // From local state
      batteryLevel: null,
      status: 'offline' as const,
      isOnline: false,
    };
  }
  return {
    deviceId: activeDeviceId,        // From local state
    batteryLevel: deviceSlice.state.battery_level,  // From Redux
    status: deviceSlice.state.current_status || 'idle' as const,
    isOnline: deviceSlice.state.is_online || false,
  };
}, [deviceSlice, activeDeviceId]);
```

## Limitations and Future Improvements

### Current Limitations

1. **No Manual Selection**: User cannot manually choose which device to display
2. **No Device Switching**: Once selected, device doesn't change unless component remounts
3. **No Multi-Device View**: Can only view one device at a time
4. **No Device Naming**: Devices identified by ID only (e.g., "DEVICE-001")

### Proposed Improvements

#### 1. Manual Device Selection
Add a device picker dropdown:
```typescript
<Select
  value={activeDeviceId}
  onChange={handleDeviceChange}
  options={linkedDevices.map(id => ({ label: id, value: id }))}
/>
```

#### 2. Device Nicknames
Allow users to name their devices:
```typescript
// Firestore: devices/{deviceId}
{
  id: "DEVICE-001",
  nickname: "Bedroom Pillbox",
  linkedAt: Timestamp,
  linkedBy: "userId"
}
```

Display as:
```
Device: Bedroom Pillbox (DEVICE-001)
```

#### 3. Multi-Device Dashboard
Show all devices in a grid or list:
```typescript
<View style={styles.devicesGrid}>
  {linkedDevices.map(device => (
    <DeviceStatusCard
      key={device.id}
      deviceId={device.id}
      nickname={device.nickname}
      {...device.status}
    />
  ))}
</View>
```

#### 4. Smart Notifications
Notify user when:
- A device comes online
- A device goes offline
- Battery is low
- Device switches automatically

#### 5. Device History
Track which device was active when:
```typescript
// Firestore: users/{userId}/deviceHistory
{
  timestamp: Timestamp,
  deviceId: "DEVICE-001",
  action: "selected" | "auto-switched" | "manual-switch"
}
```

#### 6. Persistent Selection
Remember user's last selected device:
```typescript
// AsyncStorage
await AsyncStorage.setItem(
  `lastActiveDevice_${userId}`,
  deviceId
);

// On app start, restore last selection
const lastDevice = await AsyncStorage.getItem(
  `lastActiveDevice_${userId}`
);
```

## Error Handling

### No Devices Linked
```typescript
if (deviceIds.length === 0) {
  setActiveDeviceId(null);
  // DeviceStatusCard shows "No hay dispositivo vinculado"
}
```

### Device State Unavailable
```typescript
try {
  const stateSnap = await rdbGet(ref(rdb, `devices/${id}/state`));
  const state = stateSnap.val() || {};
  return { id, isOnline: state.is_online || false, lastSeen: state.last_seen || 0 };
} catch {
  return { id, isOnline: false, lastSeen: 0 };  // Fallback to offline
}
```

### Firebase Connection Issues
```typescript
try {
  const rdb = await getRdbInstance();
  if (!rdb) return;  // Gracefully handle unavailable database
  // ... rest of logic
} catch (error) {
  console.error('Error initializing device:', error);
  // Component continues to work with null deviceId
}
```

## Testing

### Test Cases

1. **Single Device**
   - ✅ Device ID displayed correctly
   - ✅ Device state updates in real-time
   - ✅ Battery level shown

2. **Multiple Devices - One Online**
   - ✅ Online device selected
   - ✅ Offline devices ignored
   - ✅ Correct device state displayed

3. **Multiple Devices - All Offline**
   - ✅ Most recent device selected
   - ✅ Last seen timestamp used for sorting
   - ✅ Offline status shown

4. **No Devices**
   - ✅ Null device ID handled gracefully
   - ✅ "No device linked" message shown
   - ✅ No errors thrown

5. **Device State Changes**
   - ✅ Device goes offline → Status updates
   - ✅ Device comes online → Status updates
   - ✅ Battery level changes → Display updates

### Manual Testing Steps

1. Link a single device → Verify it's displayed
2. Link a second device → Verify correct one is selected
3. Take first device offline → Verify switch to second device
4. Bring first device back online → Verify it's selected again
5. Unlink all devices → Verify "no device" state

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Device status computed with `useMemo`
2. **Single Listener**: Only one device listener active at a time
3. **Cleanup**: Listener stopped when component unmounts
4. **Error Boundaries**: Graceful degradation on errors

### Potential Issues

1. **Multiple API Calls**: Fetching state for all devices can be slow
   - **Solution**: Cache device states, use batch requests
   
2. **Frequent Re-renders**: Device state changes trigger re-renders
   - **Solution**: Debounce state updates, use React.memo
   
3. **Memory Leaks**: Listener not cleaned up properly
   - **Solution**: Proper cleanup in useEffect return function

## Related Files

- `app/patient/home.tsx` - Device selection logic
- `src/components/screens/patient/DeviceStatusCard.tsx` - Device display
- `src/store/slices/deviceSlice.ts` - Device state management
- `src/services/deviceLinking.ts` - Device linking operations
- `app/patient/link-device.tsx` - Device management screen

## Summary

The device selection logic prioritizes **online devices** and **recent activity** to ensure the most relevant device is displayed to the user. The system is designed to work seamlessly with single or multiple devices, with graceful fallbacks for error cases.

Future improvements should focus on giving users more control over device selection while maintaining the smart automatic selection as a default behavior.
