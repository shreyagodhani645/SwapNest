@echo off
echo Starting SwapNest...

:: Start Backend
start cmd /k "cd backend && npm start"

:: Start Frontend
start cmd /k "cd frontend && npm run dev"

echo Backend and Frontend are starting in separate windows.
pause
