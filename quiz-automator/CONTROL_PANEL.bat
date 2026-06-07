@echo off
REM ───────────────────────────────────────────────────────────────────────
REM  QuizVault Control Panel
REM
REM  Double-click this file to open the dashboard at http://localhost:5000
REM  Close the window to stop the server.
REM ───────────────────────────────────────────────────────────────────────

cd /d "%~dp0"
title QuizVault Control Panel
echo.
echo   QuizVault Control Panel starting...
echo.
python server.py
pause
