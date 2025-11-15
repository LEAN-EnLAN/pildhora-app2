# Migration Quick Start Guide

## TL;DR

Run this command to migrate existing medication data:

```bash
# Windows
scripts\run-migration.bat

# Mac/Linux
node scripts/run-migration.js
```

## What It Does

Adds new fields to existing data:
- **Medications**: `emoji: '💊'`, `trackInventory: false`
- **Intake Records**: `completionToken`, `deviceSource: 'manual'`

## Prerequisites

1. Download service account key from Firebase Console
2. Save as `serviceAccountKey.json` in project root
3. Run: `npm install firebase-admin dotenv`

## Verify Migration

```bash
node test-migration.js
```

## Full Documentation

See `scripts/MIGRATION_README.md` for complete details.

## Troubleshooting

**Migration already completed?**
- Delete `/migrations/medication-redesign-v1` document in Firestore
- Run migration again

**Service account key not found?**
- Download from Firebase Console > Project Settings > Service Accounts
- Save as `serviceAccountKey.json` in project root

**Permission denied?**
- Verify service account has Firestore permissions
- Check Firebase Security Rules

## Support

Check the implementation summary: `.kiro/specs/medication-management-redesign/TASK19_IMPLEMENTATION_SUMMARY.md`
