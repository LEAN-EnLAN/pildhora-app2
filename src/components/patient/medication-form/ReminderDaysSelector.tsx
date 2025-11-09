import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
  error?: string;
}

const DAYS = [
  { id: 'Mon', label: 'Lun' },
  { id: 'Tue', label: 'Mar' },
  { id: 'Wed', label: 'Mié' },
  { id: 'Thu', label: 'Jue' },
  { id: 'Fri', label: 'Vie' },
  { id: 'Sat', label: 'Sáb' },
  { id: 'Sun', label: 'Dom' },
];

const QUICK_SELECT_OPTIONS = [
  { id: 'weekdays', label: 'Días de semana', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: 'weekends', label: 'Fines de semana', days: ['Sat', 'Sun'] },
  { id: 'all', label: 'Todos', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
];

export default function ReminderDaysSelector({ selectedDays, onDaysChange, error }: Props) {
  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      // Remove day if already selected
      onDaysChange(selectedDays.filter(d => d !== dayId));
    } else {
      // Add new day
      onDaysChange([...selectedDays, dayId]);
    }
  };

  const handleQuickSelect = (days: string[]) => {
    onDaysChange(days);
  };

  const isAllSelected = (days: string[]) => {
    return days.every(day => selectedDays.includes(day));
  };

  const isPartiallySelected = (days: string[]) => {
    return days.some(day => selectedDays.includes(day)) && !isAllSelected(days);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Días de Recordatorio</Text>
      
      {/* Day Selection */}
      <View style={styles.daysContainer}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.dayButton,
              selectedDays.includes(day.id) ? styles.selectedDay : styles.unselectedDay
            ]}
            onPress={() => toggleDay(day.id)}
            accessibilityLabel={`Select ${day.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedDays.includes(day.id) }}
          >
            <Text style={[
              styles.dayText,
              selectedDays.includes(day.id) ? styles.selectedDayText : styles.unselectedDayText
            ]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Select Options */}
      <View style={styles.quickSelectContainer}>
        <Text style={styles.quickSelectLabel}>Selección rápida:</Text>
        <View style={styles.quickSelectButtons}>
          {QUICK_SELECT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.quickSelectButton,
                isAllSelected(option.days) && styles.quickSelectAllSelected,
                isPartiallySelected(option.days) && styles.quickSelectPartialSelected
              ]}
              onPress={() => handleQuickSelect(option.days)}
            >
              <Text style={[
                styles.quickSelectButtonText,
                isAllSelected(option.days) && styles.quickSelectButtonTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
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
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  selectedDay: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  unselectedDay: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  unselectedDayText: {
    color: '#374151',
  },
  quickSelectContainer: {
    marginTop: 8,
  },
  quickSelectLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  quickSelectButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSelectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  quickSelectAllSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  quickSelectPartialSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  quickSelectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  quickSelectButtonTextSelected: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
});