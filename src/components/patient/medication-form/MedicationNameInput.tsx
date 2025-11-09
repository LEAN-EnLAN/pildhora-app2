import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export default function MedicationNameInput({ value, onChangeText, error }: Props) {
  // Auto-capitalize first letter of medication name
  const handleNameChange = (text: string) => {
    if (text.length === 1) {
      onChangeText(text.toUpperCase());
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre del Medicamento</Text>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null
        ]}
        placeholder="Nombre"
        value={value}
        onChangeText={handleNameChange}
        autoCapitalize="words"
        accessibilityLabel="Medication name"
        accessibilityHint="Enter the name of the medication"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
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
});