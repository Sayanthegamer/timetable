# Quick Start Guide

Get the JEE Timetable desktop app running in 5 minutes!

## Prerequisites

- Node.js 16+ and npm
- Git

## Setup

```bash
# Clone the repository
git clone <repository-url>
cd jee-timetable

# Install dependencies
npm install
cd apps/web && npm install && cd ../..

# Build the React app
cd apps/web && npm run build && cd ../..

# Start the app
npm start
```

## First Run

1. **Authentication**: On first launch, you'll see a login screen
   - Enter any username and password (stored securely with keytar)
   - In offline mode, any credentials work to access cached data

2. **Main Interface**: After login, you'll see:
   - Day selector at the top
   - Schedule cards for the selected day
   - Theme toggle (☀️/🌙)
   - Sound toggle (🔊/🔇)
   - Sync status indicator
   - Logout button

3. **Features to Try**:
   - Click any card to flip and see Bengali quotes
   - Switch between timeline and grid views
   - Change days to see different schedules
   - Toggle dark mode
   - Watch "Live Now" banner highlight current task
   - See progress ring update as tasks complete

## Development Mode

For active development with hot-reload:

```bash
# Terminal 1: Start React dev server
cd apps/web
npm run dev

# Terminal 2: Start Electron (in new terminal)
cd /home/engine/project
npm run dev:electron
```

Or use the combined command:
```bash
npm run dev
```

## Common Commands

```bash
# Run tests
npm test

# Build React app
npm run build

# Build and package Electron app
npm run build:electron

# Start Electron with built app
npm start
```

## Troubleshooting

### "Built app not found" error
```bash
cd apps/web
npm run build
cd ../..
npm start
```

### Module not found errors
```bash
# Clean install
rm -rf node_modules apps/web/node_modules
npm install
cd apps/web && npm install && cd ../..
```

### Electron won't start
- Check if port 3000 is in use (for dev mode)
- Verify `apps/web/dist/index.html` exists (for production)
- Check console for IPC or keytar errors

### Login issues
- Keytar requires native compilation - may need Python and build tools
- On first run, any credentials work (creates new account)
- Credentials stored in OS keychain (secure)

## File Structure

```
jee-timetable/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── package.json         # Root dependencies
├── apps/
│   └── web/            # React application
│       ├── src/
│       ├── public/
│       └── dist/       # Built files (after npm run build)
└── packages/
    └── sdk/            # Shared SDK
```

## Next Steps

- Read [README.md](README.md) for full documentation
- See [MIGRATION.md](MIGRATION.md) for architecture details
- Customize schedule data in `apps/web/src/data/timetable.js`
- Modify quotes in `apps/web/src/data/quotes.js`
- Add new SDK methods in `packages/sdk/src/index.js`

## Demo Features

Try these to see the app in action:

1. **Card Flipping**: Click any schedule card to see motivational/roast quotes in Bengali
2. **Live Updates**: Watch the current task get highlighted automatically
3. **Progress Tracking**: See the completion percentage update in real-time
4. **Offline Mode**: Disconnect network and verify app still works
5. **Theme Switching**: Toggle between light/dark mode (persists across restarts)
6. **Sound Effects**: Enable sounds and complete a task to hear the notification
7. **Day Navigation**: Jump to any day of the week instantly

## Getting Help

- Check logs in DevTools (Ctrl+Shift+I in Electron window)
- Review `MIGRATION.md` for architecture insights
- Verify all dependencies installed: `npm list --depth=0`

Happy coding! 🚀
