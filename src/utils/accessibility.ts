/**
 * Accessibility Utilities
 * 
 * Provides comprehensive accessibility features including:
 * - Haptic feedback for interactions
 * - Screen reader announcements
 * - High contrast mode detection
 * - Keyboard navigation helpers
 * - Touch target size validation
 */

import { Platform, AccessibilityInfo, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

// Minimum touch target size (44x44 dp) as per WCAG guidelines
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Haptic Feedback Types
 */
export enum HapticFeedbackType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection',
}

/**
 * Trigger haptic feedback
 * Provides tactile feedback for user interactions
 */
export async function triggerHapticFeedback(type: HapticFeedbackType): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      switch (type) {
        case HapticFeedbackType.LIGHT:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticFeedbackType.MEDIUM:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticFeedbackType.HEAVY:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticFeedbackType.SUCCESS:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticFeedbackType.WARNING:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticFeedbackType.ERROR:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case HapticFeedbackType.SELECTION:
          await Haptics.selectionAsync();
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else if (Platform.OS === 'android') {
      // Android haptic feedback using Vibration API
      switch (type) {
        case HapticFeedbackType.LIGHT:
          Vibration.vibrate(10);
          break;
        case HapticFeedbackType.MEDIUM:
          Vibration.vibrate(20);
          break;
        case HapticFeedbackType.HEAVY:
          Vibration.vibrate(40);
          break;
        case HapticFeedbackType.SUCCESS:
          Vibration.vibrate([0, 10, 50, 10]);
          break;
        case HapticFeedbackType.WARNING:
          Vibration.vibrate([0, 20, 100, 20]);
          break;
        case HapticFeedbackType.ERROR:
          Vibration.vibrate([0, 30, 100, 30, 100, 30]);
          break;
        case HapticFeedbackType.SELECTION:
          Vibration.vibrate(5);
          break;
        default:
          Vibration.vibrate(20);
      }
    }
  } catch (error) {
    console.warn('[Accessibility] Haptic feedback failed:', error);
  }
}

/**
 * Announce message to screen reader
 * Uses AccessibilityInfo to make announcements for screen reader users
 */
export function announceForAccessibility(message: string): void {
  try {
    AccessibilityInfo.announceForAccessibility(message);
  } catch (error) {
    console.warn('[Accessibility] Screen reader announcement failed:', error);
  }
}

/**
 * Check if screen reader is enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.warn('[Accessibility] Failed to check screen reader status:', error);
    return false;
  }
}

/**
 * Check if reduce motion is enabled
 * Users with motion sensitivity can enable this setting
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    console.warn('[Accessibility] Failed to check reduce motion status:', error);
    return false;
  }
}

/**
 * Validate touch target size
 * Ensures interactive elements meet minimum size requirements
 */
export function validateTouchTargetSize(width: number, height: number): boolean {
  return width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE;
}

/**
 * Get accessible touch target style
 * Returns style object that ensures minimum touch target size
 */
export function getAccessibleTouchTargetStyle(currentWidth?: number, currentHeight?: number) {
  return {
    minWidth: Math.max(currentWidth || 0, MIN_TOUCH_TARGET_SIZE),
    minHeight: Math.max(currentHeight || 0, MIN_TOUCH_TARGET_SIZE),
  };
}

/**
 * High Contrast Mode Support
 * Provides color adjustments for high contrast mode
 */
export interface HighContrastColors {
  text: string;
  background: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
}

export const HIGH_CONTRAST_COLORS: HighContrastColors = {
  text: '#000000',
  background: '#FFFFFF',
  border: '#000000',
  primary: '#0000FF',
  success: '#008000',
  warning: '#FFA500',
  error: '#FF0000',
};

/**
 * Get high contrast color
 * Returns high contrast version of a color if high contrast mode is enabled
 */
export function getHighContrastColor(
  normalColor: string,
  highContrastColor: string,
  isHighContrastEnabled: boolean
): string {
  return isHighContrastEnabled ? highContrastColor : normalColor;
}

/**
 * Keyboard Navigation Helpers
 */
export interface KeyboardNavigationConfig {
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
}

/**
 * Handle keyboard navigation
 * Provides keyboard shortcuts for navigation
 */
export function handleKeyboardNavigation(
  key: string,
  config: KeyboardNavigationConfig
): boolean {
  switch (key) {
    case 'Tab':
      config.onNext?.();
      return true;
    case 'ShiftTab':
      config.onPrevious?.();
      return true;
    case 'Enter':
      config.onSubmit?.();
      return true;
    case 'Escape':
      config.onCancel?.();
      return true;
    default:
      return false;
  }
}

