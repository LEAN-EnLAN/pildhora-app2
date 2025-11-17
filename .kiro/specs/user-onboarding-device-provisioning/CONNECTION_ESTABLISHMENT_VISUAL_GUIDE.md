# Connection Establishment Visual Guide (Task 9.3)

## Overview

This guide provides a visual representation of the connection establishment process when a caregiver uses a connection code to link to a patient's device.

**Requirements:** 5.4, 5.5, 5.6

---

## Connection Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    CAREGIVER CONNECTION FLOW                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  Caregiver   │
│  Confirms    │
│  Connection  │
└──────┬───────┘
       │
       │ Clicks "Conectar"
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  handleConnect() in device-connection-confirm.tsx                │
│                                                                  │
│  1. Validates user authentication                                │
│  2. Calls useCode(code, caregiverId)                            │
│  3. Calls completeOnboarding(caregiverId)                       │
│  4. Shows success screen                                         │
└──────┬───────────────────────────────────────────────────────────┘
       │
       │ useCode()
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  connectionCode.useCode() in src/services/connectionCode.ts      │
│                                                                  │
│  1. Validates code format                                        │
│  2. Validates caregiver ID                                       │
│  3. Validates authentication                                     │
│  4. Calls validateCode() to check code status                   │
│  5. Marks code as used in Firestore                             │
│  6. Calls linkDeviceToUser()                                    │
└──────┬───────────────────────────────────────────────────────────┘
       │
       │ linkDeviceToUser()
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  deviceLinking.linkDeviceToUser() in src/services/deviceLinking.ts│
│                                                                  │
│  1. Validates device ID and user ID                             │
│  2. Validates authentication                                     │
│  3. Gets user role from Firestore                               │
│  4. Creates deviceLink document in Firestore                    │
│  5. Updates RTDB users/{caregiverId}/devices/{deviceId}        │
└──────┬───────────────────────────────────────────────────────────┘
       │
       │ Firestore write triggers Cloud Function
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  onDeviceLinkCreated() in functions/src/index.ts                 │
│                                                                  │
│  1. Detects new deviceLink creation                             │
│  2. Gets user role (caregiver)                                  │
│  3. Updates device.linkedUsers map                              │
│  4. Mirrors to RTDB                                             │
│  5. Gets patient ID from device                                 │
│  6. Creates notification document for patient                   │
│  7. Sends FCM push notification (if tokens available)           │
└──────┬───────────────────────────────────────────────────────────┘
       │
       │ Notification sent
       │
       ▼
┌──────────────┐
│   Patient    │
│  Receives    │
│ Notification │
└──────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         DATA FLOW                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

1. CONNECTION CODE VALIDATION
   ┌─────────────────────────────────────┐
   │  Firestore: connectionCodes/{code}  │
   │                                     │
   │  {                                  │
   │    id: "ABC123",                    │
   │    deviceId: "DEVICE-001",          │
   │    patientId: "patient-123",        │
   │    patientName: "John Doe",         │
   │    used: false,                     │
   │    expiresAt: Timestamp             │
   │  }                                  │
   └─────────────────────────────────────┘
                    │
                    │ validateCode()
                    ▼
   ┌─────────────────────────────────────┐
   │  Validation Checks:                 │
   │  ✓ Code exists                      │
   │  ✓ Not expired                      │
   │  ✓ Not used                         │
   └─────────────────────────────────────┘

2. MARK CODE AS USED
   ┌─────────────────────────────────────┐
   │  Firestore: connectionCodes/{code}  │
   │                                     │
   │  {                                  │
   │    ...                              │
   │    used: true,                      │
   │    usedBy: "caregiver-456",         │
   │    usedAt: Timestamp                │
   │  }                                  │
   └─────────────────────────────────────┘

3. CREATE DEVICE LINK
   ┌─────────────────────────────────────┐
   │  Firestore: deviceLinks/{linkId}    │
   │                                     │
   │  {                                  │
   │    deviceId: "DEVICE-001",          │
   │    userId: "caregiver-456",         │
   │    role: "caregiver",               │
   │    status: "active",                │
   │    linkedAt: Timestamp,             │
   │    linkedBy: "caregiver-456"        │
   │  }                                  │
   └─────────────────────────────────────┘

4. UPDATE RTDB MAPPING
   ┌─────────────────────────────────────┐
   │  RTDB: users/{caregiverId}/devices  │
   │                                     │
   │  {                                  │
   │    "DEVICE-001": true               │
   │  }                                  │
   └─────────────────────────────────────┘

