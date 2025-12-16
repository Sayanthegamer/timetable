export function parseTimeString(timeStr: string, baseDate: Date): Date | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*([APM]{2})/i);
  if (!match) return null;
  let [, h, m, period] = match;
  let hour = Number(h);
  const minute = Number(m);
  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function parseTimeRange(timeStr: string, baseDate: Date): [Date | null, Date | null] {
  if (timeStr.includes('onwards')) return [null, null];

  const rangeMatch = timeStr.match(/(\d{1,2}:\d{2})(?:\s*([AP]M))?\s*[–—-]\s*(\d{1,2}:\d{2})\s*([AP]M)/i);
  if (rangeMatch) {
    let [, startTime, startPeriod, endTime, endPeriod] = rangeMatch;

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
          startPeriod = 'PM';
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

  const singleMatch = timeStr.match(/(\d{1,2}:\d{2})\s*([APM]{2})/i);
  if (singleMatch) {
    const timePoint = parseTimeString(singleMatch[1] + ' ' + singleMatch[2], baseDate);
    if (timePoint) {
      return [timePoint, new Date(timePoint.getTime() + 30 * 60000)];
    }
  }
  return [null, null];
}

export function isTaskLive(timeStr: string, now: Date): boolean {
  const [start, end] = parseTimeRange(timeStr, now);
  if (!start || !end) return false;
  return now >= start && now < end;
}

export function isTaskCompleted(timeStr: string, now: Date): boolean {
  const [, end] = parseTimeRange(timeStr, now);
  if (!end) return false;
  return now >= end;
}

export function getTaskProgress(timeStr: string, now: Date): number {
  const [start, end] = parseTimeRange(timeStr, now);
  if (!start || !end) return 0;
  if (now < start) return 0;
  if (now >= end) return 100;
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.round((elapsed / total) * 100);
}
