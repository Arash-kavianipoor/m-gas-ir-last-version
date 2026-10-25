; ==============================================================================
; NSIS INSTALLER: انبارداری ام گاز (نسخه انبار مرکزی ویندوز ۷ / ۱۰ / ۱۱)
; مهندس آرش کاویانی پور
; ==============================================================================

Unicode true
SetCompressor /SOLID lzma

!define APP_NAME "انبارداری ام گاز"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "ام گاز - ساخته شده توسط مهندس آرش کاویانی پور"
!define APP_URL "http://localhost:3000/"
!define APP_EXE "MGasInventory.exe"
!define PROJECT_DIR ".."

Name "${APP_NAME}"
OutFile "${PROJECT_DIR}/release-dist/Warehouse-Windows7-Setup.exe"
InstallDir "$LOCALAPPDATA\Programs\MGasInventory"
InstallDirRegKey HKCU "Software\MGasInventory" "InstallDir"
RequestExecutionLevel user

; Modern UI 2
!include "MUI2.nsh"

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${PROJECT_DIR}/public/logo.ico"
!define MUI_UNICON "${PROJECT_DIR}/public/logo.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish page - run app option & show log option
!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXE}"
!define MUI_FINISHPAGE_RUN_TEXT "اجرای انبارداری ام گاز (راه‌اندازی سرور محلی و باز کردن خودکار سامانه)"
!define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\MGas_Execution_Log.txt"
!define MUI_FINISHPAGE_SHOWREADME_TEXT "مشاهده فایل لاگ و دستورالعمل مسیر سامانه (MGas_Execution_Log.txt)"
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "Farsi"
!insertmacro MUI_LANGUAGE "English"

; Auto close running instances on installer startup
Function .onInit
  ExecWait 'cmd.exe /C taskkill /F /IM "MGasInventory.exe" /T'
  ExecWait 'cmd.exe /C taskkill /F /IM "MGasServer64.exe" /T'
  ExecWait 'cmd.exe /C taskkill /F /IM "MGasServer32.exe" /T'
  ExecWait 'cmd.exe /C taskkill /F /IM "MGasServer.exe" /T'
FunctionEnd

; Version Information
VIProductVersion "1.0.0.0"
VIAddVersionKey /LANG=1065 "ProductName" "${APP_NAME}"
VIAddVersionKey /LANG=1065 "Comments" "سامانه مدیریت جامع انبارداری ام گاز - نسخه انبار مرکزی ویندوز ۷ و سیستم‌های قدیمی"
VIAddVersionKey /LANG=1065 "CompanyName" "${APP_PUBLISHER}"
VIAddVersionKey /LANG=1065 "LegalCopyright" "تمامی حقوق متعلق به شرکت ام گاز می‌باشد"
VIAddVersionKey /LANG=1065 "FileDescription" "نصاب رسمی سامانه انبارداری ام گاز (نسخه جامع ۳۲ بیتی)"
VIAddVersionKey /LANG=1065 "FileVersion" "${APP_VERSION}"
VIAddVersionKey /LANG=1065 "ProductVersion" "${APP_VERSION}"

