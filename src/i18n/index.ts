/**
 * Internationalization (i18n) Service
 * 
 * Provides translation functionality for the application with support
 * for Spanish and English languages.
 * 
 * Features:
 * - Dynamic language switching
 * - Template string interpolation
 * - Nested key access
 * - Type-safe translations
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

import { es, TranslationKeys } from './translations/es';
import { en } from './translations/en';

export type Language = 'es' | 'en';

export type TranslationKey = string;

/**
 * Available translations
 */
const translations: Record<Language, TranslationKeys> = {
  es,
  en,
};

/**
 * Current language (default: Spanish)
 */
let currentLanguage: Language = 'es';

/**
 * Get the current language
 */
export function getCurrentLanguage(): Language {
  return currentLanguage;
}

/**
 * Set the current language
 */
export function setLanguage(language: Language): void {
  if (translations[language]) {
    currentLanguage = language;
  } else {
    console.warn(`[i18n] Language "${language}" not supported, falling back to Spanish`);
    currentLanguage = 'es';
  }
}

/**
 * Get a nested value from an object using dot notation
 * Example: getNestedValue(obj, 'user.name.first')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Interpolate template variables in a string
 * Example: interpolate('Hello {{name}}', { name: 'John' }) => 'Hello John'
 */
function interpolate(template: string, variables?: Record<string, any>): string {
  if (!variables) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

/**
 * Translate a key to the current language
 * 
 * @param key - Translation key in dot notation (e.g., 'wizard.title')
 * @param variables - Optional variables for template interpolation
 * @param language - Optional language override
 * @returns Translated string
 * 
 * @example
 * ```typescript
 * t('wizard.title') // => 'Configurar Dispositivo'
 * t('wizard.progressLabel', { current: 1, total: 6, step: 'Bienvenida' })
 * // => 'Paso 1 de 6: Bienvenida'
 * ```
 */
export function t(
  key: TranslationKey,
  variables?: Record<string, any>,
  language?: Language
): string {
  const lang = language || currentLanguage;
  const translation = translations[lang];

  if (!translation) {
    console.warn(`[i18n] Translation not found for language: ${lang}`);
    return key;
  }

  const value = getNestedValue(translation, key);

  if (value === undefined) {
    console.warn(`[i18n] Translation key not found: ${key}`);
    return key;
  }

  if (typeof value !== 'string') {
    console.warn(`[i18n] Translation value is not a string: ${key}`);
    return key;
  }

  return interpolate(value, variables);
}

/**
 * Translate an array of strings
 * 
 * @param keys - Array of translation keys
 * @param language - Optional language override
 * @returns Array of translated strings
 */
export function tArray(keys: TranslationKey[], language?: Language): string[] {
  return keys.map(key => t(key, undefined, language));
}

/**
 * Check if a translation key exists
 * 
 * @param key - Translation key to check
 * @param language - Optional language override
 * @returns True if the key exists
 */
export function hasTranslation(key: TranslationKey, language?: Language): boolean {
  const lang = language || currentLanguage;
  const translation = translations[lang];

  if (!translation) {
    return false;
  }

  const value = getNestedValue(translation, key);
  return value !== undefined;
}

/**
 * Get all available languages
 */
export function getAvailableLanguages(): Language[] {
  return Object.keys(translations) as Language[];
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(language: Language): string {
  const displayNames: Record<Language, string> = {
    es: 'Español',
    en: 'English',
  };

  return displayNames[language] || language;
}

// Export translation objects for direct access if needed
export { es, en };
export type { TranslationKeys };
