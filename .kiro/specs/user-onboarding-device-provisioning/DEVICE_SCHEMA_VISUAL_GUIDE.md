# Device Schema Visual Guide

## Device Document Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Device Document                           │
│                  devices/{deviceId}                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 IDENTIFICATION                                           │
│  ├─ id: string                    "DEVICE-001"              │
│  └─ primaryPatientId: string      "patient-123"             │
│                                                              │
│  🔧 PROVISIONING STATUS (NEW)                               │
│  ├─ provisioningStatus: enum      "active"                  │
│  │   Options: pending | active | inactive                   │
│  ├─ provisionedAt: timestamp      2024-01-15T10:30:00Z      │
│  └─ provisionedBy: string         "patient-123"             │
│                                                              │
│  📡 WIFI CONFIGURATION (NEW)                                │
│  ├─ wifiConfigured: boolean       true                      │
│  └─ wifiSSID: string              "HomeNetwork"             │
│                                                              │
│  ⚙️  DEVICE CONFIGURATION                                    │
│  ├─ desiredConfig: object                                   │
│  │   ├─ alarmMode: enum           "both"                    │
│  │   │   Options: sound | vibrate | both | silent          │
│  │   ├─ ledIntensity: number      75 (0-100)               │
│  │   ├─ ledColor: string          "#3B82F6"                │
│  │   └─ volume: number            75 (0-100)               │
│  └─ currentConfig: object         (reported by device)      │
│                                                              │
│  📊 METADATA                                                 │
│  ├─ firmwareVersion: string       "1.2.3"                   │
│  ├─ lastSeen: timestamp           2024-01-15T12:00:00Z      │
│  ├─ createdAt: timestamp          2024-01-15T10:00:00Z      │
│  └─ updatedAt: timestamp          2024-01-15T11:00:00Z      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Provisioning Status Lifecycle

```
┌──────────────┐
│   pending    │  Device registered but not yet provisioned
└──────┬───────┘
       │
       │ Patient completes provisioning wizard
       ↓
┌──────────────┐
│    active    │  Device fully provisioned and operational
└──────┬───────┘
       │
       │ Device deactivated or unlinked
       ↓
┌──────────────┐
│   inactive   │  Device no longer in use
└──────────────┘
```

## WiFi Configuration Flow

```
Step 1: Device Creation
┌─────────────────────────┐
│ wifiConfigured: false   │
│ wifiSSID: undefined     │
└───────────┬─────────────┘
            │
            │ User enters WiFi credentials
            ↓
Step 2: WiFi Configuration
┌─────────────────────────┐
│ wifiConfigured: true    │
│ wifiSSID: "HomeNetwork" │
└─────────────────────────┘
```

## Data Storage Locations

```
┌─────────────────────────────────────────────────────────────┐
│                      FIRESTORE                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  devices/{deviceId}                                          │
│  ├─ Provisioning metadata ✓                                 │
│  ├─ WiFi configuration status ✓                             │
│  ├─ Device configuration (desired) ✓                        │
│  └─ Timestamps and metadata ✓                               │
│                                                              │
│  deviceLinks/{deviceId}_{userId}                            │
│  └─ User-device relationships ✓                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   REALTIME DATABASE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  devices/{deviceId}/config                                   │
│  ├─ wifi_ssid: string                                       │
│  ├─ wifi_password: string (encrypted)                       │
│  ├─ alarm_mode: string                                      │
│  ├─ led_intensity: number                                   │
│  └─ led_color: string                                       │
│                                                              │
│  devices/{deviceId}/state                                    │
│  ├─ is_online: boolean                                      │
│  ├─ battery_level: number                                   │
│  ├─ wifi_connected: boolean                                 │
│  └─ current_status: string                                  │
│                                                              │
│  users/{userId}/devices/{deviceId}                          │
│  └─ true (device mapping)                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Field Usage by Component

```
┌─────────────────────────────────────────────────────────────┐
│                    VerificationStep                          │
├─────────────────────────────────────────────────────────────┤
│ Creates device document with:                                │
│ ✓ primaryPatientId                                           │
│ ✓ provisioningStatus: 'active'                              │
│ ✓ provisionedAt: serverTimestamp()                          │
│ ✓ provisionedBy: userId                                     │
│ ✓ wifiConfigured: false                                     │
│ ✓ desiredConfig: { ... }                                    │
│ ✓ createdAt, updatedAt                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    WiFiConfigStep                            │
├─────────────────────────────────────────────────────────────┤
│ Updates device document with:                                │
│ ✓ wifiConfigured: true                                      │
│ ✓ wifiSSID: "network-name"                                  │
│ ✓ updatedAt: serverTimestamp()                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   PreferencesStep                            │
├─────────────────────────────────────────────────────────────┤
│ Updates device configuration:                                │
│ ✓ desiredConfig.alarmMode                                   │
│ ✓ desiredConfig.ledIntensity                                │
│ ✓ desiredConfig.ledColor                                    │
│ ✓ desiredConfig.volume                                      │
└─────────────────────────────────────────────────────────────┘
```

## TypeScript Interface

```typescript
export interface Device {
  // Identification
  id: string;
  primaryPatientId: string;
  
  // Provisioning Status (NEW in Task 11)
  provisioningStatus: 'pending' | 'active' | 'inactive';
  provisionedAt?: Date | string;
  provisionedBy: string;
  
  // WiFi Configuration (NEW in Task 11)
  wifiConfigured: boolean;
  wifiSSID?: string;
  
  // Device Configuration
  desiredConfig: {
    alarmMode: 'sound' | 'vibrate' | 'both' | 'silent';
    ledIntensity: number;  // 0-100
    ledColor: string;      // Hex color
    volume: number;        // 0-100
  };
  currentConfig?: {
    alarmMode: 'sound' | 'vibrate' | 'both' | 'silent';
    ledIntensity: number;
    ledColor: string;
    volume: number;
  };
  
