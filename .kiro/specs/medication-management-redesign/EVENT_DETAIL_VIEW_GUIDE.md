# Event Detail View - User Guide

## Overview
The Event Detail View provides caregivers with comprehensive information about medication lifecycle events (create, update, delete) performed by their patients.

## Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│  Event Detail                                    [Back] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  [🟢]  John Doe creó                             │ │
│  │        "Aspirin"                                  │ │
│  │        ⏰ 2 hours ago                            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  🔄 Cambios Realizados                           │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  HORARIOS                                    │ │ │
│  │  │  [8:00] → [9:00]                            │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  DOSIS                                       │ │ │
│  │  │  [500 mg] → [750 mg]                        │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  📄 Información del Medicamento                  │ │
│  │  Icono:      💊                                  │ │
│  │  Nombre:     Aspirin                             │ │
│  │  Dosis:      750 mg                              │ │
│  │  Tipo:       Tablets                             │ │
│  │  Horarios:   9:00, 21:00                         │ │
│  │  Frecuencia: Diario                              │ │
│  │  Inventario: 45 unidades                         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  👤 Información del Paciente                     │ │
│  │  👤 Nombre:      John Doe                        │ │
│  │  📧 Email:       john@example.com                │ │
│  │  📊 Adherencia:  85%                             │ │
│  │  ⏰ Última dosis: Hace 3 horas                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  [💊 Ver Medicamentos]                           │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  [📧 Contactar Paciente]                         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Event Types

### 1. Created Event (🟢 Green)
**When:** Patient creates a new medication

**Display:**
- Green circular icon with "+"
- "Patient Name creó 'Medication Name'"
- Full medication snapshot
- No change diff section

**Example:**
```
[🟢] María García creó
     "Metformina"
     ⏰ 5 minutos atrás
```

### 2. Updated Event (🔵 Blue)
**When:** Patient modifies an existing medication

**Display:**
- Blue circular icon with pencil
- "Patient Name actualizó 'Medication Name'"
- Change diff showing old → new values
- Full medication snapshot (current state)

**Example:**
```
[🔵] Carlos López actualizó
     "Lisinopril"
     ⏰ 1 hora atrás

🔄 Cambios Realizados
┌─────────────────────────┐
│ HORARIOS                │
│ [8:00, 20:00] → [9:00]  │
└─────────────────────────┘
```

### 3. Deleted Event (🔴 Red)
**When:** Patient deletes a medication

**Display:**
- Red circular icon with trash
- "Patient Name eliminó 'Medication Name'"
- Full medication snapshot (final state before deletion)
- No change diff section

**Example:**
```
[🔴] Ana Martínez eliminó
     "Ibuprofeno"
     ⏰ Ayer a las 3:45 PM
```

## Change Diff Display

The change diff section shows what fields were modified in an update event:

### Visual Format
```
FIELD NAME
┌─────────────┐    ┌─────────────┐
│ Old Value   │ →  │ New Value   │
│ (Red bg)    │    │ (Green bg)  │
└─────────────┘    └─────────────┘
```

### Supported Fields
- **Nombre:** Medication name
- **Valor de dosis:** Dose value (e.g., 500 → 750)
- **Unidad:** Dose unit (e.g., mg → g)
- **Tipo:** Quantity type (e.g., Tablets → Capsules)
- **Horarios:** Schedule times (e.g., [8:00, 20:00] → [9:00])
- **Frecuencia:** Frequency (e.g., Diario → Cada 2 días)
- **Icono:** Emoji icon (e.g., 💊 → 💉)
- **Cantidad actual:** Current inventory
- **Umbral bajo:** Low quantity threshold
- **Seguimiento de inventario:** Tracking enabled/disabled

## Medication Snapshot

Shows complete medication information at the time of the event:

### Fields Displayed
1. **Icono:** Emoji representation
2. **Nombre:** Medication name
3. **Dosis:** Dose value + unit (e.g., "500 mg")
4. **Tipo:** Quantity type (e.g., "Tablets")
5. **Horarios:** Scheduled times (e.g., "8:00, 14:00, 20:00")
6. **Frecuencia:** Frequency description
7. **Inventario:** Current quantity (if tracking enabled)
8. **Umbral bajo:** Low quantity threshold (if tracking enabled)

### Conditional Display
- Inventory fields only shown if `trackInventory: true`
- Legacy dosage field shown if present
- Custom quantity types displayed as-is

## Patient Contact Information

Provides context about the patient who performed the action:

### Fields Displayed
1. **👤 Nombre:** Patient's full name
2. **📧 Email:** Patient's email address
3. **📊 Adherencia:** Medication adherence percentage (if available)
4. **⏰ Última dosis:** Time since last dose taken (if available)

## Action Buttons

### 1. Ver Medicamentos (View Medications)
**Purpose:** Navigate to patient's full medication list

**Behavior:**
- Tapping opens the patient's medication list screen
- Shows all active medications for the patient
- Allows viewing medication details
- Can return to event detail via back button

**Route:** `/caregiver/medications/[patientId]`

### 2. Contactar Paciente (Contact Patient)
**Purpose:** Initiate communication with the patient

