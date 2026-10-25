// ==============================================================================
// ELECTRON DESKTOP RUNNER (Windows 7 & Windows 11 Production Build)
// Pinned to Electron 22.3.27 LTS for guaranteed Windows 7 compatibility
// ==============================================================================

// 1. Initialize Runtime Error Logger FIRST before any other logic
const runtimeLogger = require('./runtime-logger.cjs');
runtimeLogger.info('BOOT', 'electron-main.cjs loaded. Commencing early initialization.');

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Attach Electron app lifecycle events to logger
runtimeLogger.attachElectronApp(app);

// 2. Hardware Acceleration & Windows 7 Legacy Driver Safeguard
// Windows 7 graphic drivers often crash in Chromium 108 GPU process.
if (runtimeLogger.isWindows7 || process.argv.includes('--disable-gpu')) {
  runtimeLogger.warn('GPU_CONFIG', 'Windows 7 / Legacy OS detected. Disabling hardware GPU acceleration for crash prevention.');
  try {
    app.disableHardwareAcceleration();
    app.commandLine.appendSwitch('disable-gpu');
    app.commandLine.appendSwitch('disable-software-rasterizer');
    app.commandLine.appendSwitch('disable-gpu-compositing');
    app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');
  } catch (err) {
    runtimeLogger.error('GPU_CONFIG', 'Failed to configure GPU flags', err);
  }
}

// 3. Load SQLite Manager with error logging
let sqliteManager;
try {
  sqliteManager = require('./sqlite-manager.cjs');
  runtimeLogger.info('SQLITE_MODULE', 'sqlite-manager.cjs loaded successfully');
} catch (err) {
  runtimeLogger.error('SQLITE_MODULE', 'Failed to load sqlite-manager.cjs', err);
  runtimeLogger.showFatalErrorDialog('خطای بارگذاری ماژول دیتابیس', err.stack || err.message);
}

// Determine Role & Environment
const exeName = path.basename(process.execPath || '').toLowerCase();
const isWarehouse =
  exeName.includes('warehouse') ||
  process.argv.includes('--warehouse') ||
  process.env.APP_ENV === 'WAREHOUSE_WIN7' ||
  process.env.APP_ENV === 'WAREHOUSE';

const appRole = isWarehouse ? 'WAREHOUSE_WIN7' : 'OFFICE_WIN11';
const deviceId = isWarehouse ? 'WAREHOUSE-PC-001' : 'OFFICE-PC-001';
const appTitle = isWarehouse
  ? 'سیستم انبارداری ام گاز - ترمینال انبار مرکزی (ویندوز 7)'
  : 'سیستم انبارداری ام گاز - سیستم آفیس مرکزی (ویندوز 11)';

runtimeLogger.info('ROLE_CONFIG', `App Role: ${appRole} | Device: ${deviceId} | Exe: ${exeName}`);

let mainWindow = null;

