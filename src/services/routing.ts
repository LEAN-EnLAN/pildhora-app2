import { User } from '../types';
import { needsOnboarding } from './onboarding';

/**
 * RoutingService Error Class
 * 
 * Custom error class for routing-related errors with user-friendly messages.
 */
export class RoutingError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'RoutingError';
  }
}

/**
 * RoutingService Interface
 * 
 * Provides methods for determining post-authentication navigation routes
 * based on user role and onboarding status.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
export interface RoutingService {
  getPostAuthRoute(user: User): Promise<string>;
  hasCompletedSetup(user: User): Promise<boolean>;
}

/**
 * Validate user object
 */
function validateUser(user: User): void {
  if (!user) {
    throw new RoutingError(
      'User object is null or undefined',
      'INVALID_USER',
      'Error de autenticación. Por favor, inicia sesión nuevamente.'
    );
  }

  if (!user.id || typeof user.id !== 'string') {
    throw new RoutingError(
      'User ID is missing or invalid',
      'INVALID_USER_ID',
      'Error de autenticación. Por favor, inicia sesión nuevamente.'
    );
  }

  if (!user.role || (user.role !== 'patient' && user.role !== 'caregiver')) {
    throw new RoutingError(
      `Invalid user role: ${user.role}`,
      'INVALID_USER_ROLE',
      'Rol de usuario no válido. Por favor, contacta al soporte.'
    );
  }
}

/**
 * Get post-authentication route
 * 
 * Determines where to route a user after successful authentication based on
 * their role and onboarding status.
 * 
 * Routing logic:
 * - Patients without devices → /patient/device-provisioning
 * - Caregivers without links → /caregiver/device-connection
 * - Patients with devices → /patient/home
 * - Caregivers with links → /caregiver/dashboard
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 * 
 * @param user - The authenticated user object
 * @returns Promise<string> - The route path to navigate to
 * 
 * @example
 * ```typescript
 * const route = await getPostAuthRoute(user);
 * router.push(route);
 * ```
 */
export async function getPostAuthRoute(user: User): Promise<string> {
  console.log('[RoutingService] getPostAuthRoute called', {
    userId: user?.id,
    role: user?.role,
    onboardingComplete: user?.onboardingComplete
  });

  try {
    // Validate user object
    validateUser(user);

    // Check if user has completed onboarding
    if (!user.onboardingComplete) {
      console.log('[RoutingService] User has not completed onboarding');

      // Check if user needs onboarding based on role
      const needsSetup = await needsOnboarding(user.id, user.role);

      if (needsSetup) {
        // Route to appropriate onboarding flow
        if (user.role === 'patient') {
          // Requirement 9.2: Route patients without devices to provisioning wizard
          if (!user.deviceId) {
            console.log('[RoutingService] Routing patient to device provisioning');
            return '/patient/device-provisioning';
          }
        } else if (user.role === 'caregiver') {
          // Requirement 9.3: Route caregivers without links to connection interface
          const hasDeviceLinks = user.patients && user.patients.length > 0;
          if (!hasDeviceLinks) {
            console.log('[RoutingService] Routing caregiver to device connection');
            return '/caregiver/device-connection';
          }
        }
      }
    }

    // User has completed setup, route to home/dashboard
    // Requirement 9.4, 9.5: Route completed users to their home/dashboard
    if (user.role === 'patient') {
      console.log('[RoutingService] Routing patient to home');
      return '/patient/home';
    } else if (user.role === 'caregiver') {
      console.log('[RoutingService] Routing caregiver to dashboard');
      return '/caregiver/dashboard';
    }

    // Fallback (should not reach here due to validation)
    throw new RoutingError(
      `Unable to determine route for user role: ${user.role}`,
      'UNKNOWN_ROUTE',
      'No se pudo determinar la ruta. Por favor, contacta al soporte.'
    );

  } catch (error: any) {
    console.error('[RoutingService] getPostAuthRoute failed:', {
      code: error.code,
      message: error.message
    });

    // Re-throw RoutingError as-is
    if (error instanceof RoutingError) {
      throw error;
    }

    // Wrap other errors
    throw new RoutingError(
      `Failed to determine post-auth route: ${error.message}`,
      'ROUTING_ERROR',
      'Ocurrió un error al determinar la ruta. Por favor, intenta nuevamente.'
    );
  }
}

/**
 * Check if user has completed setup
 * 
 * Determines if a user has finished all required onboarding steps
 * based on their role.
 * 
 * For patients: checks if they have a device linked
 * For caregivers: checks if they have any device connections
 * 
 * Requirements: 9.1, 9.2, 9.3
 * 
 * @param user - The user object to check
 * @returns Promise<boolean> - true if setup is complete, false otherwise
 * 
 * @example
 * ```typescript
 * const isComplete = await hasCompletedSetup(user);
 * if (!isComplete) {
 *   // Show onboarding prompt
 * }
 * ```
 */
export async function hasCompletedSetup(user: User): Promise<boolean> {
  console.log('[RoutingService] hasCompletedSetup called', {
    userId: user?.id,
    role: user?.role,
    onboardingComplete: user?.onboardingComplete
  });

  try {
    // Validate user object
    validateUser(user);

    // If onboarding is marked as complete, return true
    if (user.onboardingComplete) {
      console.log('[RoutingService] Onboarding marked as complete');
      return true;
    }

    // Check if user needs onboarding based on role
    const needsSetup = await needsOnboarding(user.id, user.role);

    // If user doesn't need onboarding, they've completed setup
    const isComplete = !needsSetup;
    console.log('[RoutingService] Setup completion status:', isComplete);
    return isComplete;

  } catch (error: any) {
    console.error('[RoutingService] hasCompletedSetup failed:', {
      code: error.code,
      message: error.message
    });

    // Re-throw RoutingError as-is
    if (error instanceof RoutingError) {
      throw error;
    }

    // Wrap other errors
    throw new RoutingError(
      `Failed to check setup completion: ${error.message}`,
      'SETUP_CHECK_ERROR',
      'Ocurrió un error al verificar el estado de configuración. Por favor, intenta nuevamente.'
    );
  }
}

/**
 * Default export of routing service methods
 */
export default {
  getPostAuthRoute,
  hasCompletedSetup
};
