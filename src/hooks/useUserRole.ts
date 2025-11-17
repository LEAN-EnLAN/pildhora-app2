import { useSelector } from 'react-redux';
import { RootState } from '../store';

/**
 * Hook to get the current user's role from auth state
 * 
 * Returns the user's role ('patient' | 'caregiver') or null if not authenticated.
 * This hook is used throughout the app to determine which UI variant to show.
 * 
 * @example
 * ```typescript
 * const { role, isPatient, isCaregiver, user } = useUserRole();
 * 
 * if (isPatient) {
 *   return <PatientView />;
 * } else if (isCaregiver) {
 *   return <CaregiverView />;
 * }
 * ```
 */
export function useUserRole() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return {
    /** User's role ('patient' | 'caregiver') or null if not authenticated */
    role: user?.role || null,
    /** Whether the user is a patient */
    isPatient: user?.role === 'patient',
    /** Whether the user is a caregiver */
    isCaregiver: user?.role === 'caregiver',
    /** Full user object */
    user,
  };
}
