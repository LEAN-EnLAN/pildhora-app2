# Backend & Firebase Risk Assessment

This document lists current backend/Firebase/RTDB issues in the `pildhora-app2` codebase that can lead to data loss, incorrect functionality, crashes, or security/privacy problems—especially once NodeMCU devices are integrated.

---

## 1. Critical Security Issues

### 1.1 Firestore rules are fully open

- File: `firestore.rules:1`
- Current rules:
  ```txt
  rules_version='2'

  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  ```
- Impact:
  - Any client with the public Firebase config can read and write **all** Firestore documents (users, medications, intake records, device data, etc.).
  - High risk of data exfiltration, corruption, and privacy violations (PHI/PII exposure).

### 1.2 Realtime Database rules are fully open

- File: `database.rules.json:1`
- Current rules:
  ```json
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```
- Impact:
  - Any client can read/write arbitrary RTDB paths including `/devices`, `/users`, `/adherence_logs`, etc.
  - Device commands and state can be spoofed or deleted; adherence logs and pairing data can be tampered with.

### 1.3 Public config + open rules

- File: `.env`
- Contains:
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_DATABASE_URL`
  - Google OAuth client IDs, etc.
- Note:
  - Firebase API keys are not secrets by design, **but** combined with `allow read, write: if true` they allow anyone to fully control production data.

### 1.4 Unauthenticated HTTP Cloud Function

- File: `functions/src/index.ts`
- Function: `checkMissedDose` (HTTP `onRequest`):
  - Accepts `deviceID` and `userID` from request body.
  - Reads device status from RTDB.
  - Writes a missed-dose log into `adherence_logs/{userID}/...`.
  - Sends FCM notifications to caregivers.
- Issues:
  - No authentication or authorization checks on the request.
  - `MISSED_DOSE_SA_EMAIL` + OIDC is configured at the **Cloud Tasks** client level, but the function never validates the OIDC token or origin.
- Impact:
  - Anyone who knows the URL can generate false missed-dose events and spam caregivers, or manipulate adherence history.

### 1.5 ESP8266 firmware stores shared secrets

- File: `hardware/esp8266_firmware/esp8266_firmware.ino`
- Hard-coded values:
  - Wi‑Fi SSID and password.
  - `API_KEY`, `FIREBASE_HOST`.
  - `USER_EMAIL`, `USER_PASSWORD`.
- Pattern:
  - Every device would share the same Firebase user credentials.
- Impact:
  - If that user password is compromised or rotated, all devices break.
  - Once rules are tightened, per-device authorization becomes necessary; shared credentials do not support fine-grained access control or revocation.

---

## 2. Data Model & Consistency Risks

### 2.1 Fragile device ownership resolution

- File: `functions/src/index.ts`
- Helper: `resolveOwnerUserId(deviceID: string)`
  - Tries to read `devices/{deviceID}/ownerUserId` from RTDB.
  - If missing, scans all users under `users` and checks `users/{uid}/devices/{deviceID} === true`.
- Issues:
  - `admin.database().ref("users").get()` does a full scan on the `users` node.
  - Does not scale; likely to exceed timeouts and become very slow with many users.
  - Ownership is split across RTDB and Firestore without a single source of truth.

### 2.2 Orphaned intake records when owner cannot be resolved

- File: `functions/src/index.ts`
- Function: `onDispenseEventToIntake`
  - Uses `resolveOwnerUserId(deviceID)` to find `userID`.
  - Writes:
    ```ts
    patientId: userID || "",
    ```
  - into `intakeRecords/{deviceID}_{eventID}`.
- Functions for reading:
  - `getPatientIntakeRecords` and `getPatientAdherence` query `intakeRecords` by `patientId == X`.
- Impact:
  - If ownership cannot be resolved, `patientId` is set to `""`.
  - These records become effectively invisible to the app’s patient-centric queries—real medication events may be logged but never shown (silent data loss from the app’s perspective).

### 2.3 Multiple overlapping device-link representations

Representations currently in use:

- RTDB:
  - `users/{uid}/devices/{deviceID} = true` (written by `linkDeviceToUser` in `src/services/deviceLinking.ts`).
- Firestore:
  - `devices/{deviceID}.linkedUsers.{uid} = role` (`functions/src/index.ts: onUserDeviceLinked` and `onDeviceLinkCreated`).
  - `devices/{deviceID}.primaryPatientId` (first patient to link).
  - `deviceLinks/{deviceID}_{uid}` documents to model relationships and status.

Issues:

- No clear, single source of truth for “who is linked to this device”.
- Both RTDB and Firestore triggers can create/update links, making it easy to get out-of-sync states.
- Server-side invariants (e.g., only one `primaryPatientId`, rule that caregivers must be attached to an existing patient, etc.) are not enforced centrally.

### 2.4 `ownerUserId` never cleared on unlink

- Files: `functions/src/index.ts`
  - `onUserDeviceLinked` sets `devices/{deviceID}/ownerUserId` when a patient links a device.
  - `onUserDeviceUnlinked` and `onDeviceLinkUpdated` remove Firestore and RTDB link entries but never clear `ownerUserId`.
- Impact:
  - A device can remain logically “owned” by a user who no longer has that device.
  - Subsequent device events may still be associated with the old owner (wrong patient attribution).

### 2.5 Device configuration split across two Firestore locations

- Client service:
  - `src/services/deviceConfig.ts`
  - Uses `deviceConfigs/{deviceId}` in Firestore.
- Cloud Function:
  - `functions/src/index.ts: onDesiredConfigUpdated`
  - Expects desired config at `devices/{deviceID}.desiredConfig` and then mirrors it to RTDB `/devices/{deviceID}/config`.
- Issues:
  - Two different Firestore paths (`deviceConfigs` vs `devices.desiredConfig`) represent device configuration.
  - Easy for client and backend to diverge; devices will only see `/devices/{id}/config` in RTDB.

### 2.6 RTDB config writes can wipe other keys

- File: `src/services/deviceConfig.ts`
- Function: `saveDeviceConfig`
  - Builds `rtdbConfig` and then:
    ```ts
    const deviceConfigRef = ref(rdb, `devices/${deviceId}/config`);
    await set(deviceConfigRef, rtdbConfig);
    ```
- Impact:
  - `set(...)` overwrites the entire `config` node.
  - Any extra config fields added by firmware or other services under `/devices/{deviceId}/config` will be lost.
  - Safer pattern would be `update(...)` or having a clearly defined, immutable schema.

### 2.7 Users vs Auth UIDs mismatch risk

- File: `src/services/firebase/user.ts`
- Function: `addUser`:
  ```ts
  const docRef = await addDoc(collection(db, 'users'), { ...userData, createdAt: Timestamp.now() });
  ```
- Behavior:
  - Uses auto-generated document IDs for `users` rather than the Firebase Auth UID.
- Risks:
  - Other parts of the system (rules, device linking, FCM tokens) naturally expect `users/{uid}` to match `request.auth.uid`.
  - Without a consistent ID strategy, device pairing and caregiver assignments can end up tied to a “user ID” that is not equal to the Auth UID, causing confusion and possible access control bugs.

---

## 3. Client-Side Firebase Initialization & Logic Risks

### 3.1 Hard crash on missing Firebase config

- File: `src/services/firebase/index.ts`
- At module scope:
  ```ts
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error('[Firebase] Missing required Firebase configuration. ...');
  }
  ```
- Behavior:
  - This runs as soon as the module is imported, before any UI code can handle failures gracefully.
- Impact:
  - If any env var is missing or misnamed in a production build, the entire app crashes on startup instead of showing a controlled error state or fallback.

### 3.2 Likely wrong Storage bucket

- File: `.env`
- Config:
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pildhora-app2.firebasestorage.app`
- Typical Firebase Storage bucket format:
  - `<project-id>.appspot.com`, not `*.firebasestorage.app`.
