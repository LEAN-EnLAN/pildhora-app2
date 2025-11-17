# Design Document

## Overview

This design document outlines the architecture and implementation approach for the user onboarding and device provisioning system. The system connects existing backend services (authentication, device linking, device configuration) with new onboarding flows to create a seamless experience for both patients and caregivers.

The design leverages the existing "Digital Shadow" paradigm where Firebase Realtime Database (RTDB) serves as the single source of truth for device state, while Firestore handles metadata, user profiles, and device links.

## Architecture

### High-Level System Flow

```
┌─────────────────┐
│  Welcome Screen │
│   (app/index)   │
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Patient       │  │  Caregiver     │  │  Existing      │
│  Signup        │  │  Signup        │  │  User Login    │
└────────┬───────┘  └────────┬───────┘  └────────┬───────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Device        │  │  Device        │  │  Role-Based    │
│  Provisioning  │  │  Connection    │  │  Routing       │
│  Wizard        │  │  Interface     │  │                │
└────────┬───────┘  └────────┬───────┘  └────────┬───────┘
         │                   │                   │
         └───────────────────┴───────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Home/Dashboard│
                    │  (Role-Based)  │
                    └────────────────┘
```

### Component Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend Layer                         │
├──────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Welcome   │  │  Auth      │  │  Wizard    │         │
│  │  Screen    │  │  Screens   │  │  Screens   │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└──────────────────────────────────────────────────────────┘
                          │
┌──────────────────────────────────────────────────────────┐
│                   State Management                        │
├──────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Auth      │  │  Device    │  │  Onboarding│         │
│  │  Slice     │  │  Slice     │  │  Slice     │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└──────────────────────────────────────────────────────────┘
                          │
┌──────────────────────────────────────────────────────────┐
│                    Service Layer                          │
├──────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Auth      │  │  Device    │  │  Device    │         │
│  │  Service   │  │  Linking   │  │  Config    │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│  ┌────────────┐  ┌────────────┐                         │
│  │  Onboarding│  │  Connection│                         │
│  │  Service   │  │  Code Svc  │                         │
│  └────────────┘  └────────────┘                         │
└──────────────────────────────────────────────────────────┘
                          │
┌──────────────────────────────────────────────────────────┐
│                   Backend Services                        │
├──────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Firebase  │  │  Firestore │  │  RTDB      │         │
│  │  Auth      │  │            │  │            │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│  ┌────────────┐                                          │
│  │  Cloud     │                                          │
│  │  Functions │                                          │
│  └────────────┘                                          │
└──────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Authentication Flow Enhancement

#### Current State
- Basic signup/login screens exist
- Auth slice handles Firebase authentication
- User documents created in Firestore with role

#### Enhancements Needed
- Add onboarding status tracking to user documents
- Implement post-authentication routing logic
- Add device provisioning status checks

#### User Document Schema (Enhanced)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'caregiver';
  createdAt: Date;
  
  // New onboarding fields
  onboardingComplete: boolean;
  onboardingStep?: 'device_provisioning' | 'device_connection' | 'complete';
  deviceId?: string;  // For patients only
  
  // Existing fields
  adherence?: number;
  lastTaken?: Date;
}
```

### 2. Device Provisioning Wizard (Patients)

#### Purpose
Guide new patients through device setup with a multi-step wizard interface.

#### Wizard Steps

**Step 1: Welcome & Instructions**
- Explain the device provisioning process
- Show visual guide for locating device ID
- Provide troubleshooting tips

**Step 2: Device ID Entry**
- Input field for device unique identifier
- Real-time validation
- Check if device is already claimed
- Format validation (alphanumeric, 5-100 chars)

**Step 3: Device Verification**
- Verify device exists and is unclaimed
- Create device document in Firestore
- Link device to patient account
- Initialize device configuration

**Step 4: WiFi Configuration**
- Guide patient through WiFi setup
- Provide QR code or manual entry options
- Test device connectivity

**Step 5: Preferences Setup**
- Configure alarm mode (sound/vibrate/both/silent)
- Set LED intensity and color
- Configure volume settings
- Test device with sample alarm

**Step 6: Completion**
- Confirm successful setup
- Show next steps
- Redirect to patient home

#### Component Structure

```typescript
interface DeviceProvisioningWizardProps {
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  component: React.ComponentType<StepProps>;
  validate?: () => Promise<boolean>;
  onNext?: () => Promise<void>;
}

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  wizardData: WizardData;
  updateWizardData: (data: Partial<WizardData>) => void;
}

