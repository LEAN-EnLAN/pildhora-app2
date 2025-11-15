# Accessibility Manual Testing Checklist

## Overview

This checklist provides step-by-step instructions for manually testing the medication wizard's accessibility features with real devices and assistive technologies.

## Prerequisites

- iOS device with VoiceOver enabled
- Android device with TalkBack enabled
- Test devices in various sizes (small phone, large phone, tablet)
- External keyboard (for keyboard navigation testing)
- Color blindness simulator app (optional)

---

## Test 1: Screen Reader Testing (VoiceOver - iOS)

### Setup
1. Open Settings > Accessibility > VoiceOver
2. Enable VoiceOver
3. Learn basic gestures:
   - Swipe right: Next element
   - Swipe left: Previous element
   - Double-tap: Activate element
   - Two-finger swipe up: Read from top
   - Rotor: Rotate two fingers to change navigation mode

### Step 1: Icon and Name Selection

- [ ] **Container Label**: Swipe to wizard, verify announces "Paso 1: Selección de icono y nombre"
- [ ] **Emoji Grid**: Verify announces "Cuadrícula de iconos disponibles"
- [ ] **Emoji Buttons**: 
  - [ ] Each emoji button announces the emoji character
  - [ ] Announces "Toca para seleccionar [emoji] como icono del medicamento"
  - [ ] Selected state is announced
- [ ] **"Más emojis" Button**:
  - [ ] Announces "Abrir selector de emojis del sistema"
  - [ ] Announces hint about opening device emoji keyboard
- [ ] **Name Input**:
  - [ ] Announces "Nombre del medicamento"
  - [ ] Announces hint about character limit
  - [ ] Announces character count as you type
- [ ] **Error Messages**:
  - [ ] Error is announced immediately when validation fails
  - [ ] Error message is in Spanish

### Step 2: Schedule Configuration

- [ ] **Container Label**: Verify announces "Paso 2: Configuración de horario"
- [ ] **Time Cards**:
  - [ ] Each card announces "Horario [number]: [time]"
  - [ ] Edit button announces "Editar horario [time]"
  - [ ] Delete button announces "Eliminar"
- [ ] **Add Time Button**:
  - [ ] Announces "Agregar horario"
  - [ ] Announces hint about adding new time
- [ ] **Day Chips**:
  - [ ] Each day announces full name (Lunes, Martes, etc.)
  - [ ] Announces selection state
  - [ ] Announces hint about selecting/deselecting
- [ ] **Timeline**:
  - [ ] Announces "Vista previa del horario del día"
  - [ ] Announces number of scheduled times
  - [ ] Each hour announces medication count if scheduled
- [ ] **Time Picker Modal**:
  - [ ] Modal can be dismissed with swipe down
  - [ ] Picker announces "Seleccionar hora"
  - [ ] Cancel and Confirm buttons are announced

### Step 3: Dosage Configuration

- [ ] **Container Label**: Verify announces "Paso 3: Configuración de dosis"
- [ ] **Dose Input**:
  - [ ] Announces "Valor de la dosis"
  - [ ] Announces hint about entering numeric value
  - [ ] Numeric keyboard is announced
- [ ] **Unit Chips**:
  - [ ] Each unit announces its label
  - [ ] Announces selection state
  - [ ] Announces hint about selecting unit
- [ ] **Type Buttons**:
  - [ ] Each type announces its label (Tabletas, Cápsulas, etc.)
  - [ ] Announces selection state
  - [ ] Announces hint about selecting type
- [ ] **Dosage Preview**:
  - [ ] Preview is announced with medication emoji
  - [ ] Amount and unit are announced
- [ ] **Error Messages**:
  - [ ] Errors are announced immediately
  - [ ] Error messages are in Spanish

---

## Test 2: Screen Reader Testing (TalkBack - Android)

### Setup
1. Open Settings > Accessibility > TalkBack
2. Enable TalkBack
3. Learn basic gestures:
   - Swipe right: Next element
   - Swipe left: Previous element
   - Double-tap: Activate element
   - Swipe down then right: Read from top
   - Local context menu: Swipe up then right

### Repeat all tests from Test 1 with TalkBack

**Additional TalkBack-specific checks:**
- [ ] Explore by touch works correctly
- [ ] Reading controls work (read from top, read from next)
- [ ] Custom actions are announced if any
- [ ] Spelling mode works for text inputs

