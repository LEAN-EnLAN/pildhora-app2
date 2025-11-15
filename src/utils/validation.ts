/**
 * Form Validation Utility
 * 
 * Provides comprehensive validation functions for all form fields
 * in the medication management system.
 */

import { ValidationErrors } from './errorHandling';

/**
 * Debounce function for validation checks
 * Delays execution until after wait milliseconds have elapsed since the last call
 * 
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait (default: 300ms)
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      error: ValidationErrors.REQUIRED_FIELD(fieldName),
    };
  }
  return { isValid: true };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult {
  if (min !== undefined && value.length < min) {
    return {
      isValid: false,
      error: ValidationErrors.MIN_LENGTH(fieldName, min),
    };
  }
  if (max !== undefined && value.length > max) {
    return {
      isValid: false,
      error: ValidationErrors.MAX_LENGTH(fieldName, max),
    };
  }
  return { isValid: true };
}

/**
 * Validate numeric value
 */
export function validateNumber(
  value: any,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return {
      isValid: false,
      error: `${fieldName} debe ser un número válido.`,
    };
  }
  
  if (min !== undefined && num < min) {
    return {
      isValid: false,
      error: ValidationErrors.MIN_VALUE(fieldName, min),
    };
  }
  
  if (max !== undefined && num > max) {
    return {
      isValid: false,
      error: ValidationErrors.MAX_VALUE(fieldName, max),
    };
  }
  
  return { isValid: true };
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: any, fieldName: string): ValidationResult {
  return validateNumber(value, fieldName, 0.01);
}

/**
 * Validate non-negative number
 */
export function validateNonNegativeNumber(value: any, fieldName: string): ValidationResult {
  return validateNumber(value, fieldName, 0);
}

/**
 * Validate emoji
 */
export function validateEmoji(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: ValidationErrors.EMOJI_REQUIRED,
    };
  }
  
  // Check if it's a valid emoji (basic check)
  const emojiRegex = /[\p{Emoji}]/u;
  if (!emojiRegex.test(value)) {
    return {
      isValid: false,
      error: 'Debes seleccionar un emoji válido.',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate medication name
 */
export function validateMedicationName(value: string): ValidationResult {
  const requiredResult = validateRequired(value, 'Nombre del medicamento');
  if (!requiredResult.isValid) {
    return requiredResult;
  }
  
  return validateLength(value.trim(), 'Nombre del medicamento', 2, 50);
}

/**
 * Validate time format (HH:MM)
 */
export function validateTime(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: 'La hora es requerida.',
    };
  }
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(value)) {
    return {
      isValid: false,
      error: ValidationErrors.INVALID_TIME,
    };
  }
  
  return { isValid: true };
}

/**
 * Validate time array (at least one time required)
 */
export function validateTimes(times: string[]): ValidationResult {
  if (!times || times.length === 0) {
    return {
      isValid: false,
      error: ValidationErrors.SCHEDULE_REQUIRED,
    };
  }
  
  // Validate each time
  for (const time of times) {
    const result = validateTime(time);
    if (!result.isValid) {
      return result;
    }
  }
  
  return { isValid: true };
}

/**
 * Validate frequency (days of week)
 */
