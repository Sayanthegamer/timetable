import { SyncEngine } from '../src/sync-engine';
import { ApiClient } from '../src/api-client';
import { StorageAdapter } from '../src/types';

// Mock ApiClient and StorageAdapter
const mockStorage: StorageAdapter = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

const mockApiClient = {
  fetchTimetable: jest.fn(),
  updateTimetable: jest.fn()
} as unknown as ApiClient;

describe('Sync Engine', () => {
  let syncEngine: SyncEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    syncEngine = new SyncEngine({
        apiUrl: 'http://localhost',
        storage: mockStorage,
        autoSync: false
    }, mockApiClient);
  });

  test('loadLocal should retrieve data from storage', async () => {
    (mockStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ Monday: [] }));
    const data = await syncEngine.loadLocal();
    expect(mockStorage.getItem).toHaveBeenCalledWith('timetable_data');
    expect(data).toEqual({ Monday: [] });
  });

  test('saveLocal should save data to storage', async () => {
    const data = { Monday: [] };
    await syncEngine.saveLocal(data);
    expect(mockStorage.setItem).toHaveBeenCalledWith('timetable_data', JSON.stringify(data));
    expect(mockStorage.setItem).toHaveBeenCalledWith('last_updated', expect.any(String));
  });

  test('sync should push local changes to server', async () => {
    const data = { Monday: [] };
    (mockStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(data));
    (mockApiClient.fetchTimetable as jest.Mock).mockResolvedValue(data);

    await syncEngine.sync();

    expect(mockApiClient.updateTimetable).toHaveBeenCalledWith(data);
    expect(mockApiClient.fetchTimetable).toHaveBeenCalled();
  });
});
