/**
 * Accessibility Context
 * 
 * Provides global accessibility settings and state management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilityContextValue {
  // Screen reader
  isScreenReaderEnabled: boolean;
  
  // Motion preferences
  isReduceMotionEnabled: boolean;
  
  // High contrast mode
  isHighContrastEnabled: boolean;
  setHighContrastEnabled: (enabled: boolean) => void;
  
  // Haptic feedback
  isHapticFeedbackEnabled: boolean;
  setHapticFeedbackEnabled: (enabled: boolean) => void;
  
  // Font scaling
  fontScale: number;
  
  // Loading state
  isLoading: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  HIGH_CONTRAST: '@accessibility/high_contrast',
  HAPTIC_FEEDBACK: '@accessibility/haptic_feedback',
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);
  const [isHapticFeedbackEnabled, setIsHapticFeedbackEnabled] = useState(true);
  const [fontScale, setFontScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize accessibility settings
  useEffect(() => {
    async function initializeAccessibility() {
      try {
        // Check screen reader status
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsScreenReaderEnabled(screenReaderEnabled);

        // Check reduce motion status
        const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        setIsReduceMotionEnabled(reduceMotionEnabled);

        // Load high contrast preference
        const highContrastPref = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST);
        if (highContrastPref !== null) {
          setIsHighContrastEnabled(highContrastPref === 'true');
        }

        // Load haptic feedback preference
        const hapticPref = await AsyncStorage.getItem(STORAGE_KEYS.HAPTIC_FEEDBACK);
        if (hapticPref !== null) {
          setIsHapticFeedbackEnabled(hapticPref === 'true');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('[AccessibilityContext] Failed to initialize:', error);
        setIsLoading(false);
      }
    }

    initializeAccessibility();

    // Listen for screen reader changes
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    // Listen for reduce motion changes
    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  }, []);

  // Handle high contrast mode toggle
  const handleSetHighContrastEnabled = async (enabled: boolean) => {
    try {
      setIsHighContrastEnabled(enabled);
      await AsyncStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, enabled.toString());
    } catch (error) {
      console.error('[AccessibilityContext] Failed to save high contrast preference:', error);
    }
  };

  // Handle haptic feedback toggle
  const handleSetHapticFeedbackEnabled = async (enabled: boolean) => {
    try {
      setIsHapticFeedbackEnabled(enabled);
      await AsyncStorage.setItem(STORAGE_KEYS.HAPTIC_FEEDBACK, enabled.toString());
    } catch (error) {
      console.error('[AccessibilityContext] Failed to save haptic feedback preference:', error);
    }
  };

  const value: AccessibilityContextValue = {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isHighContrastEnabled,
    setHighContrastEnabled: handleSetHighContrastEnabled,
    isHapticFeedbackEnabled,
    setHapticFeedbackEnabled: handleSetHapticFeedbackEnabled,
    fontScale,
    isLoading,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access accessibility context
 */
export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
}

/**
 * Hook for haptic feedback with context awareness
 */
export function useHapticFeedback() {
  const { isHapticFeedbackEnabled } = useAccessibility();
  
  return {
    isEnabled: isHapticFeedbackEnabled,
    trigger: async (type: any) => {
      if (isHapticFeedbackEnabled) {
        const { triggerHapticFeedback } = await import('../utils/accessibility');
        await triggerHapticFeedback(type);
      }
    },
  };
}

/**
 * Hook for high contrast colors
 */
export function useHighContrastColors() {
  const { isHighContrastEnabled } = useAccessibility();
  const { HIGH_CONTRAST_COLORS } = require('../utils/accessibility');
  const { colors } = require('../theme/tokens');
  
  return {
    isEnabled: isHighContrastEnabled,
    getColor: (normalColor: string, highContrastKey: keyof typeof HIGH_CONTRAST_COLORS) => {
      return isHighContrastEnabled ? HIGH_CONTRAST_COLORS[highContrastKey] : normalColor;
    },
    colors: isHighContrastEnabled ? HIGH_CONTRAST_COLORS : colors,
  };
}

export default AccessibilityContext;
