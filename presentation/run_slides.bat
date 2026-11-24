@echo off
@chcp 65001 >nul
echo ========================================================
echo   EVA AIRWAYS VIRTUAL - Reveal.js Presentation Launcher
echo ========================================================
echo.
echo Opening presentation in your default browser...
start "" "%~dp0index.html"
exit
