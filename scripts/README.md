# Firestore Medication Data Cleanup Scripts

This directory contains scripts for cleaning up and migrating medication-related data in Firestore for the Pildhora application.

## Overview

The medication system has been updated, and these scripts help clean up old data to provide a clean slate for the new system. The scripts include safety measures, backup functionality, and validation to ensure data integrity.

## Scripts

### 1. `clean-firestore-data.js`

This script cleans up medication-related data from Firestore. It can delete medications, intake records, and tasks while preserving user accounts and other essential data.

#### Features:
- **Safety First**: Creates automatic backups before deletion
- **Selective Cleaning**: Choose which collections to clean
- **Dry Run Mode**: Preview what would be deleted without actually deleting
- **Batch Processing**: Efficiently handles large datasets
- **Confirmation Prompts**: Prevents accidental data loss
- **Detailed Logging**: Shows exactly what's being deleted

#### Usage:

```bash
# Interactive mode with confirmation
node clean-firestore-data.js

# Dry run to preview what would be deleted
node clean-firestore-data.js --dry-run

# Skip backup (not recommended)
node clean-firestore-data.js --no-backup

# Clean only specific collections
node clean-firestore-data.js --no-tasks

# Skip confirmation prompt (DANGEROUS)
node clean-firestore-data.js --confirm

# Show help
node clean-firestore-data.js --help
```

#### Options:
- `--no-medications`: Skip cleaning medications
- `--no-intake-records`: Skip cleaning intake records
- `--no-tasks`: Skip cleaning tasks
- `--no-backup`: Skip creating backup
- `--dry-run`: Show what would be deleted without actually deleting
- `--confirm`: Skip confirmation prompt (DANGEROUS)
- `--help, -h`: Show help message

### 2. `migrate-medication-data.js`

This script helps migrate medication data, either from current data or from backup files. It includes validation to ensure data integrity.

#### Features:
- **Data Validation**: Validates data structure before migration
- **Backup Support**: Can restore from backup files
- **Selective Migration**: Choose which collections to migrate
- **Validation Mode**: Validate data without migrating
- **Batch Processing**: Efficiently handles large datasets
- **Error Handling**: Detailed error reporting

#### Usage:

```bash
# Interactive migration with validation
node migrate-medication-data.js

# Validate data structure only
node migrate-medication-data.js --validate-only

# Dry run to preview migration
node migrate-medication-data.js --dry-run

# Restore from backup file
node migrate-medication-data.js --backup-file "backups/firestore-backup-2023-01-01.json"

# Migrate specific collections only
node migrate-medication-data.js --collections "medications,intakeRecords"

# Skip backup before migration
node migrate-medication-data.js --no-backup

# Skip confirmation prompt
node migrate-medication-data.js --confirm

# Show help
node migrate-medication-data.js --help
```

#### Options:
- `--backup-file <path>`: Restore from a specific backup file
- `--no-backup`: Skip creating backup before migration
- `--dry-run`: Show what would be migrated without actually migrating
- `--validate-only`: Only validate data structure without migrating
- `--collections <list>`: Comma-separated list of collections to migrate
- `--confirm`: Skip confirmation prompt (DANGEROUS)
- `--help, -h`: Show help message

### 3. `cleanup-medication-data.bat` (Windows)

A convenient batch script for Windows users that provides an interactive menu for common operations.

#### Usage:
```bash
# Run the interactive menu
cleanup-medication-data.bat
```

## Data Collections

### Medications
- **Collection**: `medications`
- **Fields**: name, doseValue, doseUnit, quantityType, frequency, times, patientId, caregiverId
- **Preserved**: User accounts, device data, other app data

### Intake Records
- **Collection**: `intakeRecords`
- **Fields**: medicationName, dosage, scheduledTime, status, patientId, takenAt
- **Preserved**: User accounts, device data, other app data

### Tasks
- **Collection**: `tasks`
- **Fields**: title, description, patientId, caregiverId, completed, dueDate
- **Preserved**: User accounts, device data, other app data

## Safety Measures

### Automatic Backups
- Backups are created automatically before any deletion
- Stored in `backups/` directory with timestamp
- JSON format for easy inspection and restoration
- Includes all document data and metadata

### Confirmation Prompts
- Scripts require explicit confirmation before deletion
- Must type "DELETE" or "MIGRATE" to proceed
- Can be bypassed with `--confirm` flag (not recommended)

### Dry Run Mode
- Preview operations without making changes
- Shows exactly what would be affected
- Safe way to test scripts

### Validation
- Data structure validation before migration
- Checks for required fields
- Reports validation errors before proceeding

## Environment Setup

### Required Files
1. `serviceAccountKey.json` - Firebase service account credentials
2. Environment variables for Firebase configuration
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`

### Dependencies
The scripts use Firebase SDK and Node.js built-in modules. No additional dependencies required beyond what's already in the project.

## Common Workflows

### 1. Clean Slate for New Medication System
```bash
# Preview what will be deleted
node clean-firestore-data.js --dry-run

# Create backup and clean all medication data
node clean-firestore-data.js
```

### 2. Restore from Backup
```bash
# Validate backup first
node migrate-medication-data.js --backup-file "backups/firestore-backup-2023-01-01.json" --validate-only

# Restore from backup
node migrate-medication-data.js --backup-file "backups/firestore-backup-2023-01-01.json"
```

### 3. Selective Cleanup
```bash
# Clean only medications and intake records, preserve tasks
node clean-firestore-data.js --no-tasks
```

### 4. Data Validation
```bash
# Validate current data structure
node migrate-medication-data.js --validate-only
```

## Troubleshooting

### Permission Errors
- Ensure `serviceAccountKey.json` is present and valid
- Check that the service account has Firestore permissions
- Verify environment variables are set correctly

### Network Issues
- Check internet connection
- Verify Firebase project configuration
- Try running with increased timeout

### Large Datasets
- Scripts automatically process in batches of 500 documents
- Monitor progress in console output
- For very large datasets, consider running during off-peak hours

## Best Practices

1. **Always create backups** before any cleanup operation
2. **Use dry run mode** first to preview changes
3. **Validate data** before migration
4. **Test in development** before running in production
5. **Monitor logs** for any errors or warnings
6. **Keep service account key** secure and never commit to version control

## Support

For issues or questions:
1. Check the console output for detailed error messages
2. Verify all prerequisites are met
3. Test with dry run mode first
4. Review the help documentation with `--help` flag