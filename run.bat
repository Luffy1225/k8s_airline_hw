@echo off
@chcp 65001 >nul
echo ===================================================
echo   EVA AIRWAYS VIRTUAL - Booking & Radar System
echo ===================================================
echo.
echo Starting Flask backend server...
cd /d "%~dp0backend"
"%~dp0venv\Scripts\python.exe" app.py
pause
