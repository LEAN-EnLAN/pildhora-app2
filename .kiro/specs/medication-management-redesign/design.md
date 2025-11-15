# Design Document

## Overview

This design document outlines a comprehensive redesign of the medication management system that addresses critical usability and functionality issues. The redesign transforms the current single-screen medication form into a multi-step wizard interface with native platform integrations, implements robust dose tracking with inventory management, and introduces a caregiver notification system for medication lifecycle events.

### Key Design Goals

1. **Simplified User Experience**: Break down complex medication configuration into digestible, focused steps
2. **Native Integration**: Leverage platform-specific features (emoji picker, alarms) for familiar user interactions
3. **Data Integrity**: Prevent duplicate dose recordings and maintain accurate adherence statistics
4. **Inventory Awareness**: Track medication supply and alert patients before running out
5. **Caregiver Visibility**: Enable caregivers to monitor patient medication management activities

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Patient Application                       │
├─────────────────────────────────────────────────────────────┤
│  Medication Wizard Flow                                      │
│  ├── Step 1: Icon & Name Selection                          │
│  ├── Step 2: Schedule Configuration                         │
│  ├── Step 3: Dosage Configuration                           │
│  └── Step 4: Inventory Setup (new medications only)         │
├─────────────────────────────────────────────────────────────┤
│  Dose Taking Interface                                       │
│  ├── Duplicate Prevention Logic                             │
│  ├── Inventory Decrement                                    │
│  └── Low Quantity Alerts                                    │
├─────────────────────────────────────────────────────────────┤
│  Medication Event Queue                                      │
│  └── Offline Event Storage                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  Firestore Collections                                       │
│  ├── medications (enhanced with inventory fields)           │
│  ├── intakeRecords (enhanced with completion tracking)      │
│  └── medicationEvents (new collection)                      │
├─────────────────────────────────────────────────────────────┤
│  Cloud Functions                                             │
│  └── onMedicationEvent (new function)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Caregiver Application                       │
├─────────────────────────────────────────────────────────────┤
│  Medication Event Registry                                   │
│  ├── Event List View                                        │
│  ├── Filtering & Search                                     │
│  └── Event Details                                          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Multi-Step Medication Wizard

#### Wizard Container Component

**Purpose**: Orchestrates the multi-step flow and manages navigation between steps

**Props**:
```typescript
interface MedicationWizardProps {
  mode: 'add' | 'edit';
  medication?: Medication;
  onComplete: () => void;
  onCancel: () => void;
}
```

**State Management**:
```typescript
interface WizardState {
  currentStep: number;
  totalSteps: number;
  formData: MedicationFormData;
  canProceed: boolean;
  isSubmitting: boolean;
}

interface MedicationFormData {
  // Step 1: Icon & Name
  emoji: string;
  name: string;
  
  // Step 2: Schedule
  times: string[];
  frequency: string[];
  nativeAlarmIds: string[]; // Platform-specific alarm identifiers
  
  // Step 3: Dosage
  doseValue: string;
  doseUnit: string;
  quantityType: string;
  
  // Step 4: Inventory (add mode only)
  initialQuantity?: number;
  lowQuantityThreshold?: number;
}
```

**Navigation Logic**:
- Forward navigation: Validate current step before proceeding
- Backward navigation: Preserve entered data
- Exit handling: Confirm abandonment if data entered
- Progress indicator: Show current step position

#### Step 1: Icon & Name Selection

**Component**: `MedicationIconNameStep`

**Features**:
- Native emoji picker integration via `expo-emoji-picker` or platform APIs
- Large emoji preview (72x72 dp)
- Text input for medication name
- Character limit: 50 characters
- Real-time validation feedback

**Platform Integration**:
```typescript
// iOS: Use native emoji keyboard
// Android: Use system emoji picker or fallback to expo-emoji-picker

interface EmojiPickerService {
  openPicker(): Promise<string>;
  isNativeAvailable(): boolean;
}
```

