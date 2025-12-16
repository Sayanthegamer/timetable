# JEE Timetable

A comprehensive study schedule management system for JEE (Joint Entrance Examination) preparation, featuring an Electron desktop app and a cloud-ready REST API with real-time synchronization.

## 📦 Project Structure

This is an npm workspace monorepo containing:

```
jee-timetable/
├── services/
│   └── api/                    # Backend API (Node.js + TypeScript + PostgreSQL)
│       ├── src/                # Source code
│       ├── prisma/             # Database schema & migrations
│       ├── tests/              # API tests
│       └── README.md           # API documentation
├── src/                        # Desktop app utilities
│   └── time-utils.js          # Time parsing functions
├── sounds/                     # Audio assets
├── data.js                     # Timetable data structure
├── index.html                  # Main app UI
├── renderer.js                 # Frontend logic
├── style.css                   # Styles
├── main.js                     # Electron main process
├── preload.js                  # Electron preload script
└── package.json                # Workspace root
```

## 🚀 Quick Start

### Desktop App Only

```bash
npm install
npm start
```

The Electron app launches with the JEE study schedule interface.

### Backend API Setup

See [services/api/QUICK_START.md](services/api/QUICK_START.md) for detailed setup.

**Quick version:**

```bash
# 1. Start PostgreSQL
cd services/api
docker-compose up -d

# 2. Install & migrate
npm install
npm run migrate
npm run seed

# 3. Start API server
npm run dev
```

API runs on http://localhost:3001

## 🎯 Features

### Desktop App
- 📅 **Weekly Schedule View** - Visualize your entire week
- 🎨 **Beautiful UI** - Glassmorphic design with dark/light themes
- 🔔 **Live Updates** - Real-time highlighting of current tasks
- 📊 **Progress Tracking** - Daily completion statistics
- 🎵 **Sound Effects** - Audio notifications for task completion
- 📱 **Responsive** - Works on various screen sizes
- 🌐 **Static Hosting** - Deploy to GitHub Pages

### Backend API
- 🔐 **Authentication** - JWT + refresh tokens, OAuth ready
- 📚 **Schedule Management** - Full CRUD for schedules and lessons
- 🔄 **Real-time Sync** - WebSocket updates via Socket.IO
- 📱 **Multi-device** - Device session tracking
- ☁️ **Cloud Ready** - Docker + PostgreSQL + migrations
- 🧪 **Well Tested** - Jest integration tests
- 📖 **Documented** - Comprehensive API docs

## 📚 Documentation

### Desktop App
- [Time Parsing Tests](test_parseTimeRange.js) - Unit tests for time utilities

### Backend API
- [API README](services/api/README.md) - Full API documentation
- [Quick Start Guide](services/api/QUICK_START.md) - Get running in 5 minutes
- [API Examples](services/api/API_EXAMPLES.md) - curl & JavaScript examples
- [Contributing Guide](services/api/CONTRIBUTING.md) - Development guidelines

## 🛠️ Development

### Workspace Commands

From the root directory:

```bash
# Desktop app
npm start              # Launch Electron app
npm test               # Run time parsing tests

# Backend API
npm run api:dev        # Start API dev server
npm run api:build      # Build API TypeScript
npm run api:start      # Run API in production
npm run api:test       # Run API tests
npm run api:migrate    # Apply database migrations
```

### Tech Stack

**Desktop App:**
- Electron 29
- Vanilla JavaScript
- HTML5/CSS3 (Glassmorphism)

**Backend API:**
- Node.js 18+ with TypeScript
- Express.js
- PostgreSQL 16+ with Prisma ORM
- Socket.IO for WebSockets
- JWT authentication with bcrypt
- Jest + Supertest for testing

## 🔧 Configuration

### Desktop App
Edit `data.js` to customize your schedule.

### Backend API
Copy `services/api/.env.example` to `services/api/.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for access tokens
- `REFRESH_TOKEN_SECRET` - Secret for refresh tokens
- `CORS_ORIGIN` - Allowed origins for CORS

## 🧪 Testing

### Desktop App Tests
```bash
npm test
```

### API Tests
```bash
npm run api:test
```

## 🚢 Deployment

### Desktop App
Package for distribution:
```bash
npm install electron-packager
npx electron-packager . JEE-Timetable --platform=win32,darwin,linux --arch=x64
```

Or deploy to GitHub Pages for web access.

### Backend API

**Using Docker:**
```bash
cd services/api
docker build -t jee-timetable-api .
docker run -p 3001:3001 --env-file .env jee-timetable-api
```

**Using Cloud Platforms:**
- Deploy PostgreSQL (AWS RDS, Heroku Postgres, etc.)
- Deploy API (Heroku, Railway, Render, AWS ECS, etc.)
- Set environment variables
- Run migrations: `npm run migrate:prod`

See [services/api/README.md#production-deployment](services/api/README.md#production-deployment) for details.

## 📊 Database Schema

The API uses PostgreSQL with these main tables:
- **Users** - User accounts with email/password
- **Schedules** - User-owned study schedules
- **Lessons** - Individual schedule items (day, time, subject)
- **RefreshTokens** - JWT refresh token management
- **OAuthAccounts** - OAuth provider integrations
- **DeviceSessions** - Multi-device session tracking
- **SyncMetadata** - Schedule version tracking

## 🔌 API Endpoints

**Authentication:**
- `POST /v1/auth/register` - Create account
- `POST /v1/auth/login` - Login
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout

**Schedules:**
- `GET /v1/schedule` - List schedules
- `GET /v1/schedule/:id` - Get schedule with lessons
- `POST /v1/schedule` - Create schedule
- `PATCH /v1/schedule/:id` - Update schedule
- `DELETE /v1/schedule/:id` - Delete schedule
- `GET /v1/schedule/:id/sync?updated_since=<ISO_DATE>` - Incremental sync

**Lessons:**
- `GET /v1/lessons?scheduleId=&dayOfWeek=` - List lessons
- `GET /v1/lessons/:id` - Get lesson
- `POST /v1/lessons` - Create lesson
- `PATCH /v1/lessons/:id` - Update lesson
- `DELETE /v1/lessons/:id` - Delete lesson

**Health:**
- `GET /health` - Health check

See [services/api/API_EXAMPLES.md](services/api/API_EXAMPLES.md) for usage examples.

## 🔄 Real-time Updates

The API supports WebSocket connections for live schedule updates:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_ACCESS_TOKEN' }
});

socket.emit('join:schedule', scheduleId);

socket.on('schedule:updated', (data) => {
  console.log('Schedule updated:', data.schedule);
});
```

Events: `schedule:updated`, `lesson:created`, `lesson:updated`, `lesson:deleted`

## 🤝 Contributing

We welcome contributions! Please see [services/api/CONTRIBUTING.md](services/api/CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📝 License

MIT

## 🙏 Acknowledgments

- Built for JEE aspirants to organize their study schedule
- Uses emoji icons for visual subject identification
- Inspired by modern productivity tools

## 📧 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the documentation in `services/api/README.md`
- Review API examples in `services/api/API_EXAMPLES.md`

## 🎓 Demo Credentials

The seeded database includes a demo account:
- **Email:** demo@example.com
- **Password:** demo123

Use these to test the API without creating a new account.
