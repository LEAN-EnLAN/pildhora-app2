## Current State
- Caregiver chat screen is implemented and already reads/writes Firestore:
  - UI: `app/caregiver/chat.tsx:13–89` renders bubbles and sends via `sendMessage`.
  - Service: `src/services/firebase/chat.ts:41–70` writes to `chats/{chatId}/messages` and real-time query `getMessagesQuery` `src/services/firebase/chat.ts:78–84`.
  - Navigation: Hidden modal route `app/caregiver/_layout.tsx:100–103`; dashboard opens chat with a selected patient `app/caregiver/dashboard.tsx:413–417`.
- Patient side has no chat screen or entry point. Patient layout stack contains `home`, `link-device`, `settings` only (`app/patient/_layout.tsx:24–28`).
- Pairing check inside `sendMessage` relies on the caregiver’s `patients` list (`src/services/firebase/user.ts:144–162`). Many flows only set `Patient.caregiverId` and may not populate `User.patients`, causing “Unauthorized” errors for valid pairs.

## Plan
### 1) Add Patient Chat Screen
- Create `app/patient/chat.tsx` mirroring caregiver UI:
  - Params: `caregiverId`, `caregiverName` via `useLocalSearchParams`.
  - Data: build `messagesQuery = await getMessagesQuery(caregiverId, patientId)` using current patient `auth.user.id`.
  - Realtime: `useCollectionSWR<Message>` for messages.
  - Send: `sendMessage({ text, senderId: patientId, receiverId: caregiverId })`.
  - Title: set to `Chat con {caregiverName || 'Cuidador'}`.

### 2) Wire Patient Navigation
- Add a stack screen for chat in `app/patient/_layout.tsx` with header:
  - `Stack.Screen name="chat" options={{ title: 'Chat', headerShown: true }} />` (`app/patient/_layout.tsx`).

### 3) Add Patient Entry Point
- In `app/patient/home.tsx`, add a button “Chatear con mi cuidador” near the top cards:
  - On press: resolve `caregiverId` and name.
    - If available on the current patient doc, use `getPatientById(user.id)` (`src/services/firebase/user.ts:169–179`) to read `caregiverId`.
    - Fetch caregiver’s `name` from `users/{caregiverId}` using `getDbInstance` and `getDoc`.
  - Navigate to `/patient/chat?caregiverId=...&caregiverName=...`.
  - Handle no caregiver assigned with a friendly alert.

### 4) Make Pairing Validation Robust
- Update `sendMessage` pairing logic to accept either of:
  - Patient appears in caregiver’s `patients` list (`src/services/firebase/user.ts:144–162`), OR
  - Patient’s doc has `caregiverId` equal to the caregiver.
- Concretely in `src/services/firebase/chat.ts`:
  - After deriving `[caregiverId, patientId]`, load the patient via `user.getPatientById(patientId)` and allow messaging if `patient.caregiverId === caregiverId` even if the caregiver’s `patients` array is not populated.
  - Keep current checks to support both models.

### 5) UX Details (keep existing style)
- Use the current bubble styles and inverted `FlatList` as in caregiver chat.
- Preserve Spanish copy for placeholders and alerts.
- Keep `PHTextField` and `Ionicons` to match design.

### 6) Environment & Rules
- Confirm Firebase env vars in `.env` (Expo): `EXPO_PUBLIC_FIREBASE_*` are required (`src/services/firebase/index.ts:17–43`).
- Firestore rules should permit reads/writes to `chats/*/messages` for paired caregiver–patient users. We’ll recommend rules consistent with the updated pairing check.

### 7) Validation
- Test caregiver → patient:
  - From dashboard, open chat for a patient and send/receive.
- Test patient → caregiver:
  - From patient home, open chat and send/receive.
- Verify real-time updates and message ordering.
- Verify unauthorized pairs are blocked with a clear alert.

### 8) Non‑Breaking
- No new dependencies; reuse Firestore and existing hooks.
- Do not alter message model or navigation outside the new patient route and button.

If you approve, I’ll implement the patient chat screen, navigation/button wiring, and the robust pairing check, then run a quick end-to-end validation to ensure messages flow both ways.