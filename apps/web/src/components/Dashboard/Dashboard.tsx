import { useState, useEffect } from 'react';
import { useSchedule } from '../../hooks/useSchedule';
import { ScheduleView } from '../Schedule/ScheduleView';
import { Stats } from '../Stats/Stats';
import { BengaliCard } from '../BengaliCard/BengaliCard';
import { DaySelector } from './DaySelector';
import { Header } from '../Layout/Header';
import type { Schedule } from 'timetable-sdk';

export function Dashboard() {
  const { schedule, loading, error } = useSchedule();
  const [currentDay, setCurrentDay] = useState<keyof Schedule>(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' }) as keyof Schedule;
  });
  const [view, setView] = useState<'timeline' | 'grid'>('timeline');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const updateDay = () => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as keyof Schedule;
      setCurrentDay(today);
    };

    const timer = setInterval(updateDay, 60000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your schedule...</p>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <h2>⚠️ Error Loading Schedule</h2>
          <p>{error || 'Failed to load schedule data'}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tasks = schedule[currentDay] || [];

  return (
    <div className="dashboard">
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-text">
            <h2>📚 Timetable</h2>
            <p className="tagline">Your JEE Journey</p>
          </div>
        </div>

        <DaySelector currentDay={currentDay} onSelectDay={setCurrentDay} />

        <div className="sidebar-footer">
          <BengaliCard />
          <Stats tasks={tasks} />
        </div>
      </aside>

      <main className="main-content">
        <Header view={view} onViewChange={setView} />
        <ScheduleView schedule={schedule} currentDay={currentDay} view={view} />
      </main>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
