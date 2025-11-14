# Design System Documentation

## Overview

The Pildhora design system provides a consistent, accessible, and maintainable set of UI components and design tokens for building the medication management application. This system ensures visual consistency across all screens and simplifies development with reusable components.

## Design Tokens

Design tokens are the foundational building blocks of the design system. They define colors, spacing, typography, and other visual properties used throughout the application.

### Importing Tokens

```typescript
import { colors, spacing, typography, borderRadius, shadows } from '@/theme/tokens';
```

### Colors

#### Primary Palette
```typescript
colors.primary[50]   // #E6F0FF - Lightest
colors.primary[100]  // #CCE1FF
colors.primary[500]  // #007AFF - Main primary
colors.primary[600]  // #0066CC
colors.primary[700]  // #0052A3 - Darkest
```

#### Semantic Colors
```typescript
colors.success  // #34C759 - Success states
colors.warning  // #FF9500 - Warning states
colors.error    // #FF3B30 - Error states
colors.info     // #5856D6 - Informational states
```

#### Neutral Palette
```typescript
colors.gray[50]   // #F9FAFB - Lightest
colors.gray[100]  // #F3F4F6
colors.gray[200]  // #E5E7EB
colors.gray[300]  // #D1D5DB
colors.gray[400]  // #9CA3AF
colors.gray[500]  // #6B7280 - Mid gray
colors.gray[600]  // #4B5563
colors.gray[700]  // #374151
colors.gray[800]  // #1F2937
colors.gray[900]  // #111827 - Darkest
```

#### Surface Colors
```typescript
colors.background       // #F2F2F7 - App background
colors.surface          // #FFFFFF - Card/surface background
colors.surfaceElevated  // #FFFFFF - Elevated surfaces
```

### Spacing

```typescript
spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 12px
spacing.lg    // 16px
spacing.xl    // 20px
spacing['2xl'] // 24px
spacing['3xl'] // 32px
```

**Usage Example:**
```typescript
<View style={{ padding: spacing.lg, marginBottom: spacing.md }}>
  {/* Content */}
</View>
```

### Typography

#### Font Sizes
```typescript
typography.fontSize.xs    // 12px
typography.fontSize.sm    // 14px
typography.fontSize.base  // 16px
typography.fontSize.lg    // 18px
typography.fontSize.xl    // 20px
typography.fontSize['2xl'] // 24px
typography.fontSize['3xl'] // 30px
```

#### Font Weights
```typescript
typography.fontWeight.normal    // '400'
typography.fontWeight.medium    // '500'
typography.fontWeight.semibold  // '600'
typography.fontWeight.bold      // '700'
typography.fontWeight.extrabold // '800'
```

#### Line Heights
```typescript
typography.lineHeight.tight    // 1.25
typography.lineHeight.normal   // 1.5
typography.lineHeight.relaxed  // 1.75
```

**Usage Example:**
```typescript
<Text style={{
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
}}>
  Heading Text
</Text>
```

### Border Radius

```typescript
borderRadius.sm   // 8px
borderRadius.md   // 12px
borderRadius.lg   // 16px
borderRadius.xl   // 20px
borderRadius.full // 9999px - Fully rounded
```

### Shadows

```typescript
shadows.sm  // Small shadow (elevation: 2)
shadows.md  // Medium shadow (elevation: 4)
shadows.lg  // Large shadow (elevation: 8)
```

**Usage Example:**
```typescript
<View style={[{ backgroundColor: colors.surface }, shadows.md]}>
  {/* Elevated content */}
</View>
```

## Core Components

### Button

A versatile button component with multiple variants and states.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | Button content (text or elements) |
| `onPress` | `() => void` | Required | Press handler function |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'outline'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state with spinner |
| `fullWidth` | `boolean` | `false` | Full width button |
| `leftIcon` | `React.ReactNode` | - | Icon on the left side |
| `rightIcon` | `React.ReactNode` | - | Icon on the right side |
| `style` | `ViewStyle` | - | Additional styles |
| `accessibilityLabel` | `string` | - | Accessibility label |

#### Examples

