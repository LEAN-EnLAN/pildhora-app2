# Responsive Layout Calculations Guide

## Overview

The medication wizard components use responsive layout calculations to adapt to different screen sizes, from small phones (320px) to large tablets (1024px+). This guide documents the calculation logic, breakpoints, and implementation patterns used throughout the wizard.

## Screen Size Categories

### Breakpoints

```typescript
const BREAKPOINTS = {
  SMALL_PHONE: 360,    // < 360px
  MEDIUM_PHONE: 768,   // 360-768px
  TABLET: 768,         // >= 768px
};
```

### Device Categories

1. **Small Phones** (< 360px)
   - Examples: iPhone SE (1st gen), older Android devices
   - Width: 320-359px
   - Characteristics: Very limited space, single column layouts preferred

2. **Medium Phones** (360-767px)
   - Examples: iPhone 12/13/14, most modern Android phones
   - Width: 360-767px
   - Characteristics: Standard phone layout, 2-column grids work well

3. **Tablets** (≥ 768px)
   - Examples: iPad, Android tablets
   - Width: 768px+
   - Characteristics: Spacious layout, 3+ column grids, larger elements

## Implementation Pattern

### Using useWindowDimensions Hook

All responsive components use React Native's `useWindowDimensions` hook:

```typescript
import { useWindowDimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = useWindowDimensions();
```

### Memoized Calculations

Responsive calculations are wrapped in `useMemo` to prevent unnecessary recalculations:

```typescript
const responsiveLayout = useMemo(() => {
  // Calculations here
  return { /* layout values */ };
}, [screenWidth]); // Only recalculate when screen width changes
```

## Step 1: Icon and Name Selection

### Emoji Grid Layout

**Calculation Logic:**

```typescript
const emojiGridLayout = useMemo(() => {
  // 1. Determine emoji size based on screen width
  let emojiSize = 56;  // Default for medium phones
  let gap = 8;         // Default gap between emojis
  
  if (screenWidth < 360) {
    // Small phones: Smaller emojis, tighter spacing
    emojiSize = 48;
    gap = 6;
  } else if (screenWidth >= 768) {
    // Tablets: Larger emojis, more spacing
    emojiSize = 64;
    gap = 12;
  }
  
  // 2. Calculate available width
  const horizontalPadding = spacing.lg * 2; // padding on both sides
  const availableWidth = screenWidth - horizontalPadding;
  
  // 3. Calculate how many emojis fit per row
  const emojisPerRow = Math.floor(availableWidth / (emojiSize + gap));
  
  // 4. Clamp to reasonable min/max values
  const minEmojis = screenWidth < 360 ? 4 : 5;
  const maxEmojis = screenWidth >= 768 ? 10 : 8;
  const clampedEmojisPerRow = Math.max(minEmojis, Math.min(maxEmojis, emojisPerRow));
  
  return {
    emojisPerRow: clampedEmojisPerRow,
    emojiSize,
    gap,
  };
}, [screenWidth]);
```

**Responsive Values:**

| Screen Size | Emoji Size | Gap | Min Emojis/Row | Max Emojis/Row |
|-------------|------------|-----|----------------|----------------|
| Small (< 360px) | 48px | 6px | 4 | 8 |
| Medium (360-768px) | 56px | 8px | 5 | 8 |
| Tablet (≥ 768px) | 64px | 12px | 5 | 10 |

**Why These Values?**

- **Emoji Size**: Larger screens can accommodate bigger emojis for better visibility
- **Gap**: Proportional spacing maintains visual balance
- **Min/Max Emojis**: Ensures grid doesn't become too cramped or too sparse
- **Touch Targets**: All emoji buttons maintain minimum 48x48 dp touch target

### Example Calculations

**iPhone SE (320px width):**
```
emojiSize = 48px
gap = 6px
horizontalPadding = 32px (16px * 2)
availableWidth = 320 - 32 = 288px
emojisPerRow = floor(288 / (48 + 6)) = floor(288 / 54) = 5
clampedEmojisPerRow = max(4, min(8, 5)) = 5
```

**iPhone 14 (390px width):**
```
emojiSize = 56px
gap = 8px
horizontalPadding = 32px
availableWidth = 390 - 32 = 358px
emojisPerRow = floor(358 / (56 + 8)) = floor(358 / 64) = 5
clampedEmojisPerRow = max(5, min(8, 5)) = 5
```

**iPad (768px width):**
```
emojiSize = 64px
gap = 12px
horizontalPadding = 32px
availableWidth = 768 - 32 = 736px
emojisPerRow = floor(736 / (64 + 12)) = floor(736 / 76) = 9
clampedEmojisPerRow = max(5, min(10, 9)) = 9
```

## Step 2: Schedule Configuration

### Time Card Layout

**Calculation Logic:**

