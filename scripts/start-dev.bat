@echo off
echo ========================================
echo Starting PildHora Development Server
echo ========================================
echo.

REM Check if .env exists
if not exist "..\.env" (
    echo ❌ .env file not found!
    echo Please copy .env.example to .env and fill in your Firebase config
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "..\node_modules" (
    echo 📦 Installing dependencies...
    cd ..
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    cd scripts
)

echo 🚀 Starting Expo development server...
echo.
echo Using standard Expo commands:
echo   npx expo start
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server using standard Expo commands
cd ..
call npx expo start

if %errorlevel% neq 0 (
    echo.
    echo ❌ Development server failed to start
    echo Check the error messages above
    pause
    exit /b 1
)

echo ✅ Development server started successfully!
cd scripts
pause