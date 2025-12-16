# Contributing to JEE Timetable API

Thank you for your interest in contributing! This guide will help you get started with development.

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 16+ (or Docker)
- Git
- Your favorite code editor (VS Code recommended)

### Initial Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository>
   cd jee-timetable/services/api
   npm install
   ```

2. **Set up database**
   ```bash
   docker-compose up -d  # Or configure your own PostgreSQL
   cp .env.example .env
   ```

3. **Run migrations and seed**
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
services/api/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── config/             # Configuration management
│   │   └── index.ts        # Environment config
│   ├── controllers/        # Request handlers
│   │   ├── auth.ts         # Authentication logic
│   │   ├── schedule.ts     # Schedule CRUD
│   │   └── lessons.ts      # Lesson CRUD
│   ├── db/                 # Database client
│   │   └── index.ts        # Prisma client
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # JWT authentication
│   │   ├── validation.ts   # Request validation
│   │   └── errorHandler.ts # Global error handler
│   ├── routes/             # API route definitions
│   │   ├── auth.ts
│   │   ├── schedule.ts
│   │   └── lessons.ts
│   ├── schemas/            # Zod validation schemas
│   │   ├── auth.ts
│   │   └── schedule.ts
│   ├── socket/             # WebSocket/Socket.IO
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── jwt.ts          # JWT operations
│   │   └── password.ts     # Password hashing
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
├── tests/                  # Test files
│   ├── setup.ts
│   ├── auth.test.ts
│   └── schedule.test.ts
└── ...
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode (already configured)
- Define interfaces for all data structures
- Avoid `any` type; use `unknown` if necessary
- Use async/await over callbacks

### Naming Conventions

- **Files**: kebab-case (`auth-controller.ts`)
- **Functions**: camelCase (`getUserById`)
- **Classes**: PascalCase (`AuthController`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces**: PascalCase (`UserPayload`)

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at statement ends
- Use trailing commas in objects/arrays
- Keep functions small and focused
- Write descriptive variable names

### Example Controller

```typescript
import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';
import { CreateItemInput } from '../schemas/item';

export async function createItem(req: AuthRequest, res: Response) {
  try {
    const data = req.body as CreateItemInput;
    
    const item = await prisma.item.create({
      data: {
        ...data,
        userId: req.user!.userId,
      },
    });

    res.status(201).json({ item });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
}
```

## Adding New Features

### 1. Database Changes

If you need to modify the database schema:

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run migrate -- --name add_new_feature

# 3. Generate Prisma Client
npm run prisma:generate
```

### 2. New API Endpoint

Follow these steps:

**a. Define validation schema** (`src/schemas/feature.ts`):
```typescript
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
});

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
```

**b. Create controller** (`src/controllers/feature.ts`):
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';

export async function getFeatures(req: AuthRequest, res: Response) {
  // Implementation
}
```

**c. Define routes** (`src/routes/feature.ts`):
```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createFeatureSchema } from '../schemas/feature';
import { getFeatures, createFeature } from '../controllers/feature';

const router = Router();

router.use(authenticate);
router.get('/', getFeatures);
router.post('/', validate(createFeatureSchema), createFeature);

export default router;
```

**d. Register routes** (`src/app.ts`):
```typescript
import featureRoutes from './routes/feature';
// ...
app.use('/v1/features', featureRoutes);
```

### 3. WebSocket Events

To emit new events:

```typescript
import { getIO } from '../socket';

export async function updateResource(req: AuthRequest, res: Response) {
  // ... update logic
  
  const io = getIO();
  io.to(`user:${req.user!.userId}`).emit('resource:updated', {
    resourceId: resource.id,
    data: resource,
  });
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.ts
```

### Writing Tests

Create test files in `tests/` directory:

```typescript
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/db';

describe('Feature Endpoints', () => {
  let accessToken: string;

  beforeAll(async () => {
    // Setup: create test user, get token
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'demo@example.com', password: 'demo123' });
    accessToken = response.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('GET /v1/features', () => {
    it('should return features', async () => {
      const response = await request(app)
        .get('/v1/features')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('features');
    });
  });
});
```

## Database Management

### Migrations

```bash
# Create a migration
npm run migrate -- --name migration_name

# View migration status
npx prisma migrate status

# Apply migrations (production)
npm run migrate:prod
```

### Prisma Studio

Open a database GUI:

```bash
npm run prisma:studio
```

Access at http://localhost:5555

### Reset Database

⚠️ **This deletes all data!**

```bash
npx prisma migrate reset
```

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Logging

Add debug logs:

```typescript
console.log('Debug:', { userId, scheduleId });
console.error('Error occurred:', error);
```

In development, Prisma queries are logged automatically.

## Common Tasks

### Add a New Field to User Model

1. Update `prisma/schema.prisma`:
   ```prisma
   model User {
     // ... existing fields
     phoneNumber String? @map("phone_number")
   }
   ```

2. Create migration:
   ```bash
   npm run migrate -- --name add_phone_number
   ```

3. Update affected controllers and schemas

### Add OAuth Provider

1. Update `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-secret
   ```

2. Create OAuth route in `src/routes/oauth.ts`

3. Implement provider-specific logic in `src/controllers/oauth.ts`

4. Use `OAuthAccount` model to store tokens

### Add Rate Limiting

```bash
npm install express-rate-limit
```

```typescript
// src/app.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/v1/', limiter);
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Test your changes**
   ```bash
   npm run build
   npm test
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "Add: feature description"
   ```
   
   Use prefixes:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for changes to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Questions?

- Check the [README.md](./README.md) for API documentation
- Review [QUICK_START.md](./QUICK_START.md) for setup help
- See [API_EXAMPLES.md](./API_EXAMPLES.md) for usage examples
- Open an issue for bugs or feature requests

## License

MIT
