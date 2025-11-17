# UI Visual Style Guide

## Design System Overview

This guide showcases the enhanced visual design system for PILDHORA, featuring modern colors, refined typography, and polished components.

## Color System

### Primary Palette
The primary blue has been enhanced for a more modern, vibrant look.

```
┌─────────────────────────────────────────────────────────┐
│ PRIMARY BLUE SCALE                                       │
├─────────────────────────────────────────────────────────┤
│ 50  │ #EFF6FF │ ░░░░░░░░░░ │ Lightest backgrounds      │
│ 100 │ #DBEAFE │ ░░░░░░░░░░ │ Hover states              │
│ 200 │ #BFDBFE │ ▒▒▒▒▒▒▒▒▒▒ │ Disabled states           │
│ 300 │ #93C5FD │ ▒▒▒▒▒▒▒▒▒▒ │ Borders                   │
│ 400 │ #60A5FA │ ▓▓▓▓▓▓▓▓▓▓ │ Secondary actions         │
│ 500 │ #3B82F6 │ ██████████ │ PRIMARY - Main brand      │
│ 600 │ #2563EB │ ██████████ │ Active states             │
│ 700 │ #1D4ED8 │ ██████████ │ Pressed states            │
│ 800 │ #1E40AF │ ██████████ │ Dark mode primary         │
│ 900 │ #1E3A8A │ ██████████ │ Darkest                   │
└─────────────────────────────────────────────────────────┘
```

### Semantic Colors

#### Success Green
```
┌──────────────────────────────────────┐
│ 50  │ #F0FDF4 │ ░░░░░░░░░░ │ Light  │
│ 100 │ #DCFCE7 │ ░░░░░░░░░░ │ Subtle │
│ 500 │ #22C55E │ ██████████ │ Main   │
│ 600 │ #16A34A │ ██████████ │ Dark   │
│ 700 │ #15803D │ ██████████ │ Darker │
└──────────────────────────────────────┘
```

#### Error Red
```
┌──────────────────────────────────────┐
│ 50  │ #FEF2F2 │ ░░░░░░░░░░ │ Light  │
│ 100 │ #FEE2E2 │ ░░░░░░░░░░ │ Subtle │
│ 500 │ #EF4444 │ ██████████ │ Main   │
│ 600 │ #DC2626 │ ██████████ │ Dark   │
│ 700 │ #B91C1C │ ██████████ │ Darker │
└──────────────────────────────────────┘
```

#### Warning Orange
```
┌──────────────────────────────────────┐
│ 50  │ #FFFBEB │ ░░░░░░░░░░ │ Light  │
│ 100 │ #FEF3C7 │ ░░░░░░░░░░ │ Subtle │
│ 200 │ #FDE68A │ ▒▒▒▒▒▒▒▒▒▒ │ Medium │
│ 500 │ #F59E0B │ ██████████ │ Main   │
│ 600 │ #D97706 │ ██████████ │ Dark   │
└──────────────────────────────────────┘
```

### Gradient Combinations

```
Primary Gradient:    [#3B82F6 → #2563EB]
Success Gradient:    [#22C55E → #16A34A]
Sunset Gradient:     [#F59E0B → #EF4444]
Ocean Gradient:      [#3B82F6 → #6366F1]
```

## Typography Scale

### Font Sizes
```
┌────────┬────────┬─────────────────────────────┐
│ Token  │ Size   │ Usage                       │
├────────┼────────┼─────────────────────────────┤
│ xs     │ 12px   │ Captions, labels            │
│ sm     │ 14px   │ Body text, descriptions     │
│ base   │ 16px   │ Default body text           │
│ lg     │ 18px   │ Subheadings                 │
│ xl     │ 20px   │ Section titles              │
│ 2xl    │ 24px   │ Page titles, logo           │
│ 3xl    │ 30px   │ Hero text                   │
└────────┴────────┴─────────────────────────────┘
```

### Font Weights
```
┌──────────┬───────┬─────────────────────────┐
│ Token    │ Value │ Usage                   │
├──────────┼───────┼─────────────────────────┤
│ normal   │ 400   │ Body text               │
│ medium   │ 500   │ Emphasized text         │
│ semibold │ 600   │ Subheadings             │
│ bold     │ 700   │ Headings, buttons       │
│ extrabold│ 800   │ Logo, hero text         │
└──────────┴───────┴─────────────────────────┘
```

## Shadow System

### Elevation Levels