interface WizardData {
  deviceId: string;
  wifiSSID?: string;
  wifiPassword?: string;
  alarmMode: 'sound' | 'vibrate' | 'both' | 'silent';
  ledIntensity: number;
  ledColor: string;
  volume: number;
}
```

### 3. Device Connection Interface (Caregivers)

#### Purpose
Allow caregivers to connect to patient devices using connection codes.

#### Connection Flow

**Step 1: Connection Code Entry**
- Input field for 6-8 digit code
- Real-time validation
- Code expiration handling

**Step 2: Patient Information Display**
- Show patient name (if available)
- Display device information
- Confirm connection request

**Step 3: Connection Establishment**
- Create deviceLink document
- Update RTDB user/device mappings
- Send notifications to patient

**Step 4: Success Confirmation**
- Show successful connection
- Display patient dashboard preview
- Redirect to caregiver dashboard

#### Component Structure

```typescript
interface DeviceConnectionInterfaceProps {
  caregiverId: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface ConnectionCodeData {
  code: string;
  deviceId: string;
  patientId: string;
  patientName: string;
  expiresAt: Date;
  used: boolean;
}
```

### 4. Connection Code Service

#### Purpose
Generate and validate time-limited connection codes for caregiver linking.

#### Service Interface

```typescript
interface ConnectionCodeService {
  // Generate a new connection code for a patient's device
  generateCode(patientId: string, deviceId: string, expiresInHours?: number): Promise<string>;
  
  // Validate and retrieve connection code data
  validateCode(code: string): Promise<ConnectionCodeData | null>;
  
  // Mark code as used and create device link
  useCode(code: string, caregiverId: string): Promise<void>;
  
  // Revoke/invalidate a code
  revokeCode(code: string): Promise<void>;
  
  // Get active codes for a patient
  getActiveCodes(patientId: string): Promise<ConnectionCodeData[]>;
}
```

#### Firestore Schema

```typescript
// Collection: connectionCodes
interface ConnectionCode {
  id: string;  // The code itself (6-8 alphanumeric)
  deviceId: string;
  patientId: string;
  patientName: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  used: boolean;
  usedBy?: string;  // Caregiver ID
  usedAt?: Timestamp;
}
```

### 5. Onboarding Service

#### Purpose
Centralize onboarding logic and state management.

#### Service Interface

```typescript
interface OnboardingService {
  // Check if user needs onboarding
  needsOnboarding(userId: string, role: 'patient' | 'caregiver'): Promise<boolean>;
  
  // Get current onboarding step
  getOnboardingStep(userId: string): Promise<string | null>;
  
  // Update onboarding progress
  updateOnboardingStep(userId: string, step: string): Promise<void>;
  
  // Mark onboarding as complete
  completeOnboarding(userId: string): Promise<void>;
  
  // For patients: provision device
  provisionDevice(userId: string, deviceId: string, config: DeviceConfig): Promise<void>;
  
  // For caregivers: connect to device
  connectToDevice(caregiverId: string, connectionCode: string): Promise<void>;
}
```

### 6. Routing Logic Enhancement

#### Current Routing
- Welcome screen → Signup/Login → Home (based on role)

#### Enhanced Routing
- Welcome screen → Signup/Login → Onboarding Check → Wizard/Dashboard

#### Implementation

```typescript
interface RoutingService {
  // Determine where to route user after authentication
  getPostAuthRoute(user: User): Promise<string>;
  
  // Check if user has completed required setup
  hasCompletedSetup(user: User): Promise<boolean>;
}

// Example routing logic
async function getPostAuthRoute(user: User): Promise<string> {
  if (!user.onboardingComplete) {
    if (user.role === 'patient') {
      if (!user.deviceId) {
        return '/patient/device-provisioning';
      }
    } else if (user.role === 'caregiver') {
      const hasDeviceLinks = await checkDeviceLinks(user.id);
      if (!hasDeviceLinks) {
        return '/caregiver/device-connection';
      }
    }
  }
  
  // User has completed setup
  return user.role === 'patient' 
    ? '/patient/home' 
    : '/caregiver/dashboard';
}
```

## Data Models

### Device Document (Enhanced)

```typescript
interface Device {
  id: string;
  primaryPatientId: string;
  