- Impact:
  - Storage operations may fail at runtime with confusing errors once implemented.

### 3.3 Inconsistent auth usage: `getAuth()` vs `getAuthInstance()`

- File: `src/services/firebase/index.ts`
  - Provides an async `getAuthInstance()` that correctly initializes:
    - Web: `getAuth(app)` + `browserLocalPersistence`.
    - React Native: `initializeAuth` with `getReactNativePersistence`.
- Files using `getAuthInstance()`:
  - `src/services/deviceConfig.ts`
  - `src/services/deviceLinking.ts`
  - `src/services/notificationPreferences.ts`
  - `src/store/slices/authSlice.ts` (for sign-in/out flows).
- Files using raw `getAuth()`:
  - `src/store/slices/tasksSlice.ts`
  - `src/store/slices/medicationsSlice.ts`
  - `src/store/slices/intakesSlice.ts`
- Risks:
  - `getAuth()` may refer to a different auth instance than the one initialized by `initializeAuth` on React Native.
  - Code using `getAuth()` may see `currentUser` as `null` while the rest of the app considers the user logged in, causing inconsistent behavior and authorization checks.

### 3.4 Cloud Tasks project ID parsing can crash

- File: `functions/src/index.ts`
- Code:
  ```ts
  const project = process.env.GCLOUD_PROJECT || process.env.FIREBASE_CONFIG ? 
    JSON.parse(process.env.FIREBASE_CONFIG!).projectId : "";
  ```
- Due to operator precedence, this is interpreted as:
  ```ts
  const project = (process.env.GCLOUD_PROJECT || process.env.FIREBASE_CONFIG)
    ? JSON.parse(process.env.FIREBASE_CONFIG!).projectId
    : "";
  ```
- Impact:
  - If `GCLOUD_PROJECT` is set but `FIREBASE_CONFIG` is not, `JSON.parse(undefined)` throws, causing a runtime error when scheduling missed-dose tasks.

---

## 4. Hardware / RTDB Schema Mismatches

