# Adherence Card Troubleshooting Guide

## Issue: "Tomar Medicación" Button Not Updating Adherence Card

### Overview

When a patient clicks the "Tomar Medicación" button, it should:
1. Write an intake record to Firestore
2. The real-time subscription should receive the new record
3. The adherence card should update automatically

### Data Flow

```
User clicks "Tomar Medicación"
    ↓
handleTakeUpcomingMedication()
    ↓
Write to Firestore: intakeRecords collection
    ↓
onSnapshot listener (intakesSlice) receives update
    ↓
Redux state updates: intakes array
    ↓
adherenceData useMemo recalculates
    ↓
AdherenceCard re-renders with new count
```

### Debugging Steps

#### 1. Check Console Logs

After clicking "Tomar Medicación", you should see:

```
[TakeMedication] Starting...
[TakeMedication] Medication: Aspirina
[TakeMedication] Patient ID: vtBGfPfbEhU6Z7njl1YsujrUexc2
[TakeMedication] Writing intake record: {...}
[TakeMedication] Successfully written with ID: abc123xyz
```

If you don't see these logs:
- ✅ Check if the button is actually calling the function
- ✅ Check if there are any errors in the console
- ✅ Verify the upcoming medication exists

#### 2. Check Adherence Calculation Logs

You should see:

```
[Adherence] Today meds: 3
[Adherence] Total doses: 4
[Adherence] Total intakes: 5
[Adherence] Taken today: 2
```

If the numbers don't match expectations:
- ✅ Check if medications are properly filtered for today
- ✅ Verify the intake records have correct dates
- ✅ Check if IntakeStatus.TAKEN is being used correctly

#### 3. Verify Firestore Write

Check Firebase Console:
1. Go to Firestore Database
2. Navigate to `intakeRecords` collection
3. Look for the newly created document
4. Verify it has:
   - `patientId`: Correct patient ID
   - `medicationName`: Correct medication name
   - `scheduledTime`: Today's date with correct time
   - `status`: "TAKEN"
   - `takenAt`: Current timestamp

#### 4. Check Real-Time Subscription

In the console, look for:

```
[Intakes] Subscription error: ...
```

If you see errors:
- **Permission denied**: Check Firestore security rules
- **Index required**: Create the required index in Firebase Console
- **Network error**: Check internet connection

#### 5. Verify Redux State

Use Redux DevTools to check:
1. `intakes` array in Redux state
2. After clicking button, new intake should appear
3. Check if `status` is "TAKEN"
4. Verify `scheduledTime` is today

### Common Issues and Solutions

#### Issue 1: Intake Record Created But Adherence Not Updating

**Symptoms**:
- Console shows successful write
- Firestore shows the record
- Adherence card doesn't update

**Possible Causes**:
1. **Date Mismatch**: Scheduled time might be for a different day
2. **Status Mismatch**: Status might not be exactly "TAKEN"
3. **Medication ID Mismatch**: medicationId or medicationName doesn't match

**Solution**:
```typescript
// Check the adherence calculation logic
const intakeDate = new Date(intake.scheduledTime);
console.log('Intake date:', intakeDate);
console.log('Today:', today);
console.log('Is today?', intakeDate >= today);
```

#### Issue 2: Real-Time Subscription Not Working

**Symptoms**:
- Record created in Firestore
- Redux state doesn't update
- No subscription errors

**Possible Causes**:
1. Subscription not started
2. Subscription stopped prematurely
3. Component unmounted before update

**Solution**:
```typescript
// Check if subscription is active
useEffect(() => {
  console.log('[Subscription] Starting for patient:', patientId);
  if (patientId) {
    dispatch(startIntakesSubscription(patientId));
  }
  return () => {
    console.log('[Subscription] Stopping');
    dispatch(stopIntakesSubscription());
  };
}, [patientId, dispatch]);
```

#### Issue 3: Firestore Permission Denied

**Symptoms**:
- Error: "permission-denied"
- Console shows permission error

