import { useState, useEffect } from 'react';
import type { Schedule } from 'timetable-sdk';
import { ScheduleCard } from './ScheduleCard';
import { isTaskLive } from '../../utils/time-utils';

interface ScheduleViewProps {
  schedule: Schedule;
  currentDay: keyof Schedule;
  view: 'timeline' | 'grid';
}

export function ScheduleView({ schedule, currentDay, view }: ScheduleViewProps) {
  const [now, setNow] = useState(new Date());
  const tasks = schedule[currentDay] || [];

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const liveTask = tasks.find(task => isTaskLive(task.time, now));

  if (!tasks.length) {
    return (
      <div className="empty-state">
        <p>No tasks scheduled for {currentDay}</p>
      </div>
    );
  }

  return (
    <div className={`schedule-view ${view}`}>
      {liveTask && (
        <div className="live-banner">
          <span className="pulse"></span>
          <strong>Live Now:</strong> {liveTask.subject}
        </div>
      )}

      <div className={`schedule-container ${view === 'grid' ? 'grid-view' : 'timeline-view'}`}>
        {tasks.map((task, index) => (
          <ScheduleCard key={index} task={task} />
        ))}
      </div>
    </div>
  );
}