### 4.1 Firmware uses RTDB paths that backend does not listen to

- File: `hardware/esp8266_firmware/esp8266_firmware.ino`
- Current behavior:
  - Streams `/devices/DEVICE-001`.
  - Reads `/dispense` and, if `true`, calls `dispenseMedication()` and resets `/dispense` to `false`.
  - Periodically writes `/status = "online"`.
- Backend expectations:
  - `functions/src/index.ts` uses:
    - `/devices/{deviceID}/state/current_status` (`onDeviceStatusUpdated`, `onDeviceStateMirroredToFirestore`).
    - `/devices/{deviceID}/dispenseEvents/{eventID}` (`onDispenseEventToIntake`).
    - `/devices/{deviceID}/config` (mirrored from Firestore `desiredConfig` or written via `saveDeviceConfig`).
- Impact:
  - With the current firmware, most Cloud Functions will never be triggered.
  - Device status, telemetry and dispense events won’t be reflected into Firestore intake records or adherence metrics.

### 4.2 Firmware auth model mismatched with pairing design

- Firmware:
  - Signs in using a shared `USER_EMAIL` / `USER_PASSWORD` and a global `API_KEY`.
  - Listens on a static `DEVICE_ID`.
- App backend:
  - Uses `linkDeviceToUser` (`src/services/deviceLinking.ts`) to write `users/{uid}/devices/{deviceId}`.
  - Cloud Functions use RTDB + Firestore (`deviceLinks`, `devices.{linkedUsers}`, `primaryPatientId`, `ownerUserId`) to manage relationships.
- Issues:
  - No per-device authentication; no way to revoke a single device or prove which physical device is sending events.
  - Hard to map firmware `DEVICE_ID` to user relationships reliably without a more robust provisioning scheme.

---

## 5. Recommended Direction to Make It Robust

### 5.1 Secure the data layer first

- Replace `allow read, write: if true` rules with:
  - Rules based on `request.auth.uid` and a canonical `users/{uid}` document.
  - Device access restricted to:
    - Patients who are `primaryPatientId` for a device.
    - Caregivers who have an active `deviceLinks` entry for a patient/device.
- Keep full-open rules **only** in emulators, never in deployed environments.

### 5.2 Establish a single source of truth for device relationships

- Choose Firestore as the canonical source (`devices` + `deviceLinks`) and:
  - Have RTDB reflect a minimal subset needed by hardware (e.g., `ownerUserId`, `config`, current state).
  - Update `resolveOwnerUserId` to read from Firestore (`devices/{deviceId}.primaryPatientId` or `deviceLinks`) instead of scanning `users` in RTDB.
  - Enforce invariants server-side:
    - Only one `primaryPatientId`.
    - Linking/unlinking operations mediated via Cloud Functions or callable functions.

### 5.3 Normalize configuration handling

- Pick one Firestore path for device configuration (`devices/{deviceId}.desiredConfig` is a good candidate).
- Update the React Native app to:
  - Only write config there.
  - Let the Cloud Function mirror it into RTDB `/devices/{deviceId}/config` for the firmware.
- Change `saveDeviceConfig` to:
  - Write to the canonical Firestore location.
  - Either call a callable function or rely on the existing `onDesiredConfigUpdated` trigger instead of directly writing to RTDB.

### 5.4 Make ingestion from devices resilient

- Update firmware to:
  - Write state under `/devices/{deviceId}/state` with:
    - `current_status` (e.g., `ALARM_SOUNDING`, `DOSE_TAKEN`).
    - Battery and telemetry fields compatible with `onDeviceStateMirroredToFirestore`.
  - Write dispense events under `/devices/{deviceId}/dispenseEvents/{eventId}` with a stable schema.
- Update `onDispenseEventToIntake` to:
  - Fail **loudly** if ownership cannot be resolved, rather than silently writing `patientId: ""`.
  - Optionally accumulate “unassigned events” in a dedicated collection for manual repair.

### 5.5 Stabilize Firebase initialization and auth usage

- Replace the top-level crash in `src/services/firebase/index.ts` with:
  - A guarded init that sets an `initializationError` and an app-level view that can show “Backend misconfigured” rather than crashing.
- Standardize on `getAuthInstance()` everywhere:
  - Replace raw `getAuth()` calls in Redux slices with `getAuthInstance()` or pass `currentUser` down from a single auth slice.

### 5.6 Device provisioning and pairing (high-level)

- For production-grade device provisioning:
  - Assign each device a unique `deviceId` and secret during manufacturing / onboarding.
  - Use that to generate custom tokens or validate device requests.
  - Store device metadata under `devices/{deviceId}` and link to users via `deviceLinks`.
  - Ensure that:
    - Unlinking a device removes device links and clears `ownerUserId`.
    - Rules prevent a device from writing under a different `deviceId` path than its own.

This document should be kept up to date as the pairing, provisioning, and RTDB schema are refined and as security rules are implemented and hardened.

