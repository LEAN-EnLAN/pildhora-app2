import { getDbInstance } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';

/**
 * OnboardingAnalytics Service
 * 
 * Tracks user onboarding metrics for both patient device provisioning
 * and caregiver device connection flows.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 * 
 * Metrics tracked:
 * - Wizard step completion rates
 * - Wizard abandonment points
 * - Time spent on each step
 * - Device provisioning success rate
 * - Connection code usage metrics
 * - Error occurrences by type
 */

/**
 * Event types for onboarding analytics
 */
export enum OnboardingEventType {
  // Wizard navigation events
  WIZARD_STARTED = 'wizard_started',
  STEP_ENTERED = 'step_entered',
  STEP_COMPLETED = 'step_completed',
  STEP_ABANDONED = 'step_abandoned',
  WIZARD_COMPLETED = 'wizard_completed',
  WIZARD_ABANDONED = 'wizard_abandoned',
  
  // Device provisioning events
  DEVICE_VALIDATION_STARTED = 'device_validation_started',
  DEVICE_VALIDATION_SUCCESS = 'device_validation_success',
  DEVICE_VALIDATION_FAILED = 'device_validation_failed',
  DEVICE_PROVISIONING_SUCCESS = 'device_provisioning_success',
  DEVICE_PROVISIONING_FAILED = 'device_provisioning_failed',
  
  // Connection code events
  CONNECTION_CODE_GENERATED = 'connection_code_generated',
  CONNECTION_CODE_VALIDATION_STARTED = 'connection_code_validation_started',
  CONNECTION_CODE_VALIDATION_SUCCESS = 'connection_code_validation_success',
  CONNECTION_CODE_VALIDATION_FAILED = 'connection_code_validation_failed',
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_FAILED = 'connection_failed',
  
  // Error events
  ERROR_OCCURRED = 'error_occurred',
}

/**
 * User flow types
 */
export enum OnboardingFlowType {
  PATIENT_PROVISIONING = 'patient_provisioning',
  CAREGIVER_CONNECTION = 'caregiver_connection',
}

/**
 * Wizard step identifiers
 */
export enum WizardStep {
  // Patient provisioning steps
  WELCOME = 'welcome',
  DEVICE_ID_ENTRY = 'device_id_entry',
  DEVICE_VERIFICATION = 'device_verification',
  WIFI_CONFIG = 'wifi_config',
  PREFERENCES = 'preferences',
  COMPLETION = 'completion',
  
  // Caregiver connection steps
  CODE_ENTRY = 'code_entry',
  PATIENT_INFO = 'patient_info',
  CONNECTION_CONFIRM = 'connection_confirm',
  CONNECTION_SUCCESS = 'connection_success',
}

/**
 * Analytics event data structure
 */
export interface OnboardingAnalyticsEvent {
  // Event identification
  eventType: OnboardingEventType;
  flowType: OnboardingFlowType;
  userId: string;
  
  // Step information (for step-related events)
  step?: WizardStep;
  stepIndex?: number;
  
  // Timing information
  timestamp: Timestamp;
  timeSpentMs?: number; // Time spent on step or in wizard
  
  // Error information (for error events)
  errorCode?: string;
  errorMessage?: string;
  
  // Additional context
  metadata?: Record<string, any>;
  
  // Session tracking
  sessionId?: string;
}

/**
 * Session tracking for measuring time spent
 */
interface AnalyticsSession {
  sessionId: string;
  userId: string;
  flowType: OnboardingFlowType;
  startTime: number;
  currentStep?: WizardStep;
  stepStartTime?: number;
}

// In-memory session storage (could be moved to AsyncStorage for persistence)
const activeSessions = new Map<string, AnalyticsSession>();

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create analytics session
 */
function getOrCreateSession(
  userId: string,
  flowType: OnboardingFlowType
): AnalyticsSession {
  const existingSession = activeSessions.get(userId);
  
  if (existingSession && existingSession.flowType === flowType) {
    return existingSession;
  }
  
  const newSession: AnalyticsSession = {
    sessionId: generateSessionId(),
    userId,
    flowType,
    startTime: Date.now(),
  };
  
  activeSessions.set(userId, newSession);
  return newSession;
}

