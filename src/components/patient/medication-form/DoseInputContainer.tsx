import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DOSE_UNITS } from '../../../types';

interface Props {
  doseValue: string;
  doseUnit: string;
  onDoseValueChange: (value: string) => void;
  onDoseUnitChange: (unit: string) => void;
  doseValueError?: string;
  doseUnitError?: string;
}

export default function DoseInputContainer({
  doseValue,
  doseUnit,
  onDoseValueChange,
  onDoseUnitChange,
  doseValueError,
  doseUnitError,
}: Props) {
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [customUnit, setCustomUnit] = useState('');

  const handleUnitChange = (unit: string) => {
    if (unit === 'custom') {
      setShowCustomUnit(true);
      setShowUnitPicker(false);
    } else {
      setShowCustomUnit(false);
      onDoseUnitChange(unit);
      setShowUnitPicker(false);
    }
  };

  const handleCustomUnitSubmit = () => {
    if (customUnit.trim()) {
      onDoseUnitChange(customUnit.trim());
      setShowCustomUnit(false);
    }
  };

  const handleDoseValueChange = (text: string) => {
    // Only allow numeric input with decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    onDoseValueChange(numericText);
  };

  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const getSelectedUnitLabel = () => {
    const unit = DOSE_UNITS.find(u => u.id === doseUnit);
    return unit ? unit.label : 'Seleccionar unidad';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dosis</Text>
      <View style={styles.doseContainer}>
        <View style={styles.doseValueContainer}>
          <TextInput
            style={[
              styles.doseInput,
              doseValueError ? styles.inputError : null
            ]}
            placeholder="500"
            value={doseValue}
            onChangeText={handleDoseValueChange}
            keyboardType="numeric"
            accessibilityLabel="Dose value"
            accessibilityHint="Enter the numeric dose value"
          />
          {doseValueError && <Text style={styles.errorText}>{doseValueError}</Text>}
        </View>
        
        <View style={styles.unitContainer}>
          <TouchableOpacity
            style={[
              styles.unitSelector,
              doseUnitError ? styles.inputError : null
            ]}
            onPress={() => setShowUnitPicker(true)}
            accessibilityLabel="Dose unit selector"
            accessibilityHint="Tap to select dose unit"
          >
            <Text style={[
              styles.unitSelectorText,
              { color: doseUnit ? '#1F2937' : '#9CA3AF' }
            ]}>
              {getSelectedUnitLabel()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
          {doseUnitError && <Text style={styles.errorText}>{doseUnitError}</Text>}
        </View>
      </View>
      
      {showCustomUnit && (
        <View style={styles.customUnitContainer}>
          <TextInput
            style={styles.customUnitInput}
            placeholder="Ingrese unidad personalizada"
            value={customUnit}
            onChangeText={setCustomUnit}
            onSubmitEditing={handleCustomUnitSubmit}
            accessibilityLabel="Custom dose unit"
            accessibilityHint="Enter a custom dose unit"
          />
        </View>
      )}

      {/* Unit Picker Modal */}
      <Modal
        visible={showUnitPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Unidad</Text>
            <ScrollView style={styles.modalScrollView}>
              {DOSE_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={[
                    styles.modalOption,
                    doseUnit === unit.id ? styles.selectedOption : null
                  ]}
                  onPress={() => handleUnitChange(unit.id)}
                >
                  <Text style={styles.modalOptionText}>{unit.label}</Text>
                  {doseUnit === unit.id && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowUnitPicker(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  doseContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  doseValueContainer: {
    flex: 1,
  },
  unitContainer: {
    flex: 1.5,
  },
  doseInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    height: 48,
  },
  unitSelector: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  unitSelectorText: {
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  customUnitContainer: {
    marginTop: 8,
  },
  customUnitInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedOption: {
    backgroundColor: '#EBF5FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  modalCancelButton: {
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});