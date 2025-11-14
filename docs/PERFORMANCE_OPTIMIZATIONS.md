# Performance Optimizations

This document outlines the performance optimizations implemented in the Pildhora application as part of the UI refactor and enhancement project.

## Overview

Performance optimizations have been applied across the application to improve rendering efficiency, reduce unnecessary re-renders, and enhance the overall user experience. These optimizations follow React and React Native best practices.

## Implemented Optimizations

### 1. React.memo for Component Memoization

The following components have been wrapped with `React.memo` to prevent unnecessary re-renders when props haven't changed:

#### Patient Screen Components
- **AdherenceCard** (`src/components/screens/patient/AdherenceCard.tsx`)
  - Memoized to prevent re-renders when adherence data hasn't changed
  - Uses `useMemo` for progress ring calculations

- **UpcomingDoseCard** (`src/components/screens/patient/UpcomingDoseCard.tsx`)
  - Memoized to prevent re-renders when medication data is stable
  - Optimizes rendering of next dose information

- **MedicationListItem** (`src/components/screens/patient/MedicationListItem.tsx`)
  - Memoized for efficient list rendering
  - Uses `useMemo` for status color and text calculations

- **DeviceStatusCard** (`src/components/screens/patient/DeviceStatusCard.tsx`)
  - Memoized to prevent re-renders when device status is unchanged
  - Uses `useMemo` for status indicators and battery level calculations

#### Shared Components
- **DeviceConfigPanel** (`src/components/shared/DeviceConfigPanel.tsx`)
  - Memoized to optimize device configuration UI
  - Includes debounced slider for LED intensity

- **NotificationSettings** (`src/components/shared/NotificationSettings.tsx`)
  - Memoized to optimize settings UI
  - Uses `useMemo` for permission status calculations

### 2. useCallback for Event Handlers

Event handlers have been wrapped with `useCallback` to maintain referential equality and prevent child component re-renders:

#### Patient Home Screen (`app/patient/home.tsx`)
- `handleHistory` - Navigation to history screen
- `callEmergency` - Emergency call handler
- `handleEmergencyPress` - Emergency action sheet handler
- `handleEmergency` - Emergency button handler
- `handleLogout` - Logout handler
- `handleConfiguraciones` - Settings navigation
- `handleMiDispositivo` - Device linking navigation
- `handleAccountMenu` - Account menu handler
- `handleTakeUpcomingMedication` - Medication intake handler
- FlatList `renderItem` callback

#### DeviceConfigPanel
- `handleSave` - Configuration save handler
- `handleColorChange` - Color picker change handler
- `handleSliderChange` - LED intensity slider handler
- `handleShowColorPicker` - Color picker modal open
- `handleHideColorPicker` - Color picker modal close
- `rgbToHex` - Color conversion utility

#### NotificationSettings
- `handleToggle` - Notification toggle handler
- `handleAddModality` - Add custom modality handler
- `handleRemoveModality` - Remove modality handler
- `handleMoveUp` - Move modality up in hierarchy
- `handleMoveDown` - Move modality down in hierarchy
- `handleApplyPreset` - Apply preset configuration

### 3. useMemo for Computed Values

Expensive computations have been memoized with `useMemo` to avoid recalculation on every render:

#### Patient Home Screen
- `adherenceData` - Calculates taken/total doses for the day
- `upcoming` - Finds next scheduled medication
- `alreadyTakenUpcoming` - Checks if upcoming dose was taken
- `deviceStatus` - Computes device status from Redux state

#### Component-Level Memoization
- **AdherenceCard**: Progress ring calculations (size, radius, circumference, progress)
- **MedicationListItem**: Status color, status text, accessibility label
- **DeviceStatusCard**: Status text, status color, battery color, battery label
- **DeviceConfigPanel**: Current color hex value
- **NotificationSettings**: Permission status text, permission status color, preset configurations

### 4. Debounced Slider Changes

The LED intensity slider in `DeviceConfigPanel` has been debounced to reduce the frequency of state updates:

```typescript
// Debounce LED intensity changes with 300ms delay
useEffect(() => {
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }
  
  debounceTimerRef.current = setTimeout(() => {
    setDebouncedLedIntensity(ledIntensity);
  }, 300);

  return () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };
}, [ledIntensity]);
```

**Benefits:**
- Reduces state updates while user is actively dragging the slider
- Improves UI responsiveness
- Prevents excessive re-renders of child components
- Saves the final value after user stops interacting

### 5. FlatList Optimizations

The medication list in the patient home screen has been optimized with proper FlatList configuration:

```typescript
<AnimatedFlatList
  data={medications.filter(isScheduledToday)}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={10}
  getItemLayout={(data, index) => ({
    length: 120,
    offset: 120 * index,
    index,
  })}
  renderItem={useCallback(...)}
/>
```

