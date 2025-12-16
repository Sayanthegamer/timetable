import { useState, useEffect, useRef } from 'react';
import { parseTimeRange } from '../utils/time-utils';
import { bengaliQuotes, getRandomQuote } from '../data/quotes';
import { defaultTimetable } from '../data/timetable';

export default function TimetableApp({ sdk, user, onLogout }) {
  const [timetable, setTimetable] = useState(defaultTimetable);
  const [currentDay, setCurrentDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [currentView, setCurrentView] = useState('timeline');
  const [theme, setTheme] = useState('light');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const completedSoundPlayedRef = useRef(new Set());
  const audioRef = useRef({});

  useEffect(() => {
    const handleInteraction = () => setUserHasInteracted(true);
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    loadPreferences();
    loadScheduleData();
    
    const interval = setInterval(() => {
      setCurrentDay(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = sdk.onScheduleUpdate((data) => {
      setTimetable(data);
      setLastSync(new Date());
    });

    return unsubscribe;
  }, [sdk]);

  const loadPreferences = async () => {
    try {
      const prefs = await sdk.getAllPreferences();
      if (prefs.theme) setTheme(prefs.theme);
      if (prefs.soundEnabled !== undefined) setSoundEnabled(prefs.soundEnabled === 'true');
      if (prefs.view) setCurrentView(prefs.view);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadScheduleData = async () => {
    try {
      const cachedSchedule = await sdk.getCachedSchedule();
      if (cachedSchedule) {
        setTimetable(cachedSchedule);
        setIsOnline(false);
      }

      try {
        const freshSchedule = await sdk.fetchSchedule(false);
        setTimetable(freshSchedule);
        setIsOnline(true);
        setLastSync(new Date());
      } catch (error) {
        console.log('Failed to fetch fresh schedule, using cache');
        setIsOnline(false);
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
      setTimetable(defaultTimetable);
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme;
    await sdk.setPreference('theme', newTheme);
  };

  const handleSoundToggle = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    await sdk.setPreference('soundEnabled', newValue.toString());
  };

  const handleViewToggle = async () => {
    const newView = currentView === 'timeline' ? 'grid' : 'timeline';
    setCurrentView(newView);
    await sdk.setPreference('view', newView);
  };

  const handleDaySwitch = (day) => {
    setCurrentDay(day);
    completedSoundPlayedRef.current.clear();
  };

  const handleRefresh = async () => {
    try {
      const freshSchedule = await sdk.fetchSchedule(true);
      setTimetable(freshSchedule);
      setIsOnline(true);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to refresh schedule:', error);
    }
  };

  const playSound = (type) => {
    if (!soundEnabled || !userHasInteracted) return;
    
    try {
      const audio = new Audio(`/sounds/${type}.wav`);
      audio.volume = 0.5;
      audio.play().catch(e => console.error('Sound play failed:', e));
    } catch (error) {
      console.error('Sound error:', error);
    }
  };

  const renderSchedule = () => {
    const daySchedule = timetable[currentDay] || [];
    if (daySchedule.length === 0) {
      return <div className="error-card">No schedule available for this day.</div>;
    }

    const now = new Date();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const isManual = currentDay !== today;

    let liveTask = null;
    let completedTasks = 0;

    const scheduleCards = daySchedule.map((entry, index) => {
      const [start, end] = parseTimeRange(entry.time, now);
      const isCurrent = !isManual && start && end && now >= start && now <= end;
      const isPast = !isManual && end && now > end;

      if (isCurrent) liveTask = entry.subject;
      if (isPast) completedTasks++;

      const taskKey = `${entry.subject}|${entry.time}`;
      if (isPast && !completedSoundPlayedRef.current.has(taskKey)) {
        playSound('complete');
        completedSoundPlayedRef.current.add(taskKey);
      }

      return (
        <ScheduleCard
          key={`${currentDay}-${index}`}
          entry={entry}
          isCurrent={isCurrent}
          isPast={isPast}
          index={index}
        />
      );
    });

    return (
      <>
        {!isManual && liveTask && (
          <div className="live-banner">
            <span className="pulse-dot"></span>
            <strong>LIVE NOW:</strong> {liveTask}
          </div>
        )}
        <div className={`schedule-container schedule-${currentView}`}>
          {scheduleCards}
        </div>
        <DayStats
          completedTasks={completedTasks}
          totalTasks={daySchedule.length}
        />
      </>
    );
  };

  return (
    <div className={`app ${theme}`}>
      <Header
        user={user}
        onLogout={onLogout}
        theme={theme}
        soundEnabled={soundEnabled}
        onThemeToggle={handleThemeToggle}
        onSoundToggle={handleSoundToggle}
        isOnline={isOnline}
        lastSync={lastSync}
        onRefresh={handleRefresh}
      />
      
      <DaySelector
        currentDay={currentDay}
        onDaySwitch={handleDaySwitch}
      />
      
      <ViewToggle
        currentView={currentView}
        onViewToggle={handleViewToggle}
      />
      
      {renderSchedule()}
    </div>
  );
}

function Header({ user, onLogout, theme, soundEnabled, onThemeToggle, onSoundToggle, isOnline, lastSync, onRefresh }) {
  return (
    <header className="app-header glass-effect">
      <div className="header-left">
        <h1>📚 JEE Timetable</h1>
        <div className="sync-status">
          {isOnline ? (
            <>
              <span className="status-dot online"></span>
              <span>Online</span>
            </>
          ) : (
            <>
              <span className="status-dot offline"></span>
              <span>Offline</span>
            </>
          )}
          {lastSync && (
            <span className="last-sync">
              Last sync: {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="header-right">
        <button
          className="icon-btn"
          onClick={onRefresh}
          title="Refresh schedule"
        >
          🔄
        </button>
        <button
          className="icon-btn"
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          className="icon-btn"
          onClick={onSoundToggle}
          title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button
          className="btn-secondary"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

function DaySelector({ currentDay, onDaySwitch }) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="day-selector glass-effect">
      {days.map(day => (
        <button
          key={day}
          className={`day-btn ${currentDay === day ? 'active' : ''} ${day === today ? 'today' : ''}`}
          onClick={() => onDaySwitch(day)}
        >
          {day}
        </button>
      ))}
    </div>
  );
}

function ViewToggle({ currentView, onViewToggle }) {
  return (
    <div className="view-toggle">
      <button
        className="toggle-btn"
        onClick={onViewToggle}
      >
        {currentView === 'timeline' ? '📊 Switch to Grid' : '📅 Switch to Timeline'}
      </button>
    </div>
  );
}

function ScheduleCard({ entry, isCurrent, isPast, index }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const quote = getRandomQuote();

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`schedule-card ${entry.type} ${isCurrent ? 'highlight' : ''} ${isPast ? 'completed' : ''} ${isFlipped ? 'flipped' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={handleFlip}
    >
      <div className="card-inner">
        <div className="card-front">
          <div className="card-header">
            <span className="subject">{entry.subject}</span>
            <span className="time">{entry.time}</span>
          </div>
          {entry.details && (
            <div className="details">{entry.details}</div>
          )}
          {isPast && (
            <div className="completion-badge">✓</div>
          )}
          <div className="flip-hint">🔄 Click to flip</div>
        </div>
        
        <div className="card-back">
          <div className={`quote-content ${quote.type}`}>
            <div className="quote-header">
              {quote.type === 'motivation' ? '💪' : '🔥'}
            </div>
            <div className="quote-bengali">{quote.bengali}</div>
            <div className="quote-translation">{quote.translation}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DayStats({ completedTasks, totalTasks }) {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const progress = circumference - (percentage / 100) * circumference;

  return (
    <div className="day-stats glass-effect">
      <div className="stats-content">
        <h3>Today's Progress</h3>
        <div className="progress-info">
          <span className="completed">{completedTasks}</span>
          <span className="separator">/</span>
          <span className="total">{totalTasks}</span>
          <span className="label">tasks</span>
        </div>
      </div>
      
      <div className="progress-ring">
        <svg width="120" height="120">
          <circle
            className="progress-ring-circle-bg"
            cx="60"
            cy="60"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
          />
          <circle
            className="progress-ring-circle"
            cx="60"
            cy="60"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="progress-percentage">{percentage}%</div>
      </div>
    </div>
  );
}
