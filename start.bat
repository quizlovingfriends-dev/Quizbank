@echo off
echo Starting QuizVault Local Server...
echo.
echo If you have Python installed, we'll use that.
python -m http.server 8000
if %errorlevel% neq 0 (
    echo Python not found. Trying Node.js...
    npx serve . -p 8000
)
pause
