export interface TimetableEntry {
  time: string;
  subject: string;
  details: string;
  type: string;
}

export interface Timetable {
  [day: string]: TimetableEntry[];
}

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface AuthConfig {
  apiUrl: string;
  storage: StorageAdapter;
}

export interface SyncConfig {
  apiUrl: string;
  storage: StorageAdapter;
  autoSync?: boolean;
}
