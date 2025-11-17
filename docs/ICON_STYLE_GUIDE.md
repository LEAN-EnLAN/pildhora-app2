# Icon Style Guide

## Overview
This guide establishes consistent icon usage across the PILDHORA application for a polished, production-ready experience.

## Icon Library
We use **Ionicons** from `@expo/vector-icons` exclusively for consistency.

## Icon Variants

### Outline vs Solid
- **Outline**: Inactive, secondary, or default states
- **Solid**: Active, focused, or primary states

```tsx
// Tab bar example
focused ? 'home' : 'home-outline'
```

## Size Standards

### Navigation & UI
| Context | Size | Usage |
|---------|------|-------|
| Tab bar icons | 24px | Bottom navigation tabs |
| Header icons | 28px | Top navigation bar actions |
| Button icons | 20px | Inline button icons |
| Card icons | 24px | Card header icons |
| List item icons | 20px | List item leading icons |
| Inline text icons | 16px | Icons within text |

### Empty States & Illustrations
| Context | Size | Usage |
|---------|------|-------|
| Empty state | 48-64px | No content illustrations |
| Error state | 48px | Error messages |
| Success state | 48px | Completion screens |

## Color Standards

### Semantic Colors
```tsx
import { colors } from '../theme/tokens';

// Primary actions
color={colors.primary[500]}

// Success states
color={colors.success}

// Error states
color={colors.error[500]}

// Warning states
color={colors.warning}

// Info states
color={colors.info}

// Neutral/inactive
color={colors.gray[400]}

// Text color
color={colors.gray[700]}
```

### Context-Based Colors
| Context | Color | Usage |
|---------|-------|-------|
| Active tab | `colors.primary[500]` | Selected tab icon |
| Inactive tab | `colors.gray[400]` | Unselected tab icon |
| Emergency | `colors.error[500]` | Emergency button |
| Success | `colors.success` | Completed actions |
| Device online | `colors.success` | Connected device |
| Device offline | `colors.gray[400]` | Disconnected device |

## Icon Catalog

### Navigation Icons

#### Primary Navigation
```tsx
// Home/Dashboard
<Ionicons name="home" size={24} color={colors.primary[500]} />
<Ionicons name="home-outline" size={24} color={colors.gray[400]} />

// Tasks
<Ionicons name="checkbox" size={24} color={colors.primary[500]} />
<Ionicons name="checkbox-outline" size={24} color={colors.gray[400]} />

// Medications
<Ionicons name="medkit" size={24} color={colors.primary[500]} />
<Ionicons name="medkit-outline" size={24} color={colors.gray[400]} />

// Events/Notifications
<Ionicons name="notifications" size={24} color={colors.primary[500]} />
<Ionicons name="notifications-outline" size={24} color={colors.gray[400]} />
```

#### Secondary Navigation
```tsx
// History
<Ionicons name="time-outline" size={24} color={colors.primary[500]} />

// Medical/Health
<Ionicons name="medical-outline" size={24} color={colors.primary[500]} />

// Device
<Ionicons name="hardware-chip-outline" size={24} color={colors.primary[500]} />

// Settings
<Ionicons name="settings-outline" size={24} color={colors.gray[700]} />
```

### Action Icons

#### CRUD Operations
```tsx
// Add/Create
<Ionicons name="add" size={24} color={colors.primary[500]} />
<Ionicons name="add-circle-outline" size={24} color={colors.primary[500]} />

// Edit
<Ionicons name="pencil-outline" size={20} color={colors.gray[700]} />
<Ionicons name="create-outline" size={20} color={colors.gray[700]} />

// Delete
<Ionicons name="trash-outline" size={20} color={colors.error[500]} />

// Save
<Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
```

#### Navigation Actions
```tsx
// Back
<Ionicons name="chevron-back" size={24} color={colors.gray[900]} />
<Ionicons name="arrow-back" size={24} color={colors.gray[900]} />

// Forward
<Ionicons name="chevron-forward" size={24} color={colors.gray[700]} />
<Ionicons name="arrow-forward" size={24} color={colors.gray[700]} />

// Close
<Ionicons name="close" size={24} color={colors.gray[700]} />
<Ionicons name="close-circle-outline" size={24} color={colors.gray[700]} />
```

