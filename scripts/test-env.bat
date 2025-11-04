@echo off
echo ========================================
echo PildHora Environment Test Script
echo ========================================
echo.

REM Test 1: Check Node.js
echo [1] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    goto :error
) else (
    echo ✅ Node.js installed
)

REM Test 2: Check npm
echo.
echo [2] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found!
    goto :error
) else (
    echo ✅ npm installed
)

REM Test 3: Check Firebase CLI
echo.
echo [3] Checking Firebase CLI...
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found! Run: npm install -g firebase-tools
    goto :error
) else (
    echo ✅ Firebase CLI installed
)

REM Test 4: Check package.json
echo.
echo [4] Checking package.json...
if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json not found!
    goto :error
)

REM Test 5: Check .env file
echo.
echo [5] Checking .env file...
if exist ".env" (
    echo ✅ .env file found
) else (
    echo ⚠️  .env file not found - copy from .env.example
)

REM Test 6: Check Firebase config
echo.
echo [6] Checking Firebase configuration...
findstr "EXPO_PUBLIC_FIREBASE_CONFIG" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Firebase config found in .env
) else (
    echo ❌ Firebase config missing in .env
    goto :error
)

REM Test 7: Check dependencies
echo.
echo [7] Checking dependencies...
if exist "node_modules" (
    echo ✅ node_modules found
) else (
    echo ⚠️  node_modules not found - run: npm install
)

echo.
echo ========================================
echo ✅ All basic tests passed!
echo ========================================
echo.
echo You can now run:
echo   ..\start-dev.bat  - Start development server
echo   ..\test-firebase.bat - Test Firebase connection
echo.
goto :end

:error
echo.
echo ========================================
echo ❌ Environment test failed!
echo ========================================
exit /b 1

:end
pause