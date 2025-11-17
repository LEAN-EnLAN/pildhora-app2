/**
 * Onboarding Performance Optimization Utilities
 * 
 * This module provides performance optimization utilities specifically
 * for the device provisioning and onboarding flows.
 * 
 * Features:
 * - Lazy loading for wizard steps
 * - Device validation caching
 * - Optimistic UI updates
 * - Progress indicators for async operations
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  DEVICE_VALIDATION: {
    KEY_PREFIX: '@onboarding_device_validation_',
    TTL: 5 * 60 * 1000, // 5 minutes
  },
  CONNECTION_CODE: {
    KEY_PREFIX: '@onboarding_connection_code_',
    TTL: 2 * 60 * 1000, // 2 minutes
  },
  PATIENT_INFO: {
    KEY_PREFIX: '@onboarding_patient_info_',
    TTL: 10 * 60 * 1000, // 10 minutes
  },
};

/**
 * Cached data structure
 */
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache manager for onboarding data
 * 
 * Provides methods to cache and retrieve data with TTL support.
 * Reduces redundant API calls and improves perceived performance.
 */
export class OnboardingCache {
  /**
   * Store data in cache with TTL
   */
  static async set<T>(
    key: string,
    data: T,
    ttl: number = 5 * 60 * 1000
  ): Promise<void> {
    try {
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cachedData));
      console.log(`[OnboardingCache] Cached data for key: ${key}`);
    } catch (error) {
      console.error('[OnboardingCache] Error caching data:', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Retrieve data from cache if not expired
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) {
        return null;
      }

      const cachedData: CachedData<T> = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > cachedData.expiresAt) {
        console.log(`[OnboardingCache] Cache expired for key: ${key}`);
        await AsyncStorage.removeItem(key);
        return null;
      }

      console.log(`[OnboardingCache] Cache hit for key: ${key}`);
      return cachedData.data;
    } catch (error) {
      console.error('[OnboardingCache] Error retrieving cached data:', error);
      return null;
    }
  }

  /**
   * Invalidate cached data
   */
  static async invalidate(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`[OnboardingCache] Invalidated cache for key: ${key}`);
    } catch (error) {
      console.error('[OnboardingCache] Error invalidating cache:', error);
    }
  }

  /**
   * Clear all onboarding caches
   */
  static async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const onboardingKeys = keys.filter(
        key => 
          key.startsWith('@onboarding_') ||
          key.startsWith('@wizard_')
      );
      
      if (onboardingKeys.length > 0) {
        await AsyncStorage.multiRemove(onboardingKeys);
        console.log(`[OnboardingCache] Cleared ${onboardingKeys.length} cache entries`);
      }
    } catch (error) {
      console.error('[OnboardingCache] Error clearing cache:', error);
    }
  }
}

/**
 * Device validation result cache
 */
export interface DeviceValidationResult {
  deviceId: string;
  isValid: boolean;
  isClaimed: boolean;
  error?: string;
}

/**
 * Hook for cached device validation
 * 
 * Caches device validation results to avoid redundant API calls
 * when users navigate back and forth in the wizard.
 * 
 * Requirements: 10.1, 10.2
 * 
 * @example
 * const { validateDevice, isValidating, cachedResult } = useCachedDeviceValidation();
 * 
 * const result = await validateDevice('DEVICE-123');
 * if (result.isValid) {
 *   // Proceed with provisioning
 * }
 */
