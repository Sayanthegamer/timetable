# Timetable SDK
Shared TypeScript workspace module that centralizes domain models, validation schemas, and time utility logic.

## Features
- **Time Utils**: `parseTimeRange`, `parseTimeString`
- **Domain Models**: TypeScript interfaces for `Timetable`, `TimetableEntry`
- **API Client**: `ApiClient` for REST + Socket.IO
- **Sync Engine**: Offline-first `SyncEngine`
- **UI Helpers**: Bengali quotes, Day filtering

## Installation
Since this is a workspace package:
```json
"dependencies": {
  "@jee-timetable/timetable-sdk": "*"
}
```

## Usage

### Time Utils
```typescript
import { parseTimeRange } from '@jee-timetable/timetable-sdk';

const [start, end] = parseTimeRange('9:30 AM - 11:00 AM', new Date());
```

### Sync Engine
```typescript
import { SyncEngine, ApiClient } from '@jee-timetable/timetable-sdk';

const apiClient = new ApiClient({
    apiUrl: 'https://api.example.com',
    storage: localStorage // or AsyncStorage
});

const syncEngine = new SyncEngine({
    apiUrl: 'https://api.example.com',
    storage: localStorage,
    autoSync: true
}, apiClient);

// Sync data
await syncEngine.sync();
```

### Bengali Quotes
```typescript
import { getRandomQuote } from '@jee-timetable/timetable-sdk';

const quote = getRandomQuote();
console.log(quote.bengali, quote.translation);
```
