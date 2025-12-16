# Quick Start Guide

This guide will help you get the JEE Timetable API running in under 5 minutes.

## Prerequisites Check

```bash
node --version  # Should be 18+
npm --version
docker --version  # Optional, for database
```

## Option 1: Using Docker (Recommended)

### 1. Start the database

```bash
cd services/api
docker-compose up -d
```

Wait ~10 seconds for PostgreSQL to be ready.

### 2. Set up environment

```bash
cp .env.example .env
```

The default `.env.example` values work with Docker Compose out of the box.

### 3. Install dependencies & migrate

```bash
npm install
npm run migrate
npm run seed
```

### 4. Start the server

```bash
npm run dev
```

✅ **API is now running at http://localhost:3001**

Test it:
```bash
curl http://localhost:3001/health
```

## Option 2: Using Existing PostgreSQL

### 1. Update environment

```bash
cd services/api
cp .env.example .env
```

Edit `.env` and change `DATABASE_URL`:
```
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_db"
```

### 2. Install & migrate

```bash
npm install
npm run migrate
npm run seed
```

### 3. Start the server

```bash
npm run dev
```

## Testing the API

### 1. Register a user

```bash
curl -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Save the `accessToken` from the response.

### 2. Get schedules

```bash
curl http://localhost:3001/v1/schedule \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Try the demo user

The seed script creates a demo user:
- Email: `demo@example.com`
- Password: `demo123`

```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123"
  }'
```

## Common Commands

```bash
# Development with hot reload
npm run dev

# Run tests
npm test

# Database operations
npm run migrate        # Apply migrations
npm run seed          # Seed with default data
npm run prisma:studio # Open database GUI
```

## Troubleshooting

### Port 3001 already in use

Change `PORT` in `.env`:
```
PORT=3002
```

### Database connection failed

1. Check PostgreSQL is running: `docker-compose ps`
2. Verify `DATABASE_URL` in `.env`
3. Test connection: `npm run prisma:studio`

### Migration errors

Reset database (⚠️ deletes all data):
```bash
npx prisma migrate reset
```

## Next Steps

- Read the full [README.md](./README.md) for API documentation
- Check out [API endpoints](./README.md#api-endpoints)
- Learn about [WebSocket events](./README.md#websocketssocketio)
- Explore the code in `src/`

## Production Deployment

See [README.md - Production Deployment](./README.md#production-deployment) section.
