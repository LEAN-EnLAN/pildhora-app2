// Improved fix script for the quantity type migration bug
// This script provides the corrected migration logic with better parsing

// Corrected migration function with fixed quantity type extraction
function migrateDosageFormatFixed(medication) {
  try {
    // If already using new format, validate and return as-is
    if (medication.doseValue && medication.doseUnit && medication.quantityType) {
      const doseValue = String(medication.doseValue || '').trim();
      const doseUnit = String(medication.doseUnit || '').trim();
      const quantityType = String(medication.quantityType || '').trim();
      
      if (doseValue && doseUnit && quantityType) {
        return {
          ...medication,
          doseValue,
          doseUnit,
          quantityType,
          isCustomQuantityType: Boolean(medication.isCustomQuantityType),
          dosage: medication.dosage || `${doseValue}${doseUnit}, ${quantityType}`
        };
      }
    }

    // If we have the old dosage field, parse it
    if (medication.dosage && typeof medication.dosage === 'string') {
      const dosageString = medication.dosage.trim();
      
      if (dosageString) {
        // Try to parse the old format: "dose, quantity"
        const dosageParts = dosageString.split(',').map(part => part.trim());
        
        if (dosageParts.length >= 2) {
          // Extract dose value and unit from first part
          const doseMatch = dosageParts[0].match(/^([\d.]+)\s*([a-zA-Z%]+)?$/);
          let doseValue = '';
          let doseUnit = '';
          
          if (doseMatch) {
            doseValue = doseMatch[1];
            doseUnit = doseMatch[2] || 'units';
          } else {
            // If we can't parse the dose, try to extract numbers
            const numberMatch = dosageParts[0].match(/([\d.]+)/);
            doseValue = numberMatch ? numberMatch[1] : dosageParts[0];
            doseUnit = 'units'; // Default unit
          }
          
          // FIXED: Improved quantity type extraction from second part
          const quantityPart = dosageParts[1];
          let quantityType = '';
          let isCustomQuantityType = false;
          
          // Normalize common quantity types
          const quantityTypeMap = {
            'tablet': 'tablets',
            'tab': 'tablets',
            'tabs': 'tablets',
            'tablets': 'tablets',
            'capsule': 'capsules',
            'cap': 'capsules',
            'caps': 'capsules',
            'capsules': 'capsules',
            'liquid': 'liquid',
            'syrup': 'liquid',
            'solution': 'liquid',
            'cream': 'cream',
            'ointment': 'cream',
            'gel': 'cream',
            'inhaler': 'inhaler',
            'puffer': 'inhaler',
            'nebulizer': 'inhaler',
            'drop': 'drops',
            'drops': 'drops',
            'eyedrop': 'drops',
            'eye drops': 'drops',
            'spray': 'spray',
            'sprays': 'spray',
            'nasal spray': 'spray',
            'pills': 'tablets',
            'pill': 'tablets',
            'lozenge': 'tablets',
            'suppository': 'other',
            'patch': 'other',
            'injection': 'other',
            'other': 'other'
          };
          
          // IMPROVED: Better quantity type extraction logic
          
          // First, try to match patterns like "10 tablets" or "5ml"
          const quantityWithNumber = quantityPart.match(/^(\d+)\s*([a-zA-Z]+)$/);
          if (quantityWithNumber) {
            // Pattern like "10 tablets" - extract just the word
            quantityType = quantityWithNumber[2].toLowerCase();
          } else {
            // Pattern like "tablets" or "ml" - use the whole thing
            const justWord = quantityPart.match(/^([a-zA-Z]+)$/);
            if (justWord) {
              quantityType = justWord[1].toLowerCase();
            } else {
              // More complex pattern - try to extract the last word
              const words = quantityPart.split(/\s+/);
              quantityType = words[words.length - 1].toLowerCase();
            }
          }
          
          // Now normalize the extracted quantity type
          if (quantityTypeMap[quantityType]) {
            quantityType = quantityTypeMap[quantityType];
            isCustomQuantityType = false;
          } else if (quantityType) {
            // Check if it's a unit (like 'ml', 'g', etc.)
            const commonUnits = ['mg', 'g', 'mcg', 'ml', 'l', 'units', 'drops', 'sprays', 'puffs'];
            if (commonUnits.includes(quantityType)) {
              // It's a unit, mark as custom
              isCustomQuantityType = true;
            } else {
              // It's a custom quantity type
              isCustomQuantityType = true;
            }
          } else {
            // Fallback
            quantityType = 'other';
            isCustomQuantityType = false;
          }
          
          // Return migrated medication with new fields
          return {
            ...medication,
            doseValue,
            doseUnit,
            quantityType,
            isCustomQuantityType,
            dosage: dosageString
          };
        } else if (dosageParts.length === 1) {
          // Handle case where there's only dose information
          const doseMatch = dosageParts[0].match(/^([\d.]+)\s*([a-zA-Z%]+)?$/);
          let doseValue = '';
          let doseUnit = '';
          
          if (doseMatch) {
            doseValue = doseMatch[1];
            doseUnit = doseMatch[2] || 'units';
          } else {
            // Try to extract any numbers
            const numberMatch = dosageParts[0].match(/([\d.]+)/);
            doseValue = numberMatch ? numberMatch[1] : dosageParts[0];
            doseUnit = 'units';
          }
          
          return {
            ...medication,
            doseValue,
            doseUnit,
            quantityType: 'other', // Default when quantity info is missing
            isCustomQuantityType: false,
            dosage: dosageString
          };
        }
      }
    }
    
    // If no dosage field or empty string, check if we have individual fields
    const doseValue = medication.doseValue || '';
    const doseUnit = medication.doseUnit || 'units';
    const quantityType = medication.quantityType || 'other';
    
    return {
      ...medication,
      doseValue: String(doseValue).trim(),
      doseUnit: String(doseUnit).trim(),
      quantityType: String(quantityType).trim(),
      isCustomQuantityType: Boolean(medication.isCustomQuantityType),
      dosage: medication.dosage || ''
    };
  } catch (error) {
    console.error('Critical error in migrateDosageFormat for medication:', medication.id, error);
    
    // Return a safe default structure to prevent crashes
    return {
      ...medication,
      doseValue: medication.doseValue || '',
      doseUnit: medication.doseUnit || 'units',
      quantityType: medication.quantityType || 'other',
      isCustomQuantityType: Boolean(medication.isCustomQuantityType),
      dosage: medication.dosage || ''
    };
  }
}