5. UPDATE DEVICE LINKED USERS (Cloud Function)
   ┌─────────────────────────────────────┐
   │  Firestore: devices/{deviceId}      │
   │                                     │
   │  {                                  │
   │    ...                              │
   │    linkedUsers: {                   │
   │      "patient-123": "patient",      │
   │      "caregiver-456": "caregiver"   │
   │    },                               │
   │    updatedAt: Timestamp             │
   │  }                                  │
   └─────────────────────────────────────┘

6. CREATE NOTIFICATION (Cloud Function)
   ┌─────────────────────────────────────┐
   │  Firestore: notifications/{id}      │
   │                                     │
   │  {                                  │
   │    userId: "patient-123",           │
   │    type: "caregiver_connected",     │
   │    title: "Nuevo Cuidador...",      │
   │    message: "Test Caregiver se...", │
   │    data: {                          │
   │      caregiverId: "caregiver-456",  │
   │      caregiverName: "Test...",      │
   │      deviceId: "DEVICE-001",        │
   │      linkId: "DEVICE-001_..."       │
   │    },                               │
   │    read: false,                     │
   │    createdAt: Timestamp             │
   │  }                                  │
   └─────────────────────────────────────┘

7. SEND PUSH NOTIFICATION (Cloud Function)
   ┌─────────────────────────────────────┐
   │  FCM Push Notification              │
   │                                     │
   │  {                                  │
   │    notification: {                  │
   │      title: "Nuevo Cuidador...",    │
   │      body: "Test Caregiver se..."   │
   │    },                               │
   │    data: {                          │
   │      type: "caregiver_connected",   │
   │      caregiverId: "caregiver-456",  │
   │      ...                            │
   │    }                                │
   │  }                                  │
   └─────────────────────────────────────┘
