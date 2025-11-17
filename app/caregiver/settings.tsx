import React from 'react';
import { RoleBasedSettings } from '../../src/components/shared/RoleBasedSettings';

/**
 * Caregiver settings screen
 * 
 * Uses the shared RoleBasedSettings component which automatically
 * renders the caregiver variant based on the user's role.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5
 */
export default function CaregiverSettings() {
  return <RoleBasedSettings />;
}
