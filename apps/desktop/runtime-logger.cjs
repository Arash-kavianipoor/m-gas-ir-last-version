// ==============================================================================
// RUNTIME ERROR LOGGER (Windows 7 & Windows 10/11 Early Bootup Diagnostic Logger)
// Captures and persists early lifecycle events, system state, exceptions, and crashes
// ==============================================================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

class RuntimeLogger {
  constructor() {
    this.bootTimestamp = new Date();
    this.logsInMemory = [];
    this.activeLogPaths = [];
    this.isWindows = process.platform === 'win32';
    this.isWindows7 = false;
    this.electronApp = null;
    this.initialized = false;

    this.detectOsVersion();
    this.resolveLogPaths();
    this.setupProcessHooks();
    this.recordInitialEnvironment();
  }

  detectOsVersion() {
    try {
      const release = os.release() || '';
      // Windows 7 kernel is NT 6.1 (e.g. "6.1.7601")
      // Windows 8 is 6.2, Windows 8.1 is 6.3, Windows 10/11 is 10.0.x
      this.isWindows7 = this.isWindows && release.startsWith('6.1');
    } catch {
      this.isWindows7 = false;
    }
  }

  resolveLogPaths() {
    const candidates = [];

    // 1. Next to the executable (e.g. C:\OfficeManagement\Office-Execution-Log.txt)
    try {
      if (process.execPath) {
        const exeDir = path.dirname(process.execPath);
        const exeName = path.basename(process.execPath).toLowerCase();
        if (exeName.includes('office')) {
          candidates.push(path.join(exeDir, 'Office-Execution-Log.txt'));
        } else if (exeName.includes('warehouse')) {
          candidates.push(path.join(exeDir, 'Warehouse-Execution-Log.txt'));
        }
        candidates.push(path.join(exeDir, 'Office-Execution-Log.txt'));
        candidates.push(path.join(exeDir, 'runtime-boot.log'));
      }
    } catch {}

    // 2. Current working directory (where user launched the app or script from)
    try {
      candidates.push(path.join(process.cwd(), 'Office-Execution-Log.txt'));
      candidates.push(path.join(process.cwd(), 'runtime-boot.log'));
    } catch {}

    // 3. User TEMP folder (%TEMP%\mgas-inventory-boot.log) - Almost always writable
    try {
      const tempDir = process.env.TEMP || process.env.TMP || os.tmpdir();
      if (tempDir) {
        candidates.push(path.join(tempDir, 'mgas-inventory-boot.log'));
      }
    } catch {}

    // 4. Roaming APPDATA (%APPDATA%\MGAS-Inventory\runtime-boot.log)
    try {
      const appData = process.env.APPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : null);
      if (appData) {
        const appDir = path.join(appData, 'MGAS-Inventory');
        try {
          if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir, { recursive: true });
          }
          candidates.push(path.join(appDir, 'runtime-boot.log'));
        } catch {}
      }
    } catch {}

    // Test writability of each candidate
    this.activeLogPaths = [];
    for (const candidate of candidates) {
      if (this.activeLogPaths.includes(candidate)) continue;
      try {
        const dir = path.dirname(candidate);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.appendFileSync(candidate, `\n=== BOOT SESSION: ${this.bootTimestamp.toISOString()} ===\n`, 'utf8');
        this.activeLogPaths.push(candidate);
      } catch (err) {
        // Not writable (e.g. UAC restricted directory)
      }
    }

    // Fallback: If nothing was writable, attempt os.tmpdir directly
    if (this.activeLogPaths.length === 0) {
      try {
        const fallback = path.join(os.tmpdir(), 'mgas-boot-emergency.log');
        fs.appendFileSync(fallback, `\n=== EMERGENCY BOOT: ${this.bootTimestamp.toISOString()} ===\n`, 'utf8');
        this.activeLogPaths.push(fallback);
      } catch {}
    }
  }

  setupProcessHooks() {
    // Uncaught Exception Handler
    process.on('uncaughtException', (err, origin) => {
      const msg = `[CRITICAL_UNCAUGHT_EXCEPTION] Origin: ${origin}\nMessage: ${err?.message || err}\nStack:\n${err?.stack || 'No stack'}`;
      this.error('EXCEPTION', msg);
      this.showFatalErrorDialog('خطای بحرانی در هسته اجرایی (Uncaught Exception)', msg);
    });

    // Unhandled Promise Rejection Handler
    process.on('unhandledRejection', (reason, promise) => {
      const msg = `[UNHANDLED_PROMISE_REJECTION] Reason: ${reason instanceof Error ? reason.stack : JSON.stringify(reason)}`;
      this.error('PROMISE', msg);
      this.showFatalErrorDialog('خطای ناخواسته در بارگذاری مؤلفه‌ها (Unhandled Rejection)', msg);
    });

    // Process Exit Handler
    process.on('exit', (code) => {
      this.info('SHUTDOWN', `Process exiting with code: ${code}`);
    });

    // Signal handlers
    ['SIGINT', 'SIGTERM'].forEach(sig => {
      process.on(sig, () => {
        this.info('SIGNAL', `Received signal: ${sig}`);
      });
    });
  }

  attachElectronApp(app) {
    this.electronApp = app;

    // Attach to Electron-specific lifecycle events
    try {
      app.on('render-process-gone', (event, webContents, details) => {
        this.error('RENDERER_CRASH', `Renderer process gone! Reason: ${details.reason}, ExitCode: ${details.exitCode}`);
      });

      app.on('child-process-gone', (event, details) => {
        this.warn('CHILD_PROCESS_GONE', `Child process gone. Type: ${details.type}, Reason: ${details.reason}, ExitCode: ${details.exitCode}`);
      });

      app.on('gpu-process-crashed', (event, killed) => {
        this.error('GPU_CRASH', `Chromium GPU Process Crashed! Killed: ${killed}`);
      });
    } catch (e) {
      this.warn('ATTACH', `Failed to attach some electron app listeners: ${e.message}`);
    }
  }

  recordInitialEnvironment() {
    this.info('INIT', `Application Bootup Initialized at ${this.bootTimestamp.toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`);
    this.info('SYSTEM', `OS: ${os.type()} ${os.release()} (${os.arch()}) | Platform: ${process.platform}`);
    if (this.isWindows7) {
      this.warn('COMPATIBILITY', 'WINDOWS 7 DETECTED (NT 6.1)! Applying special legacy flags and checks.');
    }
    this.info('PROCESS', `PID: ${process.pid} | ExecPath: ${process.execPath} | CWD: ${process.cwd()}`);
    this.info('VERSIONS', `Electron: ${process.versions.electron || 'N/A'} | Node: ${process.versions.node} | Chrome: ${process.versions.chrome || 'N/A'} | V8: ${process.versions.v8}`);
    this.info('MEMORY', `Total RAM: ${Math.round(os.totalmem() / 1024 / 1024)} MB | Free RAM: ${Math.round(os.freemem() / 1024 / 1024)} MB`);
    
    // Check key Windows environment variables
    const envVars = {
      TEMP: process.env.TEMP,
      APPDATA: process.env.APPDATA,
      USERPROFILE: process.env.USERPROFILE,
      SystemRoot: process.env.SystemRoot,
      PROCESSOR_IDENTIFIER: process.env.PROCESSOR_IDENTIFIER
    };
    this.info('ENV', `Crucial Environment: ${JSON.stringify(envVars)}`);
    this.info('ARGV', `Command Line Arguments: ${JSON.stringify(process.argv)}`);
  }

  formatEntry(level, phase, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${phase}] ${message}`;
  }

  writeToFiles(formatted) {
    for (const logPath of this.activeLogPaths) {
      try {
        fs.appendFileSync(logPath, formatted + '\n', 'utf8');
      } catch (err) {
        // If file became locked or unwritable, continue to next
      }
    }
  }

  log(level, phase, message, extraData) {
    let fullMessage = String(message);
    if (extraData !== undefined) {
      if (extraData instanceof Error) {
        fullMessage += `\nStack: ${extraData.stack || extraData.message}`;
      } else if (typeof extraData === 'object') {
        try {
          fullMessage += ` | Details: ${JSON.stringify(extraData)}`;
        } catch {
          fullMessage += ` | Details: ${String(extraData)}`;
        }
      } else {
        fullMessage += ` | ${extraData}`;
      }
    }

    const formatted = this.formatEntry(level, phase, fullMessage);
    this.logsInMemory.push(formatted);
    if (this.logsInMemory.length > 500) {
      this.logsInMemory.shift();
    }

    // Output to console (visible in terminal or debug mode)
    if (level === 'ERROR' || level === 'FATAL') {
      console.error(formatted);
    } else if (level === 'WARN') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }

    // Persist synchronously to disk
    this.writeToFiles(formatted);
  }

  info(phase, message, extraData) {
    this.log('INFO', phase, message, extraData);
  }

  warn(phase, message, extraData) {
    this.log('WARN', phase, message, extraData);
  }

  error(phase, message, extraData) {
    this.log('ERROR', phase, message, extraData);
  }

  showFatalErrorDialog(title, details) {
    const primaryLogPath = this.getPrimaryLogPath();
    const message = `${details}\n\n--------------------------------------------\nفایل گزارش کامل خطا (Runtime Log):\n${primaryLogPath}\n\nپیش‌نیازهای ضروری ویندوز ۷:\n۱. نصب پچ امنیتی KB4474419 (امضای SHA-2)\n۲. نصب Visual C++ Redistributable 2015-2022\n۳. اجرای برنامه با کلیک راست و Run as Administrator\n۴. بررسی مسدود نشدن توسط آنتی‌ویروس`;

    try {
      const electron = require('electron');
      const dialog = electron.dialog;
      if (dialog && typeof dialog.showErrorBox === 'function') {
        dialog.showErrorBox(title, message);
        return;
      }
    } catch {}

    // Fallback if Electron dialog is not yet ready: Windows msg command or powershell
    if (this.isWindows) {
      try {
        const safeTitle = title.replace(/"/g, "'");
        const safeMsg = `خطای استارتاپ برنامه: برای مشاهده جزئیات فایل زیر را بررسی نمایید:\n${primaryLogPath}`.replace(/"/g, "'");
        exec(`mshta "javascript:var sh=new ActiveXObject('WScript.Shell'); sh.Popup('${safeMsg}', 0, '${safeTitle}', 16);close()"`);
      } catch {}
    }
  }

  getPrimaryLogPath() {
    return this.activeLogPaths[0] || path.join(os.tmpdir(), 'mgas-inventory-boot.log');
  }

  getAllLogPaths() {
    return [...this.activeLogPaths];
  }

  getRecentLogs(limit = 100) {
    return this.logsInMemory.slice(-limit);
  }

  openLogInNotepad() {
    const primary = this.getPrimaryLogPath();
    if (this.isWindows && fs.existsSync(primary)) {
      try {
        exec(`notepad.exe "${primary}"`);
        return true;
      } catch (err) {
        this.error('LOG_VIEW', `Failed to launch notepad for log: ${err.message}`);
        return false;
      }
    }
    return false;
  }
}

// Singleton instance
const runtimeLogger = new RuntimeLogger();

module.exports = runtimeLogger;
