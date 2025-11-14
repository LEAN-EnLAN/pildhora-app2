/**
 * Performance optimization utilities
 * 
 * This file contains utility functions and hooks for optimizing React Native performance.
 */

import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Custom hook for debouncing values
 * Useful for expensive operations like API calls or complex calculations
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // This will only run 500ms after the user stops typing
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 * Useful for scroll handlers, resize handlers, or other high-frequency events
 * 
 * @param callback - The function to throttle
 * @param delay - Minimum time between calls in milliseconds (default: 300ms)
 * @returns The throttled function
 * 
 * @example
 * const handleScroll = useThrottle((event) => {
 *   console.log('Scroll position:', event.nativeEvent.contentOffset.y);
 * }, 100);
 * 
 * <ScrollView onScroll={handleScroll} />
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * FlatList optimization configuration
 * Use these props to optimize FlatList performance for large lists
 * 
 * @example
 * <FlatList
 *   data={items}
 *   {...getFlatListOptimizationProps(100)} // 100px item height
 *   renderItem={renderItem}
 * />
 */
export const getFlatListOptimizationProps = (itemHeight?: number) => ({
  removeClippedSubviews: true,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  initialNumToRender: 10,
  windowSize: 10,
  ...(itemHeight && {
    getItemLayout: (data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
  }),
});

/**
 * Memoization helper for expensive computations
 * Use this when you need to memoize a value based on multiple dependencies
 * 
 * @example
 * const expensiveValue = useMemo(
 *   () => computeExpensiveValue(a, b, c),
 *   [a, b, c]
 * );
 */

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Measure the execution time of a function
   */
  measure: <T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    }) as T;
  },

  /**
   * Measure the execution time of an async function
   */
  measureAsync: <T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T
  ): T => {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    }) as T;
  },
};

/**
 * Best practices for React Native performance optimization:
 * 
 * 1. Use React.memo for expensive components that receive the same props frequently
 * 2. Use useCallback for event handlers to prevent unnecessary re-renders
 * 3. Use useMemo for expensive computations
 * 4. Debounce slider changes and text input for better UX and performance
 * 5. Use FlatList optimization props for large lists
 * 6. Avoid inline function definitions in render methods
 * 7. Use proper keyExtractor for FlatList items
 * 8. Enable removeClippedSubviews for long lists
 * 9. Use getItemLayout when item heights are fixed
 * 10. Profile with React DevTools to identify performance bottlenecks
 */
