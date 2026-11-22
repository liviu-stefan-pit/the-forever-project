@echo off
cd /d "%~dp0web"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)
echo.
echo Profile is stored for http://localhost:5173 only.
echo A different port is a different empty profile. This closes a previous dev server on 5173 first.
echo.
call npm run dev
