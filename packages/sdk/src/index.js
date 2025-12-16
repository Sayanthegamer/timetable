export const SDK_METHODS = {
  AUTH: 'auth',
  STORAGE: 'storage',
  CACHE: 'cache',
  SCHEDULE: 'schedule',
  PREFERENCES: 'preferences',
  SYSTEM: 'system'
};

export class TimetableSDK {
  constructor(adapter) {
    this.adapter = adapter;
  }

  async authenticate(credentials) {
    return this.adapter.invoke(SDK_METHODS.AUTH, 'authenticate', credentials);
  }

  async logout() {
    return this.adapter.invoke(SDK_METHODS.AUTH, 'logout');
  }

  async getStoredCredentials() {
    return this.adapter.invoke(SDK_METHODS.AUTH, 'getStoredCredentials');
  }

  async fetchSchedule(forceRefresh = false) {
    return this.adapter.invoke(SDK_METHODS.SCHEDULE, 'fetch', { forceRefresh });
  }

  async getCachedSchedule() {
    return this.adapter.invoke(SDK_METHODS.CACHE, 'getSchedule');
  }

  async setCachedSchedule(data) {
    return this.adapter.invoke(SDK_METHODS.CACHE, 'setSchedule', data);
  }

  async getPreference(key) {
    return this.adapter.invoke(SDK_METHODS.PREFERENCES, 'get', key);
  }

  async setPreference(key, value) {
    return this.adapter.invoke(SDK_METHODS.PREFERENCES, 'set', { key, value });
  }

  async getAllPreferences() {
    return this.adapter.invoke(SDK_METHODS.PREFERENCES, 'getAll');
  }

  async getSystemInfo() {
    return this.adapter.invoke(SDK_METHODS.SYSTEM, 'getInfo');
  }

  onScheduleUpdate(callback) {
    return this.adapter.on('schedule-updated', callback);
  }

  onAuthStateChange(callback) {
    return this.adapter.on('auth-state-changed', callback);
  }

  offScheduleUpdate(callback) {
    return this.adapter.off('schedule-updated', callback);
  }

  offAuthStateChange(callback) {
    return this.adapter.off('auth-state-changed', callback);
  }
}
