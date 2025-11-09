@echo off
echo ========================================
echo Medication Data Cleanup Utility
echo ========================================
echo.
echo This utility helps clean up medication-related data from Firestore.
echo Please choose an option:
echo.
echo 1. Clean all medication data (with backup)
echo 2. Clean all medication data (dry run - preview only)
echo 3. Clean medications only
echo 4. Clean intake history only
echo 5. Clean tasks only
echo 6. Restore from backup
echo 7. Validate data structure
echo 8. Show help
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" (
    echo.
    echo Cleaning all medication data with backup...
    node clean-firestore-data.js --confirm
) else if "%choice%"=="2" (
    echo.
    echo Previewing cleanup (dry run)...
    node clean-firestore-data.js --dry-run
) else if "%choice%"=="3" (
    echo.
    echo Cleaning medications only...
    node clean-firestore-data.js --no-intake-records --no-tasks --confirm
) else if "%choice%"=="4" (
    echo.
    echo Cleaning intake history only...
    node clean-firestore-data.js --no-medications --no-tasks --confirm
) else if "%choice%"=="5" (
    echo.
    echo Cleaning tasks only...
    node clean-firestore-data.js --no-medications --no-intake-records --confirm
) else if "%choice%"=="6" (
    echo.
    set /p backupFile="Enter backup file path: "
    echo Restoring from backup: %backupFile%
    node migrate-medication-data.js --backup-file "%backupFile%" --confirm
) else if "%choice%"=="7" (
    echo.
    echo Validating data structure...
    node migrate-medication-data.js --validate-only
) else if "%choice%"=="8" (
    echo.
    echo Showing help for cleanup script...
    node clean-firestore-data.js --help
    echo.
    echo Showing help for migration script...
    node migrate-medication-data.js --help
) else (
    echo.
    echo Invalid choice. Please run the script again.
)

echo.
echo Press any key to exit...
pause > nul