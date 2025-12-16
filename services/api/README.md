# JEE Timetable API

Backend API for the JEE Timetable application, built with Node.js, TypeScript, Express, PostgreSQL (Prisma), and Socket.IO for real-time updates.

## Features

- **Authentication**
  - Email/password authentication with bcrypt
  - JWT access tokens (15-minute expiry)
  - Refresh tokens (7-day expiry)
  - OAuth hook points for future integration (Google, GitHub)
  
- **Schedule Management**
  - CRUD operations for schedules and lessons
  - Multi-user support with data isolation
  - Timezone support
  - Incremental sync with `updated_since` parameter
  
- **Real-time Updates**
  - WebSocket/Socket.IO rooms for live updates
  - Events: `schedule:updated`, `lesson:created`, `lesson:updated`, `lesson:deleted`
  
- **Device Management**
  - Device session tracking
  - Multi-device support
  
- **Production Ready**
  - Health check endpoint
  - Docker Compose for local development
  - Environment-based configuration
  - Comprehensive error handling
  - Database migrations with Prisma

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 16+ (or Docker)
- Docker and Docker Compose (optional, for containerized database)

## Getting Started

### 1. Install Dependencies

From the root of the monorepo:

```bash
npm install
```

Or directly in the API package:

```bash
cd services/api
npm install
```

### 2. Set Up Database

#### Option A: Using Docker Compose (Recommended)

```bash
cd services/api
docker-compose up -d
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `jee_timetable`
- User: `jee_user`
- Password: `jee_password`

#### Option B: Use Your Own PostgreSQL

Ensure PostgreSQL is running and create a database, then update the `DATABASE_URL` in your `.env` file.

### 3. Configure Environment

Create a `.env` file in `services/api/`:

```bash
cp .env.example .env
```

Edit `.env` to match your setup. Key variables:

```env
DATABASE_URL="postgresql://jee_user:jee_password@localhost:5432/jee_timetable?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-in-production
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
```

⚠️ **Important**: Change `JWT_SECRET` and `REFRESH_TOKEN_SECRET` in production!

### 4. Run Migrations

```bash
npm run migrate
```

This creates all database tables based on the Prisma schema.

### 5. Seed the Database

Populate the database with the default timetable from `data.js`:

```bash
npm run seed
```

This creates:
- A demo user: `demo@example.com` / `demo123`
- A default schedule with all lessons from the original timetable

### 6. Start the Server

#### Development Mode (with hot reload):

```bash
npm run dev
```

#### Production Mode:

```bash
npm run build
npm start
```

The server starts on `http://localhost:3001` (or your configured PORT).

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and database connectivity.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-16T12:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### Authentication

#### Register

```
POST /v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### Login

```
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register.

#### Refresh Token

```
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "accessToken": "new-jwt-token"
}
```

#### Logout

```
POST /v1/auth/logout
Authorization: Bearer {accessToken}
```

Revokes all active refresh tokens for the user.

### Schedules

All schedule endpoints require authentication (`Authorization: Bearer {accessToken}`).

#### Get All Schedules

```
GET /v1/schedule
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "schedules": [
    {
      "id": "uuid",
      "name": "JEE Study Schedule",
      "timezone": "Asia/Kolkata",
      "isActive": true,
      "createdAt": "2024-12-16T12:00:00.000Z",
      "updatedAt": "2024-12-16T12:00:00.000Z",
      "lessons": [...],
      "syncMetadata": {...}
    }
  ]
}
```

#### Get Single Schedule

```
GET /v1/schedule/:id
Authorization: Bearer {accessToken}
```

#### Create Schedule

```
POST /v1/schedule
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "My Custom Schedule",
  "timezone": "Asia/Kolkata"
}
```

#### Update Schedule

```
PATCH /v1/schedule/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false
}
```

#### Delete Schedule

```
DELETE /v1/schedule/:id
Authorization: Bearer {accessToken}
```

#### Sync Schedule

```
GET /v1/schedule/:id/sync?updated_since=2024-12-15T00:00:00.000Z
Authorization: Bearer {accessToken}
```

Returns schedule data with optional filtering by `updated_since` timestamp for incremental sync.

### Lessons

All lesson endpoints require authentication.

#### Get Lessons

```
GET /v1/lessons?scheduleId={scheduleId}&dayOfWeek=Monday
Authorization: Bearer {accessToken}
```

Query parameters:
- `scheduleId` (optional): Filter by schedule
- `dayOfWeek` (optional): Filter by day (Sunday, Monday, etc.)

#### Get Single Lesson

```
GET /v1/lessons/:id
Authorization: Bearer {accessToken}
```

#### Create Lesson

```
POST /v1/lessons
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "scheduleId": "schedule-uuid",
  "dayOfWeek": "Monday",
  "startTime": "9:00 AM",
  "endTime": "11:00 AM",
  "subject": "📐 Math Practice",
  "details": "Algebra problems",
  "type": "maths",
  "order": 0
}
```