/**
 * ARIA Label Helpers
 */

/**
 * Generate descriptive label for wizard step
 */
export function getWizardStepLabel(
  currentStep: number,
  totalSteps: number,
  stepName: string
): string {
  return `Paso ${currentStep + 1} de ${totalSteps}: ${stepName}`;
}

/**
 * Generate descriptive label for progress indicator
 */
export function getProgressLabel(current: number, total: number, unit: string = 'items'): string {
  const percentage = Math.round((current / total) * 100);
  return `${current} de ${total} ${unit} completados (${percentage}%)`;
}

/**
 * Generate descriptive label for time
 */
export function getTimeLabel(time: string, use24Hour: boolean = true): string {
  if (use24Hour) {
    return `${time} horas`;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Generate descriptive label for medication dose
 */
export function getDoseLabel(
  medicationName: string,
  doseValue: string,
  doseUnit: string,
  scheduledTime: string
): string {
  return `${medicationName}, ${doseValue} ${doseUnit}, programado para las ${scheduledTime}`;
}

/**
 * Generate descriptive label for inventory status
 */
export function getInventoryLabel(
  currentQuantity: number,
  isLow: boolean,
  daysRemaining?: number
): string {
  let label = `${currentQuantity} dosis disponibles`;
  
  if (isLow) {
    label += ', cantidad baja';
  }
  
  if (daysRemaining !== undefined) {
    label += `, aproximadamente ${daysRemaining} días restantes`;
  }
  
  return label;
}

/**
 * Accessibility Event Tracking
 * Track accessibility-related events for analytics
 */
export interface AccessibilityEvent {
  type: 'haptic' | 'announcement' | 'navigation' | 'interaction';
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const accessibilityEvents: AccessibilityEvent[] = [];

export function trackAccessibilityEvent(
  type: AccessibilityEvent['type'],
  action: string,
  metadata?: Record<string, any>
): void {
  const event: AccessibilityEvent = {
    type,
    action,
    timestamp: new Date(),
    metadata,
  };
  
  accessibilityEvents.push(event);
  
  // Keep only last 100 events
  if (accessibilityEvents.length > 100) {
    accessibilityEvents.shift();
  }
  
  // Log for debugging
  if (__DEV__) {
    console.log('[Accessibility Event]', event);
  }
}

/**
 * Get accessibility events
 * Useful for debugging and analytics
 */
export function getAccessibilityEvents(): AccessibilityEvent[] {
  return [...accessibilityEvents];
}

/**
 * Clear accessibility events
 */
export function clearAccessibilityEvents(): void {
  accessibilityEvents.length = 0;
}

/**
 * Focus Management
 */

/**
 * Set focus to element (for web compatibility)
 */
export function setAccessibilityFocus(ref: any): void {
  try {
    if (Platform.OS === 'web' && ref?.current?.focus) {
      ref.current.focus();
    } else if (ref?.current?.setNativeProps) {
      // For React Native, we can use setNativeProps to trigger focus
      AccessibilityInfo.setAccessibilityFocus(ref.current);
    }
  } catch (error) {
    console.warn('[Accessibility] Failed to set focus:', error);
  }
}

/**
 * Accessibility Testing Helpers
 */

/**
 * Validate accessibility props
 */
export interface AccessibilityValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateAccessibilityProps(props: {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessible?: boolean;
}): AccessibilityValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for accessibility label
  if (!props.accessibilityLabel && props.accessible !== false) {
    warnings.push('Missing accessibilityLabel - screen readers may not describe this element properly');
  }
  
  // Check for accessibility role
  if (!props.accessibilityRole && props.accessible !== false) {
    warnings.push('Missing accessibilityRole - screen readers may not identify element type');
  }
  
  // Check label length
  if (props.accessibilityLabel && props.accessibilityLabel.length > 100) {
    warnings.push('accessibilityLabel is very long - consider making it more concise');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Export all accessibility utilities
 */
export default {
  triggerHapticFeedback,
  announceForAccessibility,
  isScreenReaderEnabled,
  isReduceMotionEnabled,
  validateTouchTargetSize,
  getAccessibleTouchTargetStyle,
  getHighContrastColor,
  handleKeyboardNavigation,
  getWizardStepLabel,
  getProgressLabel,
  getTimeLabel,
  getDoseLabel,
  getInventoryLabel,
  trackAccessibilityEvent,
  getAccessibilityEvents,
  clearAccessibilityEvents,
  setAccessibilityFocus,
  validateAccessibilityProps,
  MIN_TOUCH_TARGET_SIZE,
  HIGH_CONTRAST_COLORS,
  HapticFeedbackType,
};
