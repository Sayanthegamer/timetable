import type { Schedule } from 'timetable-sdk';

interface DaySelectorProps {
  currentDay: keyof Schedule;
  onSelectDay: (day: keyof Schedule) => void;
}

const DAYS: Array<keyof Schedule> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const DAY_ICONS: Record<keyof Schedule, string> = {
  Sunday: '🌅',
  Monday: '🌟',
  Tuesday: '🔥',
  Wednesday: '⚡',
  Thursday: '🚀',
  Friday: '🎯',
  Saturday: '🌈'
};

export function DaySelector({ currentDay, onSelectDay }: DaySelectorProps) {
  return (
    <div className="day-selector">
      {DAYS.map(day => (
        <button
          key={day}
          className={currentDay === day ? 'active' : ''}
          onClick={() => onSelectDay(day)}
          aria-pressed={currentDay === day}
        >
          <span className="day-icon">{DAY_ICONS[day]}</span>
          <span className="day-name">{day}</span>
          <span className="day-arrow">→</span>
        </button>
      ))}
    </div>
  );
}
