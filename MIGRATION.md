# Migration Guide: Legacy to React Desktop Shell

This document describes the migration from the legacy vanilla JavaScript Electron app to the new React-based desktop shell.

## Overview

The application has been refactored from a standalone static HTML/JS/CSS app to a modern React application wrapped in an Electron desktop shell with secure credential storage, offline caching, and auto-update capabilities.

## Key Changes

### Architecture

**Before:**
- Single HTML file with inline scripts
- Vanilla JavaScript with global window objects
- Direct file loading (`data.js` exposed via preload)
- No authentication
- No offline support beyond static files

**After:**
- Modern React SPA with component architecture
- Vite build system with hot reload
- Secure SDK abstraction layer
- Authentication with keytar credential storage
- Filesystem-backed offline cache
- Auto-update support
- Deep-link handling

### File Structure

#### Retired Files (Legacy)
These files are no longer used but kept for reference:
- `index.html` → Replaced by `apps/web/index.html` + React
- `renderer.js` → Replaced by React components in `apps/web/src/components/`
- `style.css` → Migrated to `apps/web/src/App.css`

#### New Files
- `apps/web/` - React application
- `packages/sdk/` - Shared SDK for Electron ↔ React communication
- `main.js` - Enhanced with auth, cache, deep-links, auto-update
- `preload.js` - Hardened security with channel whitelisting

### Data Flow

**Legacy Flow:**
```
main.js → loads index.html → preload.js exposes data.js → renderer.js reads window.timetable
```

**New Flow:**
```
main.js → loads React app → preload.js exposes SDK → React uses SDK adapter → IPC to main process → secure storage/cache
```

### Security Improvements

1. **Context Isolation**: Renderer has no direct access to Node.js
2. **Sandboxing**: Chromium sandbox enabled
3. **Channel Whitelisting**: Only approved IPC channels work
4. **Credential Encryption**: keytar uses OS-level secure storage
5. **No Remote Module**: Disabled for security

## Migration Steps

### 1. Data Migration

**Old:** Timetable data in `data.js` as global object

```javascript
const timetable = { Sunday: [...], Monday: [...] };
window.timetable = timetable;
```

**New:** Timetable fetched via SDK from backend with local cache

```javascript
// Default data in apps/web/src/data/timetable.js
export const defaultTimetable = { ... };

// Runtime data from SDK
const schedule = await sdk.fetchSchedule();
```

### 2. Time Utilities Migration

**Old:** Functions exposed on window object

```javascript
window.parseTimeRange = parseTimeRange;
```

**New:** ES module exports

```javascript
export { parseTimeRange, parseTimeString };
import { parseTimeRange } from './utils/time-utils';
```

### 3. Theme/Preferences Migration

**Old:** In-memory only (lost on restart)

```javascript
let currentTheme = 'light';
```

**New:** Persisted via SDK

```javascript
const theme = await sdk.getPreference('theme');
await sdk.setPreference('theme', 'dark');
```

### 4. Sound Management Migration

**Old:** Direct Audio API calls

```javascript
new Audio('sounds/complete.wav').play();
```

**New:** Wrapped in SDK with user preferences

```javascript
const soundEnabled = await sdk.getPreference('soundEnabled');
if (soundEnabled) {
  new Audio('/sounds/complete.wav').play();
}
```

## Feature Mapping

### Authentication (NEW)

No equivalent in legacy app. New features:
- Login screen with credentials
- Secure credential storage with keytar
- Auto-login on app restart
- Logout functionality

```javascript
// Usage
const result = await sdk.authenticate({ username, password });
const stored = await sdk.getStoredCredentials();
await sdk.logout();
```

### Schedule Loading

**Legacy:**
```javascript
const daySchedule = window.timetable[day];
```

**New:**
```javascript
const schedule = await sdk.fetchSchedule();
const cachedSchedule = await sdk.getCachedSchedule();
```

### Offline Mode (NEW)

Legacy had no true offline mode (just static data). New app:
- Detects online/offline state
- Automatically uses cache when offline
- Shows sync status in UI
- Syncs when connection restored

### Deep Links (NEW)

```
timetable://open/schedule
timetable://open/preferences
```

Handled in main.js, received in React via SDK event listeners.

### Auto-Update (NEW)

```javascript
// In main.js
autoUpdater.checkForUpdatesAndNotify();

// Events sent to renderer
mainWindow.webContents.send('update-available');
mainWindow.webContents.send('update-downloaded');
```

## Development Workflow

### Legacy

```bash
npm start  # Opens Electron with index.html
```

### New

```bash
# Development with hot-reload
npm run dev

# Production build
npm run build
npm start
```

## Testing Considerations

### Unit Tests

The time parsing tests (`test_parseTimeRange.js`) remain unchanged and work with both CommonJS and ES modules thanks to dual exports.

### Integration Tests

Add tests for:
- SDK adapter functionality
- IPC communication
- Cache persistence
- Credential storage/retrieval
- Offline mode switching

## Backwards Compatibility

The app maintains backwards compatibility:
- Falls back to `data.js` when backend unavailable
- Works offline after initial sync
- Preserves all original features (day selector, card flip, theme toggle, sounds)

## Performance

### Improvements
- React virtual DOM for efficient updates
- Vite build with tree-shaking and code splitting
- Filesystem cache faster than memory-only
- Only re-renders changed components

### Considerations
- Initial bundle size increased (React + dependencies)
- First load slightly slower (mitigated by caching)
- Dev mode requires build step or dev server

## Deployment

### Legacy
```bash
npm install
npm start
```

### New
```bash
# Install all dependencies
npm install
cd apps/web && npm install && cd ../..

# Build React app
npm run build

# Package for distribution
npm run build:electron
```

Output in `dist/` directory ready for distribution.

## Rollback Plan

If rollback needed:
1. Keep legacy files (`index.html`, `renderer.js`, `style.css`)
2. Modify `main.js` to load `index.html` instead of React app
3. Restore old `preload.js`

## Future Enhancements

With the new architecture, these are now possible:
- Real backend API integration
- User authentication with JWT
- Cloud sync across devices
- Real-time schedule updates via WebSocket
- Analytics and usage tracking
- Push notifications for task reminders
- Multi-user support
- Import/export functionality
- Calendar integrations

## Support

For issues during migration:
1. Check console logs in DevTools (Ctrl+Shift+I)
2. Verify `apps/web/dist/` exists and has built files
3. Check IPC channels are whitelisted in `preload.js`
4. Ensure keytar is compiled for your platform
5. Review cache directory permissions

## Conclusion

The migration to React + secure desktop shell provides:
- ✅ Better security with credential encryption
- ✅ Offline support with persistent cache
- ✅ Modern development experience
- ✅ Auto-update capability
- ✅ Deep-link support
- ✅ Maintained feature parity
- ✅ Foundation for future enhancements

All original functionality is preserved while adding enterprise-grade features expected in modern desktop applications.