```typescript
const responsiveLayout = useMemo(() => {
  const isSmallScreen = screenWidth < 360;
  const isTablet = screenWidth >= 768;
  
  return {
    isSmallScreen,
    isTablet,
    cardPadding: isSmallScreen ? spacing.md : isTablet ? spacing.xl : spacing.lg,
    iconSize: isSmallScreen ? 40 : isTablet ? 56 : 48,
    timeCardGap: isSmallScreen ? spacing.sm : spacing.md,
    dayChipSize: isSmallScreen ? 'sm' as const : 'md' as const,
  };
}, [screenWidth]);
```

**Responsive Values:**

| Screen Size | Card Padding | Icon Size | Card Gap | Chip Size |
|-------------|--------------|-----------|----------|-----------|
| Small (< 360px) | 12px (md) | 40px | 8px (sm) | sm |
| Medium (360-768px) | 16px (lg) | 48px | 12px (md) | md |
| Tablet (≥ 768px) | 24px (xl) | 56px | 12px (md) | md |

**Usage in Component:**

```typescript
<View style={[styles.timeCard, { padding: responsiveLayout.cardPadding }]}>
  <View style={[styles.timeCardIcon, { 
    width: responsiveLayout.iconSize, 
    height: responsiveLayout.iconSize 
  }]}>
    <Text style={styles.timeCardEmoji}>🕐</Text>
  </View>
  {/* ... */}
</View>
```

### Timeline Scroll Behavior

The timeline uses horizontal scrolling with responsive hour markers:

```typescript
<ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.timelineContent}
>
  {Array.from({ length: 24 }).map((_, hour) => (
    <View key={hour} style={styles.timelineHour}>
      {/* Hour marker - fixed 60px width for consistency */}
    </View>
  ))}
</ScrollView>
```

**Why Fixed Width?**
- Timeline hours use fixed 60px width for consistency
- Horizontal scrolling allows viewing all 24 hours
- No responsive calculation needed - scroll handles overflow

## Step 3: Dosage Configuration

### Dose Input Font Size

**Calculation Logic:**

```typescript
const responsiveLayout = useMemo(() => {
  const isSmallScreen = screenWidth < 360;
  const isMediumScreen = screenWidth >= 360 && screenWidth < 768;
  const isTablet = screenWidth >= 768;
  
  return {
    isSmallScreen,
    isMediumScreen,
    isTablet,
    doseInputFontSize: isSmallScreen ? 36 : isTablet ? 56 : 48,
    chipSize: isSmallScreen ? 'sm' as const : 'md' as const,
    quantityTypeWidth: calculateQuantityTypeWidth(screenWidth),
  };
}, [screenWidth]);
```

**Responsive Values:**

| Screen Size | Dose Font Size | Chip Size |
|-------------|----------------|-----------|
| Small (< 360px) | 36px | sm |
| Medium (360-768px) | 48px | md |
| Tablet (≥ 768px) | 56px | md |

**Why These Sizes?**

- **Large Font**: Dose value is the most important input - needs to be highly visible
- **Scalable**: Larger screens can accommodate bigger text without crowding
- **Readability**: Even on small screens, 36px is readable for numeric input

### Quantity Type Grid

**Calculation Logic:**

```typescript
function calculateQuantityTypeWidth(screenWidth: number): '47%' | '31%' | '100%' {
  if (screenWidth >= 768) {
    return '31%';  // 3 columns on tablets (with gaps)
  } else if (screenWidth < 360) {
    return '100%'; // 1 column on very small screens
  } else {
    return '47%';  // 2 columns on medium phones (with gaps)
  }
}
```

**Grid Layout:**

| Screen Size | Columns | Button Width | Gap |
|-------------|---------|--------------|-----|
| Small (< 360px) | 1 | 100% | 12px |
| Medium (360-768px) | 2 | 47% | 12px |
| Tablet (≥ 768px) | 3 | 31% | 12px |

**Why Percentage Widths?**

- **Flexible**: Adapts to exact screen width
- **Gap Handling**: Percentages account for gaps between items
- **Aspect Ratio**: Buttons maintain 1.5:1 aspect ratio via `aspectRatio: 1.5`

**Math Behind Percentages:**

For 2 columns with gap:
```
Total width = 100%
Gap = 12px (fixed)
Available for buttons = 100% - gap
Per button = (100% - gap) / 2 ≈ 47%
```

For 3 columns with gaps:
```
Total width = 100%
Gaps = 24px (2 gaps of 12px each)
Available for buttons = 100% - gaps
Per button = (100% - gaps) / 3 ≈ 31%
```

### Dosage Preview Scaling

Preview components use fixed sizes but scale their content:

```typescript
// Pill Preview
const displayCount = Math.min(count, 12); // Max 12 pills shown

// Pill size remains constant
const pillSize = 44; // Fixed size for consistency

// Grid adapts to content
<View style={styles.pillGrid}>
  {Array.from({ length: displayCount }).map((_, index) => (
    <View key={index} style={styles.pillContainer}>
      {/* 44x44 pill */}
    </View>
  ))}
</View>
```

**Why Fixed Sizes?**

