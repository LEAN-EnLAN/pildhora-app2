# UI Component Migration Guide

## Overview

This guide helps developers migrate from the old UI implementation to the new design system. The refactored components provide better consistency, accessibility, and maintainability.

## Quick Reference

| Old Pattern | New Pattern |
|-------------|-------------|
| Inline styles with hardcoded values | Design tokens from `@/theme/tokens` |
| `TouchableOpacity` with custom styling | `Button` component with variants |
| `TextInput` with custom styling | `Input` component with validation |
| Custom modal implementations | `Modal` component |
| Custom chip/tag implementations | `Chip` component |
| Inline error text | `ErrorMessage` component |
| `ActivityIndicator` with text | `LoadingSpinner` component |

## Step-by-Step Migration

### 1. Import Design Tokens

**Before:**
```typescript
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});
```

**After:**
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme/tokens';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
});
```

### 2. Replace TouchableOpacity with Button

**Before:**
```typescript
<TouchableOpacity
  style={{
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  }}
  onPress={handleSubmit}
  disabled={isLoading}
>
  {isLoading ? (
    <ActivityIndicator color="#FFFFFF" />
  ) : (
    <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
      Submit
    </Text>
  )}
</TouchableOpacity>
```

**After:**
```typescript
import { Button } from '@/components/ui';

<Button
  onPress={handleSubmit}
  loading={isLoading}
  variant="primary"
>
  Submit
</Button>
```

### 3. Replace TextInput with Input

**Before:**
```typescript
<View>
  <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
    Device ID
  </Text>
  <TextInput
    style={{
      borderWidth: 1,
      borderColor: error ? '#FF3B30' : '#D1D5DB',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    }}
    value={deviceId}
    onChangeText={setDeviceId}
    placeholder="Enter device ID"
  />
  {error && (
    <Text style={{ color: '#FF3B30', fontSize: 12, marginTop: 4 }}>
      {error}
    </Text>
  )}
</View>
```

**After:**
```typescript
import { Input } from '@/components/ui';

<Input
  label="Device ID"
  value={deviceId}
  onChangeText={setDeviceId}
  placeholder="Enter device ID"
  error={error}
/>
```

### 4. Replace Custom Modals with Modal Component

**Before:**
```typescript
<ReactNativeModal
  isVisible={isOpen}
  onBackdropPress={handleClose}
  style={{ margin: 0, justifyContent: 'flex-end' }}
