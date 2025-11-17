# Performance Optimization Quick Reference

## 🚀 Quick Start

### Import Performance Utilities
```typescript
import {
  OnboardingCache,
  useCachedDeviceValidation,
  useCachedConnectionCodeValidation,
  useOptimisticUpdate,
  useAsyncProgress,
  useNetworkQuality,
  useBatchOperations,
  measureAsyncOperation
} from '../utils/onboardingPerformance';
```

## 📦 Caching

### Device Validation Cache
```typescript
const { validateDevice, isValidating, cachedResult, clearCache } = useCachedDeviceValidation();

// Validate with caching
const result = await validateDevice(deviceId, async (id) => {
  return await deviceService.validate(id);
});

// Clear cache if needed
await clearCache(deviceId);
```

### Connection Code Cache
```typescript
const { validateCode, isValidating } = useCachedConnectionCodeValidation();

const result = await validateCode(code, async (c) => {
  return await connectionCodeService.validate(c);
});
```

### Manual Cache Operations
```typescript
// Set cache
await OnboardingCache.set('my_key', data, 300000); // 5 min TTL

// Get cache
const cached = await OnboardingCache.get('my_key');

// Invalidate
await OnboardingCache.invalidate('my_key');

// Clear all
await OnboardingCache.clearAll();
```

## ⚡ Optimistic Updates

```typescript
const { performOptimisticUpdate, isUpdating, error } = useOptimisticUpdate();

await performOptimisticUpdate(
  // Actual operation
  () => saveToServer(data),
  
  // Optimistic data
  data,
  
  // Apply optimistic update
  (optimisticData) => setLocalState(optimisticData),
  
  // Rollback on failure
  () => setLocalState(previousState)
);
```

## 📊 Progress Tracking

```typescript
const { startOperation, updateProgress, completeOperation, progress } = useAsyncProgress();

// Start
startOperation('Provisioning device', 3);

// Update
updateProgress(1, 'Validating device...');
updateProgress(2, 'Configuring WiFi...');
updateProgress(3, 'Saving preferences...');

// Complete
completeOperation();

// Access progress
console.log(progress.percentage); // 0-100
console.log(progress.message);
```

## 🌐 Network Quality

```typescript
const { quality, measureRequest, getCacheTTL, getRetryDelay } = useNetworkQuality();

// Measure request
const start = Date.now();
await apiCall();
measureRequest(Date.now() - start);

// Get adaptive values
const ttl = getCacheTTL(); // Adapts to network quality
const delay = getRetryDelay(); // Adapts to network quality

// Check quality
if (quality === 'slow') {
  // Use longer cache TTL
}
```

## 📦 Batch Operations

```typescript
const { addToQueue, processBatch, queueSize } = useBatchOperations();

// Add operations
addToQueue(() => saveStep1());
addToQueue(() => saveStep2());
addToQueue(() => saveStep3());

// Auto-processes after 1 second, or manually:
await processBatch();
```

## 📈 Performance Metrics

```typescript
import { OnboardingPerformanceMetrics, measureAsyncOperation } from '../utils/onboardingPerformance';

// Measure operation
const result = await measureAsyncOperation('device_validation', async () => {
  return await validateDevice(deviceId);
});

// Get metrics
const metrics = OnboardingPerformanceMetrics.getAllMetrics();
console.log('Average time:', metrics.device_validation.avg);

// Clear metrics
OnboardingPerformanceMetrics.clearMetrics();
```

## 🎯 Common Patterns

### Pattern 1: Cached API Call
```typescript
const { validateDevice, isValidating } = useCachedDeviceValidation();

const handleValidate = async () => {
  const result = await validateDevice(deviceId, async (id) => {
    return await api.validateDevice(id);
  });
  
  if (result.isValid) {
    // Proceed
  }
};
```

### Pattern 2: Optimistic Form Submit
```typescript
const { performOptimisticUpdate } = useOptimisticUpdate();

const handleSubmit = async (formData) => {
  await performOptimisticUpdate(
    () => api.save(formData),
    formData,
    (data) => setFormState(data),
    () => setFormState(previousFormState)
  );
};
```

### Pattern 3: Multi-Step Progress
```typescript
const { startOperation, updateProgress, completeOperation } = useAsyncProgress();

const handleProvisioning = async () => {
  startOperation('Provisioning device', 4);
  
  updateProgress(1, 'Validating device...');
  await validateDevice();
  
  updateProgress(2, 'Creating device record...');
  await createDevice();
  
  updateProgress(3, 'Configuring WiFi...');
  await configureWiFi();
  
  updateProgress(4, 'Saving preferences...');
  await savePreferences();
  
  completeOperation();
};
```

