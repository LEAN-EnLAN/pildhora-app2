@echo off
echo ========================================
echo PildHora Quick Setup and Run
echo ========================================
echo.

REM Step 1: Environment test
echo [1/4] Running environment test...
call test-env.bat
if %errorlevel% neq 0 (
    echo ❌ Environment test failed!
    pause
    exit /b 1
)

REM Step 2: Install dependencies
echo.
echo [2/4] Installing dependencies...
cd ..
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)
cd scripts

REM Step 3: Deploy Firebase rules
echo.
echo [3/4] Deploying Firebase security rules...
cd ..
call firebase deploy --only firestore:rules,database:rules
if %errorlevel% neq 0 (
    echo ⚠️  Firebase rules deployment failed - you can deploy manually later
)
cd scripts

REM Step 4: Start development server
echo.
echo [4/4] Starting development server...
echo 🚀 Starting Expo development server using standard commands...
echo.
echo Using: npx expo start
echo.
echo Your app will be available at:
echo   Web: http://localhost:8081
echo   Expo Go: Scan QR code in terminal
echo.
echo Press Ctrl+C to stop the server
echo.

cd ..
call npx expo start

echo.
echo ✅ Setup complete!
cd scripts
pause