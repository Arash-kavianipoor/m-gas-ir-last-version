; ==============================================================================
; NSIS Custom Script for Office Management (Windows 11 & Windows 10)
; Full visible installation wizard with live progress display & in-folder logging
; ==============================================================================

ShowInstDetails show
ShowUninstDetails show

!macro preInit
  ; 1. Set default installation directory to root drive C:
  StrCpy $INSTDIR "C:\OfficeManagement"

  ; 2. Initialize In-Folder Installation Log ($EXEDIR\Office-Installation-Log.txt)
  ClearErrors
  FileOpen $0 "$EXEDIR\Office-Installation-Log.txt" a
  IfErrors exedir_not_writable exedir_writable

exedir_writable:
  FileWrite $0 "$\r$\n==================================================================$\r$\n"
  FileWrite $0 "[OFFICE-WIN11-SETUP] Installation Process Started$\r$\n"
  FileWrite $0 "[OFFICE-WIN11-SETUP] Build Date/Time: ${__DATE__} ${__TIME__}$\r$\n"
  FileWrite $0 "[OFFICE-WIN11-SETUP] Installer Folder (EXEDIR): $EXEDIR$\r$\n"
  FileWrite $0 "[OFFICE-WIN11-SETUP] Setup Executable: $EXEPATH$\r$\n"
  FileWrite $0 "[OFFICE-WIN11-SETUP] Default Target Path: $INSTDIR$\r$\n"
  FileWrite $0 "[OFFICE-WIN11-SETUP] Status: Initializing installer wizard...$\r$\n"
  FileClose $0
  Goto preinit_temp_log

exedir_not_writable:
  Goto preinit_temp_log

preinit_temp_log:
  ClearErrors
  FileOpen $1 "$TEMP\Office-Installation-Log.txt" a
  IfErrors preinit_done
  FileWrite $1 "$\r$\n==================================================================$\r$\n"
  FileWrite $1 "[OFFICE-WIN11-SETUP] Installation Started at ${__DATE__} ${__TIME__}$\r$\n"
  FileWrite $1 "[OFFICE-WIN11-SETUP] EXEDIR: $EXEDIR | INSTDIR: $INSTDIR$\r$\n"
  FileClose $1

preinit_done:
!macroend

!macro customInit
  ; Log stage: User UI Initialized
  ClearErrors
  FileOpen $0 "$EXEDIR\Office-Installation-Log.txt" a
  IfErrors custom_init_temp
  FileWrite $0 "[OFFICE-WIN11-SETUP] Wizard UI ready. Awaiting user directory confirmation...$\r$\n"
  FileClose $0

custom_init_temp:
  ClearErrors
  FileOpen $1 "$TEMP\Office-Installation-Log.txt" a
  IfErrors custom_init_done
  FileWrite $1 "[OFFICE-WIN11-SETUP] Wizard UI ready. Target path selected: $INSTDIR$\r$\n"
  FileClose $1

custom_init_done:
!macroend

!macro customInstall
  SetDetailsPrint both
  DetailPrint ">> [1/4] ایجاد و آماده‌سازی پوشه نصب در $INSTDIR..."
  CreateDirectory "$INSTDIR"

  DetailPrint ">> [2/4] تنظیم دسترسی‌های امنیتی برای کاربران ویندوز ۱۱..."
  ExecWait 'icacls "$INSTDIR" /grant *S-1-5-32-545:(OI)(CI)F /T /Q'
  ExecWait 'icacls "$INSTDIR" /grant Users:(OI)(CI)F /T /Q'

  DetailPrint ">> [3/4] ثبت وقایع و ساخت فایل لاگ اختصاصی در پوشه نصب..."
  ClearErrors
  FileOpen $0 "$EXEDIR\Office-Installation-Log.txt" a
  IfErrors write_instdir_log
  FileWrite $0 "[OFFICE-WIN11-SETUP] Target directory successfully prepared: $INSTDIR$\r$\n"
  FileWrite $0 "[OFFICE-WIN11-SETUP] Permissions granted for Windows 11 Standard Users.$\r$\n"
  FileWrite $0 "[OFFICE-WIN11-SETUP] Application binaries extracted successfully.$\r$\n"
  FileWrite $0 "[OFFICE-WIN11-SETUP] SUCCESS: Office Management installation completed successfully.$\r$\n"
  FileWrite $0 "==================================================================$\r$\n"
  FileClose $0

write_instdir_log:
  ClearErrors
  FileOpen $2 "$INSTDIR\Office-Installation-Log.txt" w
  IfErrors write_temp_finish
  FileWrite $2 "==================================================================$\r$\n"
  FileWrite $2 "M-GAS INVENTORY - OFFICE MANAGEMENT (WINDOWS 11)$\r$\n"
  FileWrite $2 "Installation & Runtime Diagnostics Log$\r$\n"
  FileWrite $2 "==================================================================$\r$\n"
  FileWrite $2 "Installed Date/Time: ${__DATE__} ${__TIME__}$\r$\n"
  FileWrite $2 "Installed Directory: $INSTDIR$\r$\n"
  FileWrite $2 "Source Installer Directory: $EXEDIR$\r$\n"
  FileWrite $2 "Target Executable: $INSTDIR\Office.exe$\r$\n"
  FileWrite $2 "Local SQLite Database: $INSTDIR\office.db$\r$\n"
  FileWrite $2 "Execution Log File: $INSTDIR\Office-Execution-Log.txt$\r$\n"
  FileWrite $2 "Runtime Boot Log: $INSTDIR\runtime-boot.log$\r$\n"
  FileWrite $2 "File Permissions: Full Access granted via icacls$\r$\n"
  FileWrite $2 "Status: Installed and ready to run.$\r$\n"
  FileWrite $2 "==================================================================$\r$\n"
  FileClose $2

write_temp_finish:
  DetailPrint ">> [4/4] نصب سامانه دفتر مرکزی با موفقیت تکمیل گردید."
  ClearErrors
  FileOpen $3 "$TEMP\Office-Installation-Log.txt" a
  IfErrors custom_install_done
  FileWrite $3 "[OFFICE-WIN11-SETUP] SUCCESS: Installed to $INSTDIR$\r$\n"
  FileClose $3

custom_install_done:
!macroend
