@echo off
cd /d "%~dp0"

echo.
echo  Stopping Places local dev servers...
echo.

for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq powershell.exe" /FO LIST ^| findstr /I "PID:"') do (
  wmic process where "ProcessId=%%a" get CommandLine 2>nul | findstr /I "serve-places.ps1" >nul
  if not errorlevel 1 (
    echo  Stopping PID %%a
    taskkill /PID %%a /F >nul 2>&1
  )
)

for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq pwsh.exe" /FO LIST ^| findstr /I "PID:"') do (
  wmic process where "ProcessId=%%a" get CommandLine 2>nul | findstr /I "serve-places.ps1" >nul
  if not errorlevel 1 (
    echo  Stopping PID %%a
    taskkill /PID %%a /F >nul 2>&1
  )
)

echo.
echo  Done. You can run launch-places-local.bat again.
echo.
pause