```

---

## State Transitions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                      STATE TRANSITIONS                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

CONNECTION CODE STATE:
┌──────────┐  validateCode()  ┌──────────┐  useCode()  ┌──────────┐
│  Active  │ ───────────────> │ Validated│ ─────────> │   Used   │
│          │                  │          │            │          │
│ used:    │                  │ used:    │            │ used:    │
│  false   │                  │  false   │            │  true    │
└──────────┘                  └──────────┘            └──────────┘

DEVICE LINK STATE:
┌──────────┐  linkDeviceToUser()  ┌──────────┐
│   None   │ ──────────────────> │  Active  │
│          │                     │          │
│ No link  │                     │ status:  │
│  exists  │                     │ "active" │
└──────────┘                     └──────────┘

CAREGIVER ONBOARDING STATE:
┌──────────────┐  completeOnboarding()  ┌──────────────┐
│  In Progress │ ────────────────────> │   Complete   │
│              │                       │              │
│ onboarding   │                       │ onboarding   │
│ Complete:    │                       │ Complete:    │
│   false      │                       │   true       │
└──────────────┘                       └──────────────┘

PATIENT NOTIFICATION STATE:
┌──────────┐  Cloud Function  ┌──────────┐  User reads  ┌──────────┐
│   None   │ ──────────────> │  Unread  │ ──────────> │   Read   │
│          │                 │          │             │          │
│ No notif │                 │ read:    │             │ read:    │
│  exists  │                 │  false   │             │  true    │
└──────────┘                 └──────────┘             └──────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                      ERROR HANDLING                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

useCode() Error Handling:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Try:                                                          │
│    1. Validate code format                                     │
│    2. Validate caregiver ID                                    │
│    3. Validate authentication                                  │
│    4. Validate code (not expired, not used)                    │
│    5. Mark code as used                                        │
│    6. Create device link                                       │
│                                                                │
│  Catch:                                                        │
│    ├─ CODE_EXPIRED                                            │
│    │  └─> "Este código ha expirado. Solicita un nuevo..."    │
│    │                                                           │
│    ├─ CODE_ALREADY_USED                                       │
│    │  └─> "Este código ya ha sido utilizado..."              │
│    │                                                           │
│    ├─ CODE_NOT_FOUND                                          │
│    │  └─> "Código no encontrado. Verifica el código..."      │
│    │                                                           │
│    ├─ INVALID_CODE_FORMAT                                     │
│    │  └─> "Formato de código no válido."                     │
│    │                                                           │
│    ├─ PERMISSION_DENIED                                       │
│    │  └─> "No tienes permiso para realizar esta operación."  │
│    │                                                           │
│    ├─ SERVICE_UNAVAILABLE                                     │
│    │  └─> "El servicio no está disponible..."                │
│    │  └─> Retry with exponential backoff                     │
│    │                                                           │
│    └─ UNKNOWN_ERROR                                           │
│       └─> "Ocurrió un error inesperado..."                   │
│       └─> Retry with exponential backoff                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Retry Logic:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Retryable Errors:                                            │
│    • SERVICE_UNAVAILABLE                                      │
│    • TIMEOUT                                                  │
│    • UNKNOWN_ERROR                                            │
│                                                                │
│  Retry Strategy:                                              │
│    • Max retries: 3                                           │
│    • Delay: 1000ms * attempt (exponential backoff)           │
│    • Delays: 1s, 2s, 3s                                       │
│                                                                │
│  Non-Retryable Errors:                                        │
│    • CODE_EXPIRED                                             │
│    • CODE_ALREADY_USED                                        │
│    • CODE_NOT_FOUND                                           │
│    • INVALID_CODE_FORMAT                                      │
│    • PERMISSION_DENIED                                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## UI State Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         UI STATE FLOW                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

1. LOADING STATE (Initial)
   ┌─────────────────────────────────────┐
   │  • Show loading spinner             │
   │  • Display "Validando código..."    │
   │  • Disable all interactions         │
   └─────────────────────────────────────┘
                    │
                    │ Code validation complete
                    ▼
2. VALIDATION ERROR STATE
   ┌─────────────────────────────────────┐
   │  • Show error icon                  │
   │  • Display error message            │
   │  • Show troubleshooting tips        │
   │  • "Volver" button enabled          │
   └─────────────────────────────────────┘
                    │
                    │ OR
                    ▼
3. CONFIRMATION STATE
   ┌─────────────────────────────────────┐
   │  • Show patient information         │
   │  • Display device details           │
   │  • Show permissions list            │
   │  • "Cancelar" button enabled        │
   │  • "Conectar" button enabled        │
   └─────────────────────────────────────┘
                    │
                    │ User clicks "Conectar"
                    ▼
4. CONNECTING STATE
   ┌─────────────────────────────────────┐
   │  • Show loading spinner             │
   │  • Display "Conectando..."          │
   │  • Disable all buttons              │
   └─────────────────────────────────────┘
                    │
                    │ Connection complete
                    ▼
5. CONNECTION ERROR STATE
   ┌─────────────────────────────────────┐
   │  • Show error message               │
   │  • Keep patient information visible │
   │  • "Cancelar" button enabled        │
   │  • "Conectar" button enabled        │
   └─────────────────────────────────────┘
                    │
                    │ OR
                    ▼
6. SUCCESS STATE
   ┌─────────────────────────────────────┐
   │  • Show success icon                │
   │  • Display "¡Conexión Exitosa!"     │
   │  • Show connection details          │
   │  • Display next steps               │
   │  • "Ir al Panel" button enabled     │
   └─────────────────────────────────────┘
```

---

## Security Checks

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                       SECURITY CHECKS                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION CHECK
   ┌─────────────────────────────────────┐
   │  ✓ User is authenticated            │
   │  ✓ Firebase Auth token is valid     │
   │  ✓ User ID matches authenticated UID│
   └─────────────────────────────────────┘

2. CODE VALIDATION
   ┌─────────────────────────────────────┐
   │  ✓ Code format is valid (6-8 chars) │
   │  ✓ Code exists in Firestore         │
   │  ✓ Code is not expired              │
   │  ✓ Code has not been used           │
   └─────────────────────────────────────┘

3. AUTHORIZATION CHECK
   ┌─────────────────────────────────────┐
   │  ✓ User is a caregiver              │
   │  ✓ User is using code for themselves│
   │  ✓ User has permission to link      │
   └─────────────────────────────────────┘

4. DATA VALIDATION
   ┌─────────────────────────────────────┐
   │  ✓ Device ID is valid               │
   │  ✓ Patient ID is valid              │
   │  ✓ Device exists in Firestore       │
   │  ✓ Patient exists in Firestore      │
   └─────────────────────────────────────┘

5. FIRESTORE SECURITY RULES
   ┌─────────────────────────────────────┐
   │  ✓ User can read connectionCodes    │
   │  ✓ User can write deviceLinks       │
   │  ✓ User can update connectionCodes  │
   └─────────────────────────────────────┘