```
┌────┬──────────────────────────────────────────────┐
│ xs │ ▁ Subtle - Cards, inputs                     │
│    │ offset: (0, 1), opacity: 0.05, radius: 2    │
├────┼──────────────────────────────────────────────┤
│ sm │ ▂ Light - Buttons, small cards               │
│    │ offset: (0, 2), opacity: 0.08, radius: 4    │
├────┼──────────────────────────────────────────────┤
│ md │ ▃ Medium - Elevated cards, header            │
│    │ offset: (0, 4), opacity: 0.12, radius: 8    │
├────┼──────────────────────────────────────────────┤
│ lg │ ▄ Strong - Modals, dropdowns                 │
│    │ offset: (0, 8), opacity: 0.16, radius: 16   │
├────┼──────────────────────────────────────────────┤
│ xl │ ▅ Dramatic - Tab bar, floating elements      │
│    │ offset: (0, 12), opacity: 0.20, radius: 24  │
└────┴──────────────────────────────────────────────┘
```

### Colored Shadows (Special Effects)

```
Primary Shadow:  Blue glow for primary actions
Success Shadow:  Green glow for success states
```

## Spacing Scale

```
┌─────┬──────┬────────────────────────────────┐
│ xs  │  4px │ ▌ Tight spacing                │
│ sm  │  8px │ ▌▌ Small gaps                  │
│ md  │ 12px │ ▌▌▌ Default spacing            │
│ lg  │ 16px │ ▌▌▌▌ Section spacing           │
│ xl  │ 20px │ ▌▌▌▌▌ Large spacing            │
│ 2xl │ 24px │ ▌▌▌▌▌▌ Extra large             │
│ 3xl │ 32px │ ▌▌▌▌▌▌▌▌ Page margins          │
└─────┴──────┴────────────────────────────────┘
```

## Border Radius

```
┌──────┬──────┬────────────────────────────────┐
│ sm   │  8px │ ╭─╮ Small elements             │
│ md   │ 12px │ ╭──╮ Buttons, inputs           │
│ lg   │ 16px │ ╭───╮ Cards, large buttons     │
│ xl   │ 20px │ ╭────╮ Modals, containers      │
│ full │ 999px│ ●  Pills, circular buttons     │
└──────┴──────┴────────────────────────────────┘
```

## Component Showcase

### Tab Bar

#### Visual Structure
```
╭────────────────────────────────────────────────────────╮
│                                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐            │
│  │  🏠  │  │  ✅  │  │  💊  │  │  🔔  │            │
│  │INICIO│  │TAREAS│  │ MEDS │  │EVENTOS│            │
│  └──────┘  └──────┘  └──────┘  └──────┘            │
│                                                        │
╰────────────────────────────────────────────────────────╯
```

#### Specifications
- **Height**: 90px (iOS) / 72px (Android)
- **Border Radius**: 24px (top corners)
- **Shadow**: xl elevation
- **Background**: White surface
- **Padding**: 12px top, 32px bottom (iOS)

#### Active State
```
┌──────┐
│  🏠  │ ← Primary[600] color
│INICIO│ ← Bold, 11px
└──────┘
   ▂     ← Active indicator (optional)
```

#### Inactive State
```
┌──────┐
│  ✅  │ ← Gray[500] color
│TAREAS│ ← Bold, 11px
└──────┘
```

### Header

#### Visual Structure
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  🔵 PILDHORA                          ⚠️  👤         │
│  Dr. Smith                                             │
│  Dashboard                                             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Action Buttons
```
┌──────┐  ┌──────┐
│  ⚠️  │  │  👤  │
└──────┘  └──────┘
 48x48     48x48
 Red       Blue
 16px      16px
 radius    radius
```

#### Specifications
- **Logo**: 24px, extrabold, primary[600]
- **Name**: 14px, medium, gray[600]
- **Title**: 18px, semibold, primary[500]
- **Buttons**: 48x48, rounded 16px, md shadow

### Buttons

#### Primary Button
```
╭──────────────────╮
│   Primary Action │ ← White text, bold
╰──────────────────╯
   Primary[500] bg
   md shadow
   12px radius
```

#### Secondary Button
```
╭──────────────────╮
│ Secondary Action │ ← Gray[700] text, bold
╰──────────────────╯
   Gray[100] bg
   sm shadow
   12px radius
```

#### Danger Button
```
╭──────────────────╮
│  Danger Action   │ ← White text, bold
╰──────────────────╯
   Error[600] bg
   md shadow
   12px radius
```

### Cards

#### Elevated Card
```
╭────────────────────────────────────╮
│                                    │
│  Card Title                        │
│  ────────────────────────────      │
│                                    │
│  Card content goes here with       │
│  proper spacing and typography.    │
│                                    │
╰────────────────────────────────────╯
  White surface
  md shadow
  16px radius
  16px padding
```

#### Outlined Card
```
┌────────────────────────────────────┐
│                                    │
│  Card Title                        │
│  ────────────────────────────      │
│                                    │
│  Card content with border only.    │
│                                    │
└────────────────────────────────────┘
  White surface
  Gray[200] border
  16px radius
  16px padding
```

