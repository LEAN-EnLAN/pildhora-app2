import { Medication } from '../types';

/**
 * Migration utility to parse old dosage format and convert to new structure
 * Handles formats like "500mg, 10 tablets" or "10ml, 5ml"
 * This is exported for use in other parts of the application if needed
 */
export const migrateDosageFormat = (medication: any): Medication => {
  try {
    // If already using new format, validate and return as-is
    if (medication.doseValue && medication.doseUnit && medication.quantityType) {
      // Ensure the new fields are valid
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
          // Keep the old dosage field for backward compatibility
          dosage: medication.dosage || `${doseValue}${doseUnit}, ${quantityType}`
        };
      }
    }

    // If we have the old dosage field, parse it
    if (medication.dosage && typeof medication.dosage === 'string') {
      const dosageString = medication.dosage.trim();
      
      if (dosageString) {
        // Try to parse the old format: "dose, quantity"
        const dosageParts = dosageString.split(',').map((part: string) => part.trim());
        
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
          
          // Extract quantity type from second part
          let quantityType = dosageParts[1].toLowerCase();
          let isCustomQuantityType = false;
          
          // Normalize common quantity types
          const quantityTypeMap: { [key: string]: string } = {
            'tablet': 'tablets',
            'tab': 'tablets',
            'tabs': 'tablets',
            'capsule': 'capsules',
            'cap': 'capsules',
            'caps': 'capsules',
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
            'eyedrop': 'drops',
            'eye drops': 'drops',
            'spray': 'spray',
            'nasal spray': 'spray',
            'pills': 'tablets',
            'pill': 'tablets',
            'lozenge': 'tablets',
            'suppository': 'other',
            'patch': 'other',
            'injection': 'other',
            'other': 'other'
          };
          
          // Extract just the quantity type word (remove numbers and units)
          const quantityWord = quantityType.replace(/[\d.]+\s*[a-zA-Z%]*\s*/, '').trim();
          
          // Check if the quantity type is a unit (like 'ml') which should be marked as custom
          if (/^[a-zA-Z]+$/.test(quantityWord) && !quantityTypeMap[quantityWord]) {
            // It's a single word that's not in our map, likely a unit
            quantityType = quantityWord;
            isCustomQuantityType = true;
          } else {
            quantityType = quantityTypeMap[quantityWord] || quantityWord || 'other';
            
            // If not in our predefined list, mark as custom
            if (!['tablets', 'capsules', 'liquid', 'cream', 'inhaler', 'drops', 'spray', 'other'].includes(quantityType)) {
              isCustomQuantityType = true;
            }
          }
          
          // Return migrated medication with new fields
          return {
            ...medication,
            doseValue,
            doseUnit,
            quantityType,
            isCustomQuantityType,
            // Keep the old dosage field for backward compatibility
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
};

/**
 * Ensures medication data is in the correct format for saving
 * Converts new fields to legacy format if needed for backward compatibility
 */
export const normalizeMedicationForSave = (medication: any): any => {
  try {
    const normalized = { ...medication };
    
    // Ensure all new fields are properly formatted
    if (normalized.doseValue !== undefined) {
      normalized.doseValue = String(normalized.doseValue).trim();
    }
    if (normalized.doseUnit !== undefined) {
      normalized.doseUnit = String(normalized.doseUnit).trim();
    }
    if (normalized.quantityType !== undefined) {
      normalized.quantityType = String(normalized.quantityType).trim();
    }
    if (normalized.isCustomQuantityType !== undefined) {
      normalized.isCustomQuantityType = Boolean(normalized.isCustomQuantityType);
    }
    
    // If we have the new fields but no legacy dosage, create one
    if (!normalized.dosage && normalized.doseValue && normalized.doseUnit) {
      let dosageString = `${normalized.doseValue}${normalized.doseUnit}`;
      
      if (normalized.quantityType) {
        // Add quantity information
        const quantityDisplay = normalized.isCustomQuantityType
          ? normalized.quantityType
          : normalized.quantityType;
        dosageString += `, ${quantityDisplay}`;
      }
      
      normalized.dosage = dosageString;
    }
    
    // If we have a legacy dosage but no new fields, try to extract them
    if (normalized.dosage && (!normalized.doseValue || !normalized.doseUnit || !normalized.quantityType)) {
      const migrated = migrateDosageFormat(normalized);
      normalized.doseValue = migrated.doseValue;
      normalized.doseUnit = migrated.doseUnit;
      normalized.quantityType = migrated.quantityType;
      normalized.isCustomQuantityType = migrated.isCustomQuantityType;
    }
    
    return normalized;
  } catch (error) {
    console.error('Error in normalizeMedicationForSave:', error);
    // Return the original medication to prevent data loss
    return medication;
  }
};

/**
 * Batch migration utility for migrating all medications in an array
 * @param medications Array of medication objects to migrate
 * @returns Array of migrated medications with new structure
 */
export const migrateMedicationsBatch = (medications: any[]): Medication[] => {
  return medications.map(medication => migrateDosageFormat(medication));
};

/**
 * Validates that a medication has the new structure
 * @param medication Medication object to validate
 * @returns True if the medication has the new structure, false otherwise
 */
export const hasNewMedicationStructure = (medication: any): boolean => {
  return !!(medication.doseValue && medication.doseUnit && medication.quantityType);
};

/**
 * Creates a human-readable display string from the new medication structure
 * @param medication Medication object with new structure
 * @returns Formatted string like "500mg, 10 tablets"
 */
export const formatMedicationDisplay = (medication: Medication): string => {
  try {
    if (medication.doseValue && medication.doseUnit) {
      let display = `${medication.doseValue}${medication.doseUnit}`;
      
      if (medication.quantityType) {
        const quantityDisplay = medication.isCustomQuantityType
          ? medication.quantityType
          : medication.quantityType;
        display += `, ${quantityDisplay}`;
      }
      
      return display;
    }
    
    // Fallback to legacy dosage field
    return medication.dosage || '';
  } catch (error) {
    console.error('Error in formatMedicationDisplay:', error);
    return medication.dosage || '';
  }
};

/**
 * Validates that a medication has all required fields for the new structure
 * @param medication Medication object to validate
 * @returns Object with validation result and missing fields
 */
export const validateMedicationStructure = (medication: any): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  if (!medication.doseValue || String(medication.doseValue).trim() === '') {
    missingFields.push('doseValue');
  }
  
  if (!medication.doseUnit || String(medication.doseUnit).trim() === '') {
    missingFields.push('doseUnit');
  }
  
  if (!medication.quantityType || String(medication.quantityType).trim() === '') {
    missingFields.push('quantityType');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Safely extracts dose value from a medication object, handling various formats
 * @param medication Medication object
 * @returns Dose value as string
 */
export const extractDoseValue = (medication: any): string => {
  try {
    // Try new format first
    if (medication.doseValue) {
      return String(medication.doseValue).trim();
    }
    
    // Try to extract from legacy dosage
    if (medication.dosage) {
      const doseMatch = medication.dosage.match(/^([\d.]+)/);
      if (doseMatch) {
        return doseMatch[1];
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error extracting dose value:', error);
    return '';
  }
};

/**
 * Safely extracts dose unit from a medication object, handling various formats
 * @param medication Medication object
 * @returns Dose unit as string
 */
export const extractDoseUnit = (medication: any): string => {
  try {
    // Try new format first
    if (medication.doseUnit) {
      return String(medication.doseUnit).trim();
    }
    
    // Try to extract from legacy dosage
    if (medication.dosage) {
      const unitMatch = medication.dosage.match(/^[\d.]+\s*([a-zA-Z%]+)/);
      if (unitMatch) {
        return unitMatch[1];
      }
    }
    
    return 'units'; // Default unit
  } catch (error) {
    console.error('Error extracting dose unit:', error);
    return 'units';
  }
};

/**
 * Safely extracts quantity type from a medication object, handling various formats
 * @param medication Medication object
 * @returns Quantity type as string
 */
export const extractQuantityType = (medication: any): string => {
  try {
    // Try new format first
    if (medication.quantityType) {
      return String(medication.quantityType).trim();
    }
    
    // Try to extract from legacy dosage
    if (medication.dosage && medication.dosage.includes(',')) {
      const quantityPart = medication.dosage.split(',')[1];
      if (quantityPart) {
        // Remove numbers and extract just the type
        const typeMatch = quantityPart.match(/([a-zA-Z\s]+)/);
        if (typeMatch) {
          return typeMatch[1].trim();
        }
      }
    }
    
    return 'other'; // Default type
  } catch (error) {
    console.error('Error extracting quantity type:', error);
    return 'other';
  }
};