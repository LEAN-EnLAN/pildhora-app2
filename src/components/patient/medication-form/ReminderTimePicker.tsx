import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button } from '../../ui/Button';

interface Props {
  times: string[];
  onTimesChange: (times: string[]) => void;
  error?: string;
  maxTimes?: number; // Maximum number of reminder times allowed
}

export default function ReminderTimePicker({ times, onTimesChange, error, maxTimes = 10 }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setShowPicker(false);
      setEditingIndex(null);
      setIsProcessing(false);
    };
  }, []);

  const showTimePicker = useCallback((index: number | null = null) => {
    try {
      if (isProcessing) return;
      
      setEditingIndex(index);
      
      if (index !== null && index >= 0 && index < times.length) {
        const timeString = times[index];
        if (timeString && timeString.includes(':')) {
          const [hours, minutes] = timeString.split(':');
          const hour = parseInt(hours, 10);
          const minute = parseInt(minutes, 10);
          
          if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            const date = new Date();
            date.setHours(hour);
            date.setMinutes(minute);
            date.setSeconds(0);
            date.setMilliseconds(0);
            setTempDate(date);
          } else {
            setTempDate(new Date());
          }
        } else {
          setTempDate(new Date());
        }
      } else {
        const date = new Date();
        date.setSeconds(0);
        date.setMilliseconds(0);
        setTempDate(date);
      }
      
      setShowPicker(true);
    } catch (error) {
      console.error('Error showing time picker:', error);
      setTempDate(new Date());
      setShowPicker(true);
    }
  }, [isProcessing]);

  const handleTimeChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    // Prevent multiple rapid calls
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Handle cancellation
      if (event.type === 'dismissed' || !selectedDate) {
        setShowPicker(false);
        setEditingIndex(null);
        return;
      }
      
      // Validate the selected date
      if (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
        console.warn('Invalid date selected in ReminderTimePicker');
        setShowPicker(false);
        setEditingIndex(null);
        return;
      }
      
      // Format time string safely
      const timeString = selectedDate.toTimeString().slice(0, 5);
      if (!timeString || timeString.length !== 5 || !timeString.includes(':')) {
        console.warn('Invalid time format generated');
        setShowPicker(false);
        setEditingIndex(null);
        return;
      }
      
      // Update temp date for iOS
      setTempDate(selectedDate);
      
      // Apply changes based on platform
      if (Platform.OS === 'android') {
        // Android: Close picker and apply changes
        setShowPicker(false);
        
        if (editingIndex !== null && editingIndex >= 0 && editingIndex < times.length) {
          const newTimes = [...times];
          newTimes[editingIndex] = timeString;
          onTimesChange(newTimes);
        } else {
          // Adding new time
          if (!times.includes(timeString) && times.length < maxTimes) {
            onTimesChange([...times, timeString]);
          } else if (times.length >= maxTimes) {
            console.warn(`Maximum number of reminder times (${maxTimes}) reached`);
          }
        }
      } else if (Platform.OS === 'ios') {
        // iOS: Apply changes immediately for inline picker
        if (editingIndex !== null && editingIndex >= 0 && editingIndex < times.length) {
          const newTimes = [...times];
          newTimes[editingIndex] = timeString;
          onTimesChange(newTimes);
        } else {
          // Adding new time
          if (!times.includes(timeString) && times.length < maxTimes) {
            onTimesChange([...times, timeString]);
          } else if (times.length >= maxTimes) {
            console.warn(`Maximum number of reminder times (${maxTimes}) reached`);
          }
        }
        
        // Auto-close for better UX
        setTimeout(() => {
          setShowPicker(false);
          setEditingIndex(null);
        }, 100);
      }
    } catch (error) {
      console.error('Error in ReminderTimePicker handleTimeChange:', error);
      setShowPicker(false);
      setEditingIndex(null);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, editingIndex, times, maxTimes, onTimesChange]);

  const handleRemoveTime = useCallback((index: number) => {
    try {
      if (index >= 0 && index < times.length) {
        onTimesChange(times.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error('Error removing time:', error);
    }
  }, [times, onTimesChange]);

  const displayTime = useCallback((time: string): string => {
    try {
      if (!time || !time.includes(':')) {
        return time;
      }
      
      const [h, m] = time.split(':');
      if (!h || !m || h.length !== 2 || m.length !== 2) {
        return time;
      }
      
      const hour = parseInt(h, 10);
      const minute = parseInt(m, 10);
      
      if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return time;
      }
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const displayMinute = minute.toString().padStart(2, '0');
      
      return `${displayHour}:${displayMinute} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return time;
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horas de Recordatorio</Text>
      <View style={styles.minHeight48}>
        {times.length === 0 ? (
          <Button onPress={() => showTimePicker()} variant="secondary" style={styles.justifyCenter}>
            <View style={styles.buttonContent}>
              <Text style={styles.addTimeText}>Añadir hora</Text>
              <Ionicons name="time-outline" size={20} color="#3B82F6" />
            </View>
          </Button>
        ) : (
          <View style={styles.timesContainer}>
            {times.map((time, index) => {
              if (!time || !time.includes(':')) {
                return null; // Skip invalid times
              }
              
              return (
                <View key={`time-${index}-${time}`} style={styles.timePill}>
                  <Text style={styles.timeText}>{displayTime(time)}</Text>
                  <TouchableOpacity 
                    onPress={() => showTimePicker(index)}
                    disabled={isProcessing}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="create-outline" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleRemoveTime(index)}
                    disabled={isProcessing}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            })}
            <Button 
              onPress={() => showTimePicker()} 
              variant="secondary" 
              style={styles.addButton}
              disabled={isProcessing || times.length >= maxTimes}
            >
              <Ionicons name="add" size={16} color="#3B82F6" />
            </Button>
          </View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && (
        <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : styles.pickerContainer}>
          <DateTimePicker
            value={tempDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleTimeChange}
            locale="es-ES"
            style={Platform.OS === 'ios' ? styles.iosPicker : styles.androidPicker}
            is24Hour={false}
            minuteInterval={1}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  minHeight48: {
    minHeight: 48,
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addTimeText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  addButton: {
    padding: 4,
    borderRadius: 9999,
    height: 32,
    width: 32,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 4,
  },
  pickerContainer: {
    marginTop: 8,
  },
  iosPickerContainer: {
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iosPicker: {
    width: '100%',
  },
  androidPicker: {
    width: '100%',
  },
});