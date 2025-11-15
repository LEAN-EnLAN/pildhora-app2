/**
 * Accessibility Testing for Medication Wizard
 * 
 * This test file validates accessibility compliance for all wizard steps:
 * - Screen reader support (TalkBack/VoiceOver)
 * - Interactive element labels
 * - Minimum touch target sizes
 * - Keyboard navigation
 * - Color contrast ratios
 * - Large text size support
 * 
 * Test Requirements: All requirements from medication-wizard-fixes spec
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

// Helper function to log test results
function logTest(name, passed, message, isWarning = false) {
  const status = passed ? '✓' : (isWarning ? '⚠' : '✗');
  const color = passed ? colors.green : (isWarning ? colors.yellow : colors.red);
  
  console.log(`${color}${status}${colors.reset} ${name}`);
  if (message) {
    console.log(`  ${message}`);
  }
  
  results.tests.push({ name, passed, message, isWarning });
  if (passed) {
    results.passed++;
  } else if (isWarning) {
    results.warnings++;
  } else {
    results.failed++;
  }
}

// Helper function to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Helper function to check if a pattern exists in content
function hasPattern(content, pattern, flags = 'g') {
  const regex = new RegExp(pattern, flags);
  return regex.test(content);
}

// Helper function to count pattern occurrences
function countPattern(content, pattern, flags = 'g') {
  const regex = new RegExp(pattern, flags);
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

// Helper function to extract all matches
function extractMatches(content, pattern, flags = 'g') {
  const regex = new RegExp(pattern, flags);
  return content.match(regex) || [];
}

console.log(`\n${colors.bright}${colors.cyan}=== Medication Wizard Accessibility Testing ===${colors.reset}\n`);

// Test files to check
const wizardFiles = [
  'src/components/patient/medication-wizard/MedicationIconNameStep.tsx',
  'src/components/patient/medication-wizard/MedicationScheduleStep.tsx',
  'src/components/patient/medication-wizard/MedicationDosageStep.tsx',
];

// ============================================================================
// TEST 1: Screen Reader Support - Accessibility Labels
// ============================================================================
console.log(`\n${colors.bright}Test 1: Screen Reader Support - Accessibility Labels${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) {
    logTest(`${path.basename(file)} - File exists`, false, 'File not found');
    return;
  }

  const fileName = path.basename(file, '.tsx');
  
  // Check for accessibilityLabel on interactive elements
  const touchableOpacityCount = countPattern(content, '<TouchableOpacity');
  const touchableWithLabelCount = countPattern(content, '<TouchableOpacity[^>]*accessibilityLabel=');
  
  const textInputCount = countPattern(content, '<(?:RNTextInput|TextInput)');
  const inputWithLabelCount = countPattern(content, '<(?:RNTextInput|TextInput)[^>]*accessibilityLabel=');
  
  const scrollViewCount = countPattern(content, '<ScrollView');
  const scrollViewWithLabelCount = countPattern(content, '<ScrollView[^>]*accessibilityLabel=');
  
  // Check main container has accessibility label
  const hasMainLabel = hasPattern(content, 'accessibilityLabel="Paso \\d+:');
  logTest(
    `${fileName} - Main container has accessibility label`,
    hasMainLabel,
    hasMainLabel ? 'Step container properly labeled' : 'Missing main container label'
  );
  
  // Check TouchableOpacity elements
  const touchableLabelRatio = touchableOpacityCount > 0 ? touchableWithLabelCount / touchableOpacityCount : 1;
  logTest(
    `${fileName} - TouchableOpacity elements have labels`,
    touchableLabelRatio >= 0.8,
    `${touchableWithLabelCount}/${touchableOpacityCount} TouchableOpacity elements have accessibilityLabel (${Math.round(touchableLabelRatio * 100)}%)`,
    touchableLabelRatio >= 0.6 && touchableLabelRatio < 0.8
  );
  
  // Check Input elements
  if (textInputCount > 0) {
    const inputLabelRatio = inputWithLabelCount / textInputCount;
    logTest(
      `${fileName} - Input elements have labels`,
      inputLabelRatio >= 0.8,
      `${inputWithLabelCount}/${textInputCount} input elements have accessibilityLabel (${Math.round(inputLabelRatio * 100)}%)`,
      inputLabelRatio >= 0.6 && inputLabelRatio < 0.8
    );
  }
});

// ============================================================================
// TEST 2: Accessibility Roles
// ============================================================================
console.log(`\n${colors.bright}Test 2: Accessibility Roles${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for accessibilityRole on interactive elements
  const hasButtonRoles = hasPattern(content, 'accessibilityRole="button"');
  const hasAlertRoles = hasPattern(content, 'accessibilityRole="alert"');
  const hasMenuRoles = hasPattern(content, 'accessibilityRole="menu"');
  
  logTest(
    `${fileName} - Uses button roles`,
    hasButtonRoles,
    hasButtonRoles ? 'Button roles properly defined' : 'Missing button roles'
  );
  
  logTest(
    `${fileName} - Uses alert roles for errors`,
    hasAlertRoles,
    hasAlertRoles ? 'Alert roles properly defined for error messages' : 'Missing alert roles for errors'
  );
});

// ============================================================================
// TEST 3: Accessibility Hints
// ============================================================================
console.log(`\n${colors.bright}Test 3: Accessibility Hints${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for accessibilityHint on interactive elements
  const hintCount = countPattern(content, 'accessibilityHint=');
  const touchableCount = countPattern(content, '<TouchableOpacity');
  
  logTest(
    `${fileName} - Provides accessibility hints`,
    hintCount >= touchableCount * 0.5,
    `${hintCount} accessibility hints found for ${touchableCount} interactive elements`,
    hintCount >= touchableCount * 0.3 && hintCount < touchableCount * 0.5
  );
  
  // Check for Spanish hints
  const spanishHintCount = countPattern(content, 'accessibilityHint="[^"]*(?:Toca|para|seleccionar|cambiar|abrir)');
  logTest(
    `${fileName} - Hints are in Spanish`,
    spanishHintCount >= hintCount * 0.8,
    `${spanishHintCount}/${hintCount} hints are in Spanish`,
    spanishHintCount >= hintCount * 0.6 && spanishHintCount < hintCount * 0.8
  );
});

// ============================================================================
// TEST 4: Accessibility State
// ============================================================================
console.log(`\n${colors.bright}Test 4: Accessibility State${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for accessibilityState on selectable elements
  const hasAccessibilityState = hasPattern(content, 'accessibilityState=');
  const hasSelectedState = hasPattern(content, 'accessibilityState=\\{\\{\\s*selected:');
  
  logTest(
    `${fileName} - Uses accessibility state`,
    hasAccessibilityState,
    hasAccessibilityState ? 'Accessibility state properly defined' : 'Missing accessibility state'
  );
  
  if (hasAccessibilityState) {
    logTest(
      `${fileName} - Tracks selected state`,
      hasSelectedState,
      hasSelectedState ? 'Selected state properly tracked' : 'Missing selected state tracking'
    );
  }
});

// ============================================================================
// TEST 5: Live Regions for Dynamic Content
// ============================================================================
console.log(`\n${colors.bright}Test 5: Live Regions for Dynamic Content${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for accessibilityLiveRegion on error messages
  const hasLiveRegion = hasPattern(content, 'accessibilityLiveRegion="assertive"');
  const hasErrorText = hasPattern(content, 'errorText|Error');
  
  if (hasErrorText) {
    logTest(
      `${fileName} - Error messages use live regions`,
      hasLiveRegion,
      hasLiveRegion ? 'Error messages properly announced' : 'Missing live region for errors'
    );
  }
});

// ============================================================================
// TEST 6: Minimum Touch Target Sizes
// ============================================================================
console.log(`\n${colors.bright}Test 6: Minimum Touch Target Sizes${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for minimum touch target sizes (48x48 dp)
  const hasMinWidth = hasPattern(content, 'minWidth:\\s*(?:4[8-9]|[5-9]\\d|\\d{3,})');
  const hasMinHeight = hasPattern(content, 'minHeight:\\s*(?:4[8-9]|[5-9]\\d|\\d{3,})');
  const hasHitSlop = hasPattern(content, 'hitSlop=');
  
  logTest(
    `${fileName} - Defines minimum width`,
    hasMinWidth,
    hasMinWidth ? 'Minimum width (48dp+) defined' : 'Missing minimum width definition'
  );
  
  logTest(
    `${fileName} - Defines minimum height`,
    hasMinHeight,
    hasMinHeight ? 'Minimum height (48dp+) defined' : 'Missing minimum height definition'
  );
  
  logTest(
    `${fileName} - Uses hitSlop for small targets`,
    hasHitSlop,
    hasHitSlop ? 'hitSlop defined for better touch targets' : 'Consider adding hitSlop for small elements',
    !hasHitSlop
  );
});

// ============================================================================
// TEST 7: Emoji Button Sizes (Step 1 Specific)
// ============================================================================
console.log(`\n${colors.bright}Test 7: Emoji Button Sizes (Step 1)${colors.reset}`);

const step1Content = readFile(wizardFiles[0]);
if (step1Content) {
  // Check emoji button sizes
  const emojiButtonStyle = step1Content.match(/emojiButton:\s*\{[^}]*\}/s);
  if (emojiButtonStyle) {
    const hasMinWidth = /minWidth:\s*48/.test(emojiButtonStyle[0]);
    const hasMinHeight = /minHeight:\s*48/.test(emojiButtonStyle[0]);
    
    logTest(
      'Step 1 - Emoji buttons meet minimum size',
      hasMinWidth && hasMinHeight,
      hasMinWidth && hasMinHeight ? 'Emoji buttons are 48x48 dp minimum' : 'Emoji buttons may be too small'
    );
  }
  
  // Check for responsive emoji grid
  const hasResponsiveGrid = hasPattern(step1Content, 'useWindowDimensions|screenWidth');
  logTest(
    'Step 1 - Emoji grid is responsive',
    hasResponsiveGrid,
    hasResponsiveGrid ? 'Grid adapts to screen size' : 'Grid may not be responsive'
  );
}

// ============================================================================
// TEST 8: Time Card Accessibility (Step 2 Specific)
// ============================================================================
console.log(`\n${colors.bright}Test 8: Time Card Accessibility (Step 2)${colors.reset}`);

const step2Content = readFile(wizardFiles[1]);
if (step2Content) {
  // Check TimeCard component accessibility
  const hasTimeCardLabel = hasPattern(step2Content, 'accessibilityLabel=.*Horario');
  const hasEditLabel = hasPattern(step2Content, 'accessibilityLabel="Editar"');
  const hasDeleteLabel = hasPattern(step2Content, 'accessibilityLabel="Eliminar"');
  
  logTest(
    'Step 2 - Time cards have labels',
    hasTimeCardLabel,
    hasTimeCardLabel ? 'Time cards properly labeled' : 'Missing time card labels'
  );
  
  logTest(
    'Step 2 - Edit buttons have labels',
    hasEditLabel,
    hasEditLabel ? 'Edit buttons properly labeled' : 'Missing edit button labels'
  );
  
  logTest(
    'Step 2 - Delete buttons have labels',
    hasDeleteLabel,
    hasDeleteLabel ? 'Delete buttons properly labeled' : 'Missing delete button labels'
  );
  
  // Check timeline accessibility
  const hasTimelineLabel = hasPattern(step2Content, 'accessibilityLabel="Vista previa del horario');
  logTest(
    'Step 2 - Timeline has accessibility label',
    hasTimelineLabel,
    hasTimelineLabel ? 'Timeline properly labeled' : 'Missing timeline label'
  );
}

// ============================================================================
// TEST 9: Dosage Preview Accessibility (Step 3 Specific)
// ============================================================================
console.log(`\n${colors.bright}Test 9: Dosage Preview Accessibility (Step 3)${colors.reset}`);

const step3Content = readFile(wizardFiles[2]);
if (step3Content) {
  // Check dosage input accessibility
  const hasDoseInputLabel = hasPattern(step3Content, 'accessibilityLabel="Valor de la dosis"');
  const hasUnitSelectorLabel = hasPattern(step3Content, 'accessibilityLabel="Selector de unidades');
  const hasTypeSelectorLabel = hasPattern(step3Content, 'accessibilityLabel="Selector de tipo');
  
  logTest(
    'Step 3 - Dose input has label',
    hasDoseInputLabel,
    hasDoseInputLabel ? 'Dose input properly labeled' : 'Missing dose input label'
  );
  
  logTest(
    'Step 3 - Unit selector has label',
    hasUnitSelectorLabel,
    hasUnitSelectorLabel ? 'Unit selector properly labeled' : 'Missing unit selector label'
  );
  
  logTest(
    'Step 3 - Type selector has label',
    hasTypeSelectorLabel,
    hasTypeSelectorLabel ? 'Type selector properly labeled' : 'Missing type selector label'
  );
}

// ============================================================================
// TEST 10: Color Contrast (Code Analysis)
// ============================================================================
console.log(`\n${colors.bright}Test 10: Color Contrast${colors.reset}`);

// Check theme tokens file for color definitions
const themeFile = 'src/theme/tokens.ts';
const themeContent = readFile(themeFile);

if (themeContent) {
  // Check if colors are defined from theme
  const usesThemeColors = wizardFiles.every(file => {
    const content = readFile(file);
    return content && hasPattern(content, 'colors\\.(gray|primary|error|success|info)');
  });
  
  logTest(
    'All steps - Use theme colors',
    usesThemeColors,
    usesThemeColors ? 'All components use theme colors for consistency' : 'Some components may use hardcoded colors'
  );
  
  // Check for proper text color contrast
  wizardFiles.forEach(file => {
    const content = readFile(file);
    if (!content) return;
    
    const fileName = path.basename(file, '.tsx');
    
    // Check that text uses appropriate gray shades
    const usesProperTextColors = hasPattern(content, 'colors\\.gray\\[(?:700|800|900)\\]');
    logTest(
      `${fileName} - Uses high contrast text colors`,
      usesProperTextColors,
      usesProperTextColors ? 'Text uses dark gray shades for contrast' : 'Text colors may have low contrast',
      !usesProperTextColors
    );
  });
}

// ============================================================================
// TEST 11: Large Text Support
// ============================================================================
console.log(`\n${colors.bright}Test 11: Large Text Support${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for responsive font sizes
  const usesTypographyTokens = hasPattern(content, 'typography\\.fontSize');
  const hasResponsiveFontSize = hasPattern(content, 'fontSize:\\s*responsiveLayout|isSmallScreen.*fontSize');
  
  logTest(
    `${fileName} - Uses typography tokens`,
    usesTypographyTokens,
    usesTypographyTokens ? 'Uses theme typography tokens' : 'May use hardcoded font sizes'
  );
  
  logTest(
    `${fileName} - Supports responsive text`,
    hasResponsiveFontSize || usesTypographyTokens,
    hasResponsiveFontSize ? 'Font sizes adapt to screen size' : 'Uses theme tokens for consistency',
    !hasResponsiveFontSize && usesTypographyTokens
  );
  
  // Check for flexible layouts (no fixed heights that would break with large text)
  const usesFlexLayout = hasPattern(content, 'flex:\\s*1|flexDirection|flexWrap');
  logTest(
    `${fileName} - Uses flexible layouts`,
    usesFlexLayout,
    usesFlexLayout ? 'Layout adapts to content size' : 'Layout may not accommodate large text',
    !usesFlexLayout
  );
});

// ============================================================================
// TEST 12: Keyboard Navigation Support
// ============================================================================
console.log(`\n${colors.bright}Test 12: Keyboard Navigation Support${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for proper tab order (accessible prop)
  const hasAccessibleProp = hasPattern(content, 'accessible=\\{true\\}');
  const hasAccessibleFalse = hasPattern(content, 'accessible=\\{false\\}');
  
  logTest(
    `${fileName} - Enables accessibility`,
    hasAccessibleProp,
    hasAccessibleProp ? 'Accessibility explicitly enabled' : 'Accessibility may be implicit'
  );
  
  if (hasAccessibleFalse) {
    logTest(
      `${fileName} - Disables accessibility appropriately`,
      true,
      'Some elements appropriately hidden from screen readers',
      true
    );
  }
  
  // Check for returnKeyType on inputs
  const hasReturnKeyType = hasPattern(content, 'returnKeyType=');
  if (hasPattern(content, '<(?:RNTextInput|TextInput|Input)')) {
    logTest(
      `${fileName} - Defines keyboard return key`,
      hasReturnKeyType,
      hasReturnKeyType ? 'Return key type defined for better navigation' : 'Consider adding returnKeyType',
      !hasReturnKeyType
    );
  }
});

// ============================================================================
// TEST 13: Focus Management
// ============================================================================
console.log(`\n${colors.bright}Test 13: Focus Management${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for ref usage (for focus management)
  const usesRef = hasPattern(content, 'useRef|ref=');
  const hasFocusCall = hasPattern(content, '\\.focus\\(\\)');
  const hasBlurCall = hasPattern(content, '\\.blur\\(\\)');
  
  if (usesRef) {
    logTest(
      `${fileName} - Manages focus`,
      hasFocusCall || hasBlurCall,
      hasFocusCall || hasBlurCall ? 'Focus management implemented' : 'Refs defined but focus not managed',
      !(hasFocusCall || hasBlurCall)
    );
  }
});

// ============================================================================
// TEST 14: Error Message Accessibility
// ============================================================================
console.log(`\n${colors.bright}Test 14: Error Message Accessibility${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check that error messages are accessible
  const errorTextPattern = /\{.*Error.*\}/g;
  const errorElements = extractMatches(content, '<Text[^>]*style=\\{[^}]*error[^}]*\\}[^>]*>');
  
  if (errorElements.length > 0) {
    const errorsWithRole = errorElements.filter(el => 
      /accessibilityRole="alert"/.test(el)
    ).length;
    
    const errorsWithLiveRegion = errorElements.filter(el => 
      /accessibilityLiveRegion="assertive"/.test(el)
    ).length;
    
    logTest(
      `${fileName} - Error messages have alert role`,
      errorsWithRole >= errorElements.length * 0.8,
      `${errorsWithRole}/${errorElements.length} error messages have alert role`
    );
    
    logTest(
      `${fileName} - Error messages use live regions`,
      errorsWithLiveRegion >= errorElements.length * 0.8,
      `${errorsWithLiveRegion}/${errorElements.length} error messages use live regions`
    );
  }
});

// ============================================================================
// TEST 15: Spanish Language Consistency
// ============================================================================
console.log(`\n${colors.bright}Test 15: Spanish Language Consistency${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for Spanish text in accessibility labels
  const spanishLabelCount = countPattern(content, 'accessibilityLabel="[^"]*(?:Paso|Selecciona|Toca|Configura|Ingresa)');
  const totalLabelCount = countPattern(content, 'accessibilityLabel=');
  
  const spanishRatio = totalLabelCount > 0 ? spanishLabelCount / totalLabelCount : 1;
  
  logTest(
    `${fileName} - Accessibility labels in Spanish`,
    spanishRatio >= 0.9,
    `${spanishLabelCount}/${totalLabelCount} labels are in Spanish (${Math.round(spanishRatio * 100)}%)`,
    spanishRatio >= 0.7 && spanishRatio < 0.9
  );
  
  // Check for English text that should be Spanish
  const hasEnglishText = hasPattern(content, 'accessibilityLabel="(?:Step|Select|Tap|Configure|Enter)');
  logTest(
    `${fileName} - No English in accessibility labels`,
    !hasEnglishText,
    hasEnglishText ? 'Found English text in accessibility labels' : 'All accessibility text is in Spanish'
  );
});

// ============================================================================
// TEST 16: Modal Accessibility (Step 2 Time Picker)
// ============================================================================
console.log(`\n${colors.bright}Test 16: Modal Accessibility${colors.reset}`);

if (step2Content) {
  // Check modal accessibility
  const hasModalAccessibility = hasPattern(step2Content, 'onRequestClose');
  const hasModalOverlay = hasPattern(step2Content, 'modalOverlay');
  
  logTest(
    'Step 2 - Modal has close handler',
    hasModalAccessibility,
    hasModalAccessibility ? 'Modal can be dismissed' : 'Missing modal close handler'
  );
  
  logTest(
    'Step 2 - Modal has overlay',
    hasModalOverlay,
    hasModalOverlay ? 'Modal has proper overlay' : 'Missing modal overlay'
  );
  
  // Check picker buttons have labels
  const hasPickerButtonLabels = hasPattern(step2Content, 'Cancelar|Confirmar');
  logTest(
    'Step 2 - Picker buttons have labels',
    hasPickerButtonLabels,
    hasPickerButtonLabels ? 'Picker buttons properly labeled' : 'Missing picker button labels'
  );
}

// ============================================================================
// TEST 17: Chip Component Accessibility
// ============================================================================
console.log(`\n${colors.bright}Test 17: Chip Component Accessibility${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check if Chip components have accessibility props
  const hasChipComponent = hasPattern(content, '<Chip');
  
  if (hasChipComponent) {
    const chipCount = countPattern(content, '<Chip');
    const chipsWithLabel = countPattern(content, '<Chip[^>]*accessibilityLabel=');
    const chipsWithHint = countPattern(content, '<Chip[^>]*accessibilityHint=');
    
    logTest(
      `${fileName} - Chips have accessibility labels`,
      chipsWithLabel >= chipCount * 0.8,
      `${chipsWithLabel}/${chipCount} chips have accessibility labels`,
      chipsWithLabel >= chipCount * 0.5 && chipsWithLabel < chipCount * 0.8
    );
    
    logTest(
      `${fileName} - Chips have accessibility hints`,
      chipsWithHint >= chipCount * 0.5,
      `${chipsWithHint}/${chipCount} chips have accessibility hints`,
      chipsWithHint >= chipCount * 0.3 && chipsWithHint < chipCount * 0.5
    );
  }
});

// ============================================================================
// TEST 18: Hidden Elements Properly Marked
// ============================================================================
console.log(`\n${colors.bright}Test 18: Hidden Elements Properly Marked${colors.reset}`);

wizardFiles.forEach(file => {
  const content = readFile(file);
  if (!content) return;

  const fileName = path.basename(file, '.tsx');
  
  // Check for hidden elements that should not be accessible
  const hasHiddenInput = hasPattern(content, 'hiddenEmojiInput');
  
  if (hasHiddenInput) {
    const hiddenProperlyMarked = hasPattern(content, 'accessible=\\{false\\}.*hiddenEmojiInput|hiddenEmojiInput.*accessible=\\{false\\}');
    logTest(
      `${fileName} - Hidden elements marked inaccessible`,
      hiddenProperlyMarked,
      hiddenProperlyMarked ? 'Hidden input properly excluded from accessibility tree' : 'Hidden input may be accessible'
    );
  }
  
  // Check for decorative elements
  const hasDecorativeEmoji = hasPattern(content, 'accessible=\\{false\\}[^}]*emoji');
  if (hasDecorativeEmoji) {
    logTest(
      `${fileName} - Decorative elements hidden from screen readers`,
      true,
      'Decorative emojis properly hidden',
      true
    );
  }
});

// ============================================================================
// Summary
// ============================================================================
console.log(`\n${colors.bright}${colors.cyan}=== Test Summary ===${colors.reset}\n`);

const total = results.passed + results.failed + results.warnings;
const passRate = total > 0 ? (results.passed / total * 100).toFixed(1) : 0;

console.log(`Total Tests: ${total}`);
console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
console.log(`${colors.yellow}Warnings: ${results.warnings}${colors.reset}`);
console.log(`Pass Rate: ${passRate}%\n`);

// Categorize results
const criticalFailures = results.tests.filter(t => !t.passed && !t.isWarning && (
  t.name.includes('accessibility label') ||
  t.name.includes('alert role') ||
  t.name.includes('minimum size') ||
  t.name.includes('Spanish')
));

const recommendations = results.tests.filter(t => t.isWarning);

if (criticalFailures.length > 0) {
  console.log(`${colors.bright}${colors.red}Critical Accessibility Issues:${colors.reset}`);
  criticalFailures.forEach(test => {
    console.log(`  • ${test.name}`);
    if (test.message) console.log(`    ${test.message}`);
  });
  console.log();
}

if (recommendations.length > 0) {
  console.log(`${colors.bright}${colors.yellow}Recommendations:${colors.reset}`);
  recommendations.forEach(test => {
    console.log(`  • ${test.name}`);
    if (test.message) console.log(`    ${test.message}`);
  });
  console.log();
}

// Overall assessment
if (results.failed === 0) {
  console.log(`${colors.bright}${colors.green}✓ All accessibility tests passed!${colors.reset}`);
  console.log(`The medication wizard components meet accessibility standards.\n`);
} else if (results.failed <= 3) {
  console.log(`${colors.bright}${colors.yellow}⚠ Minor accessibility issues found${colors.reset}`);
  console.log(`Address the issues above to improve accessibility.\n`);
} else {
  console.log(`${colors.bright}${colors.red}✗ Significant accessibility issues found${colors.reset}`);
  console.log(`Please address the critical issues before proceeding.\n`);
}

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