#### Update Lesson

```
PATCH /v1/lessons/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "subject": "📐 Advanced Math",
  "startTime": "9:30 AM"
}
```

#### Delete Lesson

```
DELETE /v1/lessons/:id
Authorization: Bearer {accessToken}
```

## WebSocket/Socket.IO

### Connection

Connect to the WebSocket server at `ws://localhost:3001` (or your configured URL).

**Authentication:**

Pass the JWT token during connection:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-access-token'
  }
});
```

### Events

#### Client → Server

- `join:schedule` - Join a schedule room
  ```javascript
  socket.emit('join:schedule', scheduleId);
  ```

- `leave:schedule` - Leave a schedule room
  ```javascript
  socket.emit('leave:schedule', scheduleId);
  ```

#### Server → Client

- `schedule:updated` - Emitted when a schedule is updated
  ```javascript
  socket.on('schedule:updated', (data) => {
    console.log('Schedule updated:', data.schedule);
  });
  ```

- `lesson:created` - Emitted when a lesson is created
  ```javascript
  socket.on('lesson:created', (data) => {
    console.log('New lesson:', data.lesson);
  });
  ```

- `lesson:updated` - Emitted when a lesson is updated
  ```javascript
  socket.on('lesson:updated', (data) => {
    console.log('Updated lesson:', data.lesson);
  });
  ```

- `lesson:deleted` - Emitted when a lesson is deleted
  ```javascript
  socket.on('lesson:deleted', (data) => {
    console.log('Deleted lesson:', data.lesson);
  });
  ```

## Database Schema

### Users
- `id` (UUID, primary key)
- `email` (unique)
- `passwordHash`
- `name`
- `createdAt`, `updatedAt`

### RefreshTokens
- `id`, `token` (unique)
- `userId` (foreign key → Users)
- `expiresAt`, `revoked`

### OAuthAccounts
- `id`, `userId` (foreign key → Users)
- `provider`, `providerAccountId`
- `accessToken`, `refreshToken`, `expiresAt`

### Schedules
- `id`, `userId` (foreign key → Users)
- `name`, `timezone`, `isActive`
- `createdAt`, `updatedAt`

### Lessons
- `id`, `scheduleId` (foreign key → Schedules)
- `dayOfWeek`, `startTime`, `endTime`
- `subject`, `details`, `type`, `order`
- `createdAt`, `updatedAt`

### DeviceSessions
- `id`, `userId` (foreign key → Users)
- `deviceId`, `deviceName`, `userAgent`, `ipAddress`
- `lastActiveAt`, `createdAt`

### SyncMetadata
- `id`, `scheduleId` (foreign key → Schedules)
- `lastSyncedAt`, `syncVersion`, `checksum`

## Development

### Database Commands

```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Create a new migration
npm run migrate

# Deploy migrations (production)
npm run migrate:prod

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database
npm run seed
```

### Running Tests

```bash
npm test
```

Tests are located in the `tests/` directory and use Jest and Supertest.

### Code Structure

```
services/api/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
├── src/
│   ├── config/             # Configuration
│   ├── controllers/        # Route handlers
│   ├── db/                 # Database client
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── schemas/            # Zod validation schemas
│   ├── socket/             # Socket.IO setup
│   ├── utils/              # Utility functions
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
├── tests/                  # Test files
├── .env.example            # Environment template
├── docker-compose.yml      # PostgreSQL container
├── package.json
├── tsconfig.json
└── README.md
```

## OAuth Integration (Future)

The API has hook points for OAuth providers. To implement:

1. Add OAuth client IDs and secrets to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

2. Create OAuth routes in `src/routes/oauth.ts`

3. Use the `OAuthAccount` model to store provider tokens

## Production Deployment

### Environment Variables

Ensure all production environment variables are set:
- Use strong, unique secrets for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- Set `NODE_ENV=production`
- Configure proper `CORS_ORIGIN` (comma-separated list of allowed origins)
- Use a production PostgreSQL database with proper credentials

### Database Migration

Run migrations on the production database:

```bash
npm run migrate:prod
```

### Build and Run

```bash
npm run build
npm start
```

### Docker Deployment (Optional)

You can containerize the API:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Health Checks

Monitor the `/health` endpoint to ensure the API and database are running correctly.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `docker-compose ps` or check your local PostgreSQL service
- Check `DATABASE_URL` in `.env` matches your database credentials
- Ensure the database exists: `psql -U jee_user -d jee_timetable`

### Migration Errors

- Reset database (⚠️ deletes all data): `npx prisma migrate reset`
- Generate client after schema changes: `npm run prisma:generate`

### Authentication Issues

- Verify JWT secrets are consistent across restarts
- Check token expiry times in `.env`
- Ensure `Authorization` header format: `Bearer {token}`

### WebSocket Connection Issues

- Verify CORS settings in `.env`
- Check that the JWT token is valid and passed during connection
- Ensure server is running and accessible

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.
