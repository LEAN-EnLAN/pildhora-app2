import { User } from '../types';

/**
 * Role-based permission utilities
 * 
 * Provides functions to check user permissions based on their role.
 * Used throughout the app to conditionally show/hide features.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

/**
 * Check if user can manage devices
 * 
 * Patients can manage their own device if they have one provisioned.
 * Caregivers can manage device connections but not device settings.
 * 
 * @param user - Current user object
 * @returns true if user can access device management features
 */
export function canManageDevices(user: User | null): boolean {
  if (!user) return false;
  
  // Patients can manage their device if they have one
  if (user.role === 'patient') {
    return !!user.deviceId;
  }
  
  // Caregivers cannot manage device settings (only patients can)
  return false;
}

/**
 * Check if user can see patient selection features
 * 
 * Only caregivers should see patient selection UI.
 * Patients manage their own data directly.
 * 
 * @param user - Current user object
 * @returns true if user should see patient selection features
 */
export function canSelectPatients(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'caregiver';
}

/**
 * Check if user can manage patient connections
 * 
 * Caregivers can connect to multiple patients.
 * Patients can see which caregivers are connected to them.
 * 
 * @param user - Current user object
 * @returns true if user can manage patient/caregiver connections
 */
export function canManageConnections(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'caregiver' || user.role === 'patient';
}

/**
 * Check if user owns a device
 * 
 * Only patients can own devices. Caregivers access devices through links.
 * 
 * @param user - Current user object
 * @returns true if user is a patient with a provisioned device
 */
export function ownsDevice(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'patient' && !!user.deviceId;
}

/**
 * Check if user can modify device settings
 * 
 * Only device owners (patients) can modify device configuration.
 * Caregivers have read-only access to device state.
 * 
 * @param user - Current user object
 * @returns true if user can modify device settings
 */
export function canModifyDeviceSettings(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'patient' && !!user.deviceId;
}

/**
 * Check if user can view device state
 * 
 * Both patients (device owners) and caregivers (through links) can view device state.
 * 
 * @param user - Current user object
 * @returns true if user can view device state
 */
export function canViewDeviceState(user: User | null): boolean {
  if (!user) return false;
  
  // Patients can view their device state
  if (user.role === 'patient' && user.deviceId) {
    return true;
  }
  
  // Caregivers can view device state for linked patients
  if (user.role === 'caregiver') {
    return true;
  }
  
  return false;
}

/**
 * Get appropriate home route for user role
 * 
 * Returns the correct home screen path based on user role.
 * 
 * @param user - Current user object
 * @returns Home route path
 */
export function getHomeRoute(user: User | null): string {
  if (!user) return '/auth/login';
  
  return user.role === 'patient' ? '/patient/home' : '/caregiver/dashboard';
}

/**
 * Get appropriate settings route for user role
 * 
 * Returns the correct settings screen path based on user role.
 * 
 * @param user - Current user object
 * @returns Settings route path
 */
export function getSettingsRoute(user: User | null): string {
  if (!user) return '/auth/login';
  
  return user.role === 'patient' ? '/patient/settings' : '/caregiver/settings';
}

/**
 * Check if user should see medication management UI
 * 
 * Patients in autonomous mode (no device or offline device) can manage medications.
 * Caregivers can always manage medications for their patients.
 * Patients in caregiving mode (online device) cannot manage medications.
 * 
 * @param user - Current user object
 * @param deviceOnline - Whether the patient's device is online (optional)
 * @returns true if user should see medication management UI
 */
export function canManageMedications(user: User | null, deviceOnline?: boolean): boolean {
  if (!user) return false;
  
  // Caregivers can always manage medications
  if (user.role === 'caregiver') {
    return true;
  }
  
  // Patients can manage medications only in autonomous mode
  if (user.role === 'patient') {
    // If device is online, patient is in caregiving mode (caregiver manages meds)
    if (deviceOnline) {
      return false;
    }
    // If no device or device offline, patient is in autonomous mode
    return true;
  }
  
  return false;
}
