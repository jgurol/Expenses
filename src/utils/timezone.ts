
import { format, parseISO } from 'date-fns';

export const formatDateInTimezone = (
  date: string | Date, 
  timezone: string = 'UTC', 
  formatString: string = 'yyyy-MM-dd HH:mm:ss'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    // Use Intl.DateTimeFormat for timezone conversion
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(dateObj);
    const formattedDate = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value} ${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}:${parts.find(p => p.type === 'second')?.value}`;
    
    // Parse the formatted date and apply the desired format
    return format(parseISO(formattedDate), formatString);
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    // Fallback to basic date formatting
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  }
};

export const getCurrentTimezoneOffset = (timezone: string = 'UTC'): number => {
  try {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (getTimezoneOffset(timezone) * 60000));
    return targetTime.getTimezoneOffset();
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return 0;
  }
};

const getTimezoneOffset = (timezone: string): number => {
  try {
    const now = new Date();
    const localTime = now.toLocaleString('en-US', { timeZone: timezone });
    const utcTime = now.toLocaleString('en-US', { timeZone: 'UTC' });
    
    const localDate = new Date(localTime);
    const utcDate = new Date(utcTime);
    
    return (utcDate.getTime() - localDate.getTime()) / (1000 * 60);
  } catch (error) {
    console.error('Error calculating timezone offset:', error);
    return 0;
  }
};