/**
 * Clear analytics session
 */
function clearSession(userId: string): void {
  activeSessions.delete(userId);
}

/**
 * Track analytics event to Firestore
 */
async function trackEvent(event: Omit<OnboardingAnalyticsEvent, 'timestamp'>): Promise<void> {
  try {
    const db = await getDbInstance();
    
    if (!db) {
      console.error('[OnboardingAnalytics] Firestore not initialized');
      return;
    }
    
    const analyticsCollection = collection(db, 'onboardingAnalytics');
    
    await addDoc(analyticsCollection, {
      ...event,
      timestamp: serverTimestamp(),
    });
    
    console.log('[OnboardingAnalytics] Event tracked:', event.eventType);
  } catch (error) {
    // Don't throw errors for analytics - just log them
    console.error('[OnboardingAnalytics] Error tracking event:', error);
  }
}

/**
 * Track wizard start
 * 
 * Requirements: 9.1, 9.2
 */
export async function trackWizardStarted(
  userId: string,
  flowType: OnboardingFlowType,
  metadata?: Record<string, any>
): Promise<void> {
  const session = getOrCreateSession(userId, flowType);
  
  await trackEvent({
    eventType: OnboardingEventType.WIZARD_STARTED,
    flowType,
    userId,
    sessionId: session.sessionId,
    metadata,
  });
}

/**
 * Track step entry
 * 
 * Requirements: 9.2, 9.3
 */
export async function trackStepEntered(
  userId: string,
  flowType: OnboardingFlowType,
  step: WizardStep,
  stepIndex: number,
  metadata?: Record<string, any>
): Promise<void> {
  const session = getOrCreateSession(userId, flowType);
  
  // Update session with current step
  session.currentStep = step;
  session.stepStartTime = Date.now();
  
  await trackEvent({
    eventType: OnboardingEventType.STEP_ENTERED,
    flowType,
    userId,
    step,
    stepIndex,
    sessionId: session.sessionId,
    metadata,
  });
}

/**
 * Track step completion
 * 
 * Requirements: 9.2, 9.3
 */
export async function trackStepCompleted(
  userId: string,
  flowType: OnboardingFlowType,
  step: WizardStep,
  stepIndex: number,
  metadata?: Record<string, any>
): Promise<void> {
  const session = activeSessions.get(userId);
  
  if (!session) {
    console.warn('[OnboardingAnalytics] No active session for step completion');
    return;
  }
  
  // Calculate time spent on step
  const timeSpentMs = session.stepStartTime
    ? Date.now() - session.stepStartTime
    : undefined;
  
  await trackEvent({
    eventType: OnboardingEventType.STEP_COMPLETED,
    flowType,
    userId,
    step,
    stepIndex,
    timeSpentMs,
    sessionId: session.sessionId,
    metadata,
  });
}

/**
 * Track step abandonment
 * 
 * Requirements: 9.2, 9.3
 */
export async function trackStepAbandoned(
  userId: string,
  flowType: OnboardingFlowType,
  step: WizardStep,
  stepIndex: number,
  metadata?: Record<string, any>
): Promise<void> {
  const session = activeSessions.get(userId);
  
  if (!session) {
    return;
  }
  
  // Calculate time spent on step before abandoning
  const timeSpentMs = session.stepStartTime
    ? Date.now() - session.stepStartTime
    : undefined;
  
  await trackEvent({
    eventType: OnboardingEventType.STEP_ABANDONED,
    flowType,
    userId,
    step,
    stepIndex,
    timeSpentMs,
    sessionId: session.sessionId,
    metadata,
  });
}

/**
 * Track wizard completion
 * 
 * Requirements: 9.4, 9.5
 */
export async function trackWizardCompleted(
  userId: string,
  flowType: OnboardingFlowType,
  metadata?: Record<string, any>
): Promise<void> {
  const session = activeSessions.get(userId);
  
  if (!session) {
    console.warn('[OnboardingAnalytics] No active session for wizard completion');
    return;
  }
  
  // Calculate total time spent in wizard
  const timeSpentMs = Date.now() - session.startTime;
  
  await trackEvent({
    eventType: OnboardingEventType.WIZARD_COMPLETED,
    flowType,
    userId,
    timeSpentMs,
    sessionId: session.sessionId,
    metadata,
  });
  
  // Clear session after completion
  clearSession(userId);
}

