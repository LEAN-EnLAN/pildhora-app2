# Patient App Modes

## Overview

The Pildhora patient app operates in two distinct modes based on device connectivity. The mode automatically switches based on whether a Pillbox device is connected and online.

## Modes

### 1. Autonomous Mode (Device NOT Connected)

**When Active**: Device is not connected or offline (`deviceStatus.isOnline === false`)

**Features Available**:
- ✅ Manual medication management (CRUD operations)
- ✅ Manual "Take Medication" button for upcoming doses
- ✅ Full control over medication schedule
- ✅ Quick access to Medications section
- ✅ View medication history
- ✅ Device linking/configuration

**User Experience**:
- Patient has full autonomy over their medication management
- Can manually mark doses as taken
- Can add, edit, or remove medications
- Responsible for their own adherence tracking

**UI Indicators**:
- Device Status Card shows "Desconectado" (Offline)
- "Take Medication" button visible on upcoming dose card
- "Medicamentos" quick action card visible
- No mode indicator banner

### 2. Caregiving Mode (Device IS Connected)

**When Active**: Device is connected and online (`deviceStatus.isOnline === true`)

**Features Available**:
- ✅ View medication schedule (read-only)
- ✅ View adherence statistics
- ✅ View medication history
- ✅ Device status monitoring
- ✅ Device configuration
- ❌ Manual medication management (disabled)
- ❌ Manual "Take Medication" button (disabled)

**User Experience**:
- Caregiver manages medications remotely
- Device automatically dispenses medications
- Patient can view but not modify medication schedule
- Supervised medication adherence
- Enhanced safety and monitoring

**UI Indicators**:
- Device Status Card shows "Activo" (Active) with battery level
- Upcoming dose card shows "Automático" badge
- Green mode indicator: "Modo supervisado: Tu cuidador gestiona tus medicamentos"
- "Medicamentos" quick action card hidden
- No manual "Take Medication" button

## Mode Detection Logic

```typescript
// Device status is computed from Redux state
const deviceStatus = useMemo(() => {
  if (!deviceSlice?.state) {
    return {
      deviceId: activeDeviceId,
      batteryLevel: null,
      status: 'offline' as const,
      isOnline: false, // Autonomous Mode
    };
  }
  return {
    deviceId: activeDeviceId,
    batteryLevel: deviceSlice.state.battery_level,
    status: deviceSlice.state.current_status || 'idle' as const,
    isOnline: deviceSlice.state.is_online || false, // Caregiving Mode if true
  };
}, [deviceSlice, activeDeviceId]);
```

## UI Components by Mode

### Adherence Card
- **Autonomous Mode**: Shows manual tracking progress
- **Caregiving Mode**: Shows device-tracked progress

### Upcoming Dose Card
- **Autonomous Mode**: 
  - Shows `UpcomingDoseCard` component
  - Includes "Tomar Medicación" button
  - Patient can manually mark as taken
  
- **Caregiving Mode**:
  - Shows custom card with "Automático" badge
  - No action button
  - Indicates device will dispense automatically

### Device Status Card
- **Autonomous Mode**:
  - Shows "No hay dispositivo vinculado" if no device
  - Shows "Desconectado" if device exists but offline
  
- **Caregiving Mode**:
  - Shows battery level
  - Shows device status (Activo, Dispensando, Error)
  - Shows device ID

### Quick Actions
- **Autonomous Mode**:
  - Historial (always visible)
  - Medicamentos (visible)
  - Dispositivo (always visible)
  
- **Caregiving Mode**:
  - Historial (always visible)
  - Medicamentos (hidden)
  - Dispositivo (always visible)

### Medications List
- **Autonomous Mode**:
  - Full list with edit capabilities
  - Can tap to view/edit details
  
- **Caregiving Mode**:
  - Read-only list
  - Can tap to view details only
  - No edit/delete options

## Mode Transition

### From Autonomous to Caregiving
1. Patient or caregiver links a device
2. Device comes online and connects to Firebase
3. `deviceStatus.isOnline` becomes `true`
4. UI automatically updates:
   - "Take Medication" button disappears
   - "Medicamentos" quick action hides
   - Mode indicator appears
   - Upcoming dose shows "Automático" badge

### From Caregiving to Autonomous
1. Device goes offline or is unlinked
2. `deviceStatus.isOnline` becomes `false`
3. UI automatically updates:
   - "Take Medication" button appears
   - "Medicamentos" quick action shows
   - Mode indicator disappears
   - Upcoming dose shows action button

## Benefits

### Autonomous Mode Benefits
- **Independence**: Patient maintains full control
- **Flexibility**: Can adjust schedule as needed
- **Simplicity**: No device setup required
- **Privacy**: No external monitoring

### Caregiving Mode Benefits
- **Safety**: Automated dispensing reduces errors
- **Monitoring**: Caregiver can track adherence remotely
- **Reliability**: Device ensures timely medication
- **Peace of Mind**: Family members can monitor elderly patients

## Technical Implementation

### Key Files
- `app/patient/home.tsx` - Main screen with mode logic
- `src/components/screens/patient/UpcomingDoseCard.tsx` - Manual mode card
- `src/components/screens/patient/DeviceStatusCard.tsx` - Device status display
- `src/store/slices/deviceSlice.ts` - Device state management

### State Management
- Device state stored in Redux (`deviceSlice`)
- Real-time updates from Firebase Realtime Database
- Automatic mode switching based on device connectivity

### Firebase Integration
- **Firestore**: Stores device configuration and medication data
- **Realtime Database**: Tracks device state and connectivity
- **Cloud Functions**: Syncs device state between Firestore and RTDB

## User Communication

### Mode Indicator Message
When in Caregiving Mode, a subtle green banner appears below the Device Status Card:

```
🛡️ Modo supervisado: Tu cuidador gestiona tus medicamentos
```

This message:
- Uses a shield icon to indicate protection/supervision
- Uses green color to indicate positive/safe state
- Clearly explains the current mode
- Doesn't alarm the user
- Provides context for disabled features

### No Message in Autonomous Mode
When in Autonomous Mode, no banner appears because:
- This is the default/expected state
- Patient has full control (no need to explain)
- Cleaner UI without unnecessary information

## Future Enhancements

### Potential Improvements
1. **Mode Toggle**: Allow patient to temporarily switch modes
2. **Notifications**: Alert when mode changes
3. **History**: Track mode changes over time
4. **Permissions**: Fine-grained control over what caregiver can manage
5. **Emergency Override**: Patient can override device in emergencies

### Analytics
Track mode usage to understand:
- Percentage of users in each mode
- Mode switch frequency
- Feature usage by mode
- User satisfaction by mode

## Accessibility

Both modes maintain full accessibility:
- Screen reader support for mode indicators
- Clear labels for all interactive elements
- Proper ARIA roles and hints
- Touch targets meet minimum size requirements

## Testing

### Test Cases
1. ✅ Device connects → Mode switches to Caregiving
2. ✅ Device disconnects → Mode switches to Autonomous
3. ✅ Quick actions update based on mode
4. ✅ Upcoming dose card changes based on mode
5. ✅ Mode indicator appears/disappears correctly
6. ✅ Medication list permissions change by mode

### Manual Testing
- Test with real device connection
- Test with simulated offline state
- Test mode transitions
- Verify UI updates correctly
- Check accessibility in both modes

