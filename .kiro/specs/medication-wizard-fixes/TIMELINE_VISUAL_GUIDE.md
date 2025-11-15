# Custom Timeline Visual Guide

## 📊 Timeline Component Overview

The CustomTimeline component provides a horizontal 24-hour visualization of medication schedules.

## 🎨 Visual Examples

### Example 1: Single Medication Times
**Schedule**: 08:00, 14:00, 20:00

```
┌────────────────────────────────────────────────────────────┐
│  Vista previa del día                                      │
│  Visualiza cuándo tomarás tu medicamento durante el día    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  00  01  02  03  04  05  06  07  08  09  10  11  12  13   │
│  │   │   │   │   │   │   │   │   💊  │   │   │   │   │   │
│  │   │   │   │   │   │   │   │   ║   │   │   │   │   │   │
│  ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   │
│                                                            │
│  14  15  16  17  18  19  20  21  22  23                   │
│  💊  │   │   │   │   │   💊  │   │   │                    │
│  ║   │   │   │   │   │   ║   │   │   │                    │
│  ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼                    │
│                                                            │
│  ← Scroll horizontally to see all hours →                 │
└────────────────────────────────────────────────────────────┘

Legend:
│  = Inactive hour (gray, thin line)
║  = Active hour (blue, thick line)
💊 = Medication scheduled
```

### Example 2: Multiple Medications in Same Hour
**Schedule**: 08:00, 08:30, 14:00, 20:00, 20:15

```
┌────────────────────────────────────────────────────────────┐
│  Vista previa del día                                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  00  01  02  03  04  05  06  07  08  09  10  11  12  13   │
│  │   │   │   │   │   │   │   │  💊②  │   │   │   │   │   │
│  │   │   │   │   │   │   │   │   ║   │   │   │   │   │   │
│  ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   │
│                                                            │
│  14  15  16  17  18  19  20  21  22  23                   │
│  💊  │   │   │   │   │  💊②  │   │   │                    │
│  ║   │   │   │   │   │   ║   │   │   │                    │
│  ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼                    │
│                                                            │
└────────────────────────────────────────────────────────────┘

Legend:
💊② = Badge showing 2 medications in this hour
```

### Example 3: Frequent Dosing Schedule
**Schedule**: 06:00, 09:00, 12:00, 15:00, 18:00, 21:00

```
┌────────────────────────────────────────────────────────────┐
│  Vista previa del día                                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  00  01  02  03  04  05  06  07  08  09  10  11  12  13   │
│  │   │   │   │   │   │   💊  │   │   💊  │   │   💊  │   │
│  │   │   │   │   │   │   ║   │   │   ║   │   │   ║   │   │
│  ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   │
│                                                            │
│  14  15  16  17  18  19  20  21  22  23                   │
│  │   💊  │   │   💊  │   │   💊  │   │                    │
│  │   ║   │   │   ║   │   │   ║   │   │                    │
│  ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼                    │
│                                                            │
└────────────────────────────────────────────────────────────┘

Shows evenly distributed medication times throughout the day
```

## 🎯 Component Anatomy

### Hour Marker
```
  08
  ↓
Hour label (gray text, small font)
```

### Medication Indicator (Single)
```
  💊
  ↓
Emoji (28px, centered)
```

### Medication Indicator (Multiple)
```
  💊②
  ↑ ↑
  │ └─ Badge (count)
  └─── Emoji
```

### Hour Line States

**Inactive Hour:**
```
│
│  ← 2px wide, gray color
│
```

**Active Hour:**
```
║
║  ← 3px wide, primary blue color
║
```

## 📐 Dimensions

- **Hour width**: 60px
- **Hour line height**: 40px
- **Emoji size**: 28px
- **Badge size**: 18x18px
- **Badge font**: 10px bold
- **Hour label font**: 12px (xs)
- **Container padding**: 16px (lg)
- **Gap between hours**: 4px (xs)

## 🎨 Color Palette

| Element | Color | Token |
|---------|-------|-------|
| Hour label | Gray 500 | `colors.gray[500]` |
| Inactive line | Gray 200 | `colors.gray[200]` |
| Active line | Primary 500 | `colors.primary[500]` |
| Badge background | Primary 500 | `colors.primary[500]` |
| Badge text | White | `colors.surface` |
| Container background | White | `colors.surface` |
| Container border | Gray 200 | `colors.gray[200]` |

## 📱 Responsive Behavior

### Small Screens (< 375px)
- Timeline scrolls horizontally
- All 24 hours visible via scroll
- Smooth scrolling experience

### Medium Screens (375-768px)
- Timeline scrolls horizontally
- Approximately 6-7 hours visible at once
- Easy swipe navigation

### Large Screens (> 768px)
- Timeline scrolls horizontally
- More hours visible at once
- Desktop-friendly scrolling

## ♿ Accessibility

### Screen Reader Announcements

**Timeline container:**
```
"Vista previa del horario del día. Muestra 3 horarios programados durante el día"
```

**Hour with medication:**
```
"08:00 - 1 medicamento programado"
"08:00 - 2 medicamentos programados"
```

**Hour without medication:**
```
"10:00 - Sin medicamentos"
```

## 🔄 Dynamic Updates

The timeline automatically updates when:
1. User adds a new time
2. User edits an existing time
3. User removes a time
4. User changes medication emoji

### Update Flow
```
User adds time → times array updates → Timeline re-renders → New indicator appears
```

## 💡 Usage Tips

### For Users
1. **Scroll to view all hours**: Swipe left/right to see the full day
2. **Check for conflicts**: Multiple badges indicate overlapping times
3. **Visual verification**: Quickly confirm your schedule at a glance

### For Developers
1. **Pass current times**: `times={times}` from state
2. **Pass medication emoji**: `emoji={formData.emoji || '💊'}`
3. **Conditional rendering**: Only show when `times.length > 0`

## 🎬 Animation Opportunities (Future Enhancement)

Potential animations to add:
- Fade in when timeline appears
- Pulse effect on active hours
- Smooth scroll to current hour
- Badge pop-in animation
- Line height animation on selection

## 📊 Data Flow

```
MedicationScheduleStep
    ↓
  times: ['08:00', '14:00', '20:00']
  emoji: '💊'
    ↓
CustomTimeline
    ↓
Convert times to hours: [8, 14, 20]
    ↓
Count per hour: { 8: 1, 14: 1, 20: 1 }
    ↓
Render 24 hours with indicators
    ↓
Display in ScrollView
```

## 🧩 Integration Example

```typescript
// In MedicationScheduleStep.tsx
{times.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>Vista previa del día</Text>
    <Text style={styles.helperText}>
      Visualiza cuándo tomarás tu medicamento durante el día
    </Text>
    <CustomTimeline 
      times={times} 
      emoji={formData.emoji || '💊'} 
    />
  </View>
)}
```

## ✨ Key Features Highlighted

1. **24-Hour Coverage**: Complete day visualization
2. **Horizontal Scroll**: Access all hours easily
3. **Visual Indicators**: Clear medication markers
4. **Count Badges**: Shows multiple medications per hour
5. **Active States**: Distinguishes scheduled vs unscheduled hours
6. **Accessibility**: Full screen reader support
7. **Responsive**: Works on all screen sizes
8. **Clean Design**: Modern, minimal aesthetic

---

This visual guide helps developers and designers understand the timeline component's appearance and behavior.
