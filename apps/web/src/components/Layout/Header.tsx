import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { sound } from '../../services/sound';

interface HeaderProps {
  view: 'timeline' | 'grid';
  onViewChange: (view: 'timeline' | 'grid') => void;
}

export function Header({ view, onViewChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());

  const handleThemeToggle = () => {
    sound.play('theme');
    toggleTheme();
  };

  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sound.setEnabled(newState);
    if (newState) {
      sound.play('click');
    }
  };

  const handleViewChange = (newView: 'timeline' | 'grid') => {
    sound.play('click');
    onViewChange(newView);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>Welcome, {user?.name || 'Student'}!</h1>
          <p className="header-subtitle">Stay focused on your goals</p>
        </div>

        <div className="header-right">
          <div className="view-toggle">
            <button
              className={view === 'timeline' ? 'active' : ''}
              onClick={() => handleViewChange('timeline')}
              aria-pressed={view === 'timeline'}
              aria-label="Timeline view"
            >
              📋 Timeline
            </button>
            <button
              className={view === 'grid' ? 'active' : ''}
              onClick={() => handleViewChange('grid')}
              aria-pressed={view === 'grid'}
              aria-label="Grid view"
            >
              📊 Grid
            </button>
          </div>

          <button
            className="icon-btn sound-btn"
            onClick={handleSoundToggle}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <label className="theme-toggle" aria-label="Toggle theme">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={handleThemeToggle}
            />
            <span className="slider"></span>
          </label>

          <button onClick={logout} className="btn btn-secondary" aria-label="Logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