/**
 * Track wizard abandonment
 * 
 * Requirements: 9.2, 9.3
 */
export async function trackWizardAbandoned(
  userId: string,
  flowType: OnboardingFlowType,
  currentStep?: WizardStep,
  currentStepIndex?: number,
  metadata?: Record<string, any>
): Promise<void> {
  const session = activeSessions.get(userId);
  
  if (!session) {
    return;
  }
  
  // Calculate total time spent before abandoning
  const timeSpentMs = Date.now() - session.startTime;
  
  await trackEvent({
    eventType: OnboardingEventType.WIZARD_ABANDONED,
    flowType,
    userId,
    step: currentStep,
    stepIndex: currentStepIndex,
    timeSpentMs,
    sessionId: session.sessionId,
    metadata,
  });
  
  // Clear session after abandonment
  clearSession(userId);
}

/**
 * Track device validation start
 * 
 * Requirements: 9.2
 */
export async function trackDeviceValidationStarted(
  userId: string,
  deviceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.DEVICE_VALIDATION_STARTED,
    flowType: OnboardingFlowType.PATIENT_PROVISIONING,
    userId,
    metadata: {
      ...metadata,
      deviceId,
    },
  });
}

/**
 * Track device validation success
 * 
 * Requirements: 9.2
 */
export async function trackDeviceValidationSuccess(
  userId: string,
  deviceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.DEVICE_VALIDATION_SUCCESS,
    flowType: OnboardingFlowType.PATIENT_PROVISIONING,
    userId,
    metadata: {
      ...metadata,
      deviceId,
    },
  });
}

/**
 * Track device validation failure
 * 
 * Requirements: 9.2
 */
export async function trackDeviceValidationFailed(
  userId: string,
  deviceId: string,
  errorCode: string,
  errorMessage: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.DEVICE_VALIDATION_FAILED,
    flowType: OnboardingFlowType.PATIENT_PROVISIONING,
    userId,
    errorCode,
    errorMessage,
    metadata: {
      ...metadata,
      deviceId,
    },
  });
}

/**
 * Track device provisioning success
 * 
 * Requirements: 9.4
 */
export async function trackDeviceProvisioningSuccess(
  userId: string,
  deviceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.DEVICE_PROVISIONING_SUCCESS,
    flowType: OnboardingFlowType.PATIENT_PROVISIONING,
    userId,
    metadata: {
      ...metadata,
      deviceId,
    },
  });
}

/**
 * Track device provisioning failure
 * 
 * Requirements: 9.4
 */
export async function trackDeviceProvisioningFailed(
  userId: string,
  deviceId: string,
  errorCode: string,
  errorMessage: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.DEVICE_PROVISIONING_FAILED,
    flowType: OnboardingFlowType.PATIENT_PROVISIONING,
    userId,
    errorCode,
    errorMessage,
    metadata: {
      ...metadata,
      deviceId,
    },
  });
}

/**
 * Track connection code generation
 * 
 * Requirements: 9.2
 */
export async function trackConnectionCodeGenerated(
  userId: string,
  code: string,
  expiresInHours: number,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.CONNECTION_CODE_GENERATED,
    flowType: OnboardingFlowType.PATIENT_PROVISIONING,
    userId,
    metadata: {
      ...metadata,
      codeLength: code.length,
      expiresInHours,
    },
  });
}

/**
 * Track connection code validation start
 * 
 * Requirements: 9.3
 */
export async function trackConnectionCodeValidationStarted(
  userId: string,
  code: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.CONNECTION_CODE_VALIDATION_STARTED,
    flowType: OnboardingFlowType.CAREGIVER_CONNECTION,
    userId,
    metadata: {
      ...metadata,
      codeLength: code.length,
    },
  });
}

/**
 * Track connection code validation success
 * 
 * Requirements: 9.3
 */
export async function trackConnectionCodeValidationSuccess(
  userId: string,
  code: string,
  patientId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.CONNECTION_CODE_VALIDATION_SUCCESS,
    flowType: OnboardingFlowType.CAREGIVER_CONNECTION,
    userId,
    metadata: {
      ...metadata,
      codeLength: code.length,
      patientId,
    },
  });
}