>
  <View style={{
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Title</Text>
      <TouchableOpacity onPress={handleClose}>
        <Text>✕</Text>
      </TouchableOpacity>
    </View>
    {/* Content */}
  </View>
</ReactNativeModal>
```

**After:**
```typescript
import { Modal } from '@/components/ui';

<Modal
  visible={isOpen}
  onClose={handleClose}
  title="Title"
  size="md"
>
  {/* Content */}
</Modal>
```

### 5. Replace Custom Chips with Chip Component

**Before:**
```typescript
<TouchableOpacity
  style={{
    backgroundColor: selected ? '#007AFF' : '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  }}
  onPress={handlePress}
>
  <Text style={{
    color: selected ? '#FFFFFF' : '#374151',
    fontSize: 14,
  }}>
    {label}
  </Text>
  {onRemove && (
    <TouchableOpacity onPress={onRemove} style={{ marginLeft: 4 }}>
      <Text style={{ color: selected ? '#FFFFFF' : '#374151' }}>✕</Text>
    </TouchableOpacity>
  )}
</TouchableOpacity>
```

**After:**
```typescript
import { Chip } from '@/components/ui';

<Chip
  label={label}
  selected={selected}
  onPress={handlePress}
  onRemove={onRemove}
/>
```

### 6. Replace Loading States with LoadingSpinner

**Before:**
```typescript
{isLoading && (
  <View style={{ alignItems: 'center', padding: 20 }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 8, color: '#6B7280' }}>
      Loading...
    </Text>
  </View>
)}
```

**After:**
```typescript
import { LoadingSpinner } from '@/components/ui';

{isLoading && (
  <LoadingSpinner size="lg" text="Loading..." />
)}
```

### 7. Replace Error Messages with ErrorMessage Component

**Before:**
```typescript
{error && (
  <View style={{
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  }}>
    <Text style={{ color: '#991B1B' }}>{error}</Text>
    <TouchableOpacity onPress={handleRetry} style={{ marginTop: 8 }}>
      <Text style={{ color: '#007AFF', fontWeight: '600' }}>Retry</Text>
    </TouchableOpacity>
  </View>
)}
```

**After:**
```typescript
import { ErrorMessage } from '@/components/ui';

{error && (
  <ErrorMessage
    message={error}
    onRetry={handleRetry}
    variant="banner"
  />
)}
```

### 8. Replace Success Messages with SuccessMessage Component

**Before:**
```typescript
{success && (
  <View style={{
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  }}>
    <Text style={{ color: '#065F46' }}>{successMessage}</Text>
  </View>
)}
```

**After:**
```typescript
import { SuccessMessage } from '@/components/ui';

{success && (
  <SuccessMessage
    message={successMessage}
    autoDismiss
    duration={3000}
  />
)}
```

## Screen Migration Examples

### Caregiver Add Device Screen

**Before:**
```typescript
// app/caregiver/add-device.tsx
export default function AddDeviceScreen() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#F2F2F7' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 20 }}>
        Vincular Dispositivo
      </Text>
      
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Device ID
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 8,
            padding: 12,
          }}
          value={deviceId}
          onChangeText={setDeviceId}
        />
      </View>
      
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={handleLink}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
          Vincular
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

**After:**
```typescript
// app/caregiver/add-device.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Input, Button, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/theme/tokens';

export default function AddDeviceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vincular Dispositivo</Text>
      
      <Card variant="elevated" padding="lg">
        <Input
          label="Device ID"
          value={deviceId}
          onChangeText={setDeviceId}
          placeholder="Ingresa el ID del dispositivo"
          error={error}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleLink}
            loading={isLoading}
            fullWidth
          >
            Vincular
          </Button>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
    color: colors.gray[900],
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});
```

### Patient Home Screen

**Before:**
```typescript
// app/patient/home.tsx
export default function PatientHomeScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>PILDHORA</Text>
        
        <View style={{
          backgroundColor: '#FFFFFF',
          padding: 16,
          borderRadius: 12,
          marginTop: 20,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>
            Estado del día
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '700', marginTop: 8 }}>
            75%
          </Text>
          <Text style={{ color: '#6B7280' }}>
            3 de 4 dosis tomadas
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
```

**After:**
```typescript
// app/patient/home.tsx
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { AdherenceCard, UpcomingDoseCard, DeviceStatusCard } from '@/components/screens/patient';
import { colors, spacing, typography } from '@/theme/tokens';

export default function PatientHomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PILDHORA</Text>
        
        <AdherenceCard
          taken={3}
          total={4}
          percentage={75}
        />
        
        <UpcomingDoseCard
          medicationName="Aspirina"
          dosage="500mg"
          time="14:30"
          onTakeMedication={handleTakeMedication}
        />
        
        <DeviceStatusCard
          battery={85}
          status="active"
          isOnline={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.lg,
  },
});
```

## Common Patterns

### Form Layouts

**Before:**
```typescript
<View>
  <TextInput />
  <TextInput />
  <TouchableOpacity>
    <Text>Submit</Text>
  </TouchableOpacity>
</View>
```

**After:**
```typescript
<Card padding="lg">
  <Input label="Field 1" value={field1} onChangeText={setField1} />
  <View style={{ marginTop: spacing.md }}>
    <Input label="Field 2" value={field2} onChangeText={setField2} />
  </View>
  <View style={{ marginTop: spacing.lg }}>
    <Button onPress={handleSubmit} fullWidth>Submit</Button>
  </View>
</Card>
```

### List Items

**Before:**
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => (
    <TouchableOpacity style={{
      backgroundColor: '#FFFFFF',
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
    }}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  )}
/>
```

**After:**
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => (
    <Card
      onPress={() => handleItemPress(item)}
      style={{ marginBottom: spacing.sm }}
    >
      <Text>{item.name}</Text>
    </Card>
  )}
  contentContainerStyle={{ padding: spacing.lg }}
/>
```

### Medication Lists

**Before:**
```typescript
<FlatList
  data={medications}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
      }}
      onPress={() => router.push(`/patient/medications/${item.id}`)}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          {item.name}
        </Text>
        <Text style={{ color: '#6B7280', marginTop: 4 }}>
          {item.dosage}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {item.times.map((time) => (
            <View
              key={time}
              style={{
                backgroundColor: '#EFF6FF',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                marginRight: 4,
              }}
            >
              <Text style={{ fontSize: 12, color: '#1D4ED8' }}>
                {time}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  )}
/>
```

**After:**
```typescript
import { MedicationCard } from '@/components/screens/patient';

<FlatList
  data={medications}
  renderItem={({ item }) => (
    <MedicationCard
      medication={item}
      onPress={() => router.push(`/patient/medications/${item.id}`)}
    />
  )}
  keyExtractor={(item) => item.id}
  contentContainerStyle={{ padding: spacing.lg }}
/>
```

### History Records with Filters

