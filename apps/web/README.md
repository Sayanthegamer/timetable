# Web Client - JEE Timetable

A modern React + Vite + TypeScript web application for managing study schedules with real-time updates and offline support.

## Features

- 🔐 **Authentication**: Secure login and registration
- 📅 **Schedule Management**: View and manage daily timetables
- 🔄 **Real-time Sync**: Socket.IO integration for live updates
- 📴 **Offline Support**: IndexedDB caching with Service Worker
- 🎨 **Responsive Design**: Mobile-first, adaptive layouts
- 🌓 **Theme Toggle**: Light/dark mode support
- 🔊 **Sound Effects**: Interactive audio feedback
- 📊 **Progress Tracking**: Visual stats and completion tracking
- 🇧🇩 **Bengali Quotes**: Motivational and roast flip cards
- ♿ **Accessible**: WCAG compliant with ARIA attributes

## Development

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies from root
npm install

# Or install from web directory
cd apps/web
npm install
```

### Running Locally

```bash
# From root directory
npm run dev --workspace apps/web

# Or from web directory
cd apps/web
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# From root
npm run build --workspace apps/web

# Or from web directory
cd apps/web
npm run build
```

Build output will be in `apps/web/dist/`

### Preview Production Build

```bash
npm run preview --workspace apps/web
```

## Architecture

### Project Structure

```
apps/web/
├── public/           # Static assets
│   ├── sounds/       # Audio files
│   ├── icons/        # PWA icons
│   └── manifest.json # PWA manifest
├── src/
│   ├── components/   # React components
│   │   ├── Auth/     # Login/Register forms
│   │   ├── Dashboard/# Main dashboard
│   │   ├── Schedule/ # Schedule views
│   │   ├── Stats/    # Progress stats
│   │   ├── BengaliCard/ # Quote cards
│   │   └── Layout/   # Header/Footer
│   ├── hooks/        # Custom React hooks
│   │   ├── useSDK.tsx
│   │   ├── useAuth.tsx
│   │   ├── useSchedule.tsx
│   │   └── useTheme.tsx
│   ├── services/     # Services
│   │   ├── db.ts     # IndexedDB wrapper
│   │   └── sound.ts  # Sound manager
│   ├── utils/        # Utilities
│   │   ├── time-utils.ts
│   │   └── bengali-quotes.ts
│   ├── styles/       # CSS files
│   ├── App.tsx       # Root component
│   └── main.tsx      # Entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### State Management

- **SDK Context**: Global SDK instance
- **Auth Context**: User authentication state
- **Theme Context**: Theme preferences
- **Local State**: Component-specific state with hooks

### Data Flow

1. **Initial Load**: 
   - SDK initializes and checks for stored token
   - Fetches user data and schedule from API
   - Caches data in IndexedDB

2. **Real-time Updates**:
   - Socket.IO connection established on auth
   - Listens for `schedule:updated` events
   - Updates state and IndexedDB cache

3. **Offline Mode**:
   - Service Worker caches static assets
   - IndexedDB provides data persistence
   - App works fully offline after first load

## API Integration

The app integrates with the backend API via the `timetable-sdk` package:

### Endpoints Used

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/schedule` - Fetch schedule
- `PUT /api/schedule` - Update schedule
- `PATCH /api/schedule/task` - Update task
- `POST /api/schedule/task` - Add task
- `DELETE /api/schedule/task` - Delete task

### Socket.IO Events

- `schedule:updated` - Schedule changed
- `task:updated` - Single task changed
- `schedule:sync` - Full sync request

## Deployment

### GitHub Pages

1. Build the app:
   ```bash
   npm run build --workspace apps/web
   ```

2. Deploy `apps/web/dist/` to GitHub Pages

3. Configure backend URL in production:
   ```typescript
   // vite.config.ts
   const apiUrl = import.meta.env.PROD 
     ? 'https://your-api.com' 
     : 'http://localhost:3000';
   ```

### Cloudflare Pages

1. Connect repository to Cloudflare Pages

2. Build settings:
   - **Build command**: `npm run build --workspace apps/web`
   - **Build output directory**: `apps/web/dist`
   - **Root directory**: `/`

3. Environment variables:
   - `VITE_API_URL`: Your backend API URL

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json apps/web/
RUN npm install
COPY . .
RUN npm run build --workspace apps/web
EXPOSE 5173
CMD ["npm", "run", "preview", "--workspace", "apps/web"]
```

## Progressive Web App (PWA)

The app is PWA-enabled with:

- **Offline support** via Service Worker
- **Install prompt** for native-like experience
- **App manifest** with icons and metadata
- **Caching strategy** for optimal performance

### Installing as PWA

1. Open the app in a browser
2. Look for "Install" prompt or menu option
3. Click to install to home screen/desktop
4. Launch as standalone app

## Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader friendly

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Code splitting with React lazy loading
- Asset optimization with Vite
- Debounced API calls
- Virtual scrolling for large lists
- Service Worker caching
- IndexedDB for offline data

## Security

- Secure token storage
- HTTPS-only in production
- XSS protection
- CSRF token validation
- Content Security Policy headers

## Troubleshooting

### App won't connect to backend

- Check that backend is running on correct port
- Verify proxy settings in `vite.config.ts`
- Check browser console for CORS errors

### Offline mode not working

- Ensure HTTPS in production (PWA requirement)
- Check Service Worker registration
- Verify IndexedDB is enabled

### Socket.IO disconnections

- Check network connection
- Verify WebSocket support in browser
- Check backend Socket.IO configuration

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Submit pull request
4. Ensure CI passes

## License

MIT
