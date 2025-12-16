import { parseTimeRange, parseTimeString } from '../src/time-utils';

describe('Time Utils', () => {
  const baseDate = new Date('2025-11-10T00:00:00');

  test('parseTimeString should parse time correctly', () => {
    const result = parseTimeString('9:30 AM', baseDate);
    expect(result).not.toBeNull();
    if (result) {
        expect(result.getHours()).toBe(9);
        expect(result.getMinutes()).toBe(30);
    }
  });

  test('parseTimeString should parse PM correctly', () => {
    const result = parseTimeString('2:30 PM', baseDate);
    expect(result).not.toBeNull();
    if (result) {
        expect(result.getHours()).toBe(14);
        expect(result.getMinutes()).toBe(30);
    }
  });
  
  test('parseTimeString should parse 12 PM as 12:00', () => {
    const result = parseTimeString('12:00 PM', baseDate);
    expect(result).not.toBeNull();
    if (result) {
        expect(result.getHours()).toBe(12);
        expect(result.getMinutes()).toBe(0);
    }
  });
  
  test('parseTimeString should parse 12 AM as 0:00', () => {
    const result = parseTimeString('12:00 AM', baseDate);
    expect(result).not.toBeNull();
    if (result) {
        expect(result.getHours()).toBe(0);
        expect(result.getMinutes()).toBe(0);
    }
  });

  test('parseTimeRange should parse range with both AM/PM', () => {
    const [start, end] = parseTimeRange('9:30 AM - 11:00 AM', baseDate);
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    if (start && end) {
        expect(start.getHours()).toBe(9);
        expect(end.getHours()).toBe(11);
    }
  });

  test('parseTimeRange should infer AM/PM when missing in start', () => {
    const [start, end] = parseTimeRange('9:30 - 11:00 AM', baseDate);
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    if (start && end) {
        expect(start.getHours()).toBe(9);
        expect(end.getHours()).toBe(11);
    }
  });

  test('parseTimeRange should infer PM when inferred', () => {
      const [start, end] = parseTimeRange('2:00 - 4:00 PM', baseDate);
      expect(start).not.toBeNull();
      expect(end).not.toBeNull();
      if (start && end) {
          expect(start.getHours()).toBe(14);
          expect(end.getHours()).toBe(16);
      }
  });

  test('parseTimeRange should handle single time point', () => {
    const [start, end] = parseTimeRange('3:00 PM', baseDate);
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    if (start && end) {
        expect(start.getHours()).toBe(15);
        // Default duration 30 mins
        expect(end.getTime() - start.getTime()).toBe(30 * 60000);
    }
  });
  
  test('parseTimeRange should return nulls for onwards', () => {
      const [start, end] = parseTimeRange('onwards', baseDate);
      expect(start).toBeNull();
      expect(end).toBeNull();
  });
});
