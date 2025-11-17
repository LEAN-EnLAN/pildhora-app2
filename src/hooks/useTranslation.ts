/**
 * useTranslation Hook
 * 
 * React hook for accessing translation functionality in components.
 * Provides reactive updates when language changes.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

import { useState, useCallback, useEffect } from 'react';
import {
  t as translateFn,
  tArray as translateArrayFn,
  getCurrentLanguage,
  setLanguage as setLanguageFn,
  getAvailableLanguages,
  getLanguageDisplayName,
  hasTranslation,
  Language,
  TranslationKey,
} from '../i18n';

/**
 * Translation hook return type
 */
export interface UseTranslationReturn {
  /** Translate a single key */
  t: (key: TranslationKey, variables?: Record<string, any>) => string;
  
  /** Translate an array of keys */
  tArray: (keys: TranslationKey[]) => string[];
  
  /** Current language */
  language: Language;
  
  /** Change the current language */
  setLanguage: (language: Language) => void;
  
  /** Available languages */
  availableLanguages: Language[];
  
  /** Get language display name */
  getLanguageName: (language: Language) => string;
  
  /** Check if a translation key exists */
  hasKey: (key: TranslationKey) => boolean;
}

/**
 * Custom hook for translations
 * 
 * @returns Translation utilities and current language state
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { t, language, setLanguage } = useTranslation();
 *   
 *   return (
 *     <View>
 *       <Text>{t('wizard.title')}</Text>
 *       <Button onPress={() => setLanguage('en')}>
 *         {t('common.switchLanguage')}
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTranslation(): UseTranslationReturn {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());

  // Memoized translation function
  const t = useCallback(
    (key: TranslationKey, variables?: Record<string, any>): string => {
      return translateFn(key, variables, language);
    },
    [language]
  );

  // Memoized array translation function
  const tArray = useCallback(
    (keys: TranslationKey[]): string[] => {
      return translateArrayFn(keys, language);
    },
    [language]
  );

  // Change language
  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageFn(newLanguage);
    setLanguageState(newLanguage);
  }, []);

  // Get language display name
  const getLanguageName = useCallback((lang: Language): string => {
    return getLanguageDisplayName(lang);
  }, []);

  // Check if translation key exists
  const hasKey = useCallback(
    (key: TranslationKey): boolean => {
      return hasTranslation(key, language);
    },
    [language]
  );

  return {
    t,
    tArray,
    language,
    setLanguage,
    availableLanguages: getAvailableLanguages(),
    getLanguageName,
    hasKey,
  };
}

/**
 * Hook for accessing only the translate function
 * Lighter alternative when you don't need language switching
 * 
 * @returns Translation function
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const t = useT();
 *   
 *   return <Text>{t('wizard.title')}</Text>;
 * }
 * ```
 */
export function useT(): (key: TranslationKey, variables?: Record<string, any>) => string {
  const [language] = useState<Language>(getCurrentLanguage());

  return useCallback(
    (key: TranslationKey, variables?: Record<string, any>): string => {
      return translateFn(key, variables, language);
    },
    [language]
  );
}

/**
 * Hook for language switching functionality
 * Use when you only need language management without translations
 * 
 * @returns Language state and setter
 * 
 * @example
 * ```typescript
 * function LanguageSwitcher() {
 *   const { language, setLanguage, availableLanguages } = useLanguage();
 *   
 *   return (
 *     <View>
 *       {availableLanguages.map(lang => (
 *         <Button
 *           key={lang}
 *           onPress={() => setLanguage(lang)}
 *           selected={language === lang}
 *         >
 *           {lang}
 *         </Button>
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 */
export function useLanguage(): {
  language: Language;
  setLanguage: (language: Language) => void;
  availableLanguages: Language[];
  getLanguageName: (language: Language) => string;
} {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageFn(newLanguage);
    setLanguageState(newLanguage);
  }, []);

  const getLanguageName = useCallback((lang: Language): string => {
    return getLanguageDisplayName(lang);
  }, []);

  return {
    language,
    setLanguage,
    availableLanguages: getAvailableLanguages(),
    getLanguageName,
  };
}