**Validation Rules**:
- Emoji: Required, must be a single emoji character
- Name: Required, 2-50 characters, no special characters except spaces and hyphens

#### Step 2: Schedule Configuration

**Component**: `MedicationScheduleStep`

**Features**:
- Visual time picker with 12/24 hour format support
- Multiple time slots with add/remove capability
- Day-of-week selector with visual chips
- Native alarm creation integration
- Visual schedule preview (timeline view)

**Native Alarm Integration**:
```typescript
interface AlarmService {
  createAlarm(time: string, label: string, days: string[]): Promise<string>;
  updateAlarm(alarmId: string, time: string, label: string, days: string[]): Promise<void>;
  deleteAlarm(alarmId: string): Promise<void>;
  canScheduleAlarms(): Promise<boolean>;
}
```

**Implementation Notes**:
- iOS: Use `expo-notifications` with `UNCalendarNotificationTrigger`
- Android: Use `expo-notifications` with `AlarmManager` integration
- Store alarm IDs in medication record for future updates/deletions
- Handle permission requests gracefully
- Fallback to in-app notifications if alarm permissions denied

**Visual Timeline**:
- 24-hour circular or linear timeline
- Markers for each scheduled time
- Color-coded by medication (using emoji as identifier)

#### Step 3: Dosage Configuration

**Component**: `MedicationDosageStep`

**Features**:
- Large numeric input for dose value
- Visual unit selector (pills, ml, mg, etc.)
- Quantity type selector with icons
- Visual dosage preview (e.g., pill icons × quantity)
- Support for decimal values (0.5, 1.5, etc.)

**Visual Representations**:
```typescript
interface DosageVisualizer {
  renderPillCount(count: number): ReactNode;
  renderLiquidMeasure(ml: number): ReactNode;
  renderWeightMeasure(value: number, unit: string): ReactNode;
}
```

**Validation Rules**:
- Dose value: Required, positive number, max 4 digits
- Dose unit: Required, from predefined list or custom
- Quantity type: Required, affects visual representation

#### Step 4: Inventory Setup (Add Mode Only)

**Component**: `MedicationInventoryStep`

**Features**:
- Initial quantity input with large numeric keypad
- Visual quantity indicator (progress bar or pill count)
- Auto-calculated low quantity threshold (3 days of doses)
- Optional manual threshold adjustment
- Skip option for medications without inventory tracking

**Calculation Logic**:
```typescript
function calculateLowQuantityThreshold(
  timesPerDay: number,
  daysPerWeek: number
): number {
  const dosesPerDay = timesPerDay;
  const avgDosesPerWeek = dosesPerDay * (daysPerWeek / 7);
  const avgDosesPerDay = avgDosesPerWeek / 7;
  return Math.ceil(avgDosesPerDay * 3); // 3 days buffer
}
```

### 2. Dose Taking Interface Enhancement

#### Duplicate Prevention System

**Current Issue**: The `handleTakeUpcomingMedication` function in `app/patient/home.tsx` creates a new intake record every time it's called, without checking if that specific dose has already been recorded.

**Solution Architecture**:

```typescript
interface DoseCompletionTracker {
  isDoseCompleted(
    medicationId: string,
    scheduledTime: Date
  ): Promise<boolean>;
  
  markDoseCompleted(
    medicationId: string,
    scheduledTime: Date,
    intakeRecordId: string
  ): Promise<void>;
  
  getCompletedDosesForToday(
    medicationId: string
  ): Promise<Date[]>;
}
```

**Implementation Strategy**:

1. **Client-Side Check**: Before creating intake record, query existing records
```typescript
async function canTakeDose(
  medicationId: string,
  scheduledTime: Date
): Promise<{ canTake: boolean; reason?: string }> {
  const db = await getDbInstance();
  const startOfDay = new Date(scheduledTime);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(scheduledTime);
  endOfDay.setHours(23, 59, 59, 999);
  
  const q = query(
    collection(db, 'intakeRecords'),
    where('medicationId', '==', medicationId),
    where('scheduledTime', '>=', Timestamp.fromDate(startOfDay)),
    where('scheduledTime', '<=', Timestamp.fromDate(endOfDay)),
    where('status', '==', IntakeStatus.TAKEN)
  );
  
  const snapshot = await getDocs(q);
  const existingIntake = snapshot.docs.find(doc => {
    const data = doc.data();
    const existingTime = data.scheduledTime.toDate();
    return Math.abs(existingTime.getTime() - scheduledTime.getTime()) < 60000; // 1 minute tolerance
  });
  
  if (existingIntake) {
    return {
      canTake: false,
      reason: 'Esta dosis ya fue registrada'
    };
  }
  
  return { canTake: true };
}
```

2. **UI Feedback**: Update `UpcomingDoseCard` to show completion status
```typescript
interface UpcomingDoseCardProps {
  // ... existing props
  isCompleted: boolean;
  completedAt?: Date;
}
```

3. **Visual Indicators**:
- Completed doses: Green checkmark, disabled button, "Tomado a las HH:MM"
- Pending doses: Active button, "Tomar medicina"
- Missed doses: Yellow warning, "Dosis perdida"

#### Inventory Tracking System

**Data Model Enhancement**:
```typescript
interface Medication {
  // ... existing fields
  
  // New inventory fields
  currentQuantity?: number;
  initialQuantity?: number;
  lowQuantityThreshold?: number;
  lastRefillDate?: Date | string;
  trackInventory: boolean; // Flag to enable/disable tracking
}
```

**Inventory Service**:
```typescript
interface InventoryService {
  decrementInventory(
    medicationId: string,
    amount: number
  ): Promise<void>;
  
  refillInventory(
    medicationId: string,
    newQuantity: number
  ): Promise<void>;
  
  checkLowQuantity(
    medicationId: string
  ): Promise<boolean>;
  
  getInventoryStatus(
    medicationId: string
  ): Promise<InventoryStatus>;
}

interface InventoryStatus {
  currentQuantity: number;
  isLow: boolean;
  daysRemaining: number;
  estimatedRunOutDate: Date;
}
```

**Integration with Dose Taking**:
```typescript
async function handleTakeMedication(
  medication: Medication,
  scheduledTime: Date
): Promise<void> {
  // 1. Check if dose already taken
  const { canTake, reason } = await canTakeDose(medication.id, scheduledTime);
  if (!canTake) {
    Alert.alert('Dosis ya registrada', reason);
    return;
  }
  
  // 2. Record intake
  const intakeRecord = await createIntakeRecord(medication, scheduledTime);
  
  // 3. Decrement inventory if tracking enabled
  if (medication.trackInventory && medication.currentQuantity !== undefined) {
    const doseAmount = parseDoseAmount(medication.doseValue, medication.quantityType);
    await inventoryService.decrementInventory(medication.id, doseAmount);
    
    // 4. Check for low quantity
    const isLow = await inventoryService.checkLowQuantity(medication.id);
    if (isLow) {
      showLowQuantityNotification(medication);
    }
  }
  
  Alert.alert('Registrado', 'Se registró la toma de la dosis.');
}
```

#### Low Quantity Alert System

**Alert Triggers**:
1. When inventory falls below threshold
2. Daily check at 8:00 AM for all medications
3. When viewing medication details

**Alert UI Components**:

```typescript
// Badge on medication card
<MedicationCard
  medication={medication}
  inventoryStatus={inventoryStatus}
  showLowQuantityBadge={inventoryStatus.isLow}
/>

// In-app notification
interface LowQuantityNotification {
  medicationName: string;
  currentQuantity: number;
  daysRemaining: number;
  onRefill: () => void;
  onDismiss: () => void;
}

// Medication detail screen banner
<LowQuantityBanner
  currentQuantity={medication.currentQuantity}
  threshold={medication.lowQuantityThreshold}
  daysRemaining={inventoryStatus.daysRemaining}
  onRefill={() => showRefillDialog()}
/>
```