export function useCachedDeviceValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [cachedResult, setCachedResult] = useState<DeviceValidationResult | null>(null);
  const validationCache = useRef<Map<string, DeviceValidationResult>>(new Map());

  const validateDevice = useCallback(
    async (
      deviceId: string,
      validationFn: (deviceId: string) => Promise<DeviceValidationResult>
    ): Promise<DeviceValidationResult> => {
      // Check memory cache first
      const memoryCached = validationCache.current.get(deviceId);
      if (memoryCached) {
        console.log('[useCachedDeviceValidation] Memory cache hit');
        setCachedResult(memoryCached);
        return memoryCached;
      }

      // Check persistent cache
      const cacheKey = `${CACHE_CONFIG.DEVICE_VALIDATION.KEY_PREFIX}${deviceId}`;
      const persistentCached = await OnboardingCache.get<DeviceValidationResult>(cacheKey);
      
      if (persistentCached) {
        console.log('[useCachedDeviceValidation] Persistent cache hit');
        validationCache.current.set(deviceId, persistentCached);
        setCachedResult(persistentCached);
        return persistentCached;
      }

      // Perform validation
      setIsValidating(true);
      try {
        const result = await validationFn(deviceId);
        
        // Cache the result
        validationCache.current.set(deviceId, result);
        await OnboardingCache.set(
          cacheKey,
          result,
          CACHE_CONFIG.DEVICE_VALIDATION.TTL
        );
        
        setCachedResult(result);
        return result;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const clearCache = useCallback(async (deviceId?: string) => {
    if (deviceId) {
      validationCache.current.delete(deviceId);
      const cacheKey = `${CACHE_CONFIG.DEVICE_VALIDATION.KEY_PREFIX}${deviceId}`;
      await OnboardingCache.invalidate(cacheKey);
    } else {
      validationCache.current.clear();
      setCachedResult(null);
    }
  }, []);

  return {
    validateDevice,
    isValidating,
    cachedResult,
    clearCache,
  };
}

/**
 * Connection code validation result
 */
export interface ConnectionCodeValidationResult {
  code: string;
  isValid: boolean;
  patientName?: string;
  deviceId?: string;
  error?: string;
}

/**
 * Hook for cached connection code validation
 * 
 * Caches connection code validation results to improve UX
 * when caregivers review connection details.
 * 
 * Requirements: 10.1, 10.2
 * 
 * @example
 * const { validateCode, isValidating } = useCachedConnectionCodeValidation();
 * 
 * const result = await validateCode('ABC123');
 * if (result.isValid) {
 *   // Show patient info
 * }
 */
export function useCachedConnectionCodeValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const validationCache = useRef<Map<string, ConnectionCodeValidationResult>>(new Map());

  const validateCode = useCallback(
    async (
      code: string,
      validationFn: (code: string) => Promise<ConnectionCodeValidationResult>
    ): Promise<ConnectionCodeValidationResult> => {
      // Check memory cache
      const cached = validationCache.current.get(code);
      if (cached) {
        console.log('[useCachedConnectionCodeValidation] Cache hit');
        return cached;
      }

      // Check persistent cache
      const cacheKey = `${CACHE_CONFIG.CONNECTION_CODE.KEY_PREFIX}${code}`;
      const persistentCached = await OnboardingCache.get<ConnectionCodeValidationResult>(cacheKey);
      
      if (persistentCached) {
        console.log('[useCachedConnectionCodeValidation] Persistent cache hit');
        validationCache.current.set(code, persistentCached);
        return persistentCached;
      }

      // Perform validation
      setIsValidating(true);
      try {
        const result = await validationFn(code);
        
        // Only cache valid codes (invalid codes might become valid later)
        if (result.isValid) {
          validationCache.current.set(code, result);
          await OnboardingCache.set(
            cacheKey,
            result,
            CACHE_CONFIG.CONNECTION_CODE.TTL
          );
        }
        
        return result;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  return {
    validateCode,
    isValidating,
  };
}

/**
 * Optimistic update manager
 * 
 * Manages optimistic UI updates for better perceived performance.
 * Updates UI immediately while operation is in progress, then
 * reconciles with server response.
 * 
 * Requirements: 10.4
 * 
 * @example
 * const { performOptimisticUpdate, isUpdating, error } = useOptimisticUpdate();
 * 
 * await performOptimisticUpdate(
 *   () => updateDeviceConfig(config),
 *   config,
 *   (optimisticData) => setLocalConfig(optimisticData)
 * );
 */
export function useOptimisticUpdate<T>() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const rollbackRef = useRef<(() => void) | null>(null);

  const performOptimisticUpdate = useCallback(
    async (
      operation: () => Promise<T>,
      optimisticData: T,
      applyOptimistic: (data: T) => void,
      rollback?: () => void
    ): Promise<T | null> => {
      setIsUpdating(true);
      setError(null);

      // Store rollback function
      rollbackRef.current = rollback || null;

      // Apply optimistic update immediately
      applyOptimistic(optimisticData);

      try {
        // Perform actual operation
        const result = await operation();
        
        // Success - optimistic update was correct
        console.log('[useOptimisticUpdate] Operation succeeded');
        return result;
      } catch (err) {
        // Failure - rollback optimistic update
        console.error('[useOptimisticUpdate] Operation failed, rolling back:', err);
        
        if (rollbackRef.current) {
          rollbackRef.current();
        }
        
        setError(err as Error);
        return null;
      } finally {
        setIsUpdating(false);
        rollbackRef.current = null;
      }
    },
    []
  );

  return {
    performOptimisticUpdate,
    isUpdating,
    error,
  };
}

/**
 * Async operation progress tracker
 * 
 * Tracks progress of async operations and provides progress indicators.
 * Useful for multi-step operations like device provisioning.
 * 
 * Requirements: 10.5
 * 
 * @example
 * const { startOperation, updateProgress, completeOperation, progress } = useAsyncProgress();
 * 
 * startOperation('Provisioning device', 3);
 * updateProgress(1, 'Validating device...');
 * updateProgress(2, 'Configuring WiFi...');
 * updateProgress(3, 'Saving preferences...');
 * completeOperation();
 */
export function useAsyncProgress() {
  const [progress, setProgress] = useState({
    isActive: false,
    current: 0,
    total: 0,
    message: '',
    percentage: 0,
  });

  const startOperation = useCallback((message: string, totalSteps: number) => {
    setProgress({
      isActive: true,
      current: 0,
      total: totalSteps,
      message,
      percentage: 0,
    });
  }, []);

  const updateProgress = useCallback((step: number, message: string) => {
    setProgress(prev => ({
      ...prev,
      current: step,
      message,
      percentage: prev.total > 0 ? (step / prev.total) * 100 : 0,
    }));
  }, []);

  const completeOperation = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      isActive: false,
      current: prev.total,
      percentage: 100,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      isActive: false,
      current: 0,
      total: 0,
      message: '',
      percentage: 0,
    });
  }, []);

  return {
    startOperation,
    updateProgress,
    completeOperation,
    resetProgress,
    progress,
  };
}

