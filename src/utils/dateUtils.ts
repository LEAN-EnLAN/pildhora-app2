/**
 * Date utility functions for formatting and displaying dates
 */

/**
 * Convert a date to a relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - The date to convert (Date object or ISO string)
 * @returns Relative time string
 */
export function getRelativeTimeString(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'Justo ahora';
  } else if (diffMinutes < 60) {
    return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  } else if (diffWeeks < 4) {
    return `Hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
  } else if (diffMonths < 12) {
    return `Hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
  } else {
    return `Hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
  }
}

/**
 * Format a date to a readable string with time
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date string (e.g., "Dec 15, 2023 at 2:30 PM")
 */
export function formatDateTime(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  return targetDate.toLocaleDateString('es-ES', options);
}

/**
 * Check if a date is today
 * @param date - The date to check (Date object or ISO string)
 * @returns True if the date is today
 */
export function isToday(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    targetDate.getDate() === today.getDate() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is yesterday
 * @param date - The date to check (Date object or ISO string)
 * @returns True if the date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    targetDate.getDate() === yesterday.getDate() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getFullYear() === yesterday.getFullYear()
  );
}
