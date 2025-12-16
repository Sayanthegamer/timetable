import { io, Socket } from 'socket.io-client';
import { AuthConfig, StorageAdapter } from './types';

export class ApiClient {
  private apiUrl: string;
  private storage: StorageAdapter;
  private token: string | null = null;
  private socket: Socket | null = null;

  constructor(config: AuthConfig) {
    this.apiUrl = config.apiUrl;
    this.storage = config.storage;
  }

  async initialize() {
    this.token = await this.storage.getItem('auth_token');
    if (this.token) {
      this.connectSocket();
    }
  }

  private connectSocket() {
    if (this.socket) return;
    this.socket = io(this.apiUrl, {
      auth: {
        token: this.token
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  async login(credentials: any): Promise<void> {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.token = data.token;
    await this.storage.setItem('auth_token', this.token!);
    this.connectSocket();
  }

  async logout(): Promise<void> {
    this.token = null;
    await this.storage.removeItem('auth_token');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async fetchTimetable(): Promise<any> {
    return this.request('/timetable');
  }
  
  async updateTimetable(data: any): Promise<any> {
      return this.request('/timetable', {
          method: 'POST',
          body: JSON.stringify(data)
      });
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers
    };

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
       // Handle token refresh logic here if needed
       // For now, simple logout
       await this.logout();
       throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}
