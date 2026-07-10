const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Add logging for diagnostic purposes
const fs = require('fs');
const logFile = path.join(__dirname, 'electron-debug.log');
function log(msg) {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
}

log('Electron script started');

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err.message}\nStack: ${err.stack}`);
  if (err.code !== 'EADDRINUSE') {
    app.quit();
  } else {
    log('Port is already in use. Continuing execution...');
  }
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Start the Express server
let server;
try {
  log('Starting Express server...');
  server = require('./server');
  log('Express server started successfully');
} catch (err) {
  log(`Failed to start Express server: ${err.message}\nStack: ${err.stack}`);
}

const isDev = process.argv.includes('--dev');
const PORT = process.env.PORT || 3987;
const baseUrl = isDev ? 'http://localhost:5173' : `http://localhost:${PORT}`;

let mainWindow;

function createWindow() {
  log('Instantiating BrowserWindow...');
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'The Loomist — Fashion History & Style',
    icon: fs.existsSync(path.join(__dirname, 'public', 'favicon.ico'))
      ? path.join(__dirname, 'public', 'favicon.ico')
      : undefined,
    backgroundColor: '#e6eded',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: false,
    show: true // Show immediately
  });

  // Open external links in user's default browser, but allow Firebase Auth popups
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('firebaseapp.com') || url.includes('googleapis.com')) {
      return { action: 'allow' };
    }
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      if (!url.startsWith(baseUrl)) {
        event.preventDefault();
        shell.openExternal(url);
      }
    }
  });

  // Load the application
  log(`Loading URL: ${baseUrl}`);
  mainWindow.loadURL(baseUrl);

  mainWindow.webContents.on('did-finish-load', () => {
    log('webContents did-finish-load fired');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`webContents did-fail-load: ${errorCode} - ${errorDescription}`);
  });

  mainWindow.on('closed', () => {
    log('mainWindow closed event fired');
    mainWindow = null;
  });
}

// Custom application menu
function createMenu() {
  const template = [
    {
      label: 'The Loomist',
      submenu: [
        {
          label: 'Home',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow.loadURL(`${baseUrl}`)
        },
        {
          label: 'Admin Dashboard',
          accelerator: 'CmdOrCtrl+D',
          click: () => mainWindow.loadURL(`${baseUrl}/admin`)
        },
        { type: 'separator' },
        {
          label: 'Instagram',
          click: () => shell.openExternal('https://www.instagram.com/the.loomist_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==')
        },
        { type: 'separator' },
        { role: 'quit', label: 'Exit The Loomist' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Refresh' },
        { role: 'forceReload', label: 'Hard Refresh' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Fashion History',
          click: () => mainWindow.loadURL(`${baseUrl}/#history`)
        },
        {
          label: "Men's Fashion",
          click: () => mainWindow.loadURL(`${baseUrl}/#men`)
        },
        {
          label: "Women's Fashion",
          click: () => mainWindow.loadURL(`${baseUrl}/#women`)
        },
        {
          label: 'Posts & Photos',
          click: () => mainWindow.loadURL(`${baseUrl}/#posts`)
        },
        { type: 'separator' },
        {
          label: 'Contact',
          click: () => mainWindow.loadURL(`${baseUrl}/#contact`)
        }
      ]
    },
    {
      label: 'Developer',
      submenu: [
        { role: 'toggleDevTools', label: 'Developer Tools' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(() => {
  log('Electron app ready');
  createMenu();
  try {
    createWindow();
    log('createWindow finished successfully');
  } catch (err) {
    log(`Failed to create window: ${err.message}\nStack: ${err.stack}`);
  }

  app.on('activate', () => {
    log('Electron app activated');
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  log('All windows closed');
  if (process.platform !== 'darwin') {
    log('Quitting Electron app');
    app.quit();
  }
});