// Test the fixed migration function
function testFixedMigration() {
  console.log('=== TESTING IMPROVED MIGRATION LOGIC ===\n');
  
  const testCases = [
    {
      name: 'Old Aspirin',
      dosage: '500mg, 10 tablets',
      expectedQuantityType: 'tablets',
      expectedCustom: false
    },
    {
      name: 'Old Liquid Med',
      dosage: '10ml, 5ml',
      expectedQuantityType: 'ml',
      expectedCustom: true
    },
    {
      name: 'Simple Pill',
      dosage: '1 tablet',
      expectedQuantityType: 'tablet',
      expectedCustom: false
    },
    {
      name: 'Capsules',
      dosage: '2 capsules',
      expectedQuantityType: 'capsules',
      expectedCustom: false
    },
    {
      name: 'Custom Drops',
      dosage: '0.5ml, 2 custom drops',
      expectedQuantityType: 'drops',
      expectedCustom: true
    },
    {
      name: 'Complex Format',
      dosage: '0.25mg, 2.5ml',
      expectedQuantityType: 'ml',
      expectedCustom: true
    }
  ];
  
  let passCount = 0;
  let totalCount = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const migrated = migrateDosageFormatFixed({
      id: `test-${index}`,
      name: testCase.name,
      dosage: testCase.dosage
    });
    
    const quantityMatch = migrated.quantityType === testCase.expectedQuantityType;
    const customMatch = migrated.isCustomQuantityType === testCase.expectedCustom;
    const passed = quantityMatch && customMatch;
    
    if (passed) {
      passCount++;
    }
    
    console.log(`\nTest ${index + 1}: ${testCase.name}`);
    console.log(`  Original: "${testCase.dosage}"`);
    console.log(`  Expected: quantityType="${testCase.expectedQuantityType}", custom=${testCase.expectedCustom}`);
    console.log(`  Actual: quantityType="${migrated.quantityType}", custom=${migrated.isCustomQuantityType}`);
    console.log(`  Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!quantityMatch) {
      console.log(`    ❌ Quantity type mismatch: expected "${testCase.expectedQuantityType}", got "${migrated.quantityType}"`);
    }
    if (!customMatch) {
      console.log(`    ❌ Custom flag mismatch: expected ${testCase.expectedCustom}, got ${migrated.isCustomQuantityType}`);
    }
  });
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passCount}/${totalCount}`);
  console.log(`Success Rate: ${((passCount / totalCount) * 100).toFixed(1)}%`);
  
  if (passCount === totalCount) {
    console.log('🎉 All tests passed! The migration logic is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Further refinement needed.');
  }
}

// Run the test
if (require.main === module) {
  testFixedMigration();
}

module.exports = {
  migrateDosageFormatFixed,
  testFixedMigration
};