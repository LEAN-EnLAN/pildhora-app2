import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  times: string[];
  onTimesChange: (times: string[]) => void;
  error?: string;
}

export default function ReminderTimePicker({ times, onTimesChange, error }: Props) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddTime = () => {
    setEditingIndex(null);
    setTempDate(new Date());
    setShowTimePicker(true);
  };

  const handleEditTime = (index: number) => {
    setEditingIndex(index);
    // Parse the time string to set the date
    const [hours, minutes] = times[index].split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    setTempDate(date);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    
    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      if (editingIndex !== null) {
        // Edit existing time
        const newTimes = [...times];
        newTimes[editingIndex] = timeString;
        onTimesChange(newTimes);
      } else {
        // Add new time
        onTimesChange([...times, timeString]);
      }
    }
  };

  const handleRemoveTime = (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    onTimesChange(newTimes);
  };

  const displayTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Horas de Recordatorio</Text>
      
      {/* Times Display */}
      <View style={styles.timesContainer}>
        {times.length === 0 ? (
          <TouchableOpacity
            style={styles.addTimeButton}
            onPress={handleAddTime}
          >
            <Text style={styles.addTimeButtonText}>Añadir hora</Text>
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
        ) : (
          <View style={styles.timesList}>
            {times.map((time, index) => (
              <View key={index} style={styles.timeBadge}>
                <Text style={styles.timeText}>{displayTime(time)}</Text>
                <View style={styles.timeActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditTime(index)}
                    accessibilityLabel={`Edit ${time}`}
                  >
                    <Ionicons name="create-outline" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveTime(index)}
                    accessibilityLabel={`Remove ${time}`}
                  >
                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={handleAddTime}
            >
              <Ionicons name="add" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
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
  timesContainer: {
    minHeight: 48,
  },
  addTimeButton: {
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
  addTimeButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  timesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  timeActions: {
    flexDirection: 'row',
    gap: 4,
  },
  editButton: {
    padding: 2,
  },
  deleteButton: {
    padding: 2,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});