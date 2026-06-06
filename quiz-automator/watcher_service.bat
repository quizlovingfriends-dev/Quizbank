@echo off
cd /d "%~dp0"
:loop
echo [QuizVault Watcher] Starting at %date% %time%
python scripts\watcher.py
echo [QuizVault Watcher] Exited. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto loop
