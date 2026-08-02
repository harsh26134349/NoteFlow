@echo off
title NoteFlow Application
echo Starting NoteFlow Local Web App...
start "" /b npx -y serve "%~dp0." -l 3000
timeout /t 2 /nobreak >nul
start msedge --app=http://localhost:3000 || start chrome --app=http://localhost:3000 || start http://localhost:3000
echo NoteFlow is running locally at http://localhost:3000