#### Sharing & Communication
```tsx
// Share
<Ionicons name="share-outline" size={20} color={colors.gray[700]} />

// Call
<Ionicons name="call-outline" size={20} color={colors.primary[500]} />

// Message
<Ionicons name="chatbubble-outline" size={20} color={colors.primary[500]} />

// Email
<Ionicons name="mail-outline" size={20} color={colors.gray[700]} />
```

### Status Icons

#### States
```tsx
// Success/Complete
<Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
<Ionicons name="checkmark-circle" size={24} color={colors.success} />

// Error/Alert
<Ionicons name="alert-circle-outline" size={48} color={colors.error[500]} />
<Ionicons name="alert-circle" size={28} color={colors.error[500]} />

// Warning
<Ionicons name="warning-outline" size={24} color={colors.warning} />

// Info
<Ionicons name="information-circle-outline" size={24} color={colors.info} />
```

#### Device Status
```tsx
// Online/Connected
<Ionicons name="shield-checkmark" size={16} color={colors.success} />
<Ionicons name="checkmark-circle" size={20} color={colors.success} />

// Offline/Disconnected
<Ionicons name="cloud-offline-outline" size={24} color={colors.gray[400]} />

// Syncing
<Ionicons name="sync-outline" size={20} color={colors.primary[500]} />

// Battery
<Ionicons name="battery-full" size={20} color={colors.success} />
<Ionicons name="battery-half" size={20} color={colors.warning} />
<Ionicons name="battery-dead" size={20} color={colors.error[500]} />
```

### Content Icons

#### Time & Schedule
```tsx
// Time
<Ionicons name="time-outline" size={24} color={colors.primary[500]} />

// Alarm
<Ionicons name="alarm-outline" size={16} color={colors.primary[500]} />

// Calendar
<Ionicons name="calendar-outline" size={24} color={colors.gray[700]} />
<Ionicons name="calendar" size={24} color={colors.primary[500]} />
```

#### Medical & Health
```tsx
// Medical
<Ionicons name="medical-outline" size={24} color={colors.primary[500]} />

// Pill
<Ionicons name="medkit-outline" size={24} color={colors.primary[500]} />

// Heart
<Ionicons name="heart-outline" size={20} color={colors.error[500]} />
```

#### User & Account
```tsx
// Person
<Ionicons name="person-circle-outline" size={28} color={colors.gray[700]} />
<Ionicons name="person" size={24} color={colors.primary[600]} />

// People/Group
<Ionicons name="people-outline" size={48} color={colors.gray[400]} />

// Account
<Ionicons name="person-circle-outline" size={28} color={colors.gray[700]} />
```

#### Connection & Linking
```tsx
// Link
<Ionicons name="link-outline" size={48} color={colors.primary[600]} />
<Ionicons name="link" size={20} color={colors.info} />

// Key/Access
<Ionicons name="key-outline" size={48} color={colors.gray[400]} />
<Ionicons name="key" size={24} color={colors.success[600]} />

// QR Code
<Ionicons name="qr-code-outline" size={24} color={colors.gray[700]} />
```

### Empty State Icons

```tsx
// No medications
<Ionicons name="calendar-outline" size={64} color={colors.gray[400]} />

// No history
<Ionicons name="time-outline" size={64} color={colors.gray[400]} />

// No events
<Ionicons name="notifications-outline" size={64} color={colors.gray[400]} />

// No device
<Ionicons name="hardware-chip-outline" size={64} color={colors.gray[400]} />

// No caregivers
<Ionicons name="people-outline" size={48} color={colors.gray[400]} />

// No codes
<Ionicons name="key-outline" size={48} color={colors.gray[400]} />
```

## Implementation Patterns

