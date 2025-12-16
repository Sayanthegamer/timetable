# Timetable SDK

A TypeScript SDK for interacting with the JEE Timetable API, providing authentication, schedule management, and real-time updates via Socket.IO.

## Installation

```bash
npm install timetable-sdk
```

## Usage

### Basic Setup

```typescript
import { TimetableSDK } from 'timetable-sdk';

const sdk = new TimetableSDK({
  apiUrl: 'https://api.example.com',
  socketUrl: 'https://api.example.com'
});

await sdk.initialize();
```

### Authentication

```typescript
// Login
await sdk.login('user@example.com', 'password');

// Register
await sdk.register('user@example.com', 'password', 'User Name');

// Check authentication
const isAuthenticated = sdk.auth.isAuthenticated();

// Get current user
const user = await sdk.auth.getCurrentUser();

// Logout
await sdk.logout();
```

### Schedule Management

```typescript
// Get schedule
const schedule = await sdk.api.getSchedule();

// Update entire day schedule
await sdk.api.updateSchedule({
  day: 'Monday',
  tasks: [
    {
      time: '9:00 – 11:00 AM',
      subject: 'Math Study',
      details: 'Chapter 5',
      type: 'maths'
    }
  ]
});

// Update single task
await sdk.api.updateTask({
  day: 'Monday',
  taskIndex: 0,
  task: {
    time: '9:00 – 11:00 AM',
    subject: 'Math Study',
    details: 'Chapter 5',
    type: 'maths'
  }
});

// Add task
await sdk.api.addTask('Monday', {
  time: '2:00 – 4:00 PM',
  subject: 'Physics',
  details: '',
  type: 'physics'
});

// Delete task
await sdk.api.deleteTask('Monday', 0);
```

### Real-time Updates

```typescript
// Listen for schedule updates
sdk.socket.on('schedule:updated', (schedule) => {
  console.log('Schedule updated:', schedule);
});

// Listen for task updates
sdk.socket.on('task:updated', (update) => {
  console.log('Task updated:', update);
});

// Listen for sync events
sdk.socket.on('schedule:sync', (schedule) => {
  console.log('Schedule synced:', schedule);
});

// Remove listener
const handler = (schedule) => console.log(schedule);
sdk.socket.on('schedule:updated', handler);
sdk.socket.off('schedule:updated', handler);

// Check connection status
const isConnected = sdk.socket.isConnected();
```

## API Reference

### TimetableSDK

Main SDK class that orchestrates auth, API, and socket services.

#### Constructor

```typescript
new TimetableSDK(config?: {
  apiUrl?: string;
  socketUrl?: string;
})
```

#### Methods

- `initialize(): Promise<void>` - Initialize SDK and restore session
- `login(email: string, password: string): Promise<void>` - Login user
- `register(email: string, password: string, name: string): Promise<void>` - Register user
- `logout(): Promise<void>` - Logout and disconnect

### AuthService

Handles authentication operations.

#### Methods

- `login(credentials: LoginCredentials): Promise<AuthResponse>`
- `register(credentials: RegisterCredentials): Promise<AuthResponse>`
- `logout(): Promise<void>`
- `getCurrentUser(): Promise<User | null>`
- `getToken(): string | null`
- `isAuthenticated(): boolean`

### TimetableAPI

Handles schedule CRUD operations.

#### Methods

- `getSchedule(): Promise<Schedule>`
- `updateSchedule(update: ScheduleUpdate): Promise<Schedule>`
- `updateTask(update: TaskUpdate): Promise<Task>`
- `addTask(day: keyof Schedule, task: Task): Promise<Schedule>`
- `deleteTask(day: keyof Schedule, taskIndex: number): Promise<void>`

### SocketService

Manages WebSocket connections and real-time events.

#### Methods

- `connect(token: string): void`
- `disconnect(): void`
- `on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void`
- `off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void`
- `emit(event: string, data?: unknown): void`
- `isConnected(): boolean`

## TypeScript Types

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}
```

### Task

```typescript
interface Task {
  time: string;
  subject: string;
  details: string;
  type: 'maths' | 'physics' | 'chemistry' | 'english' | 'computer' | 'bengali' | 'break';
}
```

### Schedule

```typescript
interface Schedule {
  Sunday: Task[];
  Monday: Task[];
  Tuesday: Task[];
  Wednesday: Task[];
  Thursday: Task[];
  Friday: Task[];
  Saturday: Task[];
}
```

### TaskUpdate

```typescript
interface TaskUpdate {
  day: keyof Schedule;
  taskIndex: number;
  task: Task;
}
```

### ScheduleUpdate

```typescript
interface ScheduleUpdate {
  day: keyof Schedule;
  tasks: Task[];
}
```

## Error Handling

All API methods throw errors on failure:

```typescript
try {
  await sdk.api.getSchedule();
} catch (error) {
  console.error('Failed to fetch schedule:', error.message);
}
```

## React Integration

### Using with React Context

```typescript
import { createContext, useContext, useState } from 'react';
import { TimetableSDK } from 'timetable-sdk';

const SDKContext = createContext<TimetableSDK | null>(null);

export function SDKProvider({ children }) {
  const [sdk] = useState(() => new TimetableSDK());
  
  useEffect(() => {
    sdk.initialize();
  }, [sdk]);
  
  return <SDKContext.Provider value={sdk}>{children}</SDKContext.Provider>;
}

export function useSDK() {
  const sdk = useContext(SDKContext);
  if (!sdk) throw new Error('useSDK must be used within SDKProvider');
  return sdk;
}
```

### Using with Hooks

```typescript
import { useEffect, useState } from 'react';
import { useSDK } from './hooks/useSDK';

function ScheduleComponent() {
  const sdk = useSDK();
  const [schedule, setSchedule] = useState(null);
  
  useEffect(() => {
    sdk.api.getSchedule().then(setSchedule);
    
    sdk.socket.on('schedule:updated', setSchedule);
    return () => {
      sdk.socket.off('schedule:updated', setSchedule);
    };
  }, [sdk]);
  
  return <div>{/* render schedule */}</div>;
}
```

## Development

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

## License

MIT
