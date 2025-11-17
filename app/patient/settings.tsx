import React from 'react';
import { RoleBasedSettings } from '../../src/components/shared/RoleBasedSettings';

/**
 * Patient settings screen
 * 
 * Uses the shared RoleBasedSettings component which automatically
 * renders the patient variant based on the user's role.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export default function PatientSettings() {
  return <RoleBasedSettings />;
}