; Installer Section
Section "اصلی" SecCore
  SetOutPath "$INSTDIR"
  
  ; Terminate running processes to release file locks
  ExecWait 'cmd.exe /C taskkill /F /IM "${APP_EXE}" /T'
  ExecWait 'cmd.exe /C taskkill /F /IM "MGasServer64.exe" /T'
  ExecWait 'cmd.exe /C taskkill /F /IM "MGasServer32.exe" /T'
  ExecWait 'cmd.exe /C taskkill /F /IM "MGasServer.exe" /T'
  Sleep 1000

  ; If file exists, try delete; if locked, rename to .old (NTFS allows renaming open files)
  Delete "$INSTDIR\${APP_EXE}"
  ClearErrors
  IfFileExists "$INSTDIR\${APP_EXE}" 0 +3
    Rename "$INSTDIR\${APP_EXE}" "$INSTDIR\${APP_EXE}.old"
    Delete /REBOOTOK "$INSTDIR\${APP_EXE}.old"

  ; Clean old frontend assets to ensure fresh installation
  RMDir /r "$INSTDIR\app\assets"
  Delete "$INSTDIR\app\index.html"
  Delete "$INSTDIR\app\server.mjs"

  ; Write Universal 32-bit Native Win32 Server / Launcher (Runs on any Win 7/8/10/11)
  File /oname=${APP_EXE} "${PROJECT_DIR}/release-dist/MGasServer32.exe"
  File "${PROJECT_DIR}/public/logo.ico"
  
  ; Write Initial Log File with exact path instructions
  File /oname=MGas_Execution_Log.txt "${PROJECT_DIR}/scripts/initial-log-template.txt"
  
  ; Write SQLite databases for 3 warehouses: db-anbar1, db-anbar2, db-anbar3
  File /oname=db-anbar1.db "${PROJECT_DIR}/release-dist/db-anbar1.db"
  File /oname=db-anbar2.db "${PROJECT_DIR}/release-dist/db-anbar2.db"
  File /oname=db-anbar3.db "${PROJECT_DIR}/release-dist/db-anbar3.db"
  File /oname=db-anbar1 "${PROJECT_DIR}/release-dist/db-anbar1.db"
  File /oname=db-anbar2 "${PROJECT_DIR}/release-dist/db-anbar2.db"
  File /oname=db-anbar3 "${PROJECT_DIR}/release-dist/db-anbar3.db"
  
  ; Write Full Offline Web Application Files to $INSTDIR\app
  SetOutPath "$INSTDIR\app"
  File /r /x "server.cjs*" /x "downloads" /x "*.exe" /x "*.map" /x "*.blockmap" "${PROJECT_DIR}/dist/*"
  SetOutPath "$INSTDIR"

  ; Create batch helper
  FileOpen $0 "$INSTDIR\MGasInventory.bat" w
  FileWrite $0 "@echo off$\r$\n"
  FileWrite $0 "chcp 65001 >nul$\r$\n"
  FileWrite $0 "title انبارداری ام گاز - لاگ و اجرا$\r$\n"
  FileWrite $0 "echo [%DATE% %TIME%] [BAT] اجرای دستی انبارداری ام گاز از طریق Batch Script >> $\"%~dp0MGas_Execution_Log.txt$\"$\r$\n"
  FileWrite $0 "start $\"$\" $\"%~dp0${APP_EXE}$\"$\r$\n"
  FileWrite $0 "timeout /t 1 /nobreak >nul$\r$\n"
  FileWrite $0 "start $\"$\" $\"http://localhost:3000/$\"$\r$\n"
  FileClose $0

  ; Create URL internet shortcut
  WriteINIStr "$INSTDIR\انبارداری ام گاز.url" "InternetShortcut" "URL" "${APP_URL}"
  WriteINIStr "$INSTDIR\انبارداری ام گاز.url" "InternetShortcut" "IconIndex" "0"
  WriteINIStr "$INSTDIR\انبارداری ام گاز.url" "InternetShortcut" "IconFile" "$INSTDIR\logo.ico"

  ; Create Cloud Server shortcut
  WriteINIStr "$INSTDIR\سرور ابری anbar.mgas.ir.url" "InternetShortcut" "URL" "https://anbar.mgas.ir"
  WriteINIStr "$INSTDIR\سرور ابری anbar.mgas.ir.url" "InternetShortcut" "IconIndex" "0"
  WriteINIStr "$INSTDIR\سرور ابری anbar.mgas.ir.url" "InternetShortcut" "IconFile" "$INSTDIR\logo.ico"

  ; Append installation success to log file
  FileOpen $1 "$INSTDIR\MGas_Execution_Log.txt" a
  FileSeek $1 0 END
  FileWrite $1 "$\r$\n[INSTALLER] نصب در مسیر $INSTDIR با موفقیت به پایان رسید.$\r$\n"
  FileClose $1

  ; Create Uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"

  ; Create Start Menu Shortcuts
  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\logo.ico" 0 SW_SHOWNORMAL "" "سامانه مدیریت انبارداری ام گاز - http://localhost:3000/"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\مشاهده لاگ اجرای برنامه.lnk" "notepad.exe" '"$INSTDIR\MGas_Execution_Log.txt"' "$INSTDIR\logo.ico" 0 SW_SHOWNORMAL "" "مشاهده فایل لاگ MGas_Execution_Log.txt"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\پوشه نصب برنامه (Open Folder).lnk" "explorer.exe" '"$INSTDIR"' "" 0 SW_SHOWNORMAL "" "پوشه نصب انبارداری ام گاز"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\اجرای مستقیم تحت مرورگر.lnk" "$INSTDIR\انبارداری ام گاز.url" "" "$INSTDIR\logo.ico" 0 SW_SHOWNORMAL "" "سامانه مدیریت انبارداری ام گاز"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\حذف ${APP_NAME}.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  
  ; Direct shortcut in root of Programs folder (shows immediately in Windows 7 / 10 / 11 All Programs list)
  CreateShortcut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\logo.ico" 0 SW_SHOWNORMAL "" "سامانه مدیریت انبارداری ام گاز"

  ; Desktop Shortcuts
  CreateShortcut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\logo.ico" 0 SW_SHOWNORMAL "" "سامانه مدیریت انبارداری ام گاز"
  CreateShortcut "$DESKTOP\سرور ابری anbar.mgas.ir.lnk" "$INSTDIR\سرور ابری anbar.mgas.ir.url" "" "$INSTDIR\logo.ico" 0 SW_SHOWNORMAL "" "سامانه مرکزی ابری anbar.mgas.ir"
  CreateShortcut "$DESKTOP\مشاهده لاگ انبارداری ام گاز.lnk" "notepad.exe" '"$INSTDIR\MGas_Execution_Log.txt"' "$INSTDIR\logo.ico" 0 SW_SHOWNORMAL "" "مشاهده لاگ ثبت وقایع"

  ; Registry Keys for Windows Add/Remove Programs
  WriteRegStr HKCU "Software\MGasInventory" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MGasInventory" "DisplayName" "${APP_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MGasInventory" "DisplayIcon" "$INSTDIR\logo.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MGasInventory" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MGasInventory" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MGasInventory" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MGasInventory" "URLInfoAbout" "${APP_URL}"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MGasInventory" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MGasInventory" "NoRepair" 1
SectionEnd

; Uninstaller Section
Section "Uninstall"
  ; Remove Shortcuts
  Delete "$DESKTOP\${APP_NAME}.lnk"
  Delete "$DESKTOP\مشاهده لاگ انبارداری ام گاز.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\مشاهده لاگ اجرای برنامه.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\پوشه نصب برنامه (Open Folder).lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\اجرای مستقیم تحت مرورگر.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\حذف ${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\${APP_NAME}"

  ; Remove Files and App Directory
  RMDir /r "$INSTDIR\app"
  Delete "$INSTDIR\${APP_EXE}"
  Delete "$INSTDIR\MGas_Execution_Log.txt"
  Delete "$INSTDIR\logo.ico"
  Delete "$INSTDIR\MGasInventory.bat"
  Delete "$INSTDIR\انبارداری ام گاز.url"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"

  ; Remove Registry Keys
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MGasInventory"
  DeleteRegKey HKCU "Software\MGasInventory"
SectionEnd
