// ==============================================================================
// PRELOAD SCRIPT (Secure contextBridge for Windows 7 & Windows 11 Desktop Apps)
// ==============================================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  platform: process.platform,
  electronVersion: process.versions.electron,
  nodeVersion: process.versions.node,

  // Database Management
  getDbInfo: () => ipcRenderer.invoke('sqlite:get-info'),
  initDatabase: (envOverride) => ipcRenderer.invoke('sqlite:init', envOverride),
  query: (sql, params) => ipcRenderer.invoke('sqlite:query', sql, params),
  execute: (sql, params) => ipcRenderer.invoke('sqlite:execute', sql, params),
  recordLocalEvent: (syncEvent) => ipcRenderer.invoke('sqlite:record-event', syncEvent),
  saveBackupToFile: (options) => ipcRenderer.invoke('sqlite:backup', options),
  saveJsonFile: (fileName, content) => ipcRenderer.invoke('system:save-json', { fileName, content }),

  // Runtime Diagnostics & Early Bootup Logger
  getBootLogs: () => ipcRenderer.invoke('system:get-boot-logs'),
  getLogPaths: () => ipcRenderer.invoke('system:get-log-paths'),
  openLogInNotepad: () => ipcRenderer.invoke('system:open-log-in-notepad'),
  getDiagnostics: () => ipcRenderer.invoke('system:get-diagnostics'),

  // Real-time Instant Synchronization for Windows Desktop
  onDatabaseUpdated: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('sqlite:updated', handler);
    return () => ipcRenderer.removeListener('sqlite:updated', handler);
  },
  notifyKardexChange: (entry) => ipcRenderer.invoke('kardex:notify-change', entry)
});