**Refill Dialog**:
```typescript
interface RefillDialogProps {
  medication: Medication;
  onConfirm: (newQuantity: number) => void;
  onCancel: () => void;
}

// Features:
// - Large numeric input
// - Visual quantity preview
// - Auto-update refill date
// - Optional notes field
```

### 3. Caregiver Notification System

#### Medication Event Model

**Firestore Schema**:
```typescript
interface MedicationEvent {
  id: string;
  eventType: 'created' | 'updated' | 'deleted';
  medicationId: string;
  medicationName: string;
  medicationData: Partial<Medication>; // Snapshot of changes
  patientId: string;
  patientName: string;
  caregiverId: string;
  timestamp: Timestamp;
  syncStatus: 'pending' | 'delivered' | 'failed';
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}
```

**Collection Structure**:
```
/medicationEvents/{eventId}
  - eventType: "created"
  - medicationId: "med_123"
  - medicationName: "Aspirin"
  - patientId: "patient_456"
  - caregiverId: "caregiver_789"
  - timestamp: Timestamp
  - syncStatus: "delivered"
```

#### Event Queue System

**Purpose**: Store medication events when caregiver is not connected, deliver when connection established

**Local Storage Schema**:
```typescript
interface EventQueue {
  pendingEvents: MedicationEvent[];
  lastSyncAttempt: Date;
  syncInProgress: boolean;
}

interface EventQueueService {
  enqueue(event: Omit<MedicationEvent, 'id' | 'timestamp'>): Promise<void>;
  dequeue(): Promise<MedicationEvent | null>;
  syncPendingEvents(): Promise<void>;
  getPendingCount(): Promise<number>;
}
```

**Sync Strategy**:
1. **Immediate Sync**: Attempt to send event immediately when created
2. **Background Sync**: Retry failed events every 5 minutes
3. **App Foreground**: Sync all pending events when app comes to foreground
4. **Manual Sync**: User-triggered sync from settings

**Implementation**:
```typescript
class MedicationEventQueue {
  private queue: MedicationEvent[] = [];
  
  async enqueue(event: Omit<MedicationEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: MedicationEvent = {
      ...event,
      id: generateId(),
      timestamp: Timestamp.now(),
      syncStatus: 'pending'
    };
    
    // Store locally
    this.queue.push(fullEvent);
    await this.persistQueue();
    
    // Attempt immediate sync
    await this.syncPendingEvents();
  }
  
  async syncPendingEvents(): Promise<void> {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      const db = await getDbInstance();
      const pendingEvents = this.queue.filter(e => e.syncStatus === 'pending');
      
      for (const event of pendingEvents) {
        try {
          await addDoc(collection(db, 'medicationEvents'), event);
          event.syncStatus = 'delivered';
        } catch (error) {
          event.syncStatus = 'failed';
          console.error('Failed to sync event:', error);
        }
      }
      
      // Remove delivered events
      this.queue = this.queue.filter(e => e.syncStatus !== 'delivered');
      await this.persistQueue();
      
    } finally {
      this.syncInProgress = false;
    }
  }
  
  private async persistQueue(): Promise<void> {
    await AsyncStorage.setItem('medicationEventQueue', JSON.stringify(this.queue));
  }
}
```

#### Event Generation Hooks

**Integration Points**:
1. After successful medication creation
2. After successful medication update
3. After successful medication deletion