  // Configuration
  desiredConfig: DeviceConfig;
  currentConfig?: DeviceConfig;
  
  // Provisioning status
  provisioningStatus: 'pending' | 'active' | 'inactive';
  provisionedAt?: Timestamp;
  provisionedBy: string;  // Patient user ID
  
  // WiFi configuration
  wifiConfigured: boolean;
  wifiSSID?: string;
  
  // Metadata
  firmwareVersion?: string;
  lastSeen?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface DeviceConfig {
  alarmMode: 'sound' | 'vibrate' | 'both' | 'silent';
  ledIntensity: number;  // 0-100
  ledColor: string;      // Hex color
  volume: number;        // 0-100
}
```

### DeviceLink Document (Existing)

```typescript
interface DeviceLink {
  id: string;  // Format: {deviceId}_{userId}
  deviceId: string;
  userId: string;
  role: 'patient' | 'caregiver';
  status: 'active' | 'inactive';
  linkedAt: Timestamp;
  linkedBy: string;
  unlinkedAt?: Timestamp;
}
```

### RTDB Structure (Enhanced)

```
/devices/{deviceId}/
  config/                    # Desired state (written by app)
    alarm_mode: string
    led_intensity: number
    led_color: string
    volume: number
    wifi_ssid: string        # NEW: WiFi configuration
    wifi_password: string    # NEW: Encrypted
  
  state/                     # Reported state (written by hardware)
    is_online: boolean
    battery_level: number
    current_status: string
    last_seen: number
    time_synced: boolean
    wifi_connected: boolean  # NEW: WiFi status
    provisioning_complete: boolean  # NEW: Setup status

/users/{userId}/
  devices/
    {deviceId}: boolean      # Device links
  