**Optimization Props:**
- `removeClippedSubviews`: Unmounts components outside the viewport
- `maxToRenderPerBatch`: Limits items rendered per batch (10 items)
- `updateCellsBatchingPeriod`: Controls batch update frequency (50ms)
- `initialNumToRender`: Initial items to render (10 items)
- `windowSize`: Viewport multiplier for rendering (10x viewport)
- `getItemLayout`: Enables layout optimization for fixed-height items
- `keyExtractor`: Stable key for each item
- `renderItem`: Memoized with `useCallback`

## Performance Utilities

A new utility file has been created at `src/utils/performance.ts` with reusable performance optimization helpers:

### Available Utilities

1. **useDebounce Hook**
   ```typescript
   const debouncedValue = useDebounce(value, 300);
   ```
   - Debounces value changes
   - Useful for search inputs, sliders, etc.

2. **useThrottle Hook**
   ```typescript
   const throttledHandler = useThrottle(handler, 100);
   ```
   - Throttles function calls
   - Useful for scroll handlers, resize handlers

3. **getFlatListOptimizationProps**
   ```typescript
   <FlatList {...getFlatListOptimizationProps(100)} />
   ```
   - Returns optimized FlatList props
   - Accepts optional item height for getItemLayout

4. **performanceMonitor**
   ```typescript
   const optimizedFn = performanceMonitor.measure('myFunction', myFunction);
   ```
   - Measures function execution time
   - Supports async functions

## Best Practices Applied

1. ✅ **Component Memoization**: Expensive components wrapped with `React.memo`
2. ✅ **Event Handler Stability**: Event handlers wrapped with `useCallback`
3. ✅ **Computed Value Caching**: Expensive computations wrapped with `useMemo`
4. ✅ **Input Debouncing**: Slider changes debounced to reduce updates
5. ✅ **List Optimization**: FlatList configured with performance props
6. ✅ **Stable Keys**: Proper `keyExtractor` for list items
7. ✅ **Layout Optimization**: `getItemLayout` for fixed-height items
8. ✅ **Clipping Optimization**: `removeClippedSubviews` enabled
9. ✅ **Batch Rendering**: Controlled with `maxToRenderPerBatch`
10. ✅ **Referential Equality**: Avoided inline function definitions

## Performance Profiling

To profile the application and verify optimizations:

### Using React DevTools

1. Install React DevTools browser extension
2. Open the app in development mode
3. Open React DevTools Profiler tab
4. Record a session while interacting with the app
5. Analyze component render times and frequencies

### Key Metrics to Monitor

- **Component Render Count**: Should be minimal for memoized components
- **Render Duration**: Should be under 16ms for 60fps
- **Wasted Renders**: Should be minimal (components rendering with same props)
- **List Scroll Performance**: Should maintain 60fps during scrolling

### Performance Targets

- **Initial Render**: < 1000ms
- **Component Updates**: < 100ms
- **List Scrolling**: 60fps (16.67ms per frame)
- **Slider Interaction**: Smooth with no lag
- **Navigation**: < 300ms transition time

## Future Optimization Opportunities

1. **Code Splitting**: Lazy load heavy components (ColorPicker, Charts)
2. **Image Optimization**: Use optimized image formats and sizes
3. **Bundle Size**: Analyze and reduce bundle size
4. **Memory Management**: Monitor and optimize memory usage
5. **Network Optimization**: Implement request caching and batching
6. **Animation Performance**: Use native driver for all animations
7. **State Management**: Optimize Redux selectors with reselect
8. **Virtualization**: Consider react-native-virtualized-list for very long lists

## Measuring Impact

### Before Optimizations
- Multiple unnecessary re-renders on state changes
- Slider lag during interaction
- List scroll performance issues with many items
- Event handlers recreated on every render

### After Optimizations
- Minimal re-renders with memoization
- Smooth slider interaction with debouncing
- Optimized list rendering with FlatList props
- Stable event handlers with useCallback
- Cached computed values with useMemo

## Maintenance Guidelines

1. **Always use React.memo** for components that receive complex props
2. **Wrap event handlers** with useCallback when passing to child components
3. **Memoize expensive computations** with useMemo
4. **Debounce user inputs** that trigger expensive operations
5. **Profile regularly** to identify new performance bottlenecks
6. **Monitor bundle size** and lazy load when necessary
7. **Use performance utilities** from `src/utils/performance.ts`
8. **Test on low-end devices** to ensure good performance for all users

## Related Documentation

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [FlatList Optimization](https://reactnative.dev/docs/optimizing-flatlist-configuration)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

## Conclusion

These performance optimizations significantly improve the application's responsiveness and user experience. The combination of React.memo, useCallback, useMemo, debouncing, and FlatList optimizations ensures smooth interactions and efficient rendering across all screens.

Regular profiling and monitoring should be performed to maintain optimal performance as the application grows.
