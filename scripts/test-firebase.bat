@echo off
echo ========================================
echo Testing Firebase Connection
echo ========================================
echo.

REM Check if .env exists
if not exist "..\.env" (
    echo ❌ .env file not found!
    pause
    exit /b 1
)

echo 🔥 Testing Firebase connection...
echo.
echo This will create a test file to verify Firebase is working.
echo.

REM Create a simple test file
echo import { db } from './src/services/firebase/index.ts'; > ..\test-firebase.js
echo import { collection, getDocs } from 'firebase/firestore'; >> ..\test-firebase.js
echo. >> ..\test-firebase.js
echo async function testFirebase() { >> ..\test-firebase.js
echo   try { >> ..\test-firebase.js
echo     console.log('Testing Firebase connection...'); >> ..\test-firebase.js
echo     const querySnapshot = await getDocs(collection(db, 'test')); >> ..\test-firebase.js
echo     console.log('✅ Firebase connection successful!'); >> ..\test-firebase.js
echo     console.log(`Found ${querySnapshot.size} documents in test collection`); >> ..\test-firebase.js
echo   } catch (error) { >> ..\test-firebase.js
echo     console.error('❌ Firebase connection failed:', error.message); >> ..\test-firebase.js
echo   } >> ..\test-firebase.js
echo } >> ..\test-firebase.js
echo. >> ..\test-firebase.js
echo testFirebase(); >> ..\test-firebase.js

echo ✅ Test file created: test-firebase.js
echo.
echo To run the test:
echo   1. Start the development server first
echo   2. Run: node test-firebase.js
echo.
echo Or test manually in your app by adding Firebase calls
echo.
pause