---

## Test 3: Touch Target Size Testing

### Small Phone (320-360px width)

**Step 1:**
- [ ] All emoji buttons are easily tappable (no mis-taps)
- [ ] "Más emojis" button is easily tappable
- [ ] Name input is easily focusable

**Step 2:**
- [ ] Time card edit/delete buttons are easily tappable
- [ ] Add time button is easily tappable
- [ ] Day chips are easily tappable
- [ ] Timeline hours are easily tappable (if interactive)

**Step 3:**
- [ ] Dose input is easily focusable
- [ ] Unit chips are easily tappable
- [ ] Type buttons are easily tappable

### Large Phone (375-428px width)

Repeat all touch target tests from small phone section.

### Tablet (768px+ width)

Repeat all touch target tests from small phone section.

**Additional tablet checks:**
- [ ] Layout uses extra space effectively
- [ ] Touch targets are not unnecessarily large
- [ ] Grid layouts show more columns appropriately

---

## Test 4: Keyboard Navigation Testing

### Setup
- Connect external keyboard to device
- Enable full keyboard access (iOS: Settings > Accessibility > Keyboards > Full Keyboard Access)

### Navigation Tests

**Step 1:**
- [ ] Tab key moves through elements in logical order
- [ ] Emoji buttons can be focused with Tab
- [ ] Space or Enter activates focused emoji button
- [ ] Name input can be focused and typed into
- [ ] Return key behavior is appropriate

**Step 2:**
- [ ] Tab key moves through time cards
- [ ] Edit/delete buttons can be focused
- [ ] Add time button can be focused
- [ ] Day chips can be focused and toggled
- [ ] Modal can be dismissed with Escape key

**Step 3:**
- [ ] Tab key moves through all inputs and buttons
- [ ] Dose input can be focused and typed into
- [ ] Unit chips can be focused and selected
- [ ] Type buttons can be focused and selected
- [ ] Return key moves to next input

### Focus Indicators

- [ ] Focused elements have visible focus indicator
- [ ] Focus indicator has sufficient contrast
- [ ] Focus indicator is not obscured by other elements

---

## Test 5: Large Text Size Testing

### Setup
1. **iOS**: Settings > Display & Brightness > Text Size (set to largest)
2. **Android**: Settings > Display > Font size (set to largest)

### Layout Tests

**Step 1:**
- [ ] Title and subtitle text is not truncated
- [ ] Emoji buttons maintain proper size
- [ ] Name input label is fully visible
- [ ] Error messages are fully visible
- [ ] Info box text wraps properly

**Step 2:**
- [ ] Time card labels are fully visible
- [ ] Time display is not truncated
- [ ] Day chip labels are fully visible
- [ ] Timeline labels are readable
- [ ] Modal text is fully visible

**Step 3:**
- [ ] Section labels are fully visible
- [ ] Dose input displays large numbers properly
- [ ] Unit chip labels are fully visible
- [ ] Type button labels are fully visible
- [ ] Preview text is readable

### Scroll Tests

- [ ] All content is accessible via scrolling
- [ ] No content is cut off at screen edges
- [ ] Scroll indicators work properly

---

## Test 6: Color Contrast Testing

### Visual Inspection

**Text Contrast:**
- [ ] All body text is easily readable
- [ ] All labels are easily readable
- [ ] All button text is easily readable
- [ ] Error messages stand out clearly

**Interactive Elements:**
- [ ] Selected state is visually distinct
- [ ] Disabled state is visually distinct
- [ ] Focus state is visually distinct
- [ ] Hover state is visually distinct (if applicable)

### Bright Sunlight Test

- [ ] Take device outside in bright sunlight
- [ ] Verify all text is still readable
- [ ] Verify all interactive elements are visible

### Color Blindness Simulation

Use a color blindness simulator app to test:

**Protanopia (Red-blind):**
- [ ] All information is conveyed without relying on red
- [ ] Error states are distinguishable

**Deuteranopia (Green-blind):**
- [ ] All information is conveyed without relying on green
- [ ] Success states are distinguishable

**Tritanopia (Blue-blind):**
- [ ] All information is conveyed without relying on blue
- [ ] Primary actions are distinguishable

---

## Test 7: Gesture Testing with Screen Reader

### VoiceOver Gestures (iOS)

