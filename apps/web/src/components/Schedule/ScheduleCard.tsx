import { useState, useEffect } from 'react';
import type { Task } from 'timetable-sdk';
import { isTaskLive, isTaskCompleted, getTaskProgress } from '../../utils/time-utils';

interface ScheduleCardProps {
  task: Task;
}

export function ScheduleCard({ task }: ScheduleCardProps) {
  const [now, setNow] = useState(new Date());
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const live = isTaskLive(task.time, now);
  const completed = isTaskCompleted(task.time, now);
  const progress = getTaskProgress(task.time, now);

  const typeColors: Record<string, string> = {
    maths: 'var(--primary)',
    physics: 'var(--info)',
    chemistry: 'var(--success)',
    english: 'var(--secondary)',
    computer: 'var(--warning)',
    bengali: 'var(--error)',
    break: 'var(--text-muted)'
  };

  const color = typeColors[task.type] || 'var(--text)';

  return (
    <div
      className={`schedule-card ${live ? 'live' : ''} ${completed ? 'completed' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ '--card-color': color } as React.CSSProperties}
    >
      {live && (
        <div className="live-badge">
          <span className="pulse"></span>
          Live Now
        </div>
      )}

      <div className="card-header">
        <span className="card-time">{task.time}</span>
        {live && (
          <span className="card-progress">{progress}%</span>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-subject">{task.subject}</h3>
        {task.details && <p className="card-details">{task.details}</p>}
      </div>

      {live && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {completed && (
        <div className="completed-badge">
          <span>✓</span>
        </div>
      )}
    </div>
  );
}
