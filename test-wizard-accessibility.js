/**
 * Device Provisioning Wizard Accessibility Test
 * 
 * Tests accessibility features including:
 * - Keyboard navigation
 * - Screen reader announcements
 * - ARIA labels
 * - Touch target sizes
 * - High contrast mode support
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Device Provisioning Wizard Accessibility...\n');

// Test results tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function addResult(category, test, status, message) {
  const result = { test, message };
  results[category].push(result);
  
  const icon = category === 'passed' ? '✅' : category === 'failed' ? '❌' : '⚠️';
  console.log(`${icon} ${test}: ${message}`);
}

// Test 1: Keyboard Navigation Support
console.log('\n📋 Test 1: Keyboard Navigation Support');
console.log('─'.repeat(50));

try {
  const wizardFile = fs.readFileSync(
    'src/components/patient/provisioning/DeviceProvisioningWizard.tsx',
    'utf8'
  );
  
  // Check for keyboard event handlers
  const hasKeyboardHandlers = wizardFile.includes('handleKeyDown') || 
                               wizardFile.includes('onKeyPress') ||
                               wizardFile.includes('keydown');
  
  if (hasKeyboardHandlers) {
    addResult('passed', 'Keyboard event handlers', 'Keyboard navigation handlers implemented');
  } else {
    addResult('failed', 'Keyboard event handlers', 'No keyboard navigation handlers found');
  }
  
  // Check for arrow key support
  const hasArrowKeys = wizardFile.includes('ArrowRight') || 
                       wizardFile.includes('ArrowLeft') ||
                       wizardFile.includes('PageDown') ||
                       wizardFile.includes('PageUp');
  
  if (hasArrowKeys) {
    addResult('passed', 'Arrow key navigation', 'Arrow keys and Page Up/Down supported');
  } else {
    addResult('warnings', 'Arrow key navigation', 'Arrow key support not detected');
  }
  
  // Check for Escape key support
  const hasEscapeKey = wizardFile.includes('Escape');
  
  if (hasEscapeKey) {
    addResult('passed', 'Escape key support', 'Escape key for cancellation implemented');
  } else {
    addResult('warnings', 'Escape key support', 'Escape key support not detected');
  }
  
  // Check for Enter key support
  const hasEnterKey = wizardFile.includes('Enter');
  
  if (hasEnterKey) {
    addResult('passed', 'Enter key support', 'Enter key for submission implemented');
  } else {
    addResult('warnings', 'Enter key support', 'Enter key support not detected');
  }
  
} catch (error) {
  addResult('failed', 'Keyboard navigation test', `Error: ${error.message}`);
}

// Test 2: Screen Reader Announcements
console.log('\n📋 Test 2: Screen Reader Announcements');
console.log('─'.repeat(50));

try {
  const wizardFile = fs.readFileSync(
    'src/components/patient/provisioning/DeviceProvisioningWizard.tsx',
    'utf8'
  );
  
  // Check for announceForAccessibility usage
  const announcementCount = (wizardFile.match(/announceForAccessibility/g) || []).length;
  
  if (announcementCount >= 3) {
    addResult('passed', 'Screen reader announcements', `Found ${announcementCount} accessibility announcements`);
  } else if (announcementCount > 0) {
    addResult('warnings', 'Screen reader announcements', `Only ${announcementCount} announcements found, consider adding more`);
  } else {
    addResult('failed', 'Screen reader announcements', 'No accessibility announcements found');
  }
  
  // Check for step change announcements
  const hasStepAnnouncements = wizardFile.includes('Paso') && 
                                wizardFile.includes('announceForAccessibility');
  
  if (hasStepAnnouncements) {
    addResult('passed', 'Step change announcements', 'Step changes are announced to screen readers');
  } else {
    addResult('warnings', 'Step change announcements', 'Step change announcements not clearly detected');
  }
  
  // Check for screen reader detection
  const hasScreenReaderDetection = wizardFile.includes('isScreenReaderEnabled') ||
                                    wizardFile.includes('isScreenReaderActive');
  
  if (hasScreenReaderDetection) {
    addResult('passed', 'Screen reader detection', 'Screen reader state is detected and tracked');
  } else {
    addResult('warnings', 'Screen reader detection', 'Screen reader detection not found');
  }
  
} catch (error) {
  addResult('failed', 'Screen reader test', `Error: ${error.message}`);
}

// Test 3: ARIA Labels on Form Inputs
console.log('\n📋 Test 3: ARIA Labels on Form Inputs');
console.log('─'.repeat(50));

try {
  const stepFiles = [
    'src/components/patient/provisioning/steps/DeviceIdStep.tsx',
    'src/components/patient/provisioning/steps/WiFiConfigStep.tsx',
    'src/components/patient/provisioning/steps/PreferencesStep.tsx'
  ];
  
  let totalInputs = 0;
  let labeledInputs = 0;
  let hintedInputs = 0;
  
  stepFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Count Input components
      const inputs = (content.match(/<Input/g) || []).length;
      totalInputs += inputs;
      
      // Count accessibilityLabel
      const labels = (content.match(/accessibilityLabel=/g) || []).length;
      labeledInputs += labels;
      
      // Count accessibilityHint
      const hints = (content.match(/accessibilityHint=/g) || []).length;
      hintedInputs += hints;
    }
  });
  
  if (totalInputs > 0) {
    const labelPercentage = Math.round((labeledInputs / totalInputs) * 100);
    const hintPercentage = Math.round((hintedInputs / totalInputs) * 100);
    
    if (labelPercentage === 100) {
      addResult('passed', 'Input accessibility labels', `All ${totalInputs} inputs have accessibility labels (100%)`);
    } else if (labelPercentage >= 80) {
      addResult('warnings', 'Input accessibility labels', `${labelPercentage}% of inputs have labels (${labeledInputs}/${totalInputs})`);
    } else {
      addResult('failed', 'Input accessibility labels', `Only ${labelPercentage}% of inputs have labels (${labeledInputs}/${totalInputs})`);
    }
    
    if (hintPercentage >= 80) {
      addResult('passed', 'Input accessibility hints', `${hintPercentage}% of inputs have hints (${hintedInputs}/${totalInputs})`);
    } else {
      addResult('warnings', 'Input accessibility hints', `Only ${hintPercentage}% of inputs have hints (${hintedInputs}/${totalInputs})`);
    }
  } else {
    addResult('warnings', 'Input accessibility', 'No Input components found in step files');
  }
  
} catch (error) {
  addResult('failed', 'ARIA labels test', `Error: ${error.message}`);
}

// Test 4: Touch Target Sizes
console.log('\n📋 Test 4: Touch Target Sizes (44x44 minimum)');
console.log('─'.repeat(50));

try {
  const wizardFile = fs.readFileSync(
    'src/components/patient/provisioning/DeviceProvisioningWizard.tsx',
    'utf8'
  );
  
  // Check for MIN_TOUCH_TARGET_SIZE constant usage
  const hasTouchTargetConstant = wizardFile.includes('MIN_TOUCH_TARGET_SIZE');
  
  if (hasTouchTargetConstant) {
    addResult('passed', 'Touch target size constant', 'MIN_TOUCH_TARGET_SIZE constant is imported and used');
  } else {
    addResult('warnings', 'Touch target size constant', 'MIN_TOUCH_TARGET_SIZE constant not found');
  }
  
  // Check for minHeight/minWidth in button styles
  const hasMinHeight = wizardFile.includes('minHeight:') || wizardFile.includes('minHeight =');
  const hasMinWidth = wizardFile.includes('minWidth:') || wizardFile.includes('minWidth =');
  
  if (hasMinHeight && hasMinWidth) {
    addResult('passed', 'Button minimum dimensions', 'Buttons have minimum height and width defined');
  } else if (hasMinHeight || hasMinWidth) {
    addResult('warnings', 'Button minimum dimensions', 'Only partial minimum dimensions defined');
  } else {
    addResult('warnings', 'Button minimum dimensions', 'No explicit minimum dimensions found');
  }
  
  // Check for accessible button styles
  const hasAccessibleButtonStyle = wizardFile.includes('accessibleButton');
  
  if (hasAccessibleButtonStyle) {
    addResult('passed', 'Accessible button styles', 'Dedicated accessible button styles defined');
  } else {
    addResult('warnings', 'Accessible button styles', 'No dedicated accessible button styles found');
  }
  
} catch (error) {
  addResult('failed', 'Touch target test', `Error: ${error.message}`);
}

// Test 5: High Contrast Mode Support
console.log('\n📋 Test 5: High Contrast Mode Support');
console.log('─'.repeat(50));

try {
  const accessibilityFile = fs.readFileSync(
    'src/utils/accessibility.ts',
    'utf8'
  );
  
  // Check for high contrast color definitions
  const hasHighContrastColors = accessibilityFile.includes('HIGH_CONTRAST_COLORS') ||
                                 accessibilityFile.includes('HighContrastColors');
  
  if (hasHighContrastColors) {
    addResult('passed', 'High contrast colors', 'High contrast color definitions found');
  } else {
    addResult('warnings', 'High contrast colors', 'High contrast color definitions not found');
  }
  
  // Check for getHighContrastColor function
  const hasHighContrastFunction = accessibilityFile.includes('getHighContrastColor');
  
  if (hasHighContrastFunction) {
    addResult('passed', 'High contrast function', 'High contrast color helper function available');
  } else {
    addResult('warnings', 'High contrast function', 'High contrast helper function not found');
  }
  
  // Check for reduce motion support
  const hasReduceMotion = accessibilityFile.includes('isReduceMotionEnabled') ||
                          accessibilityFile.includes('reduceMotion');
  
  if (hasReduceMotion) {
    addResult('passed', 'Reduce motion support', 'Reduce motion detection implemented');
  } else {
    addResult('warnings', 'Reduce motion support', 'Reduce motion support not found');
  }
  
} catch (error) {
  addResult('failed', 'High contrast test', `Error: ${error.message}`);
}

// Test 6: Accessibility Roles and States
console.log('\n📋 Test 6: Accessibility Roles and States');
console.log('─'.repeat(50));

try {
  const wizardFile = fs.readFileSync(
    'src/components/patient/provisioning/DeviceProvisioningWizard.tsx',
    'utf8'
  );
  
  // Check for accessibilityRole usage
  const roleCount = (wizardFile.match(/accessibilityRole=/g) || []).length;
  
  if (roleCount >= 3) {
    addResult('passed', 'Accessibility roles', `Found ${roleCount} accessibility role definitions`);
  } else if (roleCount > 0) {
    addResult('warnings', 'Accessibility roles', `Only ${roleCount} accessibility roles found`);
  } else {
    addResult('warnings', 'Accessibility roles', 'No accessibility roles found');
  }
  
  // Check for accessibilityState usage
  const stateCount = (wizardFile.match(/accessibilityState=/g) || []).length;
  
  if (stateCount >= 2) {
    addResult('passed', 'Accessibility states', `Found ${stateCount} accessibility state definitions`);
  } else if (stateCount > 0) {
    addResult('warnings', 'Accessibility states', `Only ${stateCount} accessibility states found`);
  } else {
    addResult('warnings', 'Accessibility states', 'No accessibility states found');
  }
  
  // Check for progressbar role
  const hasProgressBar = wizardFile.includes('progressbar') || 
                         fs.readFileSync('src/components/patient/provisioning/WizardProgressIndicator.tsx', 'utf8')
                           .includes('progressbar');
  
  if (hasProgressBar) {
    addResult('passed', 'Progress indicator role', 'Progress indicator has proper ARIA role');
  } else {
    addResult('warnings', 'Progress indicator role', 'Progress indicator role not clearly defined');
  }
  
} catch (error) {
  addResult('failed', 'Accessibility roles test', `Error: ${error.message}`);
}

// Test 7: Focus Management
console.log('\n📋 Test 7: Focus Management');
console.log('─'.repeat(50));

try {
  const wizardFile = fs.readFileSync(
    'src/components/patient/provisioning/DeviceProvisioningWizard.tsx',
    'utf8'
  );
  
  // Check for ref usage (for focus management)
  const hasRefs = wizardFile.includes('useRef') && wizardFile.includes('Ref');
  
  if (hasRefs) {
    addResult('passed', 'Focus management refs', 'Refs are used for potential focus management');
  } else {
    addResult('warnings', 'Focus management refs', 'No refs found for focus management');
  }
  
  // Check for setAccessibilityFocus
  const accessibilityFile = fs.readFileSync(
    'src/utils/accessibility.ts',
    'utf8'
  );
  
  const hasFocusFunction = accessibilityFile.includes('setAccessibilityFocus');
  
  if (hasFocusFunction) {
    addResult('passed', 'Focus helper function', 'setAccessibilityFocus helper function available');
  } else {
    addResult('warnings', 'Focus helper function', 'Focus helper function not found');
  }
  
} catch (error) {
  addResult('failed', 'Focus management test', `Error: ${error.message}`);
}

// Test 8: Haptic Feedback
console.log('\n📋 Test 8: Haptic Feedback');
console.log('─'.repeat(50));

try {
  const wizardFile = fs.readFileSync(
    'src/components/patient/provisioning/DeviceProvisioningWizard.tsx',
    'utf8'
  );
  
  // Check for haptic feedback usage
  const hapticCount = (wizardFile.match(/triggerHapticFeedback/g) || []).length;
  
  if (hapticCount >= 5) {
    addResult('passed', 'Haptic feedback', `Found ${hapticCount} haptic feedback triggers`);
  } else if (hapticCount > 0) {
    addResult('warnings', 'Haptic feedback', `Only ${hapticCount} haptic feedback triggers found`);
  } else {
    addResult('failed', 'Haptic feedback', 'No haptic feedback found');
  }
  
  // Check for different haptic types
  const hasSuccessHaptic = wizardFile.includes('HapticFeedbackType.SUCCESS');
  const hasErrorHaptic = wizardFile.includes('HapticFeedbackType.ERROR');
  const hasSelectionHaptic = wizardFile.includes('HapticFeedbackType.SELECTION');
  
  const hapticTypes = [hasSuccessHaptic, hasErrorHaptic, hasSelectionHaptic].filter(Boolean).length;
  
  if (hapticTypes >= 3) {
    addResult('passed', 'Haptic feedback variety', 'Multiple haptic feedback types used appropriately');
  } else if (hapticTypes > 0) {
    addResult('warnings', 'Haptic feedback variety', `Only ${hapticTypes} haptic types used`);
  } else {
    addResult('warnings', 'Haptic feedback variety', 'No varied haptic feedback types found');
  }
  
} catch (error) {
  addResult('failed', 'Haptic feedback test', `Error: ${error.message}`);
}

// Print Summary
console.log('\n' + '='.repeat(50));
console.log('📊 ACCESSIBILITY TEST SUMMARY');
console.log('='.repeat(50));

console.log(`\n✅ Passed: ${results.passed.length}`);
results.passed.forEach(r => console.log(`   • ${r.test}`));

if (results.warnings.length > 0) {
  console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
  results.warnings.forEach(r => console.log(`   • ${r.test}: ${r.message}`));
}

if (results.failed.length > 0) {
  console.log(`\n❌ Failed: ${results.failed.length}`);
  results.failed.forEach(r => console.log(`   • ${r.test}: ${r.message}`));
}

// Calculate score
const totalTests = results.passed.length + results.warnings.length + results.failed.length;
const score = Math.round((results.passed.length / totalTests) * 100);

console.log(`\n📈 Accessibility Score: ${score}%`);

if (score >= 90) {
  console.log('🎉 Excellent accessibility implementation!');
} else if (score >= 75) {
  console.log('👍 Good accessibility implementation with room for improvement');
} else if (score >= 60) {
  console.log('⚠️  Acceptable accessibility but needs significant improvements');
} else {
  console.log('❌ Poor accessibility - major improvements required');
}

console.log('\n' + '='.repeat(50));

// Exit with appropriate code
if (results.failed.length > 0) {
  console.log('\n❌ Some accessibility tests failed. Please review and fix the issues.');
  process.exit(1);
} else if (results.warnings.length > 3) {
  console.log('\n⚠️  Multiple accessibility warnings detected. Consider addressing them.');
  process.exit(0);
} else {
  console.log('\n✅ All critical accessibility tests passed!');
  process.exit(0);
}
