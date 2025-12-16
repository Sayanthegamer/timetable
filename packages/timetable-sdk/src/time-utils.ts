// Time parsing utilities for timetable application

export function parseTimeString(timeStr: string, baseDate: Date): Date | null {
  // Accepts "h:mm AM/PM" or "h:mmAM/PM"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*([APM]{2})/i);
  if (!match) return null;
  let [, hStr, mStr, period] = match;
  let h = Number(hStr);
  const m = Number(mStr);
  
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  
  const date = new Date(baseDate);
  date.setHours(h, m, 0, 0);
  return date;
}

export function parseTimeRange(timeStr: string, baseDate: Date): [Date | null, Date | null] {
  if (timeStr.includes('onwards')) return [null, null];

  // Try to match both times, allowing the first to be missing AM/PM
  const rangeMatch = timeStr.match(/(\d{1,2}:\d{2})(?:\s*([AP]M))?\s*[–—-]\s*(\d{1,2}:\d{2})\s*([AP]M)/i);
  if (rangeMatch) {
    let [, startTime, startPeriod, endTime, endPeriod] = rangeMatch;

    // If startPeriod is missing, infer it
    if (!startPeriod) {
      const [startHour] = startTime.split(':').map(Number);
      const [endHour] = endTime.split(':').map(Number);

      if (endPeriod.toUpperCase() === 'PM') {
        if (startHour === 12) {
          startPeriod = 'PM';
        } else if (startHour < 12 && startHour < endHour) {
          startPeriod = 'PM';
        } else if (startHour < 12 && startHour > endHour) {
          startPeriod = 'AM';
        } else {
          startPeriod = 'PM';
        }
      } else if (endPeriod.toUpperCase() === 'AM') {
        if (startHour === 12) {
          startPeriod = 'AM';
        } else if (startHour > endHour) {
          startPeriod = 'PM'; // overnight case like 11:30 - 1:30 AM
        } else {
          startPeriod = 'AM';
        }
      } else {
        startPeriod = endPeriod;
      }
    }

    const start = parseTimeString(startTime + ' ' + startPeriod, baseDate);
    const end = parseTimeString(endTime + ' ' + endPeriod, baseDate);
    return [start, end];
  }

  // Single time (point event)
  const singleMatch = timeStr.match(/(\d{1,2}:\d{2})\s*([APM]{2})/i);
  if (singleMatch) {
    const timePoint = parseTimeString(singleMatch[1] + ' ' + singleMatch[2], baseDate);
    if (timePoint) {
      return [timePoint, new Date(timePoint.getTime() + 30 * 60000)];
    }
  }
  return [null, null];
}
