import { SyncConfig, Timetable } from './types';
import { ApiClient } from './api-client';

export class SyncEngine {
  private apiClient: ApiClient;
  private storage: any; // Using any for generic storage adapter for now, but should be StorageAdapter
  private autoSync: boolean;

  constructor(config: SyncConfig, apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.storage = config.storage;
    this.autoSync = config.autoSync || false;
  }

  async saveLocal(data: Timetable): Promise<void> {
    await this.storage.setItem('timetable_data', JSON.stringify(data));
    await this.storage.setItem('last_updated', new Date().toISOString());
    if (this.autoSync) {
      await this.sync();
    }
  }

  async loadLocal(): Promise<Timetable | null> {
    const data = await this.storage.getItem('timetable_data');
    return data ? JSON.parse(data) : null;
  }

  async sync(): Promise<void> {
    try {
      const localData = await this.loadLocal();
      if (!localData) return;
      
      // Here we would implement conflict resolution, merging, etc.
      // For now, we push local changes to server.
      await this.apiClient.updateTimetable(localData);
      
      // And fetch latest
      const serverData = await this.apiClient.fetchTimetable();
      if (serverData) {
          await this.storage.setItem('timetable_data', JSON.stringify(serverData));
      }

    } catch (error) {
      console.error('Sync failed:', error);
      // Determine if it's offline
    }
  }
}