**Step 1:**
- [ ] Swipe right/left navigates through all elements
- [ ] Double-tap activates emoji selection
- [ ] Two-finger swipe up reads entire step
- [ ] Rotor can navigate by headings (if applicable)

**Step 2:**
- [ ] Swipe right/left navigates through time cards
- [ ] Double-tap activates edit/delete
- [ ] Two-finger swipe up reads entire step
- [ ] Timeline can be explored

**Step 3:**
- [ ] Swipe right/left navigates through all inputs
- [ ] Double-tap activates chip selection
- [ ] Two-finger swipe up reads entire step
- [ ] Preview can be explored

### TalkBack Gestures (Android)

**Explore by Touch:**
- [ ] Can explore screen by dragging finger
- [ ] Elements are announced as finger moves over them
- [ ] Double-tap activates element under finger

**Reading Controls:**
- [ ] Swipe down then right reads from top
- [ ] Swipe up then right opens local context menu
- [ ] Swipe right then left goes back

---

## Test 8: Dynamic Content Announcements

### Error Messages

**Step 1:**
- [ ] Type invalid name, verify error is announced immediately
- [ ] Clear name, verify error is announced
- [ ] Fix error, verify error dismissal is announced

**Step 3:**
- [ ] Enter invalid dose, verify error is announced immediately
- [ ] Change medication type, verify unit reset is announced
- [ ] Fix error, verify error dismissal is announced

### State Changes

**Step 1:**
- [ ] Select emoji, verify selection is announced
- [ ] Change emoji, verify new selection is announced

**Step 2:**
- [ ] Add time, verify new time is announced
- [ ] Edit time, verify change is announced
- [ ] Delete time, verify deletion is announced
- [ ] Toggle day, verify selection change is announced

**Step 3:**
- [ ] Select unit, verify selection is announced
- [ ] Select type, verify selection is announced
- [ ] Change dose value, verify preview update is announced

---

## Test 9: Modal and Overlay Accessibility

### Time Picker Modal (Step 2)

**Opening:**
- [ ] Modal opening is announced
- [ ] Focus moves to modal content
- [ ] Background content is not accessible

**Interaction:**
- [ ] Can navigate through modal elements
- [ ] Time picker is accessible
- [ ] Cancel button is accessible
- [ ] Confirm button is accessible

**Closing:**
- [ ] Modal closing is announced
- [ ] Focus returns to trigger element
- [ ] Background content becomes accessible again

---

## Test 10: Multi-language Support

### Spanish Language Verification

**All Steps:**
- [ ] All labels are in Spanish
- [ ] All hints are in Spanish
- [ ] All error messages are in Spanish
- [ ] All button text is in Spanish
- [ ] All placeholder text is in Spanish

**Screen Reader:**
- [ ] Screen reader pronounces Spanish text correctly
- [ ] No English text is announced
- [ ] Pronunciation is natural and understandable

---

## Test Results Template

### Device Information
- Device Model: _______________
- OS Version: _______________
- Screen Size: _______________
- Assistive Technology: _______________

### Overall Assessment
- [ ] Pass - All tests passed
- [ ] Pass with Minor Issues - Most tests passed, minor improvements needed
- [ ] Fail - Significant issues found

### Issues Found

| Issue | Severity | Step | Description |
|-------|----------|------|-------------|
| 1 | High/Medium/Low | Step # | Description |
| 2 | High/Medium/Low | Step # | Description |

### Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Tester Information
- Name: _______________
- Date: _______________
- Signature: _______________

---

## Success Criteria

The medication wizard passes accessibility testing if:

1. ✅ All interactive elements are accessible with screen readers
2. ✅ All elements have appropriate labels and hints in Spanish
3. ✅ All touch targets meet minimum size requirements (44-48dp)
4. ✅ All text is readable at large text sizes
5. ✅ All color contrast ratios meet WCAG AA standards
6. ✅ Keyboard navigation works logically
7. ✅ Error messages are announced immediately
8. ✅ State changes are announced appropriately
9. ✅ Modals and overlays are accessible
10. ✅ No critical issues found in manual testing

## Next Steps After Testing

1. **Document Issues**: Record all issues found with screenshots/videos
2. **Prioritize Fixes**: Categorize issues by severity
3. **Implement Fixes**: Address high-priority issues first
4. **Re-test**: Verify fixes with another round of testing
5. **User Testing**: Test with actual users who rely on accessibility features
6. **Continuous Monitoring**: Include accessibility in regular QA process
