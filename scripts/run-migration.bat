@echo off
REM Medication Data Migration Script for Windows
REM This script runs the medication data migration

echo ========================================
echo Medication Data Migration
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if service account key exists
if not exist "serviceAccountKey.json" (
    echo ERROR: Service account key not found
    echo.
    echo Please download the service account key from Firebase Console:
    echo 1. Go to Project Settings ^> Service Accounts
    echo 2. Click "Generate New Private Key"
    echo 3. Save as serviceAccountKey.json in the project root
    echo.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found
    echo Make sure Firebase configuration is set up correctly
    echo.
)

REM Install dependencies if needed
echo Checking dependencies...
call npm list firebase-admin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing firebase-admin...
    call npm install firebase-admin
)

call npm list dotenv >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing dotenv...
    call npm install dotenv
)

echo.
echo Starting migration...
echo.

REM Run the migration script
node scripts\run-migration.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo You can verify the migration by running:
    echo   node test-migration.js
    echo.
) else (
    echo.
    echo ========================================
    echo Migration failed!
    echo ========================================
    echo.
    echo Please check the error messages above
    echo.
)

pause
