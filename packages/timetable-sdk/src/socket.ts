import { io, Socket } from 'socket.io-client';
import type { Schedule, TaskUpdate } from './types';

export interface SocketEvents {
  'schedule:updated': (schedule: Schedule) => void;
  'task:updated': (update: TaskUpdate) => void;
  'schedule:sync': (schedule: Schedule) => void;
}

export class SocketService {
  private socket: Socket | null = null;
  private url: string;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  constructor(url: string = '/') {
    this.url = url;
  }

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as (...args: unknown[]) => void);

    if (this.socket?.connected) {
      this.socket.on(event as string, callback as (...args: unknown[]) => void);
    }
  }

  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as (...args: unknown[]) => void);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event as string, callback as (...args: unknown[]) => void);
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