// 4. Single Instance Lock: Ensure only one instance of the app runs per machine
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  runtimeLogger.warn('SINGLE_INSTANCE', 'Another instance of the application is already running or previous process is stuck. Alerting user and exiting.');
  dialog.showErrorBox(
    'برنامه در حال حاضر در حال اجرا است (Application Already Running)',
    'یک نسخه از سیستم انبارداری ام گاز هم‌اکنون در حافظه سیستم در حال اجرا است.\n\nاگر پنجره برنامه را مشاهده نمی‌کنید:\n1. کلیدهای ترکیبی Ctrl + Shift + Esc را فشار دهید تا Task Manager باز شود.\n2. پروسه مربوط به Warehouse.exe یا Office.exe را پیدا کرده و روی دکمه End Process یا End Task کلیک نمایید.\n3. مجدداً روی آیکون برنامه دابل کلیک کنید.'
  );
  app.quit();
} else {
  app.on('second-instance', () => {
    runtimeLogger.info('SECOND_INSTANCE', 'Secondary instance launch detected. Focusing existing window.');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

runtimeLogger.info('PLATFORM', `Electron: ${process.versions.electron}, Node: ${process.versions.node}, Platform: ${process.platform}`);

async function createWindow() {
  runtimeLogger.info('WINDOW_CREATION', 'Beginning window creation sequence...');

  let rootDir = '';
  try {
    rootDir = sqliteManager.getAppRootDirectory(app);
    runtimeLogger.info('DIR_CHECK', `Application installation root resolved: ${rootDir}`);
  } catch (err) {
    runtimeLogger.error('DIR_CHECK', 'Failed to resolve app root directory', err);
  }

  // 1. Verify directory write permissions
  if (rootDir) {
    const permCheck = sqliteManager.verifyDirectoryWritePermission(rootDir);
    if (!permCheck.writable) {
      runtimeLogger.warn('PERMISSIONS', `Directory not writable: ${rootDir}`, permCheck.error);
      dialog.showErrorBox(
        'خطای سطح دسترسی دایرکتوری (Database Directory Write Permission Error)',
        `برنامه امکان ایجاد یا تغییر فایل پایگاه داده SQLite در پوشه ریشه زیر را ندارد:\n\n${rootDir}\n\nراه حل:\nلطفاً برنامه را در مسیری با دسترسی کامل کاربر (مانند C:\\WarehouseManagement یا C:\\OfficeManagement) نصب و اجرا نمایید، یا با کلیک راست و انتخاب "Run as Administrator" برنامه را اجرا کنید.`
      );
    } else {
      runtimeLogger.info('PERMISSIONS', `Root directory verified as writable: ${rootDir}`);
    }
  }

  // 2. Initialize the SQLite database automatically on startup
  try {
    const dbInfo = await sqliteManager.initDatabase(app, appRole);
    runtimeLogger.info('SQLITE_INIT', `SQLite database initialized successfully at: ${dbInfo.dbPath}`);
  } catch (err) {
    runtimeLogger.error('SQLITE_INIT', 'Failed to initialize SQLite database', err);
    dialog.showErrorBox(
      'خطای پایگاه داده محلی SQLite',
      `خطا در بارگذاری دیتابیس محلی:\n${err.message}\n\nلطفاً از سلامت پوشه نصب و داشتن مجوز ادمین اطمینان حاصل کنید.`
    );
  }

  // 3. Create Browser Window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: appTitle,
    backgroundColor: '#020617',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Allows loading local file:// assets seamlessly
    }
  });

  mainWindow.once('ready-to-show', () => {
    runtimeLogger.info('WINDOW_SHOW', 'BrowserWindow ready-to-show event fired. Displaying window.');
    mainWindow.show();
  });

  // Attach window navigation error monitors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    runtimeLogger.error('WEB_CONTENTS', `Page failed to load: ${errorDescription} (${errorCode}) at ${validatedURL}`);
  });

  mainWindow.webContents.on('crashed', (event, killed) => {
    runtimeLogger.error('WEB_CONTENTS', `WebContents crashed! Killed: ${killed}`);
    runtimeLogger.showFatalErrorDialog('خطای بارگذاری رابط گرافیکی', 'رابط کاربری برنامه با کرش مواجه شد. لطفاً کارت گرافیک و درایور ویندوز 7 را بررسی کنید.');
  });

  mainWindow.webContents.on('unresponsive', () => {
    runtimeLogger.warn('WEB_CONTENTS', 'Window became unresponsive.');
  });

  // In production, load the built Vite index.html; in dev, load dev server
  const distPath = path.join(__dirname, '../../dist/index.html');
  const startUrl = process.env.ELECTRON_START_URL || (fs.existsSync(distPath) ? `file://${distPath}` : 'http://localhost:3000');

  runtimeLogger.info('PAGE_LOAD', `Loading application URL: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    runtimeLogger.info('WINDOW_CLOSED', 'Main window closed by user.');
    mainWindow = null;
  });
}

// IPC HANDLERS FOR SQLITE & SYSTEM OPERATIONS
ipcMain.handle('sqlite:get-info', async () => {
  return sqliteManager.getDatabaseInfo(app);
});

ipcMain.handle('sqlite:init', async (event, envOverride) => {
  return sqliteManager.initDatabase(app, envOverride || appRole);
});

ipcMain.handle('sqlite:query', async (event, sql, params) => {
  return sqliteManager.query(sql, params);
});

ipcMain.handle('sqlite:execute', async (event, sql, params) => {
  return sqliteManager.execute(sql, params);
});

ipcMain.handle('sqlite:record-event', async (event, syncEvent) => {
  return sqliteManager.recordLocalEvent(syncEvent);
});

ipcMain.handle('sqlite:backup', async (event, options = {}) => {
  const rootDir = sqliteManager.getAppRootDirectory(app);
  const defaultFileName = `mgas_${isWarehouse ? 'warehouse' : 'office'}_backup_${Date.now()}.db`;
  const defaultPath = path.join(rootDir, defaultFileName);

  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'ذخیره نسخه پشتیبان کامل پایگاه داده SQLite',
    defaultPath: defaultPath,
    filters: [
      { name: 'SQLite Database (*.db)', extensions: ['db', 'sqlite'] },
      { name: 'All Files (*.*)', extensions: ['*'] }
    ]
  });

  if (filePath) {
    return sqliteManager.backupDatabase(filePath);
  }
  return { success: false, cancelled: true };
});

// JSON Report File Saver for Windows Desktop (Office Win11 & Warehouse Win7)
ipcMain.handle('system:save-json', async (_event, { fileName, content }) => {
  try {
    const rootDir = sqliteManager.getAppRootDirectory(app);
    const defaultName = fileName || `report_mgas_${Date.now()}.json`;
    const defaultPath = path.join(rootDir, defaultName);

    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'ذخیره گزارش استاندارد JSON سامانه ام گاز',
      defaultPath: defaultPath,
      filters: [
        { name: 'JSON Files (*.json)', extensions: ['json'] },
        { name: 'All Files (*.*)', extensions: ['*'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    const dataToWrite = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    fs.writeFileSync(filePath, dataToWrite, 'utf8');
    runtimeLogger.info('SAVE_JSON', `Report JSON saved successfully: ${filePath}`);
    return { success: true, filePath };
  } catch (err) {
    runtimeLogger.error('SAVE_JSON', 'Failed to save report JSON file', err);
    return { success: false, error: err?.message || 'خطا در ذخیره‌سازی فایل' };
  }
});

// Instant Kardex update broadcast across all desktop windows
ipcMain.handle('kardex:notify-change', async (_event, entry) => {
  BrowserWindow.getAllWindows().forEach(win => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('sqlite:updated', { entity_type: 'GAS_KARDEX', entry });
    }
  });
  return true;
});

// IPC HANDLERS FOR RUNTIME LOGGER & DIAGNOSTICS
ipcMain.handle('system:get-boot-logs', async () => {
  return runtimeLogger.getRecentLogs();
});

ipcMain.handle('system:get-log-paths', async () => {
  return runtimeLogger.getAllLogPaths();
});

ipcMain.handle('system:open-log-in-notepad', async () => {
  return runtimeLogger.openLogInNotepad();
});

ipcMain.handle('system:get-diagnostics', async () => {
  return {
    platform: process.platform,
    release: os.release(),
    arch: os.arch(),
    isWindows7: runtimeLogger.isWindows7,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
    logPaths: runtimeLogger.getAllLogPaths()
  };
});

app.whenReady().then(() => {
  runtimeLogger.info('APP_READY', 'app.whenReady resolved. Launching window.');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(err => {
  runtimeLogger.error('APP_READY', 'Fatal error during app.whenReady', err);
  runtimeLogger.showFatalErrorDialog('خطای آغاز به کار اپلیکیشن', err.stack || err.message);
});

app.on('before-quit', () => {
  runtimeLogger.info('APP_QUIT', 'app.before-quit event received. Flushing database.');
  try {
    if (sqliteManager) sqliteManager.flushDatabaseToDisk();
  } catch (err) {
    runtimeLogger.error('APP_QUIT', 'Failed to flush database to disk on quit', err);
  }
});

app.on('window-all-closed', () => {
  runtimeLogger.info('APP_QUIT', 'All windows closed.');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