/**
 * Track connection code validation failure
 * 
 * Requirements: 9.3
 */
export async function trackConnectionCodeValidationFailed(
  userId: string,
  code: string,
  errorCode: string,
  errorMessage: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.CONNECTION_CODE_VALIDATION_FAILED,
    flowType: OnboardingFlowType.CAREGIVER_CONNECTION,
    userId,
    errorCode,
    errorMessage,
    metadata: {
      ...metadata,
      codeLength: code.length,
    },
  });
}

/**
 * Track connection establishment success
 * 
 * Requirements: 9.5
 */
export async function trackConnectionEstablished(
  userId: string,
  patientId: string,
  deviceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.CONNECTION_ESTABLISHED,
    flowType: OnboardingFlowType.CAREGIVER_CONNECTION,
    userId,
    metadata: {
      ...metadata,
      patientId,
      deviceId,
    },
  });
}

/**
 * Track connection establishment failure
 * 
 * Requirements: 9.5
 */
export async function trackConnectionFailed(
  userId: string,
  patientId: string,
  errorCode: string,
  errorMessage: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.CONNECTION_FAILED,
    flowType: OnboardingFlowType.CAREGIVER_CONNECTION,
    userId,
    errorCode,
    errorMessage,
    metadata: {
      ...metadata,
      patientId,
    },
  });
}

/**
 * Track error occurrence
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
export async function trackError(
  userId: string,
  flowType: OnboardingFlowType,
  errorCode: string,
  errorMessage: string,
  step?: WizardStep,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventType: OnboardingEventType.ERROR_OCCURRED,
    flowType,
    userId,
    step,
    errorCode,
    errorMessage,
    metadata,
  });
}

/**
 * Query analytics data (for reporting/dashboard)
 */
export interface AnalyticsQuery {
  flowType?: OnboardingFlowType;
  eventType?: OnboardingEventType;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Get analytics events based on query
 * 
 * Note: This is a basic implementation. For production, consider using
 * Firebase Analytics or a dedicated analytics platform for better querying.
 */
export async function getAnalyticsEvents(
  queryParams: AnalyticsQuery
): Promise<OnboardingAnalyticsEvent[]> {
  try {
    const db = await getDbInstance();
    
    if (!db) {
      console.error('[OnboardingAnalytics] Firestore not initialized');
      return [];
    }
    
    const analyticsCollection = collection(db, 'onboardingAnalytics');
    let q = query(analyticsCollection);
    
    // Apply filters
    if (queryParams.flowType) {
      q = query(q, where('flowType', '==', queryParams.flowType));
    }
    
    if (queryParams.eventType) {
      q = query(q, where('eventType', '==', queryParams.eventType));
    }
    
    if (queryParams.userId) {
      q = query(q, where('userId', '==', queryParams.userId));
    }
    
    if (queryParams.startDate) {
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(queryParams.startDate)));
    }
    
    if (queryParams.endDate) {
      q = query(q, where('timestamp', '<=', Timestamp.fromDate(queryParams.endDate)));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data()) as OnboardingAnalyticsEvent[];
  } catch (error) {
    console.error('[OnboardingAnalytics] Error querying events:', error);
    return [];
  }
}

/**
 * Default export
 */
export default {
  // Wizard tracking
  trackWizardStarted,
  trackStepEntered,
  trackStepCompleted,
  trackStepAbandoned,
  trackWizardCompleted,
  trackWizardAbandoned,
  
  // Device provisioning tracking
  trackDeviceValidationStarted,
  trackDeviceValidationSuccess,
  trackDeviceValidationFailed,
  trackDeviceProvisioningSuccess,
  trackDeviceProvisioningFailed,
  
  // Connection code tracking
  trackConnectionCodeGenerated,
  trackConnectionCodeValidationStarted,
  trackConnectionCodeValidationSuccess,
  trackConnectionCodeValidationFailed,
  trackConnectionEstablished,
  trackConnectionFailed,
  
  // Error tracking
  trackError,
  
  // Querying
  getAnalyticsEvents,
};
