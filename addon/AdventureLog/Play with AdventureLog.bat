@echo off
setlocal EnableExtensions EnableDelayedExpansion
set "WOWROOT="
set "EXTRA="

:parse
if "%~1"=="" goto parsed
if /I "%~1"=="-WowRoot" (
  set "WOWROOT=%~2"
  shift
  shift
  goto parse
)
set "EXTRA=!EXTRA! %1"
shift
goto parse

:parsed
if not defined WOWROOT (
  set "DIR=%~dp0"
  :walk
  if exist "!DIR!Wow.exe" (
    set "WOWROOT=!DIR!"
    goto have_root
  )
  for %%I in ("!DIR!.") do set "CUR=%%~fI"
  for %%I in ("!DIR!..") do set "PAR=%%~fI"
  if /I "!PAR!"=="!CUR!" goto missing
  set "DIR=!PAR!\"
  goto walk
)

:have_root
if "!WOWROOT:~-1!"=="\" if not "!WOWROOT:~-2!"==":\" set "WOWROOT=!WOWROOT:~0,-1!"
if not exist "!WOWROOT!\Wow.exe" goto missing

echo Starting "!WOWROOT!\Wow.exe"
start "" /wait "!WOWROOT!\Wow.exe"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0export.ps1" -WowRoot "!WOWROOT!" !EXTRA!
set "RC=!ERRORLEVEL!"
if not "!RC!"=="0" pause
exit /b !RC!

:missing
echo ERROR: Wow.exe was not found. Pass -WowRoot with the _forever_ folder, or keep this addon under Interface\AddOns.
pause
exit /b 1