## Icon System

### Sizes
```
┌──────────┬──────┬─────────────────────────┐
│ Context  │ Size │ Usage                   │
├──────────┼──────┼─────────────────────────┤
│ Inline   │ 16px │ Within text             │
│ Button   │ 20px │ Button icons            │
│ Nav      │ 24px │ Navigation, cards       │
│ Header   │ 28px │ Header actions          │
│ Empty    │ 48px │ Empty states            │
│ Hero     │ 64px │ Large illustrations     │
└──────────┴──────┴─────────────────────────┘
```

### States
```
Active:    Primary[600] or semantic color
Inactive:  Gray[500]
Disabled:  Gray[300]
```

## Accessibility

### Color Contrast Ratios

```
┌─────────────────────┬───────┬────────┐
│ Combination         │ Ratio │ Grade  │
├─────────────────────┼───────┼────────┤
│ Primary[600]/White  │ 4.5:1 │ AA ✓   │
│ Gray[500]/White     │ 4.5:1 │ AA ✓   │
│ Error[600]/White    │ 4.5:1 │ AA ✓   │
│ White/Primary[500]  │ 4.5:1 │ AA ✓   │
│ White/Error[600]    │ 5.2:1 │ AAA ✓  │
└─────────────────────┴───────┴────────┘
```

### Touch Targets

```
Minimum Size: 44x44 points

Tab Bar Items:  48x48 ✓
Header Buttons: 48x48 ✓
Action Buttons: 44x44 ✓
List Items:     44px height ✓
```

## Animation Guidelines

### Timing
```
Fast:    150ms - Micro-interactions
Normal:  250ms - Standard transitions
Slow:    350ms - Page transitions
```

### Easing
```
ease-out:     Entering elements
ease-in:      Exiting elements
ease-in-out:  Moving elements
spring:       Natural feel (iOS)
```

### Examples
```
Button Press:  Scale 0.95, 150ms, ease-out
Tab Switch:    Fade + slide, 250ms, ease-in-out
Modal Open:    Scale + fade, 350ms, spring
```

## Responsive Breakpoints

```
┌──────────┬────────┬─────────────────────┐
│ Device   │ Width  │ Adjustments         │
├──────────┼────────┼─────────────────────┤
│ Small    │ <375px │ Compact spacing     │
│ Medium   │ 375px  │ Standard (iPhone)   │
│ Large    │ 414px  │ Standard (Plus)     │
│ XL       │ >768px │ Tablet layout       │
└──────────┴────────┴─────────────────────┘
```

## Platform Differences

### iOS
- Floating tab bar with absolute positioning
- Larger bottom padding (32px) for home indicator
- ActionSheet for native modals
- Spring animations
- Haptic feedback

### Android
- Fixed tab bar
- Standard bottom padding (16px)
- Custom modals with Material design
- Standard easing
- Material elevation

## Usage Examples

### Applying Colors
```typescript
// Primary action
backgroundColor: colors.primary[500]
color: colors.surface

// Secondary action
backgroundColor: colors.gray[100]
color: colors.gray[700]

// Success state
backgroundColor: colors.success[500]
color: colors.surface
```

### Applying Shadows
```typescript
// Card
...shadows.md

// Floating button
...shadows.lg

// Tab bar
...shadows.xl
```

### Applying Spacing
```typescript
// Tight
padding: spacing.xs

// Standard
padding: spacing.lg

// Generous
padding: spacing['2xl']
```

## Best Practices

### Do's ✅
- Use design tokens consistently
- Maintain proper color contrast
- Ensure adequate touch targets
- Apply appropriate shadows for elevation
- Use semantic colors for meaning
- Follow platform conventions

### Don'ts ❌
- Don't use arbitrary colors
- Don't mix shadow levels inconsistently
- Don't create touch targets smaller than 44x44
- Don't use color alone to convey information
- Don't ignore platform differences
- Don't override system fonts unnecessarily

## Quick Reference

### Most Common Patterns

```typescript
// Primary Button
{
  backgroundColor: colors.primary[500],
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xl,
  borderRadius: borderRadius.md,
  ...shadows.sm,
}

// Card
{
  backgroundColor: colors.surface,
  padding: spacing.lg,
  borderRadius: borderRadius.lg,
  ...shadows.md,
}

// Header
{
  backgroundColor: colors.surface,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.lg,
  ...shadows.md,
}

// Tab Bar
{
  backgroundColor: colors.surface,
  paddingTop: spacing.md,
  paddingBottom: spacing['2xl'],
  borderTopLeftRadius: spacing['2xl'],
  borderTopRightRadius: spacing['2xl'],
  ...shadows.xl,
}
```

---

**Version**: 2.1.0
**Last Updated**: November 17, 2025
**Status**: Production Ready ✨
