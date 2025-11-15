// User types
export interface User {
  id: string;
  email: string;
  role: 'patient' | 'caregiver';
  name: string;
  createdAt: Date | string; // Can be Date object or ISO string after Firestore conversion
  patients?: string[];
}

// Medication types
export interface Medication {
  id: string;
  name: string;
  // New fields for separated dose and quantity
  doseValue?: string;        // Numeric value only (e.g., "500", "10", "0.5")
  doseUnit?: string;          // Unit (e.g., "mg", "ml", "g", "mcg")
  quantityType?: string;       // Form factor (e.g., "Tablets", "Capsules", "Liquid")
  isCustomQuantityType?: boolean; // Flag for custom quantity types
  // Legacy field for backward compatibility
  dosage?: string;
  frequency: string;
  times: string[];
  patientId: string;
  caregiverId: string;
  createdAt: Date | string; // Can be Date object or ISO string after Firestore conversion
  updatedAt: Date | string; // Can be Date object or ISO string after Firestore conversion
  
  // Wizard redesign fields
  emoji?: string; // Emoji icon for visual identification
  nativeAlarmIds?: string[]; // Platform-specific alarm identifiers
  
  // Inventory tracking fields
  trackInventory: boolean;
  currentQuantity?: number;
  initialQuantity?: number;
  lowQuantityThreshold?: number;
  lastRefillDate?: Date | string;
}

// Dose units enumeration with Spanish labels
export const DOSE_UNITS = [
  { id: 'mg', label: 'mg (miligramos)' },
  { id: 'g', label: 'g (gramos)' },
  { id: 'mcg', label: 'mcg (microgramos)' },
  { id: 'ml', label: 'ml (mililitros)' },
  { id: 'l', label: 'l (litros)' },
  { id: 'units', label: 'unidades' },
  { id: 'drops', label: 'gotas' },
  { id: 'sprays', label: 'sprays' },
  { id: 'puffs', label: 'inhalaciones' },
  { id: 'inhalations', label: 'inhalaciones' },
  { id: 'applications', label: 'aplicaciones' },
  { id: 'custom', label: 'Unidad personalizada' }
] as const;

// Type definitions for dose units
export type DoseUnitId = typeof DOSE_UNITS[number]['id'];
export type DoseUnit = typeof DOSE_UNITS[number];

// Quantity types enumeration with Spanish labels
export const QUANTITY_TYPES = [
  { id: 'tablets', label: 'Tabletas', icon: 'medkit-outline' },
  { id: 'capsules', label: 'Cápsulas', icon: 'medkit-outline' },
  { id: 'liquid', label: 'Líquido', icon: 'flask-outline' },
  { id: 'cream', label: 'Crema', icon: 'color-wand-outline' },
  { id: 'inhaler', label: 'Inhalador', icon: 'wind-outline' },
  { id: 'drops', label: 'Gotas', icon: 'water-outline' },
  { id: 'spray', label: 'Spray', icon: 'snow-outline' },
  { id: 'other', label: 'Otro', icon: 'help-circle-outline' }
] as const;

// Type definitions for quantity types
export type QuantityTypeId = typeof QUANTITY_TYPES[number]['id'];
export type QuantityType = typeof QUANTITY_TYPES[number];

// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  patientId: string;
  caregiverId: string;
  completed: boolean;
  dueDate: Date | string; // Can be Date object or ISO string after Firestore conversion
  createdAt: Date | string; // Can be Date object or ISO string after Firestore conversion
}

// Report types
export interface Report {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string; // e.g., 'pdf', 'image/jpeg'
  patientId: string;
  caregiverId: string;
  createdAt: Date | string;
}

// Audit Log types
export interface AuditLog {
  id: string;
  action: string; // e.g., "Medication 'Aspirin' taken by John"
  timestamp: Date | string;
  userId: string; // ID of the user who performed the action (patient or caregiver)
  caregiverId: string; // To scope the logs to the caregiver
}

// BLE device types
export interface PillboxDevice {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel?: number;
  lastSeen: Date | string; // Can be Date object or ISO string after Firestore conversion
}

// Medication intake types
export enum IntakeStatus {
  PENDING = 'pending',
  TAKEN = 'taken',
  MISSED = 'missed'
}

export interface IntakeRecord {
  id: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date | string; // Can be Date object or ISO string after Firestore conversion
  status: IntakeStatus;
  patientId: string;
  takenAt?: Date | string; // Can be Date object or ISO string after Firestore conversion
  // Optional linkage to the medication document for enrichment
  medicationId?: string;
  // New fields for duplicate prevention and device tracking
  completionToken?: string; // Unique token: `${medicationId}-${scheduledTime.getTime()}`
  deviceSource?: 'manual' | 'pillbox'; // Source of intake recording
  caregiverId?: string; // Caregiver ID for scoping
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Patient types for caregiver dashboard
export interface Patient {
  /** Unique identifier for the patient document in Firestore */
  id: string;
  /** Full name of the patient */
  name: string;
  /** Email address of the patient */
  email: string;
  /** Optional ID of the linked pillbox device */
  deviceId?: string;
  /** Required field: ID of the caregiver user assigned to this patient.
   *  This field is essential for the caregiver dashboard query to work properly.
   *  It links the patient to their assigned caregiver and is used in Firestore queries
   *  with where('caregiverId', '==', user.id) to fetch only the patients assigned
   *  to the currently logged-in caregiver. */
  caregiverId: string;
  /** Timestamp when the patient record was created. Can be Date object or ISO string after Firestore conversion */
  createdAt: Date | string;
  /** Optional medication adherence percentage (0-100) */
  adherence?: number;
  /** Optional human-readable string indicating when the last medication dose was taken */
  lastTaken?: string;
}

// Device state for real-time monitoring
export interface DeviceState {
  is_online: boolean;
  battery_level: number;
  current_status: 'PENDING' | 'ALARM_SOUNDING' | 'DOSE_TAKEN' | 'DOSE_MISSED';
  last_event_at?: number;
}

// Dose segment for DoseRing component
export interface DoseSegment {
  startHour: number;
  endHour: number;
  status: 'PENDING' | 'DOSE_TAKEN' | 'DOSE_MISSED';
}

// Patient with device state for dashboard
export interface PatientWithDevice extends Patient {
  deviceState?: DeviceState;
  doseSegments?: DoseSegment[];
}

// Device configuration types
export interface DeviceConfig {
  deviceId: string;
  alarmMode: 'off' | 'sound' | 'led' | 'both';
  ledIntensity: number; // 0-1023
  ledColor: {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
  };
  lastUpdated: Date | string;
  syncStatus?: 'synced' | 'pending' | 'error';
}

// Notification preferences types
export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  hierarchy: string[]; // ordered list of modalities
  customModalities: string[];
  lastUpdated: Date | string;
}

// Medication event types for caregiver notification system
export type MedicationEventType = 'created' | 'updated' | 'deleted';
export type EventSyncStatus = 'pending' | 'delivered' | 'failed';

export interface MedicationEventChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface MedicationEvent {
  id: string;
  eventType: MedicationEventType;
  medicationId: string;
  medicationName: string;
  medicationData: Partial<Medication>; // Snapshot of medication data
  patientId: string;
  patientName: string;
  caregiverId: string;
  timestamp: Date | string; // Can be Date object or ISO string after Firestore conversion
  syncStatus: EventSyncStatus;
  changes?: MedicationEventChange[]; // For update events, track what changed
}

// External module declarations
// (No external module declarations needed at this time)
