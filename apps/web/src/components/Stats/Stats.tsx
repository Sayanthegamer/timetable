import { useMemo } from 'react';
import type { Task } from 'timetable-sdk';
import { isTaskCompleted } from '../../utils/time-utils';

interface StatsProps {
  tasks: Task[];
}

export function Stats({ tasks }: StatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const completed = tasks.filter(task => isTaskCompleted(task.time, now)).length;
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byType = tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { completed, total, percentage, byType };
  }, [tasks]);

  const typeLabels: Record<string, string> = {
    maths: '📐 Maths',
    physics: '📘 Physics',
    chemistry: '🧪 Chemistry',
    english: '📖 English',
    computer: '💻 Computer',
    bengali: '📚 Bengali',
    break: '🍽️ Break'
  };

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h3>Today's Progress</h3>
      </div>

      <div className="progress-ring-container">
        <svg className="progress-ring" viewBox="0 0 120 120">
          <circle
            className="progress-ring-bg"
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          <circle
            className="progress-ring-fill"
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="8"
            strokeDasharray={`${(stats.percentage / 100) * 339.292} 339.292`}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="progress-text">
          <div className="progress-percentage">{stats.percentage}%</div>
          <div className="progress-label">
            {stats.completed}/{stats.total} tasks
          </div>
        </div>
      </div>

      <div className="stats-breakdown">
        <h4>Breakdown</h4>
        <div className="stats-list">
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="stat-item">
              <span className="stat-label">{typeLabels[type] || type}</span>
              <span className="stat-value">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
