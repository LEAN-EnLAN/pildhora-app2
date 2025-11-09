import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QUANTITY_TYPES } from '../../../types';

interface Props {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  error?: string;
}

export default function QuantityTypeSelector({ selectedTypes, onTypesChange, error }: Props) {
  const [showSelector, setShowSelector] = useState(false);
  const [customType, setCustomType] = useState('');

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      // Remove type if already selected
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      // Add new type
      onTypesChange([...selectedTypes, type]);
    }
  };

  const handleAddCustomType = () => {
    if (customType.trim() && !selectedTypes.includes(customType.trim())) {
      onTypesChange([...selectedTypes, customType.trim()]);
      setCustomType('');
    }
  };

  const handleRemoveType = (typeToRemove: string) => {
    onTypesChange(selectedTypes.filter(t => t !== typeToRemove));
  };

  const getTypeIcon = (type: string) => {
    const foundType = QUANTITY_TYPES.find(t => t.label === type);
    return foundType ? foundType.icon : 'help-circle-outline';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de Medicamento</Text>
      
      {/* Selected Types Display */}
      <View style={styles.selectedTypesContainer}>
        {selectedTypes.length === 0 ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowSelector(true)}
          >
            <Text style={styles.addButtonText}>Añadir tipo</Text>
            <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
        ) : (
          <View style={styles.typesList}>
            {selectedTypes.map((type, index) => (
              <View key={index} style={styles.typeBadge}>
                <Ionicons 
                  name={getTypeIcon(type) as any} 
                  size={16} 
                  color="#374151" 
                  style={styles.typeIcon}
                />
                <Text style={styles.typeText}>{type}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveType(type)}
                  accessibilityLabel={`Remove ${type}`}
                  accessibilityRole="button"
                >
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => setShowSelector(true)}
            >
              <Ionicons name="add" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Type Selector Modal */}
      <Modal
        visible={showSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Tipo</Text>
            
            <ScrollView style={styles.modalScrollView}>
              {QUANTITY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedTypes.includes(type.label) ? styles.selectedOption : null
                  ]}
                  onPress={() => handleTypeToggle(type.label)}
                >
                  <View style={styles.modalOptionContent}>
                    <Ionicons name={type.icon as any} size={20} color="#374151" />
                    <Text style={styles.modalOptionText}>{type.label}</Text>
                  </View>
                  {selectedTypes.includes(type.label) && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Custom Type Input */}
            <View style={styles.customTypeContainer}>
              <Text style={styles.customTypeLabel}>Tipo personalizado:</Text>
              <View style={styles.customTypeInputContainer}>
                <TextInput
                  style={styles.customTypeInput}
                  placeholder="Ingrese tipo personalizado"
                  value={customType}
                  onChangeText={setCustomType}
                  onSubmitEditing={handleAddCustomType}
                />
                <TouchableOpacity
                  style={styles.addCustomButton}
                  onPress={handleAddCustomType}
                  disabled={!customType.trim()}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowSelector(false)}
            >
              <Text style={styles.modalCancelButtonText}>Listo</Text>
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
  selectedTypesContainer: {
    minHeight: 48,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  typesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  typeIcon: {
    marginLeft: 2,
  },
  typeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: 4,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
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
    maxHeight: 250,
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
  modalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  customTypeContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  customTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  customTypeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customTypeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  addCustomButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});