export function validateFrequency(frequency: string): ValidationResult {
  if (!frequency || frequency.trim() === '') {
    return {
      isValid: false,
      error: 'Debes seleccionar al menos un día de la semana.',
    };
  }
  
  const days = frequency.split(',').map(d => d.trim()).filter(d => d.length > 0);
  if (days.length === 0) {
    return {
      isValid: false,
      error: 'Debes seleccionar al menos un día de la semana.',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate dose value
 */
export function validateDoseValue(value: string): ValidationResult {
  const requiredResult = validateRequired(value, 'Cantidad de dosis');
  if (!requiredResult.isValid) {
    return requiredResult;
  }
  
  return validatePositiveNumber(value, 'Cantidad de dosis');
}

/**
 * Validate dose unit
 */
export function validateDoseUnit(value: string): ValidationResult {
  const requiredResult = validateRequired(value, 'Unidad de dosis');
  if (!requiredResult.isValid) {
    return requiredResult;
  }
  
  return validateLength(value.trim(), 'Unidad de dosis', 1, 20);
}

/**
 * Validate quantity type
 */
export function validateQuantityType(value: string): ValidationResult {
  return validateRequired(value, 'Tipo de cantidad');
}

/**
 * Validate inventory quantity
 */
export function validateInventoryQuantity(value: any): ValidationResult {
  if (value === undefined || value === null || value === '') {
    // Inventory is optional, so empty is valid
    return { isValid: true };
  }
  
  return validateNonNegativeNumber(value, 'Cantidad de inventario');
}

/**
 * Validate low quantity threshold
 */
export function validateLowQuantityThreshold(value: any): ValidationResult {
  if (value === undefined || value === null || value === '') {
    // Threshold is optional, so empty is valid
    return { isValid: true };
  }
  
  return validatePositiveNumber(value, 'Umbral de cantidad baja');
}

/**
 * Validate email
 */
export function validateEmail(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: 'El correo electrónico es requerido.',
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return {
      isValid: false,
      error: ValidationErrors.INVALID_EMAIL,
    };
  }
  
  return { isValid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: 'El número de teléfono es requerido.',
    };
  }
  
  // Basic phone validation (10+ digits)
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  if (!phoneRegex.test(value)) {
    return {
      isValid: false,
      error: ValidationErrors.INVALID_PHONE,
    };
  }
  
  return { isValid: true };
}

/**
 * Validate date
 */
export function validateDate(value: any): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      error: 'La fecha es requerida.',
    };
  }
  
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: ValidationErrors.INVALID_DATE,
    };
  }
  
  return { isValid: true };
}

/**
 * Validate medication wizard step 1 (Icon & Name)
 */
export function validateStep1(emoji: string, name: string): Record<string, string> {
  const errors: Record<string, string> = {};
  
  const emojiResult = validateEmoji(emoji);
  if (!emojiResult.isValid) {
    errors.emoji = emojiResult.error!;
  }
  
  const nameResult = validateMedicationName(name);
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  }
  
  return errors;
}

/**
 * Validate medication wizard step 2 (Schedule)
 */
export function validateStep2(times: string[], frequency: string): Record<string, string> {
  const errors: Record<string, string> = {};
  
  const timesResult = validateTimes(times);
  if (!timesResult.isValid) {
    errors.times = timesResult.error!;
  }
  
  const frequencyResult = validateFrequency(frequency);
  if (!frequencyResult.isValid) {
    errors.frequency = frequencyResult.error!;
  }
  
  return errors;
}

/**
 * Validate medication wizard step 3 (Dosage)
 */
export function validateStep3(
  doseValue: string,
  doseUnit: string,
  quantityType: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  const doseValueResult = validateDoseValue(doseValue);
  if (!doseValueResult.isValid) {
    errors.doseValue = doseValueResult.error!;
  }
  
  const doseUnitResult = validateDoseUnit(doseUnit);
  if (!doseUnitResult.isValid) {
    errors.doseUnit = doseUnitResult.error!;
  }
  
  const quantityTypeResult = validateQuantityType(quantityType);
  if (!quantityTypeResult.isValid) {
    errors.quantityType = quantityTypeResult.error!;
  }
  
  return errors;
}

/**
 * Validate medication wizard step 4 (Inventory)
 */
export function validateStep4(
  initialQuantity?: number,
  lowQuantityThreshold?: number
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (initialQuantity !== undefined) {
    const quantityResult = validateInventoryQuantity(initialQuantity);
    if (!quantityResult.isValid) {
      errors.initialQuantity = quantityResult.error!;
    }
  }
  
  if (lowQuantityThreshold !== undefined) {
    const thresholdResult = validateLowQuantityThreshold(lowQuantityThreshold);
    if (!thresholdResult.isValid) {
      errors.lowQuantityThreshold = thresholdResult.error!;
    }
  }
  
  return errors;
}

/**
 * Check if validation errors object has any errors
 */
export function hasValidationErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get first validation error message
 */
export function getFirstError(errors: Record<string, string>): string | undefined {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : undefined;
}