**Behavior:**
- Tapping opens a dialog with contact options
- Currently supports email contact
- Opens default email client with patient's email pre-filled
- Future: Could add phone, SMS, in-app messaging

**Dialog Options:**
```
Contactar Paciente
¿Cómo deseas contactar a [Patient Name]?

[Email]  [Cancelar]
```

## Navigation Flow

### Entry Points
1. **From Event Registry:**
   - Tap any event card in the registry
   - Navigates to detail view with event ID

2. **From Push Notification:**
   - Tap notification about medication change
   - Deep links to specific event detail

### Exit Points
1. **Back Button:**
   - Returns to event registry
   - Preserves scroll position

2. **View Medications Button:**
   - Navigates to patient's medication list
   - Can navigate back to event detail

3. **System Back Gesture:**
   - Swipe from left edge (iOS)
   - Back button (Android)

## Loading States

### Initial Load
```
┌─────────────────────────────────┐
│                                 │
│         ⏳ Loading...           │
│    Cargando evento...           │
│                                 │
└─────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────┐
│         ⚠️ Error               │
│                                 │
│    Error al cargar el evento    │
│                                 │
│      [Volver]                   │
└─────────────────────────────────┘
```

## Accessibility Features

### Screen Reader Support
- Event header announces: "Patient Name action Medication Name time ago"
- Change items announce: "Field changed from old value to new value"
- Action buttons have descriptive labels and hints

### Touch Targets
- All buttons meet minimum 44x44 dp size
- Adequate spacing between interactive elements

### Visual Clarity
- High contrast text colors
- Clear visual hierarchy
- Icon + text labels for all sections

## Use Cases

### 1. Reviewing Recent Changes
**Scenario:** Caregiver wants to see what medication changes a patient made today

**Steps:**
1. Open event registry
2. Filter by patient and date (today)
3. Tap event to view details
4. Review change diff to see modifications
5. Contact patient if needed

### 2. Verifying Medication Setup
**Scenario:** Patient reports setting up a new medication, caregiver wants to verify

**Steps:**
1. Open event registry
2. Look for "created" event for that medication
3. Tap to view details
4. Review medication snapshot for accuracy
5. Navigate to medication list if changes needed

### 3. Investigating Deletion
**Scenario:** Caregiver notices a medication was deleted, wants to understand why

**Steps:**
1. Open event registry
2. Find "deleted" event
3. Tap to view details
4. Review final medication state
5. Contact patient to discuss

### 4. Monitoring Adherence
**Scenario:** Caregiver wants to check patient's medication management activity

**Steps:**
1. Open event registry
2. Review all events for patient
3. Tap events to see details
4. Check patient adherence in contact section
5. Reach out if adherence is low

## Best Practices

### For Caregivers
1. **Regular Review:** Check event registry daily for patient changes
2. **Verify Changes:** Review update events to ensure correct modifications
3. **Prompt Communication:** Contact patients about concerning changes
4. **Context Awareness:** Use medication snapshot to understand full picture

### For Developers
1. **Data Validation:** Ensure all event data is complete before display
2. **Error Handling:** Gracefully handle missing or malformed data
3. **Performance:** Optimize Firestore queries for fast loading
4. **Accessibility:** Maintain comprehensive accessibility labels

## Troubleshooting

### Event Not Loading
**Symptoms:** Loading spinner doesn't disappear, or error message appears

**Possible Causes:**
- Network connectivity issues
- Event doesn't exist in Firestore
- Caregiver doesn't have permission to view event
- Firestore service unavailable

**Solutions:**
1. Check network connection
2. Verify event ID is correct
3. Confirm caregiver-patient relationship
4. Retry loading

### Patient Information Missing
**Symptoms:** Patient contact section shows "N/A" or is empty

**Possible Causes:**
- Patient document not found
- Patient not assigned to caregiver
- Incomplete patient data

**Solutions:**
1. Verify patient exists in Firestore
2. Check caregiverId matches
3. Update patient document with missing fields

### Navigation Not Working
**Symptoms:** "Ver Medicamentos" button doesn't navigate

**Possible Causes:**
- Patient ID missing from event
- Route doesn't exist
- Navigation error

**Solutions:**
1. Check event has valid patientId
2. Verify route exists at `/caregiver/medications/[patientId]`
3. Check console for navigation errors

## Technical Details

### Data Flow
```
Event Registry → Tap Event Card → Event Detail Screen
                                        ↓
                                  Load Event Data
                                        ↓
                                  Load Patient Data
                                        ↓
                                  Render Components
```

### Firestore Queries
1. **Event Data:** `getDoc(doc(db, 'medicationEvents', eventId))`
2. **Patient Data:** `query(collection(db, 'patients'), where('caregiverId', '==', userId))`

### State Management
- Local state with `useState` hooks
- Real-time updates via Firestore listeners
- Error and loading states managed separately

## Related Documentation
- [Event Registry UI Guide](./EVENT_REGISTRY_UI_GUIDE.md)
- [Event Filtering Guide](./EVENT_FILTERING_GUIDE.md)
- [Medication Event Service Guide](../../src/services/MEDICATION_EVENT_SERVICE_GUIDE.md)
- [Task 17 Implementation Summary](./TASK17_IMPLEMENTATION_SUMMARY.md)
