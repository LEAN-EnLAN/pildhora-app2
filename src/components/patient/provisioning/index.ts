/**
 * Device Provisioning Wizard Components
 * 
 * This module exports all components related to the device provisioning wizard.
 * The wizard guides new patients through setting up their medication dispenser device.
 * 
 * Main Components:
 * - DeviceProvisioningWizard: Main wizard container with step navigation
 * - WizardProgressIndicator: Visual progress indicator
 * - ExitConfirmationDialog: Confirmation dialog for exiting wizard
 * 
 * Context:
 * - WizardProvider: Context provider for wizard state
 * - useWizardContext: Hook to access wizard context
 * 
 * Usage:
 * ```typescript
 * import { DeviceProvisioningWizard } from '@/components/patient/provisioning';
 * 
 * <DeviceProvisioningWizard
 *   userId={user.id}
 *   onComplete={handleComplete}
 *   onCancel={handleCancel}
 * />
 * ```
 */

export { DeviceProvisioningWizard } from './DeviceProvisioningWizard';
export type { 
  DeviceProvisioningWizardProps, 
  DeviceProvisioningFormData 
} from './DeviceProvisioningWizard';

export { WizardProgressIndicator } from './WizardProgressIndicator';
export type { WizardProgressIndicatorProps } from './WizardProgressIndicator';

export { ExitConfirmationDialog } from './ExitConfirmationDialog';
export type { ExitConfirmationDialogProps } from './ExitConfirmationDialog';

export { WizardProvider, useWizardContext } from './WizardContext';
export type { WizardContextValue } from './WizardContext';