```typescript
import { Button } from '@/components/ui';

// Primary button
<Button onPress={handleSubmit}>
  Submit
</Button>

// Secondary button with icon
<Button 
  variant="secondary" 
  leftIcon={<Icon name="add" />}
  onPress={handleAdd}
>
  Add Item
</Button>

// Loading state
<Button loading={isLoading} onPress={handleSave}>
  Save Changes
</Button>

// Danger button
<Button variant="danger" onPress={handleDelete}>
  Delete
</Button>

// Full width button
<Button fullWidth onPress={handleContinue}>
  Continue
</Button>

// Disabled button
<Button disabled onPress={handleAction}>
  Unavailable
</Button>
```

### Card

A container component for grouping related content with consistent styling.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | Card content |
| `variant` | `'default' \| 'elevated' \| 'outlined'` | `'default'` | Visual style variant |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| `onPress` | `() => void` | - | Makes card pressable |
| `header` | `React.ReactNode` | - | Optional header section |
| `footer` | `React.ReactNode` | - | Optional footer section |
| `style` | `ViewStyle` | - | Additional styles |

#### Examples

```typescript
import { Card } from '@/components/ui';

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Elevated card with header
<Card variant="elevated" header={<Text>Header</Text>}>
  <Text>Main content</Text>
</Card>

// Pressable card
<Card onPress={handleCardPress}>
  <Text>Tap me</Text>
</Card>

// Card with custom padding
<Card padding="lg">
  <Text>Spacious content</Text>
</Card>

// Card with header and footer
<Card
  header={<Text style={{ fontWeight: 'bold' }}>Title</Text>}
  footer={<Button onPress={handleAction}>Action</Button>}
>
  <Text>Content goes here</Text>
</Card>
```

### Input

A unified text input component with validation and error handling.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label |
| `error` | `string` | - | Error message to display |
| `helperText` | `string` | - | Helper text below input |
| `leftIcon` | `React.ReactNode` | - | Icon on the left side |
| `rightIcon` | `React.ReactNode` | - | Icon on the right side |
| `variant` | `'default' \| 'filled' \| 'outlined'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `required` | `boolean` | `false` | Shows required indicator |
| All `TextInputProps` | - | - | Standard React Native TextInput props |

#### Examples

```typescript
import { Input } from '@/components/ui';

// Basic input
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
/>

// Input with error
<Input
  label="Device ID"
  value={deviceId}
  onChangeText={setDeviceId}
  error="Device ID must be at least 5 characters"
/>

// Input with helper text
<Input
  label="Password"
  secureTextEntry
  helperText="Must be at least 8 characters"
  value={password}
  onChangeText={setPassword}
/>

// Input with icons
<Input
  label="Search"
  leftIcon={<Icon name="search" />}
  rightIcon={<Icon name="close" onPress={clearSearch} />}
  value={searchQuery}
  onChangeText={setSearchQuery}
/>

// Required input
<Input
  label="Name"
  required
  value={name}
  onChangeText={setName}
/>
```

### Modal

A modal dialog component with overlay and animations.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | Required | Modal visibility state |
| `onClose` | `() => void` | Required | Close handler function |
| `children` | `React.ReactNode` | Required | Modal content |
| `title` | `string` | - | Optional modal title |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Modal size |
| `animationType` | `'fade' \| 'slide'` | `'slide'` | Animation type |
| `showCloseButton` | `boolean` | `true` | Show close button |
| `closeOnOverlayPress` | `boolean` | `true` | Close on overlay tap |

#### Examples

```typescript
import { Modal } from '@/components/ui';

// Basic modal
<Modal visible={isOpen} onClose={handleClose}>
  <Text>Modal content</Text>
</Modal>

// Modal with title
<Modal
  visible={isOpen}
  onClose={handleClose}
  title="Confirm Action"
>
  <Text>Are you sure?</Text>
  <Button onPress={handleConfirm}>Confirm</Button>
</Modal>

// Full screen modal
<Modal
  visible={isOpen}
  onClose={handleClose}
  size="full"
  animationType="fade"
>
  <ScrollView>
    {/* Full screen content */}
  </ScrollView>
</Modal>

