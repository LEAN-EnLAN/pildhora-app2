# Animations Implementation Guide

This document describes the animations and transitions implemented throughout the Pildhora application as part of the UI refactor enhancement.

## Overview

All animations use React Native's `Animated` API with the native driver enabled for optimal performance. The animations follow Material Design principles with appropriate timing and easing functions.

## Animation Timing Guidelines

- **Fast (150-200ms)**: Micro-interactions like button presses
- **Medium (250-300ms)**: Transitions like modal open/close
- **Slow (400-500ms)**: Complex animations (not currently used)

## Implemented Animations

### 1. Screen Transition Animations

**Location**: `app/_layout.tsx`

**Implementation**:
- Default: `slide_from_right` (250ms) for most screens
- Auth screens: `slide_from_bottom` for login/signup
- Index: `fade` animation

**Usage**:
```typescript
<Stack 
  screenOptions={{ 
    headerShown: false,
    animation: 'slide_from_right',
    animationDuration: 250,
  }}
>
  <Stack.Screen 
    name="auth/login"
    options={{
      animation: 'slide_from_bottom',
    }}
  />
</Stack>
```

### 2. Button Press Animations

**Location**: `src/components/ui/Button.tsx`

**Implementation**:
- Scale animation from 1.0 to 0.95 on press
- Spring animation for natural feel
- Uses native driver for 60fps performance

**Features**:
- Automatic press-in/press-out handling
- Works with all button variants
- Disabled state prevents animation

**Code**:
```typescript
const scaleAnim = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.95,
    useNativeDriver: true,
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};
```

### 3. Modal Entrance/Exit Animations

**Location**: `src/components/ui/Modal.tsx`

**Implementation**:
- Overlay: Fade animation (250ms in, 200ms out)
- Content: Slide-up animation with spring physics
- Synchronized parallel animations

**Animation Types**:
- `slide`: Bottom sheet style with slide-up animation
- `fade`: Simple fade in/out

**Code**:
```typescript
Animated.parallel([
  Animated.timing(overlayOpacity, {
    toValue: 1,
    duration: 250,
    useNativeDriver: true,
  }),
  Animated.spring(slideAnim, {
    toValue: 0,
    useNativeDriver: true,
    damping: 20,
    stiffness: 90,
  }),
]).start();
```

### 4. Chip Press Animations

**Location**: `src/components/ui/Chip.tsx`

**Implementation**:
- Similar to button press animation
- Scale from 1.0 to 0.95
- Only applies when chip is pressable

**Features**:
- Works with all chip variants
- Respects disabled state
- Smooth spring animation

### 5. Success Message Animations

**Location**: `src/components/ui/SuccessMessage.tsx`

**Implementation**:
- Entrance: Fade + slide from top
- Exit: Fade + slide to top (for auto-dismiss)
- Spring animation for natural movement

**Features**:
- Auto-dismiss with animation
- Configurable duration
- Smooth entrance/exit

**Code**:
```typescript
Animated.parallel([
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }),
  Animated.spring(slideAnim, {
    toValue: 0,
    useNativeDriver: true,
    damping: 15,
    stiffness: 100,
  }),
]).start();
```

### 6. Error Message Animations

**Location**: `src/components/ui/ErrorMessage.tsx`

**Implementation**:
- Entrance: Fade + slide with shake effect
- Icon shake: 4-step sequence for attention
- Smooth fade-in for message

**Features**:
- Attention-grabbing shake animation
- Smooth entrance
- Icon animation separate from container

**Code**:
```typescript
// Shake animation for error icon
Animated.sequence([
  Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
  Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
  Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
  Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
]).start();
```

### 7. List Item Animations

**Location**: `src/components/ui/AnimatedListItem.tsx`

**Implementation**:
- Staggered entrance animations
- Fade + slide from bottom
- Configurable delay between items

**Usage**:
```typescript
<AnimatedListItem index={index} delay={50}>
  <MedicationListItem {...props} />
</AnimatedListItem>
```

**Features**:
- Automatic stagger based on index
- Configurable delay (default 50ms)
- Smooth spring animation

**Applied to**:
- Patient home screen medication list
- Patient link-device screen device cards

### 8. Collapsible Animations

**Location**: `src/components/ui/Collapsible.tsx`

**Implementation**:
- Height animation (expand/collapse)
- Opacity fade during transition
- Automatic content measurement

**Features**:
- Smooth expand/collapse
- Automatic height calculation
- Opacity fade for polish

**Usage**:
```typescript
<Collapsible collapsed={!isExpanded}>
  <View>{/* Content */}</View>
</Collapsible>
```

**Applied to**:
- Device configuration panels in link-device screen

**Code**:
```typescript
Animated.parallel([
  Animated.timing(animatedHeight, {
    toValue: collapsed ? 0 : contentHeight,
    duration: collapsed ? 250 : 300,
    useNativeDriver: false, // Height animation requires layout
  }),
  Animated.timing(animatedOpacity, {
    toValue: collapsed ? 0 : 1,
    duration: collapsed ? 200 : 250,
    useNativeDriver: true,
  }),
]).start();
```

## Performance Considerations

### Native Driver Usage

All animations use `useNativeDriver: true` except for:
- Height animations (Collapsible component)
- Layout-dependent animations

This ensures 60fps performance by running animations on the native thread.

### Animation Optimization

1. **Memoization**: Animation values are created with `useRef` to prevent recreation
2. **Cleanup**: Animations are properly cleaned up in useEffect return functions
3. **Conditional Rendering**: Heavy animations only run when components are visible
4. **Staggering**: List animations use staggered delays to prevent performance issues

## Testing Animations

### Manual Testing Checklist

- [ ] Button press animations feel responsive
- [ ] Modal animations are smooth and synchronized
- [ ] List items animate in sequence
- [ ] Error messages shake to grab attention
- [ ] Success messages fade in smoothly
- [ ] Collapsible sections expand/collapse smoothly
- [ ] Screen transitions feel natural
- [ ] No animation jank or stuttering

### Performance Testing

Use React DevTools Profiler to ensure:
- Animations run at 60fps
- No unnecessary re-renders during animations
- Native driver is used where possible

## Accessibility Considerations

All animated components maintain accessibility:
- Animations respect `prefers-reduced-motion` (future enhancement)
- Accessibility labels remain functional during animations
- Focus management works correctly with animations
- Screen readers announce state changes appropriately

## Future Enhancements

1. **Reduced Motion Support**: Detect and respect system preference for reduced motion
2. **Custom Easing**: Add custom easing functions for brand-specific feel
3. **Gesture Animations**: Add swipe-to-dismiss for modals and cards
4. **Loading Skeletons**: Animated skeleton loaders for better perceived performance
5. **Micro-interactions**: Add subtle animations to form inputs and toggles

## Troubleshooting

### Animation Not Running

1. Check if `useNativeDriver: true` is set
2. Verify animation value is created with `useRef`
3. Ensure component is mounted when animation starts
4. Check for conflicting styles

### Janky Animations

1. Verify native driver is enabled
2. Check for heavy computations during animation
3. Profile with React DevTools
4. Reduce animation complexity

### Layout Issues

1. Height animations require `useNativeDriver: false`
2. Use `overflow: 'hidden'` for collapsible content
3. Ensure proper layout measurement with `onLayout`

## References

- [React Native Animated API](https://reactnative.dev/docs/animated)
- [Material Design Motion](https://material.io/design/motion)
- [Animation Performance](https://reactnative.dev/docs/performance#using-nativedriver)
