@echo off
cd /d "%~dp0"

where npx >nul 2>&1
if %errorlevel%==0 (
  echo.
  echo  Places local dev server
  echo  http://localhost:3000/places.html
  echo.
  echo  Press Ctrl+C to stop.
  echo.
  start /b cmd /c "ping -n 3 127.0.0.1 >nul && start "" "http://localhost:3000/places.html""
  npx --yes serve -l 3000
  goto :done
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-places.ps1"
if errorlevel 1 (
  echo.
  echo  Could not start the local server.
  echo  Run stop-places-local.bat if a previous server is still running.
  echo.
  pause
)

:done