**Before:**
```typescript
const [filter, setFilter] = useState('all');

<View>
  <View style={{ flexDirection: 'row', padding: 16 }}>
    <TouchableOpacity
      style={{
        backgroundColor: filter === 'all' ? '#007AFF' : '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
      }}
      onPress={() => setFilter('all')}
    >
      <Text style={{ color: filter === 'all' ? '#FFFFFF' : '#6B7280' }}>
        All
      </Text>
    </TouchableOpacity>
    {/* More filter buttons... */}
  </View>
  
  <FlatList
    data={filteredRecords}
    renderItem={({ item }) => (
      <View style={{
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: item.status === 'taken' ? '#34C759' : '#FF3B30',
      }}>
        <Text>{item.medicationName}</Text>
        <Text>{item.status}</Text>
      </View>
    )}
  />
</View>
```

**After:**
```typescript
import { HistoryFilterBar, HistoryRecordCard } from '@/components/screens/patient';

const [selectedFilter, setSelectedFilter] = useState<'all' | 'taken' | 'missed'>('all');

<View>
  <HistoryFilterBar
    selectedFilter={selectedFilter}
    onFilterChange={setSelectedFilter}
    counts={{
      all: intakeRecords.length,
      taken: intakeRecords.filter(r => r.status === 'taken').length,
      missed: intakeRecords.filter(r => r.status === 'missed').length,
    }}
  />
  
  <FlatList
    data={filteredRecords}
    renderItem={({ item }) => (
      <HistoryRecordCard
        record={item}
        medication={medications.find(m => m.id === item.medicationId)}
        onMarkAsMissed={handleMarkAsMissed}
      />
    )}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ padding: spacing.lg }}
  />
</View>
```

### Loading States

**Before:**
```typescript
{isLoading ? (
  <ActivityIndicator />
) : (
  <View>{/* Content */}</View>
)}
```

**After:**
```typescript
import { LoadingSpinner } from '@/components/ui';

{isLoading ? (
  <LoadingSpinner size="lg" text="Loading..." />
) : (
  <View>{/* Content */}</View>
)}
```

## Breaking Changes

### Button Component

- `title` prop removed → use `children` instead
- `type` prop removed → use `variant` instead
- Custom `buttonStyle` → use `style` prop

### Input Component

- Separate label component removed → use `label` prop
- Error text component removed → use `error` prop
- Helper text component removed → use `helperText` prop

### Card Component

- `elevation` prop removed → use `variant="elevated"` instead
- Custom shadow styles → use design token `shadows`

## Testing Your Migration

### Visual Testing

1. Compare old and new screens side-by-side
2. Check all interactive states (hover, press, disabled)
3. Verify spacing and alignment
4. Test on both iOS and Android
5. Test in light and dark mode (if applicable)

### Functional Testing

1. Verify all event handlers work correctly
2. Test form validation and error states
3. Check loading states and transitions
4. Test accessibility with screen readers
5. Verify keyboard navigation

### Performance Testing

1. Profile component render times
2. Check for unnecessary re-renders
3. Verify animations run at 60fps
4. Test with large lists (virtualization)

## Troubleshooting

### Styles Not Applying

**Problem:** Design tokens not working
```typescript
// ❌ Wrong
import { colors } from '../theme/tokens';

// ✅ Correct
import { colors } from '@/theme/tokens';
```

### TypeScript Errors

**Problem:** Props not recognized
```typescript
// Make sure you're importing from the correct location
import { Button } from '@/components/ui';

// Not from old location
import { Button } from '@/components/Button';
```

### Animation Issues

**Problem:** Animations not smooth
```typescript
// ✅ Always use native driver when possible
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Important!
}).start();
```

### Accessibility Warnings

**Problem:** Missing accessibility labels
```typescript
// ✅ Add labels to all interactive elements
<Button
  onPress={handlePress}
  accessibilityLabel="Submit form"
  accessibilityHint="Submits the device configuration"
>
  Submit
</Button>
```

## Getting Help

- Check the [Design System Documentation](./DESIGN_SYSTEM.md)
- Review component examples in the codebase
- Ask questions in the team chat
- Create an issue for bugs or missing features

## Checklist

Use this checklist when migrating a screen:

- [ ] Replace hardcoded values with design tokens
- [ ] Replace TouchableOpacity with Button component
- [ ] Replace TextInput with Input component
- [ ] Replace custom modals with Modal component
- [ ] Replace custom chips with Chip component
- [ ] Replace loading indicators with LoadingSpinner
- [ ] Replace error messages with ErrorMessage component
- [ ] Add accessibility labels to all interactive elements
- [ ] Test on iOS and Android
- [ ] Test with screen reader
- [ ] Verify all functionality works
- [ ] Check performance (no jank)
- [ ] Update tests if needed
