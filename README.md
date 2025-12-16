# JEE Timetable - Monorepo

A comprehensive study planner for JEE preparation with Electron desktop app, React web client, and TypeScript SDK.

## Project Structure

```
.
├── apps/
│   └── web/              # React + Vite + TypeScript web client
├── packages/
│   └── timetable-sdk/    # TypeScript SDK for API integration
├── main.js               # Electron main process
├── renderer.js           # Electron renderer
├── preload.js            # Electron preload script
├── index.html            # Electron HTML
├── style.css             # Shared CSS
├── data.js               # Schedule data
└── src/
    └── time-utils.js     # Time parsing utilities
```

## Applications

### 🖥️ Electron Desktop App

The original desktop application with a native interface.

**Run:**
```bash
npm start
```

**Features:**
- Native desktop experience
- Offline-first design
- System tray integration
- Bengali motivation/roast cards
- Live task tracking

### 🌐 Web Client (NEW)

Modern React SPA with real-time sync and PWA support.

**Run:**
```bash
npm run dev --workspace apps/web
```

**Features:**
- ✅ Authentication (login/register)
- ✅ Responsive dashboard with timeline/grid views
- ✅ Real-time updates via Socket.IO
- ✅ Offline support with Service Worker + IndexedDB
- ✅ Bengali flip cards
- ✅ Theme toggle (light/dark)
- ✅ Sound effects toggle
- ✅ Progress tracking and stats
- ✅ PWA installable
- ✅ Mobile-friendly

**Build:**
```bash
npm run build --workspace apps/web
```

**Preview:**
```bash
npm run preview --workspace apps/web
```

See [apps/web/README.md](apps/web/README.md) for detailed documentation.

## Packages

### 📦 Timetable SDK

TypeScript SDK for backend API integration.

**Build:**
```bash
npm run build --workspace packages/timetable-sdk
```

**Features:**
- Authentication service
- Schedule CRUD operations
- Socket.IO real-time updates
- Full TypeScript support
- React integration helpers

See [packages/timetable-sdk/README.md](packages/timetable-sdk/README.md) for API documentation.

## Quick Start

### Installation

```bash
npm install
```

This will install dependencies for all workspaces.

### Development

**Desktop App:**
```bash
npm start
```

**Web App:**
```bash
npm run dev
```

The web app will run at `http://localhost:5173` with:
- Mock data (no backend required)
- Hot module replacement
- TypeScript checking
- Auto-reload on changes

### Backend Setup (Optional)

For full functionality with real-time sync:

1. Start your backend API server on `http://localhost:3000`
2. Ensure it implements the endpoints documented in the SDK
3. Set `VITE_API_URL` to disable mock mode:

```bash
VITE_API_URL=http://localhost:3000 npm run dev --workspace apps/web
```

## Features

### Shared Features (All Apps)

- 📅 **Weekly Schedule**: 7-day timetable with subject breakdown
- ⏰ **Live Tracking**: Real-time task highlighting
- 📊 **Progress Stats**: Completion tracking and analytics
- 🎨 **Theme Support**: Light/dark mode
- 🔊 **Sound Effects**: Audio feedback
- 🇧🇩 **Bengali Cards**: Motivational and roast quotes
- 📱 **Responsive**: Works on all screen sizes

### Web-Specific Features

- 🔐 **Authentication**: Secure login/register
- 🔄 **Real-time Sync**: Socket.IO live updates
- 📴 **Offline Mode**: Full offline functionality
- 🚀 **PWA**: Install as native app
- ♿ **Accessible**: WCAG compliant

## Architecture

### Tech Stack

**Electron App:**
- Electron 29
- Vanilla JavaScript
- HTML/CSS

**Web Client:**
- React 18
- TypeScript 5
- Vite 5
- Socket.IO Client
- IndexedDB (idb)
- Vite PWA Plugin

**SDK:**
- TypeScript 5
- Socket.IO Client
- ESM modules

### Data Flow

1. **Authentication**:
   - User logs in via web client
   - SDK stores token in localStorage
   - Token used for API requests and Socket.IO auth

2. **Schedule Loading**:
   - Fetch from API or mock data
   - Cache in IndexedDB
   - Display in UI

3. **Real-time Updates**:
   - Socket.IO connection on auth
   - Listen for `schedule:updated` events
   - Update state and cache automatically

4. **Offline Mode**:
   - Service Worker caches assets
   - IndexedDB persists data
   - App works without network

## Time Utilities

Both desktop and web apps share time parsing logic:

```javascript
import { parseTimeRange, isTaskLive } from './utils/time-utils';

const [start, end] = parseTimeRange('9:00 – 11:00 AM', new Date());
const isLive = isTaskLive('9:00 – 11:00 AM', new Date());
```

**Functions:**
- `parseTimeString(timeStr, baseDate)` - Parse single time
- `parseTimeRange(timeStr, baseDate)` - Parse time range
- `isTaskLive(timeStr, now)` - Check if task is active
- `isTaskCompleted(timeStr, now)` - Check if task is done
- `getTaskProgress(timeStr, now)` - Get completion percentage

## Deployment

### Web Client

**GitHub Pages:**
```bash
npm run build --workspace apps/web
# Deploy apps/web/dist/ to gh-pages branch
```

**Cloudflare Pages:**
- Build command: `npm run build --workspace apps/web`
- Output directory: `apps/web/dist`

**Docker:**
```bash
docker build -t timetable-web -f apps/web/Dockerfile .
docker run -p 5173:5173 timetable-web
```

### Electron Desktop

**Package for distribution:**
```bash
npm run package
```

Requires electron-packager configuration in package.json.

## Development Guidelines

### Code Style

- Use TypeScript for web client and SDK
- Follow existing patterns in codebase
- Add ARIA labels for accessibility
- Use CSS custom properties for theming
- Keep components small and focused

### Time Parsing

- Time parsing functions are in `src/time-utils.js`
- Exported as CommonJS (for tests) and window globals (for browser)
- Web client uses TypeScript version in `apps/web/src/utils/time-utils.ts`

### CSS Management

- Shared CSS in `style.css`
- Web-specific CSS in `apps/web/src/styles/app.css`
- Use CSS custom properties for colors/spacing
- Follow mobile-first responsive design

### Rendering Optimization

- Track `lastRenderedDay` and `lastLiveTask`
- Use DocumentFragment for batch DOM updates
- Debounce expensive operations
- Reset state when switching days

## Testing

**Time parsing tests:**
```bash
npm test
```

**Web client:**
```bash
cd apps/web
npm run dev  # Manual testing in browser
```

## Scripts

**Root level:**
- `npm start` - Run Electron app
- `npm test` - Run time parsing tests
- `npm run dev` - Run web client dev server
- `npm run build` - Build web client

**Web client:**
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**SDK:**
- `npm run build` - Build SDK
- `npm run dev` - Watch mode

## Environment Variables

**Web Client:**

- `VITE_API_URL` - Backend API URL (optional, uses mock if not set)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Known Issues

- Mock mode doesn't persist changes (by design)
- Socket.IO requires WebSocket support
- PWA requires HTTPS in production

## Contributing

1. Create feature branch
2. Make changes following guidelines
3. Test thoroughly
4. Submit pull request

## License

MIT

## Support

For issues or questions:
- Check README files in subdirectories
- Review SDK documentation
- Check browser console for errors