### Pattern 4: Adaptive Caching
```typescript
const { quality, getCacheTTL } = useNetworkQuality();

const cacheData = async (key, data) => {
  const ttl = getCacheTTL(); // Adapts to network
  await OnboardingCache.set(key, data, ttl);
};
```

## 🔧 Configuration

### Cache TTL Values
```typescript
const CACHE_CONFIG = {
  DEVICE_VALIDATION: 5 * 60 * 1000,      // 5 minutes
  CONNECTION_CODE: 2 * 60 * 1000,        // 2 minutes
  PATIENT_INFO: 10 * 60 * 1000,          // 10 minutes
};
```

### Network Quality Thresholds
```typescript
const NETWORK_THRESHOLDS = {
  FAST: 500,    // < 500ms
  SLOW: 2000,   // 500ms - 2000ms
  OFFLINE: 2000 // > 2000ms
};
```

### Adaptive TTL by Network Quality
```typescript
const ADAPTIVE_TTL = {
  fast: 2 * 60 * 1000,    // 2 minutes
  slow: 10 * 60 * 1000,   // 10 minutes
  offline: 30 * 60 * 1000 // 30 minutes
};
```

## 🎨 UI Integration

### Loading States
```typescript
const { isValidating } = useCachedDeviceValidation();

return (
  <View>
    {isValidating && <LoadingSpinner />}
    <Button disabled={isValidating}>Validate</Button>
  </View>
);
```

### Progress Indicators
```typescript
const { progress } = useAsyncProgress();

return (
  <View>
    {progress.isActive && (
      <>
        <ProgressBar value={progress.percentage} />
        <Text>{progress.message}</Text>
      </>
    )}
  </View>
);
```

### Network Quality Indicator
```typescript
const { quality } = useNetworkQuality();

return (
  <View>
    {quality === 'slow' && (
      <Banner type="warning">
        Slow network detected. Some operations may take longer.
      </Banner>
    )}
  </View>
);
```

## 🐛 Debugging

### Enable Performance Logging
```typescript
// In development
if (__DEV__) {
  console.log('[Performance] Metrics:', OnboardingPerformanceMetrics.getAllMetrics());
}
```

### Monitor Cache Hit Rate
```typescript
let cacheHits = 0;
let cacheMisses = 0;

const { validateDevice } = useCachedDeviceValidation();

// Track hits/misses
const result = await validateDevice(deviceId, async (id) => {
  cacheMisses++;
  return await api.validate(id);
});

if (result === cachedResult) {
  cacheHits++;
}

console.log('Cache hit rate:', (cacheHits / (cacheHits + cacheMisses)) * 100);
```

### Test Slow Network
```typescript
// Simulate slow network
const slowNetworkDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const result = await measureAsyncOperation('slow_operation', async () => {
  await slowNetworkDelay(2000);
  return await api.call();
});
```

## ⚠️ Common Pitfalls

### ❌ Don't Cache Sensitive Data
```typescript
// BAD
await OnboardingCache.set('password', userPassword);

// GOOD
// Don't cache passwords or tokens
```

### ❌ Don't Use Optimistic Updates for Critical Operations
```typescript
// BAD - Payment operations should not be optimistic
await performOptimisticUpdate(() => processPayment(), ...);

// GOOD - Wait for confirmation
await processPayment();
```

### ❌ Don't Forget to Clear Cache on Logout
```typescript
// GOOD
const handleLogout = async () => {
  await OnboardingCache.clearAll();
  await logout();
};
```

### ❌ Don't Set TTL Too Long
```typescript
// BAD - Data might become stale
await OnboardingCache.set(key, data, 24 * 60 * 60 * 1000); // 24 hours

// GOOD - Reasonable TTL
await OnboardingCache.set(key, data, 5 * 60 * 1000); // 5 minutes
```

## 📚 Additional Resources

- [Performance Optimization Guide](./TASK25_PERFORMANCE_OPTIMIZATION.md)
- [Testing Guide](../../test-onboarding-performance.js)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)

## 🎯 Performance Checklist

- [ ] Cache frequently accessed data
- [ ] Use optimistic updates for non-critical operations
- [ ] Show progress indicators for long operations
- [ ] Adapt to network quality
- [ ] Batch multiple operations
- [ ] Measure and monitor performance
- [ ] Clear cache on logout
- [ ] Test on slow networks
- [ ] Set appropriate cache TTL
- [ ] Implement error handling and rollback

---

**Last Updated:** 2024  
**Version:** 1.0.0
