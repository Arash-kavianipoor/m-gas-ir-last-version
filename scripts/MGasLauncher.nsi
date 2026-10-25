; ==============================================================================
; M-Gas Inventory Launcher & Background Service Runner
; Ensures local server is active, then launches http://localhost:3000/
; ==============================================================================

Unicode true
RequestExecutionLevel user
SilentInstall silent
AutoCloseWindow true
ShowInstDetails nevershow

!include "LogicLib.nsh"
!include "FileFunc.nsh"

!define PROJECT_DIR ".."
OutFile "${PROJECT_DIR}/release-dist/MGasLauncher.exe"
Icon "${PROJECT_DIR}/public/logo.ico"

Section
  ; 1. Start lightweight local server in background (hidden)
  IfFileExists "$EXEDIR\start-server.ps1" 0 SkipServerStart
    Exec 'powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "$EXEDIR\start-server.ps1"'
    Sleep 800

SkipServerStart:

  ; 2. Try Microsoft Edge (64-bit Registry)
  SetRegView 64
  ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" ""
  ${If} $0 != ""
  ${AndIf} ${FileExists} "$0"
    Exec '"$0" --app=http://localhost:3000/'
    Sleep 2000
    Quit
  ${EndIf}

  ; Try Microsoft Edge (32-bit Registry)
  SetRegView 32
  ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" ""
  ${If} $0 != ""
  ${AndIf} ${FileExists} "$0"
    Exec '"$0" --app=http://localhost:3000/'
    Sleep 2000
    Quit
  ${EndIf}

  ; 3. Try Google Chrome (64-bit Registry)
  SetRegView 64
  ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" ""
  ${If} $0 != ""
  ${AndIf} ${FileExists} "$0"
    Exec '"$0" --app=http://localhost:3000/'
    Sleep 2000
    Quit
  ${EndIf}

  ; Try Google Chrome (32-bit Registry)
  SetRegView 32
  ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" ""
  ${If} $0 != ""
  ${AndIf} ${FileExists} "$0"
    Exec '"$0" --app=http://localhost:3000/'
    Sleep 2000
    Quit
  ${EndIf}

  ; 4. Universal Windows URL Protocol Handler (works on every version of Windows)
  Exec 'rundll32.exe url.dll,FileProtocolHandler http://localhost:3000/'
  Sleep 1000

  ; 5. Shell Execute Open Fallback
  ExecShell "open" "http://localhost:3000/"
  Sleep 2000
  Quit
SectionEnd
