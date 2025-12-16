# API Examples

Real-world examples for using the JEE Timetable API.

## Authentication Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "abc123...",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### 3. Refresh Access Token

When your access token expires (default: 15 minutes):

```bash
curl -X POST http://localhost:3001/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 4. Logout

```bash
curl -X POST http://localhost:3001/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Schedule Management

### Get All Schedules

```bash
curl http://localhost:3001/v1/schedule \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a New Schedule

```bash
curl -X POST http://localhost:3001/v1/schedule \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend Study Plan",
    "timezone": "Asia/Kolkata"
  }'
```

### Get Single Schedule with Lessons

```bash
curl http://localhost:3001/v1/schedule/SCHEDULE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Schedule

```bash
curl -X PATCH http://localhost:3001/v1/schedule/SCHEDULE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Weekend Plan",
    "isActive": true
  }'
```

### Sync Schedule (Incremental)

Get only lessons updated after a specific time:

```bash
curl "http://localhost:3001/v1/schedule/SCHEDULE_ID/sync?updated_since=2024-12-15T00:00:00.000Z" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Delete Schedule

```bash
curl -X DELETE http://localhost:3001/v1/schedule/SCHEDULE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Lesson Management

### Get All Lessons

Get all lessons for the authenticated user:

```bash
curl http://localhost:3001/v1/lessons \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Lessons by Schedule

```bash
curl "http://localhost:3001/v1/lessons?scheduleId=SCHEDULE_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Lessons by Day

```bash
curl "http://localhost:3001/v1/lessons?dayOfWeek=Monday" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Lessons by Schedule and Day

```bash
curl "http://localhost:3001/v1/lessons?scheduleId=SCHEDULE_ID&dayOfWeek=Monday" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a Lesson

```bash
curl -X POST http://localhost:3001/v1/lessons \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": "SCHEDULE_ID",
    "dayOfWeek": "Monday",
    "startTime": "9:00 AM",
    "endTime": "11:00 AM",
    "subject": "📐 Advanced Calculus",
    "details": "Chapter 5: Derivatives",
    "type": "maths",
    "order": 0
  }'
```

### Update a Lesson

```bash
curl -X PATCH http://localhost:3001/v1/lessons/LESSON_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "📐 Advanced Calculus - Integration",
    "details": "Chapter 6: Integration techniques",
    "startTime": "9:30 AM"
  }'
```

### Delete a Lesson

```bash
curl -X DELETE http://localhost:3001/v1/lessons/LESSON_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## WebSocket Examples

### JavaScript/Node.js Client

```javascript
import io from 'socket.io-client';

// Connect with JWT token
const socket = io('http://localhost:3001', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server');
  
  // Join a schedule room to receive updates
  socket.emit('join:schedule', 'SCHEDULE_ID');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Listen for schedule updates
socket.on('schedule:updated', (data) => {
  console.log('Schedule updated:', data.schedule);
  // Update your UI with the new schedule data
});

// Listen for lesson events
socket.on('lesson:created', (data) => {
  console.log('New lesson created:', data.lesson);
});

socket.on('lesson:updated', (data) => {
  console.log('Lesson updated:', data.lesson);
});

socket.on('lesson:deleted', (data) => {
  console.log('Lesson deleted:', data.lesson);
});

// Leave a schedule room
socket.emit('leave:schedule', 'SCHEDULE_ID');
```

### React Example

```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ScheduleComponent({ accessToken, scheduleId }) {
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      auth: { token: accessToken }
    });

    socket.on('connect', () => {
      socket.emit('join:schedule', scheduleId);
    });

    socket.on('schedule:updated', (data) => {
      if (data.scheduleId === scheduleId) {
        setSchedule(data.schedule);
      }
    });

    socket.on('lesson:created', (data) => {
      // Refresh schedule or add lesson to state
      console.log('New lesson:', data.lesson);
    });

    return () => {
      socket.emit('leave:schedule', scheduleId);
      socket.disconnect();
    };
  }, [accessToken, scheduleId]);

  return (
    <div>
      {schedule && (
        <div>
          <h2>{schedule.name}</h2>
          {/* Render lessons */}
        </div>
      )}
    </div>
  );
}
```

## Complete Workflow Example

### Building a Study Schedule App

```bash
#!/bin/bash

API_URL="http://localhost:3001"

# 1. Register
echo "Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "study2024",
    "name": "Study Student"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.accessToken')
echo "Access Token: $TOKEN"

# 2. Create a schedule
echo -e "\nCreating schedule..."
SCHEDULE_RESPONSE=$(curl -s -X POST $API_URL/v1/schedule \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JEE Preparation 2024",
    "timezone": "Asia/Kolkata"
  }')

SCHEDULE_ID=$(echo $SCHEDULE_RESPONSE | jq -r '.schedule.id')
echo "Schedule ID: $SCHEDULE_ID"

# 3. Add lessons
echo -e "\nAdding Monday lessons..."
curl -s -X POST $API_URL/v1/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"scheduleId\": \"$SCHEDULE_ID\",
    \"dayOfWeek\": \"Monday\",
    \"startTime\": \"7:00 AM\",
    \"endTime\": \"9:00 AM\",
    \"subject\": \"📘 Physics Self-Study\",
    \"details\": \"Mechanics revision\",
    \"type\": \"physics\",
    \"order\": 0
  }" | jq '.'

curl -s -X POST $API_URL/v1/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"scheduleId\": \"$SCHEDULE_ID\",
    \"dayOfWeek\": \"Monday\",
    \"startTime\": \"9:30 AM\",
    \"endTime\": \"11:30 AM\",
    \"subject\": \"📐 Math Practice\",
    \"details\": \"Algebra problems\",
    \"type\": \"maths\",
    \"order\": 1
  }" | jq '.'

# 4. Get the complete schedule
echo -e "\nFetching complete schedule..."
curl -s $API_URL/v1/schedule/$SCHEDULE_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\nDone!"
```

## Error Handling

### Invalid Token

```bash
curl http://localhost:3001/v1/schedule \
  -H "Authorization: Bearer invalid_token"
```

**Response (401):**
```json
{
  "error": "Invalid token"
}
```

### Validation Error

```bash
curl -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }'
```

**Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "email",
      "message": "Invalid email address"
    },
    {
      "path": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### Not Found

```bash
curl http://localhost:3001/v1/schedule/non-existent-id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (404):**
```json
{
  "error": "Schedule not found"
}
```

## Rate Limiting (Future Enhancement)

To add rate limiting, install `express-rate-limit`:

```bash
npm install express-rate-limit
```

Add to `src/app.ts`:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/v1/', limiter);
```

## Postman Collection

You can import these examples into Postman by creating a new collection with the following structure:

1. Set up an environment variable `{{baseUrl}}` = `http://localhost:3001`
2. Set up an environment variable `{{accessToken}}` (populate after login)
3. Add requests as shown above
4. Use `{{baseUrl}}` and `{{accessToken}}` in your requests

## Testing with HTTPie

If you prefer HTTPie over curl:

```bash
# Register
http POST :3001/v1/auth/register email=test@example.com password=test123 name="Test User"

# Login
http POST :3001/v1/auth/login email=test@example.com password=test123

# Get schedules (with token)
http GET :3001/v1/schedule Authorization:"Bearer YOUR_TOKEN"
```