// Modal without close button
<Modal
  visible={isOpen}
  onClose={handleClose}
  showCloseButton={false}
  closeOnOverlayPress={false}
>
  <Text>Must complete action</Text>
</Modal>
```

### Chip

A compact component for displaying tags, filters, or selectable options.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | Required | Chip text |
| `selected` | `boolean` | `false` | Selected state |
| `onPress` | `() => void` | - | Press handler |
| `onRemove` | `() => void` | - | Remove handler (shows X) |
| `variant` | `'default' \| 'outlined' \| 'filled'` | `'default'` | Visual style variant |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'error'` | `'primary'` | Color theme |
| `size` | `'sm' \| 'md'` | `'md'` | Chip size |
| `leftIcon` | `React.ReactNode` | - | Icon on the left side |
| `disabled` | `boolean` | `false` | Disabled state |

#### Examples

```typescript
import { Chip } from '@/components/ui';

// Basic chip
<Chip label="Tag" />

// Selectable chip
<Chip
  label="Option 1"
  selected={selected === 'option1'}
  onPress={() => setSelected('option1')}
/>

// Removable chip
<Chip
  label="Filter"
  onRemove={() => removeFilter('filter1')}
/>

// Chip with icon
<Chip
  label="Urgent"
  leftIcon={<Icon name="alert" />}
  color="error"
/>

// Outlined chip
<Chip
  label="Category"
  variant="outlined"
  color="secondary"
/>
```

### ColorPicker

An intuitive color picker with presets and custom selection.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | Required | Current color (hex) |
| `onChange` | `(color: { hex: string; rgb: [number, number, number] }) => void` | Required | Change handler |
| `presets` | `string[]` | Default presets | Preset color array |
| `showPresets` | `boolean` | `true` | Show preset swatches |
| `showCustomPicker` | `boolean` | `true` | Show custom picker |

#### Examples

```typescript
import { ColorPicker } from '@/components/ui';

// Basic color picker
<ColorPicker
  value={color}
  onChange={({ hex, rgb }) => {
    setColor(hex);
    setRgbColor(rgb);
  }}
/>

// Color picker with custom presets
<ColorPicker
  value={color}
  onChange={handleColorChange}
  presets={['#FF0000', '#00FF00', '#0000FF', '#FFFF00']}
/>

// Color picker without presets
<ColorPicker
  value={color}
  onChange={handleColorChange}
  showPresets={false}
/>
```

### LoadingSpinner

A loading indicator component with size variants.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size |
| `color` | `string` | `colors.primary[500]` | Spinner color |
| `text` | `string` | - | Optional loading text |

#### Examples

```typescript
import { LoadingSpinner } from '@/components/ui';

// Basic spinner
<LoadingSpinner />

// Large spinner with text
<LoadingSpinner size="lg" text="Loading devices..." />

// Custom color spinner
<LoadingSpinner color={colors.success} />
```

### ErrorMessage

An error display component with retry and dismiss options.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | Required | Error message text |
| `onRetry` | `() => void` | - | Retry handler |
| `onDismiss` | `() => void` | - | Dismiss handler |
| `variant` | `'inline' \| 'banner' \| 'toast'` | `'inline'` | Display variant |

#### Examples

```typescript
import { ErrorMessage } from '@/components/ui';

// Inline error
<ErrorMessage message="Invalid device ID" />

// Error with retry
<ErrorMessage
  message="Failed to connect to server"
  onRetry={handleRetry}
  variant="banner"
/>

// Dismissible error
<ErrorMessage
  message="Operation failed"
  onDismiss={handleDismiss}
  variant="toast"
/>
```

### SuccessMessage

A success feedback component with auto-dismiss functionality.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | Required | Success message text |
| `autoDismiss` | `boolean` | `true` | Auto-dismiss after duration |
| `duration` | `number` | `3000` | Duration in milliseconds |
| `onDismiss` | `() => void` | - | Dismiss handler |

#### Examples

```typescript
import { SuccessMessage } from '@/components/ui';

// Basic success message
<SuccessMessage message="Device linked successfully" />

// Success message without auto-dismiss
<SuccessMessage
  message="Changes saved"
  autoDismiss={false}
  onDismiss={handleDismiss}
/>

// Custom duration
<SuccessMessage
  message="Operation complete"
  duration={5000}
/>
```