  profile/                   # User profile data
    name: string
    role: string
    onboarding_complete: boolean  # NEW
```

## Error Handling

### Device Provisioning Errors

```typescript
enum DeviceProvisioningError {
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  DEVICE_ALREADY_CLAIMED = 'DEVICE_ALREADY_CLAIMED',
  INVALID_DEVICE_ID = 'INVALID_DEVICE_ID',
  WIFI_CONFIG_FAILED = 'WIFI_CONFIG_FAILED',
  DEVICE_OFFLINE = 'DEVICE_OFFLINE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

interface ProvisioningErrorHandler {
  handle(error: DeviceProvisioningError): {
    userMessage: string;
    retryable: boolean;
    suggestedAction: string;
  };
}
```

### Connection Code Errors

```typescript
enum ConnectionCodeError {
  CODE_NOT_FOUND = 'CODE_NOT_FOUND',
  CODE_EXPIRED = 'CODE_EXPIRED',
  CODE_ALREADY_USED = 'CODE_ALREADY_USED',
  INVALID_CODE_FORMAT = 'INVALID_CODE_FORMAT',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
}

interface ConnectionErrorHandler {
  handle(error: ConnectionCodeError): {
    userMessage: string;
    retryable: boolean;
    suggestedAction: string;
  };
}
```

### Error Recovery Strategies

1. **Network Errors**: Retry with exponential backoff
2. **Validation Errors**: Show inline error messages with correction hints
3. **Permission Errors**: Guide user to check settings or contact support
4. **Device Offline**: Provide troubleshooting steps and retry option
5. **Code Expired**: Prompt patient to generate new code

## Testing Strategy

### Unit Tests

1. **Service Layer**
   - OnboardingService methods
   - ConnectionCodeService validation
   - Device provisioning logic
   - Error handling

2. **State Management**
   - Onboarding slice reducers
   - Async thunk actions
   - State transitions

3. **Utilities**
   - Device ID validation
   - Code generation
   - Routing logic

### Integration Tests

1. **Authentication Flow**
   - Signup → Onboarding check → Wizard
   - Login → Route to appropriate screen
   - Role-based routing

2. **Device Provisioning**
   - Complete wizard flow
   - Device validation
   - Configuration sync

3. **Device Connection**
   - Code generation
   - Code validation
   - Link creation

### End-to-End Tests

1. **Patient Onboarding**
   - Create account → Provision device → Access home

2. **Caregiver Onboarding**
   - Create account → Connect to device → Access dashboard

3. **Multi-Caregiver Scenario**
   - Multiple caregivers connect to same patient

4. **Error Scenarios**
   - Invalid device ID
   - Expired connection code
   - Network failures

## Security Considerations

### Device Provisioning Security

1. **Device Ownership Validation**
   - Verify device is unclaimed before provisioning
   - Prevent device hijacking
   - Audit device ownership changes

2. **WiFi Credentials**
   - Encrypt WiFi passwords before storing
   - Use secure transmission to device
   - Never log or expose credentials

3. **Device Access Control**
   - Only device owner can modify configuration
   - Caregivers have read-only access to device state
   - Enforce security rules in Firestore and RTDB

### Connection Code Security

1. **Code Generation**
   - Use cryptographically secure random generation
   - Minimum 6 characters, alphanumeric
   - Avoid ambiguous characters (0/O, 1/I)

2. **Code Expiration**
   - Default 24-hour expiration
   - Configurable by patient
   - Automatic cleanup of expired codes

3. **Code Usage**
   - Single-use codes
   - Mark as used immediately
   - Prevent replay attacks

4. **Rate Limiting**
   - Limit code generation (max 5 per hour)
   - Limit validation attempts (max 10 per minute)
   - Prevent brute force attacks

### Firestore Security Rules

```javascript
// Device provisioning rules
match /devices/{deviceId} {
  // Only unclaimed devices can be provisioned
  allow create: if request.auth != null 
    && !exists(/databases/$(database)/documents/devices/$(deviceId))
    && request.resource.data.primaryPatientId == request.auth.uid;
  
  // Only device owner can update
  allow update: if request.auth != null 
    && resource.data.primaryPatientId == request.auth.uid;
  
  // Linked users can read
  allow read: if request.auth != null 
    && (resource.data.primaryPatientId == request.auth.uid
        || exists(/databases/$(database)/documents/deviceLinks/$(deviceId + '_' + request.auth.uid)));
}

// Connection code rules
match /connectionCodes/{code} {
  // Only patients can create codes for their devices
  allow create: if request.auth != null
    && request.resource.data.patientId == request.auth.uid;
  
  // Anyone authenticated can read to validate
  allow read: if request.auth != null;
  
  // Only the patient who created it can delete
  allow delete: if request.auth != null
    && resource.data.patientId == request.auth.uid;
  
  // Code can be marked as used by any authenticated user
  allow update: if request.auth != null
    && !resource.data.used
    && request.resource.data.used == true
    && request.resource.data.usedBy == request.auth.uid;
}
```

## Performance Optimization

### Onboarding Flow

1. **Lazy Loading**
   - Load wizard steps on demand
   - Preload next step while user completes current

2. **Caching**
   - Cache device validation results
   - Store wizard progress locally
   - Resume from last completed step

3. **Optimistic Updates**
   - Update UI immediately
   - Sync to backend asynchronously
   - Handle conflicts gracefully

### Device Provisioning

1. **Parallel Operations**
   - Validate device ID while user reads instructions
   - Configure Firestore and RTDB simultaneously
   - Batch related updates

2. **Progress Indicators**
   - Show clear progress through wizard
   - Provide estimated time for each step
   - Display real-time sync status

### Connection Code Validation

1. **Client-Side Validation**
   - Check format before server call
   - Validate expiration locally
   - Reduce unnecessary network requests

2. **Code Lookup Optimization**
   - Index codes by expiration date
   - Clean up expired codes automatically
   - Use efficient query patterns

## Accessibility

### Wizard Navigation

1. **Keyboard Navigation**
   - Tab through form fields
   - Enter to proceed, Escape to cancel
   - Arrow keys for step navigation

2. **Screen Reader Support**
   - Announce current step
   - Describe progress
   - Read error messages clearly

3. **Visual Indicators**
   - High contrast colors
   - Large touch targets (min 44x44)
   - Clear focus states

### Error Messages

1. **Clear Language**
   - Avoid technical jargon
   - Provide actionable guidance
   - Offer help resources

2. **Visual Feedback**
   - Color + icon + text
   - Persistent error display
   - Success confirmations

## Internationalization

### Supported Languages

- Spanish (primary)
- English (secondary)

### Translatable Content

1. **Wizard Steps**
   - Step titles and descriptions
   - Button labels
   - Help text

2. **Error Messages**
   - All error messages
   - Validation feedback
   - Success messages

3. **Instructions**
   - Setup guides
   - Troubleshooting tips
   - Help documentation

## Migration Strategy

### Existing Users

1. **Detect Incomplete Onboarding**
   - Check for missing deviceId (patients)
   - Check for no device links (caregivers)
   - Prompt to complete setup

2. **Graceful Degradation**
   - Allow access to existing features
   - Show onboarding prompt
   - Don't block critical functionality

3. **Data Migration**
   - Add onboardingComplete field to existing users
   - Set to true for users with devices
   - Set to false for users without devices

### New Users

1. **Mandatory Onboarding**
   - Block access until setup complete
   - Clear progress indicators
   - Allow cancellation with warning

## Monitoring and Analytics

### Key Metrics

1. **Onboarding Completion Rate**
   - Track wizard abandonment by step
   - Measure time to complete
   - Identify problem areas

2. **Device Provisioning Success**
   - Track provisioning attempts
   - Measure success rate
   - Monitor error types

3. **Connection Code Usage**
   - Track code generation
   - Monitor validation attempts
   - Measure connection success rate

### Error Tracking

1. **Provisioning Errors**
   - Log error types and frequency
   - Track user actions before error
   - Monitor resolution success

2. **Connection Errors**
   - Track code validation failures
   - Monitor expired code usage
   - Identify UX issues

## Future Enhancements

### Phase 2 Features

1. **QR Code Provisioning**
   - Scan device QR code for instant setup
   - Reduce manual entry errors
   - Faster onboarding

2. **Bluetooth Setup**
   - Configure WiFi via Bluetooth
   - Eliminate manual WiFi entry
   - Improve user experience

3. **Multi-Device Support**
   - Allow patients to have multiple devices
   - Manage device switching
   - Sync across devices

4. **Advanced Connection Options**
   - Email invitations
   - SMS invitations
   - NFC pairing

### Phase 3 Features

1. **Onboarding Personalization**
   - Customize wizard based on user type
   - Skip unnecessary steps
   - Adaptive help content

2. **Video Tutorials**
   - Embedded setup videos
   - Interactive guides
   - Troubleshooting videos

3. **Remote Support**
   - Live chat during setup
   - Screen sharing for troubleshooting
   - Expert assistance

## Implementation Phases

### Phase 1: Core Onboarding (Week 1-2)
- Enhance user document schema
- Implement routing logic
- Create onboarding service
- Add onboarding status checks

### Phase 2: Device Provisioning Wizard (Week 3-4)
- Build wizard component structure
- Implement device validation
- Create configuration steps
- Add WiFi setup flow

### Phase 3: Connection Code System (Week 5-6)
- Implement code generation service
- Build code validation logic
- Create connection interface
- Add security rules

### Phase 4: Integration & Testing (Week 7-8)
- Integrate all components
- End-to-end testing
- Security audit
- Performance optimization

### Phase 5: Polish & Launch (Week 9-10)
- UI/UX refinements
- Error handling improvements
- Documentation
- Deployment

## Dependencies

### Existing Services
- Firebase Auth (authentication)
- Firestore (metadata storage)
- RTDB (device state)
- deviceLinking service
- deviceConfig service

### New Services
- onboardingService
- connectionCodeService
- routingService

### UI Components
- Wizard container
- Step components
- Progress indicators
- Error displays

### State Management
- onboardingSlice (new)
- Enhanced authSlice
- deviceSlice (new)

## Conclusion

This design provides a comprehensive approach to user onboarding and device provisioning that:

1. **Leverages Existing Infrastructure**: Uses current Firebase setup and services
2. **Maintains Security**: Implements proper access controls and validation
3. **Ensures Scalability**: Designed to handle multiple users and devices
4. **Provides Great UX**: Clear, guided flows with helpful feedback
5. **Enables Future Growth**: Architected for easy enhancement and expansion

The implementation will connect all existing backend pieces while adding the necessary onboarding flows to create a complete, production-ready system.
