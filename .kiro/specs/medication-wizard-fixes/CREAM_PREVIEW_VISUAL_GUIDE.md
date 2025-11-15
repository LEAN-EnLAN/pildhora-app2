# Cream Preview Visual Guide

## Component Overview

The CreamPreview component displays a professional tube/jar visualization for cream medications with dynamic fill levels.

## Visual Structure

```
┌─────────────────────────────┐
│                             │
│      ┌─────────────┐        │  ← Cap Top Element
│      │   Gray-800  │        │     (30x15px, rounded)
│      └─────────────┘        │
│  ┌───────────────────────┐  │
│  │      Gray-700         │  │  ← Cap Section
│  │                       │  │     (35px height)
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   Success Gradient    │  │
│  │   (400 → 600)         │  │
│  │                       │  │  ← Tube Body
│  │   ┌───────────────┐   │  │     (Gradient fill)
│  │   │ Fill Level    │   │  │
│  │   │ ███████░░░░░░ │   │  │  ← Fill Indicator
│  │   └───────────────┘   │  │     (Dynamic width)
│  │                       │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘

         50 g
    ─────────────
      Amount Label
```

## Component Hierarchy

```
CreamPreview
├── creamTubeContainer (100x160px)
│   └── creamTube (90x150px, LinearGradient)
│       ├── creamCap (35px height)
│       │   └── creamCapTop (30x15px)
│       └── creamBody (flex: 1)
│           └── creamFillContainer (12px height)
│               └── creamFill (dynamic width)
└── creamLabel (Text)
```

## Color Scheme

### Tube Gradient
- **Start**: `colors.success[400]` (Light green)
- **End**: `colors.success[600]` (Dark green)
- **Direction**: Diagonal (top-left to bottom-right)

### Cap
- **Main**: `colors.gray[700]` (Dark gray)
- **Top**: `colors.gray[800]` (Darker gray)

### Fill Indicator
- **Container**: `rgba(255, 255, 255, 0.2)` (Semi-transparent white)
- **Fill**: `rgba(255, 255, 255, 0.5)` (More opaque white)

### Label
- **Color**: `colors.gray[900]` (Almost black)
- **Weight**: Semibold
- **Size**: Large

## Dimensions

### Container
- Width: 100px
- Height: 160px
- Padding: `spacing.md` bottom

### Tube
- Width: 90px
- Height: 150px
- Border Radius: `borderRadius.lg`
- Shadow: `shadows.md`

### Cap
- Height: 35px
- Border Radius: Top corners only (`borderRadius.lg`)

### Cap Top
- Width: 30px
- Height: 15px
- Border Radius: `borderRadius.sm`

### Fill Indicator
- Height: 12px
- Border Radius: `borderRadius.md`
- Width: Dynamic (0-100% based on amount)

## Fill Percentage Logic

```typescript
// Default max amounts for visualization
let maxAmount = 100;  // For g and ml
let displayAmount = amount;

// Adjust for applications
if (unit === 'applications' || unit === 'aplicaciones') {
  maxAmount = 20;
}

// Calculate percentage (capped at 100%)
const fillPercentage = Math.min((displayAmount / maxAmount) * 100, 100);
```

### Examples

| Amount | Unit | Max | Fill % | Visual |
|--------|------|-----|--------|--------|
| 25 | g | 100 | 25% | ██░░░░░░░░ |
| 50 | g | 100 | 50% | █████░░░░░ |
| 75 | ml | 100 | 75% | ███████░░░ |
| 100 | g | 100 | 100% | ██████████ |
| 5 | aplicaciones | 20 | 25% | ██░░░░░░░░ |
| 10 | aplicaciones | 20 | 50% | █████░░░░░ |
| 150 | g | 100 | 100% | ██████████ |

## Styling Details

### Rounded Corners
- **Tube**: `borderRadius.lg` on all corners
- **Cap**: `borderRadius.lg` on top corners only
- **Cap Top**: `borderRadius.sm` on all corners
- **Fill Elements**: `borderRadius.md` on all corners

### Shadows
- **Tube**: `shadows.md` for depth effect
- Creates a subtle 3D appearance
- Enhances visual hierarchy

### Spacing
- **Preview Padding**: `spacing.lg` vertical
- **Container Margin**: `spacing.md` bottom
- **Body Padding**: `spacing.md` all sides

## Unit Support

### Grams (g)
- Most common for cream medications
- Max visualization: 100g
- Example: "50 g"

### Milliliters (ml)
- Volume-based measurement
- Max visualization: 100ml
- Example: "30 ml"

### Applications (aplicaciones)
- Application-based measurement
- Max visualization: 20 applications
- Example: "5 aplicaciones"

## Integration Example

```typescript
// In DosageVisualizer component
case 'cream':
  const creamUnitLabel = doseUnit ? 
    (DOSE_UNITS.find(u => u.id === doseUnit)?.label || doseUnit) : 'g';
  return <CreamPreview amount={doseValue} unit={creamUnitLabel} />;
```

## Accessibility

- Clear visual representation
- High contrast between elements
- Large, readable label text
- Semantic structure

## Responsive Behavior

- Fixed dimensions for consistency
- Centered alignment
- Proper spacing on all screen sizes
- Maintains aspect ratio

## Visual States

### Empty (0%)
```
┌─────────┐
│  ┌───┐  │
│  └───┘  │
├─────────┤
│         │
│  ░░░░░  │  ← Empty fill bar
│         │
└─────────┘
```

### Quarter Full (25%)
```
┌─────────┐
│  ┌───┐  │
│  └───┘  │
├─────────┤
│         │
│  ██░░░  │  ← 25% filled
│         │
└─────────┘
```

### Half Full (50%)
```
┌─────────┐
│  ┌───┐  │
│  └───┘  │
├─────────┤
│         │
│  █████  │  ← 50% filled
│         │
└─────────┘
```

### Full (100%)
```
┌─────────┐
│  ┌───┐  │
│  └───┘  │
├─────────┤
│         │
│  █████  │  ← 100% filled
│         │
└─────────┘
```

## Design Rationale

### Why a Tube Design?
- Familiar representation of cream medications
- Clear visual metaphor for users
- Allows for fill level indication

### Why Green Gradient?
- Success color palette suggests health/wellness
- Differentiates from pill (primary) and liquid (info) colors
- Visually appealing and professional

### Why Cap Section?
- Adds realism to the tube visualization
- Provides visual interest
- Helps users recognize it as a cream tube

### Why Fill Indicator?
- Shows relative amount at a glance
- Provides visual feedback
- Helps users understand dosage quantity

## Comparison with Other Previews

| Type | Component | Color | Key Feature |
|------|-----------|-------|-------------|
| Pills | PillPreview | Primary (blue) | Grid of pills |
| Liquid | LiquidPreview | Info (cyan) | Glass with fill |
| Cream | CreamPreview | Success (green) | Tube with fill bar |

## Best Practices

1. **Always show the unit label** - Users need context
2. **Cap fill at 100%** - Prevents visual overflow
3. **Use appropriate max amounts** - Different for each unit type
4. **Maintain consistent styling** - Follows design system
5. **Provide visual feedback** - Fill level shows amount

## Future Enhancements

Potential improvements for future iterations:
- Animated fill level transitions
- Different tube shapes for different cream types
- Color customization based on medication
- Squeeze animation on interaction
- More detailed cap design