  // Metadata
  firmwareVersion?: string;
  lastSeen?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

## Example Usage

### Creating a Device (VerificationStep)

```typescript
const deviceRef = doc(db, 'devices', deviceId);

await setDoc(deviceRef, {
  primaryPatientId: userId,
  provisioningStatus: 'active',
  provisionedAt: serverTimestamp(),
  provisionedBy: userId,
  wifiConfigured: false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  desiredConfig: {
    alarmMode: 'both',
    ledIntensity: 75,
    ledColor: '#3B82F6',
    volume: 75,
  },
});
```

### Updating WiFi Configuration (WiFiConfigStep)

```typescript
const deviceDocRef = doc(db, 'devices', deviceId);

await updateDoc(deviceDocRef, {
  wifiConfigured: true,
  wifiSSID: wifiSSID.trim(),
  updatedAt: serverTimestamp(),
});
```

### Reading Device Status

```typescript
const deviceRef = doc(db, 'devices', deviceId);
const deviceDoc = await getDoc(deviceRef);

if (deviceDoc.exists()) {
  const device = deviceDoc.data() as Device;
  
  console.log('Provisioning Status:', device.provisioningStatus);
  console.log('WiFi Configured:', device.wifiConfigured);
  console.log('Provisioned By:', device.provisionedBy);
  console.log('Provisioned At:', device.provisionedAt);
}
```

## Security Rules

```javascript
match /devices/{deviceId} {
  // Only unclaimed devices can be provisioned
  allow create: if request.auth != null 
    && !exists(/databases/$(database)/documents/devices/$(deviceId))
    && request.resource.data.primaryPatientId == request.auth.uid
    && request.resource.data.provisioningStatus == 'active'
    && request.resource.data.provisionedBy == request.auth.uid;
  
  // Only device owner can update
  allow update: if request.auth != null 
    && resource.data.primaryPatientId == request.auth.uid;
  
  // Linked users can read
  allow read: if request.auth != null 
    && (resource.data.primaryPatientId == request.auth.uid
        || exists(/databases/$(database)/documents/deviceLinks/$(deviceId + '_' + request.auth.uid)));
}
```

## Query Examples

### Get All Active Devices for a Patient

```typescript
const devicesRef = collection(db, 'devices');
const q = query(
  devicesRef,
  where('primaryPatientId', '==', userId),
  where('provisioningStatus', '==', 'active')
);

const snapshot = await getDocs(q);
const devices = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
})) as Device[];
```

### Get Devices Needing WiFi Configuration

```typescript
const devicesRef = collection(db, 'devices');
const q = query(
  devicesRef,
  where('primaryPatientId', '==', userId),
  where('wifiConfigured', '==', false)
);

const snapshot = await getDocs(q);
const unconfiguredDevices = snapshot.docs.map(doc => doc.data()) as Device[];
```

### Get Recently Provisioned Devices

```typescript
const devicesRef = collection(db, 'devices');
const q = query(
  devicesRef,
  where('provisioningStatus', '==', 'active'),
  orderBy('provisionedAt', 'desc'),
  limit(10)
);

const snapshot = await getDocs(q);
const recentDevices = snapshot.docs.map(doc => doc.data()) as Device[];
```

## Migration Guide

### For Existing Devices

If you have existing device documents without the new provisioning fields, run this migration:

```typescript
async function migrateExistingDevices() {
  const devicesRef = collection(db, 'devices');
  const snapshot = await getDocs(devicesRef);
  
  for (const doc of snapshot.docs) {
    const device = doc.data();
    
    // Only migrate if fields are missing
    if (!device.provisioningStatus) {
      await updateDoc(doc.ref, {
        provisioningStatus: 'active',
        provisionedAt: device.createdAt || serverTimestamp(),
        provisionedBy: device.primaryPatientId,
        wifiConfigured: true, // Assume configured if device exists
        updatedAt: serverTimestamp(),
      });
      
      console.log(`Migrated device: ${doc.id}`);
    }
  }
}
```

## Best Practices

### ✅ DO
- Always set `provisioningStatus` when creating a device
- Update `updatedAt` timestamp on any device modification
- Set `wifiConfigured: false` initially, update to `true` after WiFi setup
- Store only SSID in Firestore, keep password in RTDB
- Use `serverTimestamp()` for consistent timestamps

### ❌ DON'T
- Don't create devices without `provisionedBy` field
- Don't store WiFi passwords in Firestore
- Don't modify `provisionedAt` after initial creation
- Don't change `primaryPatientId` after device is provisioned
- Don't skip validation of provisioning status transitions

## Troubleshooting

### Device Shows as Unconfigured
```typescript
// Check WiFi configuration status
const device = await getDevice(deviceId);
if (!device.wifiConfigured) {
  console.log('WiFi not configured');
  // Redirect to WiFi configuration step
}
```

### Device Provisioning Failed
```typescript
// Check provisioning status
const device = await getDevice(deviceId);
if (device.provisioningStatus === 'pending') {
  console.log('Provisioning incomplete');
  // Resume provisioning wizard
}
```

### Device Already Claimed
```typescript
// Verify device ownership
const device = await getDevice(deviceId);
if (device.primaryPatientId !== userId) {
  throw new Error('Device already claimed by another user');
}
```

---

**Related Documentation**:
- [Task 11 Completion Summary](./TASK11_COMPLETION_SUMMARY.md)
- [Device Provisioning Wizard](./TASK6_COMPLETION_SUMMARY.md)
- [WiFi Configuration Step](./TASK7.4_COMPLETION_SUMMARY.md)
- [Design Document](./design.md)
- [Requirements Document](./requirements.md)
