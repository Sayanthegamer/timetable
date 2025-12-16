export class ElectronAdapter {
  constructor() {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('ElectronAdapter can only be used in Electron renderer process');
    }
    this.api = window.electronAPI;
    this.listeners = new Map();
  }

  async invoke(channel, method, args) {
    return this.api.invoke(channel, method, args);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    const wrappedCallback = (data) => callback(data);
    this.api.on(event, wrappedCallback);
    
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      this.api.off(event, callback);
    }
  }
}

export class WebAdapter {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl || 'http://localhost:3000/api';
    this.listeners = new Map();
    this.mockData = null;
  }

  async invoke(channel, method, args) {
    switch (channel) {
      case 'auth':
        return this.handleAuth(method, args);
      case 'schedule':
        return this.handleSchedule(method, args);
      case 'cache':
        return this.handleCache(method, args);
      case 'preferences':
        return this.handlePreferences(method, args);
      case 'system':
        return this.handleSystem(method, args);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }

  async handleAuth(method, args) {
    switch (method) {
      case 'authenticate':
        const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Authentication failed');
        return response.json();
      case 'logout':
        await fetch(`${this.apiBaseUrl}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        localStorage.removeItem('auth_token');
        return { success: true };
      case 'getStoredCredentials':
        return { token: localStorage.getItem('auth_token') };
      default:
        throw new Error(`Unknown auth method: ${method}`);
    }
  }

  async handleSchedule(method, args) {
    if (method === 'fetch') {
      const response = await fetch(`${this.apiBaseUrl}/schedule`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data = await response.json();
      localStorage.setItem('cached_schedule', JSON.stringify(data));
      this.emit('schedule-updated', data);
      return data;
    }
    throw new Error(`Unknown schedule method: ${method}`);
  }

  async handleCache(method, args) {
    switch (method) {
      case 'getSchedule':
        const cached = localStorage.getItem('cached_schedule');
        return cached ? JSON.parse(cached) : null;
      case 'setSchedule':
        localStorage.setItem('cached_schedule', JSON.stringify(args));
        return { success: true };
      default:
        throw new Error(`Unknown cache method: ${method}`);
    }
  }

  async handlePreferences(method, args) {
    switch (method) {
      case 'get':
        return localStorage.getItem(`pref_${args}`);
      case 'set':
        localStorage.setItem(`pref_${args.key}`, args.value);
        return { success: true };
      case 'getAll':
        const prefs = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('pref_')) {
            prefs[key.substring(5)] = localStorage.getItem(key);
          }
        }
        return prefs;
      default:
        throw new Error(`Unknown preferences method: ${method}`);
    }
  }

  async handleSystem(method, args) {
    if (method === 'getInfo') {
      return {
        platform: 'web',
        version: '1.0.0',
        isElectron: false
      };
    }
    throw new Error(`Unknown system method: ${method}`);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  emit(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}