## Screen-Specific Components

### AdherenceCard

Displays medication adherence progress for the patient home screen.

```typescript
import { AdherenceCard } from '@/components/screens/patient';

<AdherenceCard
  taken={3}
  total={4}
  percentage={75}
/>
```

### UpcomingDoseCard

Shows the next scheduled medication dose.

```typescript
import { UpcomingDoseCard } from '@/components/screens/patient';

<UpcomingDoseCard
  medicationName="Aspirina"
  dosage="500mg"
  time="14:30"
  onTakeMedication={handleTakeMedication}
/>
```

### DeviceStatusCard

Displays device status and battery information.

```typescript
import { DeviceStatusCard } from '@/components/screens/patient';

<DeviceStatusCard
  battery={85}
  status="active"
  isOnline={true}
  lastSeen={new Date()}
/>
```

### MedicationListItem

A list item component for displaying medications.

```typescript
import { MedicationListItem } from '@/components/screens/patient';

<MedicationListItem
  name="Aspirina"
  dosage="500mg"
  time="08:00"
  taken={true}
  onPress={handleViewDetails}
/>
```

## Shared Components

### DeviceConfigPanel

A comprehensive device configuration panel with alarm mode, LED intensity, and color controls.

```typescript
import { DeviceConfigPanel } from '@/components/shared';

<DeviceConfigPanel
  deviceId="DEVICE-001"
  config={{
    alarmMode: 'both',
    ledIntensity: 512,
    ledColor: { r: 255, g: 0, b: 0 }
  }}
  onSave={handleSaveConfig}
  onCancel={handleCancel}
/>
```

### NotificationSettings

A notification preferences component for the settings screen.

```typescript
import { NotificationSettings } from '@/components/shared';

<NotificationSettings
  enabled={true}
  permissionStatus="granted"
  hierarchy={['urgent', 'medication', 'general']}
  customModalities={['custom1']}
  onSave={handleSavePreferences}
/>
```

## Best Practices

### Component Composition

Build complex UIs by composing simple components:

```typescript
<Card variant="elevated">
  <View style={{ padding: spacing.lg }}>
    <Text style={{ 
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.md
    }}>
      Device Configuration
    </Text>
    
    <Input
      label="Device ID"
      value={deviceId}
      onChangeText={setDeviceId}
      error={errors.deviceId}
    />
    
    <View style={{ marginTop: spacing.lg }}>
      <Button onPress={handleSave} loading={isSaving}>
        Save Changes
      </Button>
    </View>
  </View>
</Card>
```

### Consistent Spacing

Use design tokens for consistent spacing:

```typescript
// Good
<View style={{ 
  padding: spacing.lg,
  marginBottom: spacing.md,
  gap: spacing.sm
}}>

// Avoid
<View style={{ 
  padding: 16,
  marginBottom: 10,
  gap: 5
}}>
```

### Color Usage

Use semantic colors for consistent meaning:

```typescript
// Success state
<Text style={{ color: colors.success }}>Operation successful</Text>

// Error state
<Text style={{ color: colors.error }}>Error occurred</Text>

// Primary action
<Button variant="primary">Submit</Button>

// Destructive action
<Button variant="danger">Delete</Button>
```

### Accessibility

Always provide accessibility labels:

```typescript
<Button
  onPress={handleSubmit}
  accessibilityLabel="Submit form"
  accessibilityHint="Submits the device configuration form"
>
  Submit
</Button>

<Input
  label="Device ID"
  accessibilityLabel="Enter device identifier"
  required
/>
```

### Performance

Optimize component rendering:

```typescript
// Memoize expensive components
const MedicationList = React.memo(({ medications }) => (
  <FlatList
    data={medications}
    renderItem={({ item }) => <MedicationListItem {...item} />}
    keyExtractor={(item) => item.id}
  />
));

// Use callbacks for event handlers
const handlePress = useCallback(() => {
  // Handle press
}, [dependencies]);
```

## Migration from Old Components

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.
