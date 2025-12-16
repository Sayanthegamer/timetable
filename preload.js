const { contextBridge, ipcRenderer } = require('electron');

const ALLOWED_CHANNELS = [
  'auth',
  'schedule',
  'cache',
  'preferences',
  'system'
];

const ALLOWED_EVENTS = [
  'schedule-updated',
  'auth-state-changed',
  'deep-link',
  'update-available',
  'update-downloaded'
];

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, method, args) => {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, method, args);
    }
    throw new Error(`Channel ${channel} is not allowed`);
  },

  on: (event, callback) => {
    if (ALLOWED_EVENTS.includes(event)) {
      const subscription = (_, data) => callback(data);
      ipcRenderer.on(event, subscription);
      return () => ipcRenderer.removeListener(event, subscription);
    }
    throw new Error(`Event ${event} is not allowed`);
  },

  off: (event, callback) => {
    if (ALLOWED_EVENTS.includes(event)) {
      ipcRenderer.removeListener(event, callback);
    }
  }
});