- **Consistency**: Previews look the same across devices
- **Predictability**: Users know what to expect
- **Simplicity**: No complex scaling calculations needed

## Performance Considerations

### Calculation Frequency

Responsive calculations only run when screen width changes:

```typescript
const responsiveLayout = useMemo(() => {
  // Expensive calculations here
}, [screenWidth]); // Dependency array
```

**When Does Screen Width Change?**

- Device rotation (portrait ↔ landscape)
- Window resize (web/desktop)
- Split-screen mode changes (tablets)

**Optimization:**

- Calculations are memoized
- Only recalculate on width change
- No calculations during scrolling or typing

### Render Performance

Responsive values are calculated once and reused:

```typescript
// ✅ Good: Calculate once, use many times
const { doseInputFontSize, chipSize } = responsiveLayout;

<TextInput style={{ fontSize: doseInputFontSize }} />
<Chip size={chipSize} />
<Chip size={chipSize} />
<Chip size={chipSize} />

// ❌ Bad: Calculate every render
<TextInput style={{ fontSize: screenWidth < 360 ? 36 : 48 }} />
```

## Testing Responsive Layouts

### Manual Testing

Test on these screen widths:

1. **320px** - iPhone SE (1st gen)
2. **375px** - iPhone 12/13 mini
3. **390px** - iPhone 14
4. **414px** - iPhone 14 Plus
5. **768px** - iPad (portrait)
6. **1024px** - iPad (landscape)

### Automated Testing

```typescript
describe('Responsive Layout Calculations', () => {
  test('calculates emoji grid for small screen', () => {
    const screenWidth = 320;
    const layout = calculateEmojiGridLayout(screenWidth);
    
    expect(layout.emojiSize).toBe(48);
    expect(layout.gap).toBe(6);
    expect(layout.emojisPerRow).toBeGreaterThanOrEqual(4);
    expect(layout.emojisPerRow).toBeLessThanOrEqual(8);
  });

  test('calculates quantity type width for tablet', () => {
    const screenWidth = 768;
    const width = calculateQuantityTypeWidth(screenWidth);
    
    expect(width).toBe('31%'); // 3 columns
  });
});
```

### Visual Regression Testing

Use screenshot testing to verify layouts:

```typescript
test('emoji grid renders correctly on small screen', async () => {
  const { container } = render(<MedicationIconNameStep />, {
    dimensions: { width: 320, height: 568 }
  });
  
  const screenshot = await takeScreenshot(container);
  expect(screenshot).toMatchImageSnapshot();
});
```

## Common Pitfalls

### Pitfall 1: Forgetting Padding

```typescript
// ❌ Wrong: Doesn't account for padding
const emojisPerRow = Math.floor(screenWidth / emojiSize);

// ✅ Correct: Subtracts padding first
const availableWidth = screenWidth - (padding * 2);
const emojisPerRow = Math.floor(availableWidth / emojiSize);
```

### Pitfall 2: Not Clamping Values

```typescript
// ❌ Wrong: Could result in 0 or 100 emojis per row
const emojisPerRow = Math.floor(availableWidth / emojiSize);

// ✅ Correct: Clamps to reasonable range
const emojisPerRow = Math.max(4, Math.min(10, 
  Math.floor(availableWidth / emojiSize)
));
```

### Pitfall 3: Inline Calculations

```typescript
// ❌ Wrong: Recalculates every render
<View style={{ width: screenWidth < 360 ? '100%' : '47%' }}>

// ✅ Correct: Calculate once in useMemo
const { quantityTypeWidth } = responsiveLayout;
<View style={{ width: quantityTypeWidth }}>
```

### Pitfall 4: Ignoring Gaps

```typescript
// ❌ Wrong: Doesn't account for gaps between items
const itemWidth = screenWidth / 3;

// ✅ Correct: Accounts for gaps
const totalGaps = (3 - 1) * gapSize;
const availableWidth = screenWidth - totalGaps;
const itemWidth = availableWidth / 3;
```

## Best Practices

### Do's

✅ Use `useMemo` for expensive calculations
✅ Test on multiple screen sizes
✅ Clamp values to reasonable ranges
✅ Account for padding and gaps
✅ Use percentage widths for flexible layouts
✅ Maintain minimum touch target sizes (48x48 dp)

### Don'ts

❌ Don't calculate inline in render
❌ Don't forget about landscape orientation
❌ Don't use fixed pixel widths for main layout
❌ Don't ignore very small or very large screens
❌ Don't recalculate on every state change

## Related Documentation

- [Wizard Components Documentation](./WIZARD_COMPONENTS_DOCUMENTATION.md)
- [Responsive Layout Visual Guide](./RESPONSIVE_LAYOUT_VISUAL_GUIDE.md)
- [Design Document](./design.md)
- [Task 13 Implementation Summary](./TASK13_RESPONSIVE_LAYOUT_IMPLEMENTATION.md)

---

**Last Updated**: November 15, 2025
**Maintained By**: Pildhora Development Team
