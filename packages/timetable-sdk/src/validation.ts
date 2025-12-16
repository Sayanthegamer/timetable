import { TimetableEntry, Timetable } from './types';

export const validateTimetableEntry = (entry: any): entry is TimetableEntry => {
  if (typeof entry !== 'object' || entry === null) return false;
  return (
    typeof entry.time === 'string' &&
    typeof entry.subject === 'string' &&
    typeof entry.details === 'string' &&
    typeof entry.type === 'string'
  );
};

export const validateTimetable = (data: any): data is Timetable => {
  if (typeof data !== 'object' || data === null) return false;
  for (const day in data) {
    if (!Array.isArray(data[day])) return false;
    for (const entry of data[day]) {
      if (!validateTimetableEntry(entry)) return false;
    }
  }
  return true;
};
