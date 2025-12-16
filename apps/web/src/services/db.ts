import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Schedule, User } from 'timetable-sdk';

interface TimetableDB extends DBSchema {
  schedule: {
    key: string;
    value: {
      id: string;
      data: Schedule;
      updatedAt: number;
    };
  };
  user: {
    key: string;
    value: {
      id: string;
      data: User;
      updatedAt: number;
    };
  };
}

class DatabaseService {
  private db: IDBPDatabase<TimetableDB> | null = null;
  private readonly DB_NAME = 'timetable-db';
  private readonly VERSION = 1;

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<TimetableDB>(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('schedule')) {
          db.createObjectStore('schedule', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('user')) {
          db.createObjectStore('user', { keyPath: 'id' });
        }
      },
    });
  }

  async saveSchedule(schedule: Schedule): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    await this.db.put('schedule', {
      id: 'current',
      data: schedule,
      updatedAt: Date.now(),
    });
  }

  async getSchedule(): Promise<Schedule | null> {
    await this.initialize();
    if (!this.db) return null;

    const result = await this.db.get('schedule', 'current');
    return result?.data || null;
  }

  async saveUser(user: User): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    await this.db.put('user', {
      id: 'current',
      data: user,
      updatedAt: Date.now(),
    });
  }

  async getUser(): Promise<User | null> {
    await this.initialize();
    if (!this.db) return null;

    const result = await this.db.get('user', 'current');
    return result?.data || null;
  }

  async clear(): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    await this.db.clear('schedule');
    await this.db.clear('user');
  }
}

export const db = new DatabaseService();
