# Component Documentation

## Table of Contents

- [Core UI Components](#core-ui-components)
  - [Button](#button)
  - [Card](#card)
  - [Input](#input)
  - [Modal](#modal)
  - [Chip](#chip)
  - [ColorPicker](#colorpicker)
  - [LoadingSpinner](#loadingspinner)
  - [ErrorMessage](#errormessage)
  - [SuccessMessage](#successmessage)
- [Screen-Specific Components](#screen-specific-components)
  - [AdherenceCard](#adherencecard)
  - [UpcomingDoseCard](#upcomingdosecard)
  - [DeviceStatusCard](#devicestatuscard)
  - [MedicationListItem](#medicationlistitem)
  - [MedicationCard](#medicationcard)
  - [HistoryRecordCard](#historyrecordcard)
  - [HistoryFilterBar](#historyfilterbar)
- [Shared Components](#shared-components)
  - [DeviceConfigPanel](#deviceconfigpanel)
  - [NotificationSettings](#notificationsettings)

---

## Core UI Components

### Button

A versatile, accessible button component with multiple variants, sizes, and states.

#### Import

```typescript
import { Button } from '@/components/ui';
```

#### Props

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}
```

#### Variants

- **primary**: Main call-to-action button (blue background)
- **secondary**: Secondary actions (gray background)
- **danger**: Destructive actions (red background)
- **ghost**: Minimal button (transparent background)
- **outline**: Outlined button (transparent with border)

#### Examples

```typescript
// Primary button (default)
<Button onPress={() => console.log('Pressed')}>
  Submit
</Button>

// Secondary button
<Button variant="secondary" onPress={handleCancel}>
  Cancel
</Button>

// Danger button for destructive actions
<Button variant="danger" onPress={handleDelete}>
  Delete Account
</Button>

// Ghost button for subtle actions
<Button variant="ghost" onPress={handleSkip}>
  Skip
</Button>

// Outline button
<Button variant="outline" onPress={handleEdit}>
  Edit
</Button>

// Small button
<Button size="sm" onPress={handleQuickAction}>
  Quick Action
</Button>

// Large button
<Button size="lg" onPress={handleImportantAction}>
  Important Action
</Button>

// Button with loading state
<Button loading={isSubmitting} onPress={handleSubmit}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>

// Disabled button
<Button disabled onPress={handleAction}>
  Unavailable
</Button>

// Full width button
<Button fullWidth onPress={handleContinue}>
  Continue
</Button>

// Button with left icon
<Button
  leftIcon={<Icon name="add" size={20} color="#FFFFFF" />}
  onPress={handleAdd}
>
  Add Item
</Button>

// Button with right icon
<Button
  rightIcon={<Icon name="arrow-forward" size={20} color="#FFFFFF" />}
  onPress={handleNext}
>
  Next
</Button>

// Button with accessibility label
<Button
  onPress={handleSubmit}
  accessibilityLabel="Submit registration form"
  accessibilityHint="Submits your information and creates an account"
>
  Submit
</Button>

// Custom styled button
<Button
  onPress={handleAction}
  style={{ marginTop: 20, marginHorizontal: 10 }}
>
  Custom Margin
</Button>
```

#### Accessibility

The Button component automatically includes:
- `accessibilityRole="button"`
- Proper touch target size (minimum 44x44 points)
- Disabled state announcement
- Loading state announcement

#### Animation

Buttons include a subtle scale animation on press for tactile feedback.

---

### Card

A container component for grouping related content with consistent styling and elevation.

#### Import

```typescript
import { Card } from '@/components/ui';
```

#### Props

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
}
```

#### Variants

- **default**: Standard card with subtle shadow
- **elevated**: Card with prominent shadow
- **outlined**: Card with border, no shadow

#### Examples

```typescript
// Basic card
<Card>
  <Text>Card content goes here</Text>
</Card>

// Elevated card
<Card variant="elevated">
  <Text>This card has more prominent shadow</Text>
</Card>

// Outlined card
<Card variant="outlined">
  <Text>This card has a border instead of shadow</Text>
</Card>

// Card with no padding
<Card padding="none">
  <Image source={image} style={{ width: '100%', height: 200 }} />
  <View style={{ padding: 16 }}>
    <Text>Image with custom padding below</Text>
  </View>
</Card>

// Card with small padding
<Card padding="sm">
  <Text>Compact content</Text>
</Card>

// Card with large padding
<Card padding="lg">
  <Text>Spacious content</Text>
</Card>

// Pressable card
<Card onPress={() => console.log('Card pressed')}>
  <Text>Tap me!</Text>
</Card>

// Card with header
<Card
  header={
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
      Card Title
    </Text>
  }
>
  <Text>Main content</Text>
</Card>

// Card with footer
<Card
  footer={
    <Button onPress={handleAction}>
      Action
    </Button>
  }
>
  <Text>Content with action button below</Text>
</Card>

// Card with header and footer
<Card
  header={<Text style={{ fontWeight: 'bold' }}>Settings</Text>}
  footer={
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Button variant="outline" onPress={handleCancel}>Cancel</Button>
      <Button onPress={handleSave}>Save</Button>
    </View>
  }
>
  <Text>Configuration options</Text>
</Card>

// Custom styled card
<Card style={{ marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#007AFF' }}>
  <Text>Card with custom accent</Text>
</Card>
```

#### Use Cases

- Grouping related information
- List items with multiple fields
- Settings sections
- Dashboard widgets
- Form containers

---

### Input

A unified text input component with label, validation, error handling, and icon support.

#### Import

```typescript
import { Input } from '@/components/ui';
```

#### Props

```typescript
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
}
```

#### Examples

```typescript
// Basic input
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
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
  value={password}
  onChangeText={setPassword}
  helperText="Must be at least 8 characters with one number"
/>

// Required input
<Input
  label="Full Name"
  required
  value={name}
  onChangeText={setName}
  placeholder="John Doe"
/>

// Input with left icon
<Input
  label="Search"
  leftIcon={<Icon name="search" size={20} color="#6B7280" />}
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search medications..."
/>

// Input with right icon (clear button)
<Input
  label="Username"
  value={username}
  onChangeText={setUsername}
  rightIcon={
    username ? (
      <TouchableOpacity onPress={() => setUsername('')}>
        <Icon name="close" size={20} color="#6B7280" />
      </TouchableOpacity>
    ) : null
  }
/>

// Input with both icons
<Input
  label="Amount"
  leftIcon={<Text style={{ color: '#6B7280' }}>$</Text>}
  rightIcon={<Text style={{ color: '#6B7280' }}>.00</Text>}
  value={amount}
  onChangeText={setAmount}
  keyboardType="numeric"
/>

// Filled variant
<Input
  variant="filled"
  label="Notes"
  value={notes}
  onChangeText={setNotes}
  multiline
  numberOfLines={4}
/>

// Outlined variant
<Input
  variant="outlined"
  label="Phone Number"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
/>

// Small input
<Input
  size="sm"
  label="Code"
  value={code}
  onChangeText={setCode}
  maxLength={6}
/>

// Large input
<Input
  size="lg"
  label="Title"
  value={title}
  onChangeText={setTitle}
/>

// Disabled input
<Input
  label="User ID"
  value={userId}
  editable={false}
/>
```

#### Validation Example

```typescript
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const validateEmail = (value: string) => {
  if (!value) {
    setEmailError('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(value)) {
    setEmailError('Please enter a valid email');
  } else {
    setEmailError('');
  }
};

<Input
  label="Email"
  required
  value={email}
  onChangeText={(value) => {
    setEmail(value);
    validateEmail(value);
  }}
  onBlur={() => validateEmail(email)}
  error={emailError}
  keyboardType="email-address"
  autoCapitalize="none"
/>
```

#### Accessibility

The Input component automatically includes:
- Label association with input field
- Error announcement for screen readers
- Required field indication
- Proper keyboard type hints

---

### Modal

A modal dialog component with overlay, animations, and configurable sizes.

#### Import

```typescript
import { Modal } from '@/components/ui';
```

#### Props

```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  animationType?: 'fade' | 'slide';
  showCloseButton?: boolean;
  closeOnOverlayPress?: boolean;
}
```

#### Examples

```typescript
// Basic modal
const [isOpen, setIsOpen] = useState(false);

<Modal visible={isOpen} onClose={() => setIsOpen(false)}>
  <Text>Modal content</Text>
  <Button onPress={() => setIsOpen(false)}>Close</Button>
</Modal>

// Modal with title
<Modal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <Text>Are you sure you want to proceed?</Text>
  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
    <Button variant="outline" onPress={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button onPress={handleConfirm}>
      Confirm
    </Button>
  </View>
</Modal>

// Small modal
<Modal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  size="sm"
  title="Quick Action"
>
  <Text>Small modal for quick actions</Text>
</Modal>

// Large modal
<Modal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  size="lg"
  title="Detailed Information"
>
  <ScrollView>
    {/* Lots of content */}
  </ScrollView>
</Modal>

// Full screen modal
<Modal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  size="full"
  animationType="fade"
>
  <ScrollView>
    {/* Full screen content */}
  </ScrollView>
</Modal>

// Modal with fade animation
<Modal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  animationType="fade"
>
  <Text>Fades in and out</Text>
</Modal>

// Modal without close button
<Modal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  showCloseButton={false}
  title="Required Action"
>
  <Text>You must complete this action</Text>
  <Button onPress={handleComplete}>Complete</Button>
</Modal>

// Modal that doesn't close on overlay press
<Modal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  closeOnOverlayPress={false}
  title="Important"
>
  <Text>Must use button to close</Text>
  <Button onPress={() => setIsOpen(false)}>Done</Button>
</Modal>

// Form modal
<Modal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add Medication"
  size="lg"
>
  <Input
    label="Medication Name"
    value={name}
    onChangeText={setName}
  />
  <Input
    label="Dosage"
    value={dosage}
    onChangeText={setDosage}
  />
  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
    <Button variant="outline" onPress={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button onPress={handleSave}>
      Save
    </Button>
  </View>
</Modal>
```

#### Accessibility

The Modal component automatically includes:
- Focus trap (focus stays within modal)
- Escape key support (on web)
- Proper ARIA attributes
- Screen reader announcements

---

### Chip

A compact component for displaying tags, filters, or selectable options.

#### Import

```typescript
import { Chip } from '@/components/ui';
```

#### Props

```typescript
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  color?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  disabled?: boolean;
}
```

#### Examples

```typescript
// Basic chip
<Chip label="Tag" />

// Selectable chip
const [selected, setSelected] = useState('option1');

<View style={{ flexDirection: 'row', gap: 8 }}>
  <Chip
    label="Option 1"
    selected={selected === 'option1'}
    onPress={() => setSelected('option1')}
  />
  <Chip
    label="Option 2"
    selected={selected === 'option2'}
    onPress={() => setSelected('option2')}
  />
  <Chip
    label="Option 3"
    selected={selected === 'option3'}
    onPress={() => setSelected('option3')}
  />
</View>

// Removable chip
const [tags, setTags] = useState(['urgent', 'medication', 'general']);

<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {tags.map((tag) => (
    <Chip
      key={tag}
      label={tag}
      onRemove={() => setTags(tags.filter(t => t !== tag))}
    />
  ))}
</View>

// Chip with icon
<Chip
  label="Urgent"
  leftIcon={<Icon name="alert" size={16} color="#FFFFFF" />}
  color="error"
/>

// Outlined chip
<Chip
  label="Category"
  variant="outlined"
  color="secondary"
/>

// Filled chip
<Chip
  label="Status"
  variant="filled"
  color="success"
/>

// Small chip
<Chip
  label="Small"
  size="sm"
/>

// Disabled chip
<Chip
  label="Disabled"
  disabled
  onPress={() => {}}
/>

// Color variants
<View style={{ flexDirection: 'row', gap: 8 }}>
  <Chip label="Primary" color="primary" />
  <Chip label="Secondary" color="secondary" />
  <Chip label="Success" color="success" />
  <Chip label="Error" color="error" />
</View>

// Alarm mode selector example
const [alarmMode, setAlarmMode] = useState<'off' | 'sound' | 'led' | 'both'>('both');

<View style={{ flexDirection: 'row', gap: 8 }}>
  <Chip
    label="Off"
    selected={alarmMode === 'off'}
    onPress={() => setAlarmMode('off')}
  />
  <Chip
    label="Sound"
    selected={alarmMode === 'sound'}
    onPress={() => setAlarmMode('sound')}
  />
  <Chip
    label="LED"
    selected={alarmMode === 'led'}
    onPress={() => setAlarmMode('led')}
  />
  <Chip
    label="Both"
    selected={alarmMode === 'both'}
    onPress={() => setAlarmMode('both')}
  />
</View>
```

#### Use Cases

- Tag selection
- Filter options
- Alarm mode selection
- Notification modalities
- Category badges
- Status indicators

---

### ColorPicker

An intuitive color picker with preset swatches and custom HSB color selection.

#### Import

```typescript
import { ColorPicker } from '@/components/ui';
```

#### Props

```typescript
interface ColorPickerProps {
  value: string; // hex color
  onChange: (color: { hex: string; rgb: [number, number, number] }) => void;
  presets?: string[];
  showPresets?: boolean;
  showCustomPicker?: boolean;
}
```

#### Examples

```typescript
// Basic color picker
const [color, setColor] = useState('#FF0000');

<ColorPicker
  value={color}
  onChange={({ hex, rgb }) => {
    setColor(hex);
    console.log('RGB:', rgb); // [255, 0, 0]
  }}
/>

// Color picker with custom presets
<ColorPicker
  value={color}
  onChange={handleColorChange}
  presets={[
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
  ]}
/>

// Color picker without presets
<ColorPicker
  value={color}
  onChange={handleColorChange}
  showPresets={false}
/>

// Color picker without custom picker (presets only)
<ColorPicker
  value={color}
  onChange={handleColorChange}
  showCustomPicker={false}
/>

// LED color configuration example
const [ledColor, setLedColor] = useState({ r: 255, g: 0, b: 0 });
const [colorHex, setColorHex] = useState('#FF0000');

<View>
  <Text>LED Color</Text>
  <TouchableOpacity onPress={() => setShowPicker(true)}>
    <View style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colorHex,
      borderWidth: 2,
      borderColor: '#D1D5DB',
    }} />
  </TouchableOpacity>
  
  <Modal visible={showPicker} onClose={() => setShowPicker(false)}>
    <ColorPicker
      value={colorHex}
      onChange={({ hex, rgb }) => {
        setColorHex(hex);
        setLedColor({ r: rgb[0], g: rgb[1], b: rgb[2] });
      }}
    />
    <Button onPress={() => setShowPicker(false)}>Done</Button>
  </Modal>
</View>
```

#### Features

- Preset color swatches for quick selection
- Custom HSB (Hue, Saturation, Brightness) picker
- Real-time color preview
- RGB output for device configuration
- Smooth color transitions

---

### LoadingSpinner

A loading indicator component with size variants and optional text.

#### Import

```typescript
import { LoadingSpinner } from '@/components/ui';
```

#### Props

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}
```

#### Examples

```typescript
// Basic spinner
<LoadingSpinner />

// Small spinner
<LoadingSpinner size="sm" />

// Large spinner
<LoadingSpinner size="lg" />

// Spinner with text
<LoadingSpinner text="Loading devices..." />

// Spinner with custom color
<LoadingSpinner color="#34C759" text="Syncing..." />

// Full screen loading
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  <LoadingSpinner size="lg" text="Loading your medications..." />
</View>

// Inline loading
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  <LoadingSpinner size="sm" />
  <Text>Saving...</Text>
</View>
```

---

### ErrorMessage

An error display component with retry and dismiss options.

#### Import

```typescript
import { ErrorMessage } from '@/components/ui';
```

#### Props

```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'banner' | 'toast';
}
```

#### Variants

- **inline**: Compact error message for forms
- **banner**: Prominent error banner for page-level errors
- **toast**: Floating toast notification

#### Examples

```typescript
// Inline error (for forms)
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
  onDismiss={() => setError(null)}
  variant="toast"
/>

// Network error example
{networkError && (
  <ErrorMessage
    message="No internet connection. Please check your network."
    onRetry={handleRetry}
    onDismiss={() => setNetworkError(null)}
    variant="banner"
  />
)}

// Form validation error
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>
{emailError && (
  <ErrorMessage message={emailError} variant="inline" />
)}
```

---

### SuccessMessage

A success feedback component with auto-dismiss functionality.

#### Import

```typescript
import { SuccessMessage } from '@/components/ui';
```

#### Props

```typescript
interface SuccessMessageProps {
  message: string;
  autoDismiss?: boolean;
  duration?: number;
  onDismiss?: () => void;
}
```

#### Examples

```typescript
// Basic success message
<SuccessMessage message="Device linked successfully" />

// Success message without auto-dismiss
<SuccessMessage
  message="Changes saved"
  autoDismiss={false}
  onDismiss={() => setSuccess(null)}
/>

// Custom duration
<SuccessMessage
  message="Operation complete"
  duration={5000}
/>

// Save confirmation example
{saveSuccess && (
  <SuccessMessage
    message="Configuration saved successfully"
    autoDismiss
    duration={3000}
    onDismiss={() => setSaveSuccess(false)}
  />
)}
```

---

## Screen-Specific Components

### AdherenceCard

Displays medication adherence progress with a visual progress indicator.

#### Import

```typescript
import { AdherenceCard } from '@/components/screens/patient';
```

#### Props

```typescript
interface AdherenceCardProps {
  taken: number;
  total: number;
  percentage: number;
}
```

#### Example

```typescript
<AdherenceCard
  taken={3}
  total={4}
  percentage={75}
/>
```

---

### UpcomingDoseCard

Shows the next scheduled medication dose with action button.

#### Import

```typescript
import { UpcomingDoseCard } from '@/components/screens/patient';
```

#### Props

```typescript
interface UpcomingDoseCardProps {
  medicationName: string;
  dosage: string;
  time: string;
  onTakeMedication: () => void;
}
```

#### Example

```typescript
<UpcomingDoseCard
  medicationName="Aspirina"
  dosage="500mg"
  time="14:30"
  onTakeMedication={handleTakeMedication}
/>
```

---

### DeviceStatusCard

Displays device status, battery, and connectivity information.

#### Import

```typescript
import { DeviceStatusCard } from '@/components/screens/patient';
```

#### Props

```typescript
interface DeviceStatusCardProps {
  battery: number | null;
  status: 'idle' | 'dispensing' | 'error' | 'offline';
  isOnline: boolean;
  lastSeen?: Date;
}
```

#### Example

```typescript
<DeviceStatusCard
  battery={85}
  status="idle"
  isOnline={true}
  lastSeen={new Date()}
/>
```

---

### MedicationListItem

A list item component for displaying medication information.

#### Import

```typescript
import { MedicationListItem } from '@/components/screens/patient';
```

#### Props

```typescript
interface MedicationListItemProps {
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  onPress: () => void;
}
```

#### Example

```typescript
<FlatList
  data={medications}
  renderItem={({ item }) => (
    <MedicationListItem
      name={item.name}
      dosage={item.dosage}
      time={item.time}
      taken={item.taken}
      onPress={() => handleViewDetails(item.id)}
    />
  )}
  keyExtractor={(item) => item.id}
/>
```

---

### MedicationCard

A comprehensive card component for displaying medication information in list views with scheduled times, dosage, and frequency.

#### Import

```typescript
import { MedicationCard } from '@/components/screens/patient';
```

#### Props

```typescript
interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
}
```

#### Features

- Displays medication icon, name, and dosage
- Shows all scheduled times as chips
- Displays frequency information (daily, specific days, etc.)
- Fully accessible with proper labels and hints
- Optimized with React.memo for performance
- Uses design tokens for consistent styling

#### Example

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
/>
```

#### Visual Structure

The card displays:
- **Header**: Medication icon, name, and dosage
- **Times Section**: Scheduled times as chips (e.g., "8:00 AM", "8:00 PM")
- **Frequency Section**: Calendar icon with frequency text (e.g., "Every day", "3 days per week")

#### Accessibility

The component includes:
- Comprehensive accessibility label with medication details
- Accessibility hint explaining tap action
- Proper role assignment for screen readers
- Individual labels for time chips

---

### HistoryRecordCard

A card component for displaying individual medication intake records with status indicators and actions.

#### Import

```typescript
import { HistoryRecordCard } from '@/components/screens/patient';
```

#### Props

```typescript
interface HistoryRecordCardProps {
  record: IntakeRecord;
  medication?: {
    id: string;
    name: string;
    dosage: string;
  };
  onMarkAsMissed?: (recordId: string) => void;
  onViewDetails?: (recordId: string) => void;
}
```

#### Features

- Color-coded status indicator (green for taken, red for missed, gray for pending)
- Status badge with icon
- Displays scheduled time and actual taken time
- Optional "Mark as missed" action for pending records
- Fully accessible with comprehensive labels
- Optimized with React.memo for performance

#### Example

```typescript
import { HistoryRecordCard } from '@/components/screens/patient';

<FlatList
  data={intakeRecords}
  renderItem={({ item }) => (
    <HistoryRecordCard
      record={item}
      medication={medications.find(m => m.id === item.medicationId)}
      onMarkAsMissed={handleMarkAsMissed}
    />
  )}
  keyExtractor={(item) => item.id}
/>
```

#### Visual Structure

The card displays:
- **Status Indicator**: Colored vertical bar (4px wide)
- **Main Content**: Medication name, dosage, and scheduled time
- **Status Badge**: Chip with status label and icon
- **Taken Time**: Displayed when status is "taken"
- **Actions**: "Mark as missed" button for pending records

#### Status Colors

- **Taken**: Green (`colors.success`)
- **Missed**: Red (`colors.error`)
- **Pending**: Gray (`colors.gray[400]`)

#### Accessibility

The component includes:
- Comprehensive accessibility label with all record details
- Status announcement for screen readers
- Accessible action buttons with hints
- Proper role assignments

---

### HistoryFilterBar

A horizontal scrolling filter bar with chips for filtering medication history records.

#### Import

```typescript
import { HistoryFilterBar } from '@/components/screens/patient';
```

#### Props

```typescript
interface HistoryFilterBarProps {
  selectedFilter: 'all' | 'taken' | 'missed';
  onFilterChange: (filter: 'all' | 'taken' | 'missed') => void;
  counts?: {
    all: number;
    taken: number;
    missed: number;
  };
}
```

#### Features

- Three filter options: All (Todos), Taken (Tomados), Missed (Olvidados)
- Optional record counts displayed in labels
- Color-coded chips matching status colors
- Horizontal scrolling for smaller screens
- Fully accessible with descriptive labels

#### Example

```typescript
import { HistoryFilterBar } from '@/components/screens/patient';

const [selectedFilter, setSelectedFilter] = useState<'all' | 'taken' | 'missed'>('all');

<HistoryFilterBar
  selectedFilter={selectedFilter}
  onFilterChange={setSelectedFilter}
  counts={{
    all: 45,
    taken: 38,
    missed: 7,
  }}
/>
```

#### Filter Options

- **All (Todos)**: Shows all records (secondary color)
- **Taken (Tomados)**: Shows only taken records (success/green color)
- **Missed (Olvidados)**: Shows only missed records (error/red color)

#### With Counts

When counts are provided, they are displayed in the chip labels:
- "Todos (45)"
- "Tomados (38)"
- "Olvidados (7)"

#### Accessibility

The component includes:
- Descriptive labels for each filter
- Count information in accessibility labels
- Hints explaining what each filter shows
- Proper role assignments for screen readers

---

## Shared Components

### DeviceConfigPanel

A comprehensive device configuration panel with alarm mode, LED intensity, and color controls.

#### Import

```typescript
import { DeviceConfigPanel } from '@/components/shared';
```

#### Props

```typescript
interface DeviceConfigPanelProps {
  deviceId: string;
  config: {
    alarmMode: 'off' | 'sound' | 'led' | 'both';
    ledIntensity: number;
    ledColor: { r: number; g: number; b: number };
  };
  onSave: (config: DeviceConfig) => Promise<void>;
  onCancel: () => void;
}
```

#### Example

```typescript
<DeviceConfigPanel
  deviceId="DEVICE-001"
  config={{
    alarmMode: 'both',
    ledIntensity: 512,
    ledColor: { r: 255, g: 0, b: 0 }
  }}
  onSave={async (config) => {
    await saveDeviceConfig(deviceId, config);
  }}
  onCancel={() => setEditMode(false)}
/>
```

---

### NotificationSettings

A notification preferences component for the settings screen.

#### Import

```typescript
import { NotificationSettings } from '@/components/shared';
```

#### Props

```typescript
interface NotificationSettingsProps {
  enabled: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  hierarchy: string[];
  customModalities: string[];
  onSave: (preferences: NotificationPreferences) => Promise<void>;
}
```

#### Example

```typescript
<NotificationSettings
  enabled={true}
  permissionStatus="granted"
  hierarchy={['urgent', 'medication', 'general']}
  customModalities={['custom1', 'custom2']}
  onSave={async (preferences) => {
    await saveNotificationPreferences(userId, preferences);
  }}
/>
```

---

## Additional Resources

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Accessibility Compliance](./ACCESSIBILITY_COMPLIANCE.md)
- [Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md)