**Example Integration**:
```typescript
// In medicationsSlice.ts
export const addMedication = createAsyncThunk(
  'medications/add',
  async (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>, { getState }) => {
    const db = await getDbInstance();
    const docRef = await addDoc(collection(db, 'medications'), {
      ...medication,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    const newMedication = { ...medication, id: docRef.id };
    
    // Generate medication event
    if (medication.caregiverId) {
      await eventQueue.enqueue({
        eventType: 'created',
        medicationId: docRef.id,
        medicationName: medication.name,
        medicationData: newMedication,
        patientId: medication.patientId,
        patientName: (getState() as RootState).auth.user?.name || 'Unknown',
        caregiverId: medication.caregiverId,
        syncStatus: 'pending'
      });
    }
    
    return newMedication;
  }
);
```

#### Caregiver Event Registry

**Component**: `MedicationEventRegistry`

**Features**:
- Chronological event list with infinite scroll
- Event type icons and color coding
- Patient name and medication name display
- Timestamp with relative time ("2 hours ago")
- Filter by patient, event type, date range
- Search by medication name
- Pull-to-refresh
- Real-time updates via Firestore listener

**UI Layout**:
```
┌─────────────────────────────────────────┐
│  Medication Events                      │
│  ┌─────────────────────────────────┐   │
│  │ Filters: [All Patients ▼]      │   │
│  │          [All Events ▼]         │   │
│  │ Search: [________________]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [+] John Doe                    │   │
│  │     Created "Aspirin"           │   │
│  │     2 hours ago                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [✏️] Jane Smith                  │   │
│  │     Updated "Metformin"         │   │
│  │     Changed time: 8:00 → 9:00   │   │
│  │     Yesterday at 3:45 PM        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [🗑️] John Doe                    │   │
│  │     Deleted "Ibuprofen"         │   │
│  │     3 days ago                  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Event Detail View**:
- Full medication snapshot at time of event
- Change diff for update events
- Patient contact information
- Action buttons: "View Medication", "Contact Patient"

## Data Models

### Enhanced Medication Model

```typescript
interface Medication {
  // Existing fields
  id: string;
  name: string;
  doseValue: string;
  doseUnit: string;
  quantityType: string;
  isCustomQuantityType?: boolean;
  dosage?: string; // Legacy field
  frequency: string;
  times: string[];
  patientId: string;
  caregiverId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // New fields for redesign
  emoji: string; // Emoji icon for visual identification
  nativeAlarmIds: string[]; // Platform-specific alarm identifiers
  
  // Inventory tracking fields
  trackInventory: boolean;
  currentQuantity?: number;
  initialQuantity?: number;
  lowQuantityThreshold?: number;
  lastRefillDate?: Date | string;
}
```

### Enhanced IntakeRecord Model

```typescript
interface IntakeRecord {
  // Existing fields
  id: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date | string;
  status: IntakeStatus;
  patientId: string;
  takenAt?: Date | string;
  medicationId?: string;
  caregiverId?: string;
  
