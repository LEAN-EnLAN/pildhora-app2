import { Medication } from '../types';
import { AlarmConfig } from '../services/alarmService';

/**
 * Utility functions for working with medication alarms
 */

/**
 * Convert frequency string to day numbers
 * @param frequency - Frequency string (e.g., "Daily", "Mon,Wed,Fri")
 * @returns Array of day numbers (0-6, where 0 is Sunday)
 */
export function frequencyToDays(frequency: string): number[] {
  if (!frequency) {
    return [0, 1, 2, 3, 4, 5, 6]; // Default to daily
  }

  const lowerFreq = frequency.toLowerCase();

  // Handle common frequency patterns
  if (lowerFreq === 'daily' || lowerFreq === 'diario' || lowerFreq === 'todos los días') {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  if (lowerFreq === 'weekdays' || lowerFreq === 'días laborables') {
    return [1, 2, 3, 4, 5]; // Monday to Friday
  }

  if (lowerFreq === 'weekends' || lowerFreq === 'fines de semana') {
    return [0, 6]; // Saturday and Sunday
  }

  // Parse comma-separated days
  const dayMap: { [key: string]: number } = {
    'sun': 0, 'dom': 0, 'sunday': 0, 'domingo': 0,
    'mon': 1, 'lun': 1, 'monday': 1, 'lunes': 1,
    'tue': 2, 'mar': 2, 'tuesday': 2, 'martes': 2,
    'wed': 3, 'mié': 3, 'mie': 3, 'wednesday': 3, 'miércoles': 3, 'miercoles': 3,
    'thu': 4, 'jue': 4, 'thursday': 4, 'jueves': 4,
    'fri': 5, 'vie': 5, 'friday': 5, 'viernes': 5,
    'sat': 6, 'sáb': 6, 'sab': 6, 'saturday': 6, 'sábado': 6, 'sabado': 6,
  };

  const days: number[] = [];
  const parts = frequency.split(',').map(s => s.trim().toLowerCase());

  for (const part of parts) {
    if (dayMap[part] !== undefined) {
      days.push(dayMap[part]);
    }
  }

  // If no valid days found, default to daily
  return days.length > 0 ? days : [0, 1, 2, 3, 4, 5, 6];
}

/**
 * Convert day numbers to frequency string
 * @param days - Array of day numbers (0-6)
 * @returns Frequency string
 */
export function daysToFrequency(days: number[]): string {
  if (!days || days.length === 0) {
    return 'Daily';
  }

  if (days.length === 7) {
    return 'Daily';
  }

  if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) {
    return 'Weekdays';
  }

  if (days.length === 2 && days.includes(0) && days.includes(6)) {
    return 'Weekends';
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map(d => dayNames[d]).join(',');
}

/**
 * Convert medication to alarm configurations
 * @param medication - Medication object
 * @returns Array of alarm configurations (one per scheduled time)
 */
export function medicationToAlarmConfigs(medication: Medication): AlarmConfig[] {
  const days = frequencyToDays(medication.frequency);
  
  return medication.times.map(time => ({
    medicationId: medication.id,
    medicationName: medication.name,
    time,
    days,
    emoji: medication.emoji,
  }));
}

/**
 * Validate time format (HH:MM)
 * @param time - Time string
 * @returns True if valid, false otherwise
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Format time to 24-hour format
 * @param time - Time string (can be 12 or 24 hour format)
 * @returns Time in 24-hour format (HH:MM)
 */
export function formatTo24Hour(time: string): string {
  // If already in 24-hour format, return as is
  if (isValidTimeFormat(time)) {
    return time;
  }

  // Try to parse 12-hour format
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);
  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Format time to 12-hour format
 * @param time - Time string in 24-hour format (HH:MM)
 * @returns Time in 12-hour format (h:MM AM/PM)
 */
export function formatTo12Hour(time: string): string {
  const [hoursStr, minutes] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${period}`;
}

/**
 * Get next alarm time for a medication
 * @param medication - Medication object
 * @returns Next alarm date or null if no alarms
 */
export function getNextAlarmTime(medication: Medication): Date | null {
  if (!medication.times || medication.times.length === 0) {
    return null;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const days = frequencyToDays(medication.frequency);
  const times = medication.times.map(t => {
    const [hours, minutes] = t.split(':').map(Number);
    return hours * 60 + minutes;
  });

  // Find next alarm
  let minDiff = Infinity;
  let nextAlarm: Date | null = null;

  for (const day of days) {
    for (const time of times) {
      let dayDiff = day - currentDay;
      if (dayDiff < 0) {
        dayDiff += 7;
      } else if (dayDiff === 0 && time <= currentTime) {
        dayDiff = 7;
      }

      const totalMinutes = dayDiff * 24 * 60 + (time - currentTime);
      
      if (totalMinutes > 0 && totalMinutes < minDiff) {
        minDiff = totalMinutes;
        
        const alarmDate = new Date(now);
        alarmDate.setDate(alarmDate.getDate() + dayDiff);
        alarmDate.setHours(Math.floor(time / 60));
        alarmDate.setMinutes(time % 60);
        alarmDate.setSeconds(0);
        alarmDate.setMilliseconds(0);
        
        nextAlarm = alarmDate;
      }
    }
  }

  return nextAlarm;
}

/**
 * Check if medication has alarms scheduled for today
 * @param medication - Medication object
 * @returns True if alarms scheduled for today
 */
export function hasAlarmsToday(medication: Medication): boolean {
  const today = new Date().getDay();
  const days = frequencyToDays(medication.frequency);
  return days.includes(today);
}

/**
 * Get alarm times for today
 * @param medication - Medication object
 * @returns Array of time strings for today's alarms
 */
export function getAlarmTimesForToday(medication: Medication): string[] {
  if (!hasAlarmsToday(medication)) {
    return [];
  }
  return medication.times;
}
