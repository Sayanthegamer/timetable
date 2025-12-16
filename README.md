# JEE Timetable - Electron Desktop Application

A modern desktop application for managing your JEE study timetable, built with Electron and React.

## Features

- 🔐 **Secure Authentication**: Uses keytar for encrypted credential storage
- 💾 **Offline-First**: Works without network after initial sync with filesystem-backed cache
- 🔄 **Auto-Updates**: Automatic update notifications and installation
- 🔗 **Deep Linking**: Support for `timetable://` protocol
- 🎨 **Theme Toggle**: Light/Dark mode support
- 🔊 **Sound Effects**: Optional audio feedback for task completion
- 📊 **Multiple Views**: Timeline and Grid layout options
- 📈 **Progress Tracking**: Real-time tracking of completed tasks
- 💪 **Bengali Quotes**: Motivational and roast quotes on card flip
- 🌐 **Cross-Platform**: Works on Windows, macOS, and Linux

## Project Structure

```
jee-timetable/
├── main.js                 # Electron main process (desktop shell)
├── preload.js             # Hardened preload script with secure SDK
├── data.js                # Legacy data (fallback for offline mode)
├── apps/
│   └── web/               # React web application
│       ├── src/
│       │   ├── main.jsx           # React entry point
│       │   ├── App.jsx            # Main app component
│       │   ├── App.css            # Styles
│       │   ├── components/
│       │   │   ├── AuthScreen.jsx      # Authentication UI
│       │   │   └── TimetableApp.jsx    # Main timetable component
│       │   ├── data/
│       │   │   ├── quotes.js     # Bengali quotes
│       │   │   └── timetable.js  # Default schedule data
│       │   └── utils/
│       │       └── time-utils.js # Time parsing utilities
│       ├── public/        # Static assets (sounds, icons)
│       └── package.json   # React app dependencies
├── packages/
│   └── sdk/               # Shared SDK for Electron ↔ Web communication
│       └── src/
│           ├── index.js   # SDK interface
│           └── adapter.js # Electron & Web adapters
└── package.json           # Root Electron dependencies
```

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Python (for keytar native module compilation)

### Installation

```bash
# Install root dependencies (Electron + desktop modules)
npm install

# Install React app dependencies
cd apps/web
npm install
cd ../..
```

### Running in Development Mode

#### Option 1: Run built React app in Electron
```bash
# Build the React app first
npm run build

# Start Electron with the built app
npm start
```

#### Option 2: Run with hot-reload (development mode)
```bash
# Terminal 1: Start Vite dev server
npm run dev:web

# Terminal 2: Start Electron pointing to dev server
npm run dev:electron

# Or use concurrently to run both
npm run dev
```

### Building for Production

```bash
# Build React app and package Electron
npm run build:electron
```

The packaged application will be in the `dist/` directory.

## Architecture

### Electron Main Process (`main.js`)

- Creates the BrowserWindow
- Loads the React app (dev server in development, built files in production)
- Handles IPC communication via channels: `auth`, `schedule`, `cache`, `preferences`, `system`
- Manages secure credential storage with keytar
- Implements filesystem-backed offline cache
- Sets up deep-link handling (`timetable://`)
- Configures auto-updater

### Preload Script (`preload.js`)

Hardened bridge between main and renderer processes:
- Only exposes whitelisted IPC channels
- Uses `contextIsolation` for security
- Provides safe SDK interface via `window.electronAPI`

### SDK Layer (`packages/sdk`)

Abstraction layer for platform-specific functionality:
- **TimetableSDK**: High-level API for authentication, schedule, cache, preferences
- **ElectronAdapter**: Electron-specific implementation
- **WebAdapter**: Browser fallback (uses localStorage, fetch API)

### React App (`apps/web`)

Modern React application with:
- **AuthScreen**: Login interface
- **TimetableApp**: Main schedule view with day selector, progress tracking, card flips
- Theme and sound preferences
- Offline/online status indicator
- Real-time schedule updates

## Security Features

1. **Context Isolation**: Renderer process isolated from Node.js APIs
2. **Sandbox**: Renderer runs in Chromium sandbox
3. **No Remote Module**: Remote module disabled
4. **Whitelisted IPC**: Only approved channels allowed
5. **Keytar Integration**: OS-level credential encryption (Keychain on macOS, Credential Vault on Windows, libsecret on Linux)

## Offline Support

The app caches schedule data in the user's app data directory:
- **Windows**: `%APPDATA%/jee-timetable/cache/`
- **macOS**: `~/Library/Application Support/jee-timetable/cache/`
- **Linux**: `~/.config/jee-timetable/cache/`

When offline, the app automatically uses cached data and displays an offline indicator.

## Deep Links

The app registers the `timetable://` protocol:
```
timetable://open/schedule
timetable://open/preferences
```

## Auto-Updates

In production builds, the app checks for updates:
- On startup
- Every hour
- Notifies user when update is available
- Downloads and installs in background

## Testing

```bash
# Run unit tests for time parsing
npm test
```

## Legacy Files

The following files are kept for backward compatibility and will be retired in future versions:
- `index.html` - Old static HTML (replaced by React app)
- `renderer.js` - Old vanilla JS renderer (replaced by React components)
- `style.css` - Old styles (migrated to React app)

## Environment Variables

- `NODE_ENV`: Set to `development` to load dev server
- `VITE_DEV_SERVER_URL`: Custom dev server URL (default: `http://localhost:3000`)

## Contributing

When making changes:
1. Follow existing code patterns
2. Test both development and production builds
3. Ensure offline mode works
4. Verify deep links on target platform
5. Test auto-update flow

## License

Proprietary - All rights reserved
