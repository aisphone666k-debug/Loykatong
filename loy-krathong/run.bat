@echo off
title ลอยกระทงกับแฟน - Loy Krathong with Love
color 0D

echo ============================================================
echo   🌕 ลอยกระทงกับแฟน (Loy Krathong with Love) Launcher
echo ============================================================
echo.

cd /d "%~dp0"

:: 1. Check node in PATH or in Visual Studio directory
where node >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs\node.exe" (
        set "PATH=C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs;%PATH%"
    )
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Node.js not found in PATH.
    echo Opening directly in your default browser...
    start "" "%~dp0index.html"
    pause
    exit /b 0
)

echo [STATUS] Starting Local Server at port 3000...
start "" http://localhost:3000

node server.js
pause
