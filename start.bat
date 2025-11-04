@echo off
echo ========================================
echo PildHora Development Launcher
echo ========================================
echo.
echo What would you like to do?
echo.
echo [1] Test environment (recommended first)
echo [2] Start development server
echo [3] Full setup and run (first time)
echo [4] Test Firebase connection
echo [5] Show help
echo [6] Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto :test
if "%choice%"=="2" goto :start
if "%choice%"=="3" goto :setup
if "%choice%"=="4" goto :firebase
if "%choice%"=="5" goto :help
if "%choice%"=="6" goto :exit

echo Invalid choice!
pause
goto :end

:test
cd scripts
call test-env.bat
cd ..
goto :end

:start
cd scripts
call start-dev.bat
cd ..
goto :end

:setup
cd scripts
call setup-and-run.bat
cd ..
goto :end

:firebase
cd scripts
call test-firebase.bat
cd ..
goto :end

:help
cd scripts
call help.bat
cd ..
goto :end

:exit
echo Goodbye!
exit /b 0

:end
pause