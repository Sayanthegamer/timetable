import type { Schedule, Task, TaskUpdate, ScheduleUpdate } from './types';

export class TimetableAPI {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(baseUrl: string = '/api', getToken: () => string | null) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: { message?: string } = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json() as Promise<T>;
  }

  async getSchedule(): Promise<Schedule> {
    return this.request<Schedule>('/schedule');
  }

  async updateSchedule(update: ScheduleUpdate): Promise<Schedule> {
    return this.request<Schedule>('/schedule', {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  async updateTask(update: TaskUpdate): Promise<Task> {
    return this.request<Task>('/schedule/task', {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  }

  async deleteTask(day: keyof Schedule, taskIndex: number): Promise<void> {
    return this.request<void>('/schedule/task', {
      method: 'DELETE',
      body: JSON.stringify({ day, taskIndex }),
    });
  }

  async addTask(day: keyof Schedule, task: Task): Promise<Schedule> {
    return this.request<Schedule>('/schedule/task', {
      method: 'POST',
      body: JSON.stringify({ day, task }),
    });
  }
}