**Solution**:
Check Firestore security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /intakeRecords/{intakeId} {
      // Allow patients to read/write their own intake records
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         request.resource.data.patientId == request.auth.uid);
      
      // Allow caregivers to read/write intake records for their patients
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'caregiver';
    }
  }
}
```

#### Issue 4: Duplicate Intake Records

**Symptoms**:
- Multiple records created for same dose
- Adherence count higher than expected

**Possible Causes**:
1. Button clicked multiple times
2. No duplicate prevention logic

**Solution**:
Add duplicate check:

```typescript
const handleTakeUpcomingMedication = useCallback(async () => {
  try {
    // ... existing validation ...
    
    // Check if already taken
    const scheduledDate = new Date();
    scheduledDate.setHours(hh, mm, 0, 0);
    
    const alreadyTaken = intakes.some((intake) => {
      const intakeDate = new Date(intake.scheduledTime);
      return (
        intake.status === IntakeStatus.TAKEN &&
        intakeDate.getTime() === scheduledDate.getTime() &&
        (intake.medicationId === upcoming.med.id || 
         intake.medicationName === upcoming.med.name)
      );
    });
    
    if (alreadyTaken) {
      Alert.alert('Ya registrado', 'Esta dosis ya fue registrada como tomada.');
      return;
    }
    
    // ... rest of function ...
  } catch (e: any) {
    // ... error handling ...
  }
}, [upcoming, patientId, intakes]);
```

#### Issue 5: Time Zone Issues

**Symptoms**:
- Intake recorded but shows wrong date
- Adherence calculation off by one day

**Possible Causes**:
1. Server time vs local time mismatch
2. Timestamp conversion issues

**Solution**:
Use consistent time zone handling:

```typescript
// Always use local time for scheduled dates
const scheduledDate = new Date();
scheduledDate.setHours(hh, mm, 0, 0);

// Log for debugging
console.log('Scheduled date (local):', scheduledDate.toLocaleString());
console.log('Scheduled date (ISO):', scheduledDate.toISOString());
```

### Testing Checklist

Before deploying, verify:

- [ ] Click "Tomar Medicación" button
- [ ] See success alert
- [ ] Check console for successful write log
- [ ] Verify Firestore record created
- [ ] Check Redux state updated
- [ ] Confirm adherence card updates
- [ ] Test with multiple medications
- [ ] Test with multiple doses per day
- [ ] Test edge cases (midnight, etc.)

### Performance Considerations

#### Optimize Adherence Calculation

The adherence calculation runs on every render when medications or intakes change. For large datasets, this could be slow.

**Current Implementation**:
```typescript
const adherenceData = useMemo(() => {
  // Filters and calculations
}, [medications, intakes]);
```

**Optimization**:
```typescript
const adherenceData = useMemo(() => {
  // Early returns for empty data
  if (medications.length === 0) return { takenCount: 0, totalCount: 0 };
  
  // Cache today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  // Use Map for faster lookups
  const takenMap = new Map();
  intakes.forEach((intake) => {
    if (intake.status === IntakeStatus.TAKEN) {
      const intakeTime = new Date(intake.scheduledTime).getTime();
      if (intakeTime >= todayTime) {
        const key = `${intake.medicationId || intake.medicationName}-${intakeTime}`;
        takenMap.set(key, true);
      }
    }
  });
  
  // Calculate totals
  let totalDoses = 0;
  medications.forEach(med => {
    if (isScheduledToday(med)) {
      totalDoses += med.times.length;
    }
  });
  
  return { takenCount: takenMap.size, totalCount: totalDoses };
}, [medications, intakes]);
```

### Monitoring and Analytics

Track these metrics:
1. **Success Rate**: % of successful intake recordings
2. **Error Rate**: % of failed recordings
3. **Latency**: Time from button click to UI update
4. **Adherence Rate**: Overall medication adherence

```typescript
// Example analytics tracking
analytics.logEvent('medication_taken', {
  medication_name: upcoming.med.name,
  scheduled_time: scheduledDate.toISOString(),
  actual_time: new Date().toISOString(),
  latency_ms: Date.now() - startTime,
});
```

### Related Files

- `app/patient/home.tsx` - Main screen with adherence card
- `src/store/slices/intakesSlice.ts` - Real-time subscription
- `src/components/screens/patient/AdherenceCard.tsx` - Display component
- `src/components/screens/patient/UpcomingDoseCard.tsx` - Take medication button
- `firestore.rules` - Security rules

### Support

If issues persist after following this guide:
1. Check Firebase Console for errors
2. Review Firestore security rules
3. Verify network connectivity
4. Check Redux DevTools for state updates
5. Review console logs for detailed error messages