6. RTDB SECURITY RULES
   ┌─────────────────────────────────────┐
   │  ✓ User can write to their devices  │
   │  ✓ User can read device state       │
   └─────────────────────────────────────┘
```

---

## Performance Considerations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    PERFORMANCE OPTIMIZATIONS                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

1. PARALLEL OPERATIONS
   ┌─────────────────────────────────────┐
   │  • Firestore and RTDB writes in     │
   │    parallel (not sequential)        │
   │  • Cloud Function triggers async    │
   │  • Notification sent async          │
   └─────────────────────────────────────┘

2. RETRY LOGIC
   ┌─────────────────────────────────────┐
   │  • Exponential backoff for retries  │
   │  • Max 3 retries per operation      │
   │  • Fast fail for non-retryable      │
   └─────────────────────────────────────┘

3. CACHING
   ┌─────────────────────────────────────┐
   │  • User data cached in Redux        │
   │  • Code validation cached locally   │
   │  • Device info cached during flow   │
   └─────────────────────────────────────┘

4. OPTIMISTIC UPDATES
   ┌─────────────────────────────────────┐
   │  • Show success immediately         │
   │  • Update UI before server confirm  │
   │  • Rollback on error                │
   └─────────────────────────────────────┘

5. CLOUD FUNCTION OPTIMIZATION
   ┌─────────────────────────────────────┐
   │  • Async notification sending       │
   │  • Batch FCM token queries          │
   │  • Graceful FCM failure handling    │
   └─────────────────────────────────────┘
```

---

## Testing Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                       TESTING CHECKLIST                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

✅ Unit Tests
   ✓ Connection code validation
   ✓ Code marking as used
   ✓ DeviceLink creation
   ✓ RTDB mapping update
   ✓ Error handling
   ✓ Retry logic

✅ Integration Tests
   ✓ Complete connection flow
   ✓ Code validation → link creation
   ✓ Firestore → RTDB sync
   ✓ Cloud Function triggering
   ✓ Notification creation

✅ End-to-End Tests
   ✓ Caregiver enters code
   ✓ System validates code
   ✓ Connection established
   ✓ Patient receives notification
   ✓ Caregiver sees success

✅ Error Scenarios
   ✓ Expired code
   ✓ Used code
   ✓ Invalid code format
   ✓ Network failure
   ✓ Permission denied

✅ Security Tests
   ✓ Authentication required
   ✓ Authorization checks
   ✓ Code single-use enforcement
   ✓ UID validation

✅ Performance Tests
   ✓ Connection time < 2 seconds
   ✓ Retry logic works
   ✓ Parallel operations
   ✓ Cloud Function latency
```

---

## Troubleshooting Guide

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    TROUBLESHOOTING GUIDE                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

ISSUE: Code validation fails
SOLUTION:
  1. Check code format (6-8 alphanumeric)
  2. Verify code exists in Firestore
  3. Check expiration timestamp
  4. Verify code.used === false

ISSUE: DeviceLink not created
SOLUTION:
  1. Check Firestore permissions
  2. Verify user authentication
  3. Check device ID validity
  4. Review error logs

ISSUE: RTDB mapping not updated
SOLUTION:
  1. Check RTDB permissions
  2. Verify database URL
  3. Check network connectivity
  4. Review retry logic

ISSUE: Patient notification not sent
SOLUTION:
  1. Check Cloud Function deployment
  2. Verify FCM tokens exist
  3. Check notification permissions
  4. Review Cloud Function logs

ISSUE: Connection takes too long
SOLUTION:
  1. Check network latency
  2. Verify Firestore indexes
  3. Review retry attempts
  4. Check Cloud Function cold start

ISSUE: Duplicate links created
SOLUTION:
  1. Check deviceLink ID format
  2. Verify merge logic
  3. Review concurrent requests
  4. Check transaction handling
```

---

## Summary

The connection establishment flow (Task 9.3) successfully implements all requirements:

✅ **Requirement 5.4** - Creates device link between caregiver and patient
✅ **Requirement 5.5** - Grants caregiver access to patient's medication data
✅ **Requirement 5.6** - Notifies patient about new caregiver connection

The implementation is:
- **Secure** - Multiple authentication and authorization checks
- **Reliable** - Retry logic and error handling
- **Fast** - Parallel operations and optimistic updates
- **User-friendly** - Clear messages and visual feedback
- **Well-tested** - Comprehensive test coverage

All components work together seamlessly to provide a smooth connection experience for both caregivers and patients.