### Tab Bar Icon
```tsx
<Tabs.Screen
  name="screen-name"
  options={{
    title: 'Screen Title',
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons 
        name={focused ? 'icon-name' : 'icon-name-outline'} 
        size={size} 
        color={color} 
      />
    ),
    tabBarAccessibilityLabel: 'Screen - Description',
  }}
/>
```

### Icon Button
```tsx
<TouchableOpacity 
  style={styles.iconButton}
  onPress={handlePress}
  accessibilityLabel="Action description"
  accessibilityHint="What happens when pressed"
  accessibilityRole="button"
>
  <Ionicons name="icon-name" size={24} color={colors.primary[500]} />
</TouchableOpacity>
```

### Card Header Icon
```tsx
<View style={styles.cardHeader}>
  <Ionicons name="icon-name-outline" size={24} color={colors.primary[500]} />
  <Text style={styles.cardTitle}>Card Title</Text>
</View>
```

### Empty State
```tsx
<View style={styles.emptyState}>
  <Ionicons name="icon-name-outline" size={64} color={colors.gray[400]} />
  <Text style={styles.emptyTitle}>No Items</Text>
  <Text style={styles.emptyDescription}>Description text</Text>
</View>
```

### Status Badge
```tsx
<View style={styles.statusBadge}>
  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
  <Text style={styles.statusText}>Status Text</Text>
</View>
```

## Accessibility Guidelines

### 1. Always Provide Context
Icons alone are not accessible. Always pair with:
- Text labels
- Accessibility labels
- Accessibility hints

### 2. Color Contrast
Ensure icons meet WCAG AA standards:
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text and icons

### 3. Touch Targets
Minimum touch target size: 44x44 points (iOS) / 48x48 dp (Android)

```tsx
const styles = StyleSheet.create({
  iconButton: {
    padding: spacing.sm,  // Ensures 44x44 minimum
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### 4. Screen Reader Support
```tsx
<TouchableOpacity
  accessibilityLabel="Emergency call"
  accessibilityHint="Opens emergency contact options"
  accessibilityRole="button"
>
  <Ionicons name="alert-circle" size={28} color={colors.error[500]} />
</TouchableOpacity>
```

## Don'ts

❌ **Don't mix icon libraries**
```tsx
// Bad
<MaterialIcons name="home" />
<Ionicons name="settings" />
```

❌ **Don't use inconsistent sizes**
```tsx
// Bad - inconsistent tab bar sizes
<Ionicons name="home" size={24} />
<Ionicons name="settings" size={20} />
```

❌ **Don't use icons without labels**
```tsx
// Bad - no accessibility
<TouchableOpacity onPress={handlePress}>
  <Ionicons name="trash" size={20} />
</TouchableOpacity>
```

❌ **Don't use wrong variants**
```tsx
// Bad - solid icon for inactive state
<Ionicons name="home" size={24} color={colors.gray[400]} />
```

## Do's

✅ **Use consistent icon library**
```tsx
// Good
import { Ionicons } from '@expo/vector-icons';
```

✅ **Use appropriate variants**
```tsx
// Good
{focused ? 'home' : 'home-outline'}
```

✅ **Provide accessibility labels**
```tsx
// Good
<TouchableOpacity
  accessibilityLabel="Delete item"
  accessibilityRole="button"
>
  <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
</TouchableOpacity>
```

✅ **Use semantic colors**
```tsx
// Good
<Ionicons name="alert-circle" size={28} color={colors.error[500]} />
<Ionicons name="checkmark-circle" size={24} color={colors.success} />
```

## Testing Checklist

- [ ] All icons use Ionicons
- [ ] Sizes are consistent within contexts
- [ ] Colors follow semantic meaning
- [ ] Outline/solid variants used correctly
- [ ] All icon buttons have accessibility labels
- [ ] Touch targets are minimum 44x44 points
- [ ] Color contrast meets WCAG AA
- [ ] Icons render correctly on both iOS and Android
- [ ] No console warnings about icon names
- [ ] Icons are visually aligned in layouts