  // New fields for duplicate prevention
  completionToken: string; // Unique token: `${medicationId}-${scheduledTime.getTime()}`
  deviceSource?: 'manual' | 'pillbox'; // Source of intake recording
}
```

### MedicationEvent Model

```typescript
interface MedicationEvent {
  id: string;
  eventType: 'created' | 'updated' | 'deleted';
  medicationId: string;
  medicationName: string;
  medicationData: Partial<Medication>;
  patientId: string;
  patientName: string;
  caregiverId: string;
  timestamp: Timestamp;
  syncStatus: 'pending' | 'delivered' | 'failed';
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}
```

## Error Handling

### Wizard Flow Errors

1. **Validation Errors**: Display inline error messages below invalid fields
2. **Network Errors**: Show retry dialog with offline queue option
3. **Permission Errors**: Guide user to settings with clear instructions
4. **Save Errors**: Preserve form data, offer retry or save draft

### Dose Taking Errors

1. **Duplicate Dose**: Clear message with timestamp of previous intake
2. **Network Error**: Queue intake locally, sync when online
3. **Inventory Error**: Allow dose recording, flag inventory for manual correction

### Event Sync Errors

1. **Network Failure**: Queue events locally, show pending count in UI
2. **Permission Error**: Log error, continue with local operation
3. **Firestore Error**: Retry with exponential backoff, max 3 attempts

### Native Integration Errors

1. **Alarm Permission Denied**: Fallback to in-app notifications
2. **Emoji Picker Unavailable**: Provide fallback icon selector
3. **Platform API Error**: Log error, use graceful degradation

## Testing Strategy

### Unit Tests

1. **Wizard Navigation Logic**
   - Step progression validation
   - Data persistence across steps
   - Exit confirmation logic

2. **Duplicate Prevention**
   - Dose completion checking
   - Completion token generation
   - Time tolerance matching

3. **Inventory Calculations**
   - Quantity decrement logic
   - Low threshold calculation
   - Days remaining estimation

4. **Event Queue**
   - Enqueue/dequeue operations
   - Sync retry logic
   - Local persistence

### Integration Tests

1. **Medication Creation Flow**
   - Complete wizard flow from start to finish
   - Native alarm creation
   - Event generation and sync

2. **Dose Taking Flow**
   - Duplicate prevention
   - Inventory decrement
   - Low quantity alert triggering

3. **Event Sync Flow**
   - Offline event queuing
   - Online sync
   - Caregiver event reception

### E2E Tests

1. **Patient Medication Management**
   - Create medication with all steps
   - Edit medication
   - Delete medication
   - Verify caregiver receives events

2. **Dose Tracking**
   - Take dose
   - Attempt duplicate
   - Verify inventory update
   - Receive low quantity alert

3. **Caregiver Monitoring**
   - View event registry
   - Filter events
   - View event details

## Performance Considerations

### Wizard Performance

- Lazy load step components
- Debounce validation checks (300ms)
- Cache emoji picker results
- Optimize re-renders with React.memo

### Dose Taking Performance

- Index Firestore on `medicationId`, `scheduledTime`, `status`
- Cache today's completed doses in memory
- Batch inventory updates

### Event Sync Performance

- Batch event uploads (max 10 per batch)
- Implement exponential backoff for retries
- Use Firestore offline persistence
- Limit event history to 90 days

### UI Performance

- Virtualize long event lists
- Optimize medication card renders
- Use skeleton loaders for async operations
- Implement pull-to-refresh with haptic feedback

## Migration Strategy

### Data Migration

1. **Medication Records**
   - Add default emoji (💊) to existing medications
   - Set `trackInventory: false` for existing medications
   - Preserve existing alarm functionality

2. **Intake Records**
   - Generate `completionToken` for existing records
   - Backfill `deviceSource` as 'manual'

### Feature Rollout

1. **Phase 1**: Multi-step wizard (add/edit flows)
2. **Phase 2**: Duplicate prevention and inventory tracking
3. **Phase 3**: Caregiver notification system
4. **Phase 4**: Native alarm integration

### Backward Compatibility

- Maintain legacy `dosage` field for 6 months
- Support both old and new medication forms during transition
- Gradual migration of alarm system
- Feature flags for phased rollout

## Security Considerations

### Data Access

- Medication events only visible to assigned caregiver
- Patient can view their own event queue status
- Firestore security rules enforce caregiver-patient relationships

### Event Integrity

- Server-side timestamp validation
- Event signature to prevent tampering
- Rate limiting on event creation (max 100/hour per patient)

### Privacy

- No sensitive medication details in push notifications
- Event data encrypted at rest
- Automatic event cleanup after 90 days

## Accessibility

### Wizard Accessibility

- Screen reader support for step progress
- High contrast mode for visual elements
- Keyboard navigation support
- Haptic feedback for step transitions

### Dose Taking Accessibility

- Clear audio feedback for completion
- Large touch targets (min 44x44 dp)
- Color-blind friendly status indicators
- Voice control support

### Event Registry Accessibility

- Semantic HTML for event list
- ARIA labels for filter controls
- Keyboard shortcuts for common actions
- Screen reader announcements for new events
