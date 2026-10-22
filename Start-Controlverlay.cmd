@echo off
cd /d "%~dp0"
if exist "Controlverlay Maker.exe" (
  start "" "%~dp0Controlverlay Maker.exe"
  exit /b 0
)
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 20 or newer from https://nodejs.org then reopen this file.
  pause
  exit /b 1
)
start "Controlverlay editor" http://127.0.0.1:3210
node server.mjs
pause
