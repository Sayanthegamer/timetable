const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const keytar = require('keytar');
const { autoUpdater } = require('electron-updater');

const SERVICE_NAME = 'jee-timetable';
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;
const cacheDir = path.join(app.getPath('userData'), 'cache');
const prefsPath = path.join(app.getPath('userData'), 'preferences.json');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true
    }
  });

  if (isDev) {
    const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
    mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    const distPath = path.join(__dirname, 'apps/web/dist/index.html');
    if (fs.existsSync(distPath)) {
      mainWindow.loadFile(distPath);
    } else {
      console.error('Built app not found, please run: cd apps/web && npm run build');
      app.quit();
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupDeepLinkHandler();
  
  if (!isDev) {
    setupAutoUpdater();
  }
}

function setupDeepLinkHandler() {
  if (process.platform === 'win32') {
    app.setAsDefaultProtocolClient('timetable');
  }

  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
      
      const url = commandLine.find(arg => arg.startsWith('timetable://'));
      if (url) {
        handleDeepLink(url);
      }
    });
  }
}

function handleDeepLink(url) {
  console.log('Deep link received:', url);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('deep-link', url);
  }
}

function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    if (mainWindow) {
      mainWindow.webContents.send('update-available');
    }
  });

  autoUpdater.on('update-downloaded', () => {
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded');
    }
  });

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 3600000);
}

ipcMain.handle('auth', async (event, method, args) => {
  try {
    switch (method) {
      case 'authenticate':
        const { username, password } = args;
        await keytar.setPassword(SERVICE_NAME, username, password);
        await keytar.setPassword(SERVICE_NAME, 'current_user', username);
        return { success: true, user: { username } };

      case 'logout':
        const currentUser = await keytar.getPassword(SERVICE_NAME, 'current_user');
        if (currentUser) {
          await keytar.deletePassword(SERVICE_NAME, currentUser);
          await keytar.deletePassword(SERVICE_NAME, 'current_user');
        }
        return { success: true };

      case 'getStoredCredentials':
        const user = await keytar.getPassword(SERVICE_NAME, 'current_user');
        if (user) {
          const password = await keytar.getPassword(SERVICE_NAME, user);
          return { token: password, username: user };
        }
        return null;

      default:
        throw new Error(`Unknown auth method: ${method}`);
    }
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
});

ipcMain.handle('schedule', async (event, method, args) => {
  try {
    switch (method) {
      case 'fetch':
        const cachedSchedule = await readCache('schedule.json');
        if (!args.forceRefresh && cachedSchedule) {
          return cachedSchedule;
        }

        try {
          const freshSchedule = await fetchScheduleFromBackend();
          await writeCache('schedule.json', freshSchedule);
          if (mainWindow) {
            mainWindow.webContents.send('schedule-updated', freshSchedule);
          }
          return freshSchedule;
        } catch (error) {
          if (cachedSchedule) {
            return cachedSchedule;
          }
          throw error;
        }

      default:
        throw new Error(`Unknown schedule method: ${method}`);
    }
  } catch (error) {
    console.error('Schedule error:', error);
    throw error;
  }
});

ipcMain.handle('cache', async (event, method, args) => {
  try {
    switch (method) {
      case 'getSchedule':
        return await readCache('schedule.json');

      case 'setSchedule':
        await writeCache('schedule.json', args);
        return { success: true };

      default:
        throw new Error(`Unknown cache method: ${method}`);
    }
  } catch (error) {
    console.error('Cache error:', error);
    throw error;
  }
});

ipcMain.handle('preferences', async (event, method, args) => {
  try {
    let prefs = {};
    if (fs.existsSync(prefsPath)) {
      prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf8'));
    }

    switch (method) {
      case 'get':
        return prefs[args] || null;

      case 'set':
        prefs[args.key] = args.value;
        fs.writeFileSync(prefsPath, JSON.stringify(prefs, null, 2));
        return { success: true };

      case 'getAll':
        return prefs;

      default:
        throw new Error(`Unknown preferences method: ${method}`);
    }
  } catch (error) {
    console.error('Preferences error:', error);
    throw error;
  }
});

ipcMain.handle('system', async (event, method, args) => {
  try {
    switch (method) {
      case 'getInfo':
        return {
          platform: process.platform,
          version: app.getVersion(),
          isElectron: true,
          isDev
        };

      default:
        throw new Error(`Unknown system method: ${method}`);
    }
  } catch (error) {
    console.error('System error:', error);
    throw error;
  }
});

async function fetchScheduleFromBackend() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const fallbackSchedule = require('./data.js').timetable;
      resolve(fallbackSchedule);
    }, 1000);
  });
}

async function readCache(filename) {
  const filepath = path.join(cacheDir, filename);
  if (fs.existsSync(filepath)) {
    try {
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }
  return null;
}

async function writeCache(filename, data) {
  const filepath = path.join(cacheDir, filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing cache:', error);
    throw error;
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