/**
 * Lazy component loader
 * 
 * Provides a hook for lazy loading wizard steps on demand.
 * Reduces initial bundle size and improves load time.
 * 
 * Requirements: 10.1
 * 
 * @example
 * const { loadComponent, isLoading, Component } = useLazyComponent();
 * 
 * useEffect(() => {
 *   loadComponent(() => import('./WelcomeStep'));
 * }, []);
 * 
 * if (isLoading) return <LoadingSpinner />;
 * return <Component />;
 */
export function useLazyComponent<T = any>() {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(
    async (importFn: () => Promise<{ default: T }>) => {
      setIsLoading(true);
      setError(null);

      try {
        const module = await importFn();
        setComponent(() => module.default);
      } catch (err) {
        console.error('[useLazyComponent] Error loading component:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    loadComponent,
    isLoading,
    error,
    Component,
  };
}

/**
 * Preload next wizard step
 * 
 * Preloads the next wizard step while user is on current step
 * to ensure instant navigation.
 * 
 * Requirements: 10.1
 * 
 * @example
 * usePreloadNextStep(currentStep, stepComponents);
 */
export function usePreloadNextStep(
  currentStep: number,
  stepComponents: Array<() => Promise<any>>
) {
  useEffect(() => {
    const nextStep = currentStep + 1;
    
    if (nextStep < stepComponents.length) {
      // Preload next step after a short delay
      const timer = setTimeout(() => {
        console.log(`[usePreloadNextStep] Preloading step ${nextStep}`);
        stepComponents[nextStep]().catch(err => {
          console.error('[usePreloadNextStep] Error preloading step:', err);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentStep, stepComponents]);
}

/**
 * Network quality detector
 * 
 * Detects network quality and adjusts caching/retry strategies accordingly.
 * 
 * Requirements: 10.3
 */
export function useNetworkQuality() {
  const [quality, setQuality] = useState<'fast' | 'slow' | 'offline'>('fast');
  const requestTimesRef = useRef<number[]>([]);

  const measureRequest = useCallback((duration: number) => {
    requestTimesRef.current.push(duration);
    
    // Keep only last 5 measurements
    if (requestTimesRef.current.length > 5) {
      requestTimesRef.current.shift();
    }

    // Calculate average
    const avg = requestTimesRef.current.reduce((a, b) => a + b, 0) / requestTimesRef.current.length;

    // Classify network quality
    if (avg < 500) {
      setQuality('fast');
    } else if (avg < 2000) {
      setQuality('slow');
    } else {
      setQuality('offline');
    }
  }, []);

  const getCacheTTL = useCallback(() => {
    // Adjust cache TTL based on network quality
    switch (quality) {
      case 'fast':
        return 2 * 60 * 1000; // 2 minutes
      case 'slow':
        return 10 * 60 * 1000; // 10 minutes
      case 'offline':
        return 30 * 60 * 1000; // 30 minutes
      default:
        return 5 * 60 * 1000; // 5 minutes
    }
  }, [quality]);

  const getRetryDelay = useCallback(() => {
    // Adjust retry delay based on network quality
    switch (quality) {
      case 'fast':
        return 1000; // 1 second
      case 'slow':
        return 3000; // 3 seconds
      case 'offline':
        return 5000; // 5 seconds
      default:
        return 2000; // 2 seconds
    }
  }, [quality]);

  return {
    quality,
    measureRequest,
    getCacheTTL,
    getRetryDelay,
  };
}

/**
 * Batch operation manager
 * 
 * Batches multiple operations together to reduce network overhead.
 * Useful for saving multiple wizard steps at once.
 * 
 * Requirements: 10.3
 */
export function useBatchOperations<T>() {
  const [queue, setQueue] = useState<Array<() => Promise<T>>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToQueue = useCallback((operation: () => Promise<T>) => {
    setQueue(prev => [...prev, operation]);
  }, []);

  const processBatch = useCallback(async () => {
    if (queue.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);
    console.log(`[useBatchOperations] Processing batch of ${queue.length} operations`);

    try {
      // Execute all operations in parallel
      await Promise.all(queue.map(op => op()));
      console.log('[useBatchOperations] Batch completed successfully');
      setQueue([]);
    } catch (error) {
      console.error('[useBatchOperations] Batch processing failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [queue, isProcessing]);

  // Auto-process batch after delay
  useEffect(() => {
    if (queue.length > 0 && !isProcessing) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        processBatch();
      }, 1000); // Process after 1 second of inactivity
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [queue, isProcessing, processBatch]);

  return {
    addToQueue,
    processBatch,
    isProcessing,
    queueSize: queue.length,
  };
}

/**
 * Performance metrics collector
 * 
 * Collects performance metrics for onboarding flows to identify bottlenecks.
 */
export class OnboardingPerformanceMetrics {
  private static metrics: Map<string, number[]> = new Map();

  static recordMetric(name: string, duration: number): void {
    const existing = this.metrics.get(name) || [];
    existing.push(duration);
    this.metrics.set(name, existing);
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  static getAverageMetric(name: string): number | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }
    
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  static getAllMetrics(): Record<string, { avg: number; count: number }> {
    const result: Record<string, { avg: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      const sum = values.reduce((a, b) => a + b, 0);
      result[name] = {
        avg: sum / values.length,
        count: values.length,
      };
    });
    
    return result;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

/**
 * Measure async operation performance
 */
export async function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - start;
    OnboardingPerformanceMetrics.recordMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    OnboardingPerformanceMetrics.recordMetric(`${name}_error`, duration);
    throw error;
  }
}
