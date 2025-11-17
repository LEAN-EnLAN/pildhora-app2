# User Onboarding Migration - Visual Guide

## Migration Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    START MIGRATION                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Initialize Firebase Admin SDK                        │
│         - Load service account key                           │
│         - Connect to Firestore                               │
│         - Connect to RTDB                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Check Migration Status                               │
│         migrations/user-onboarding-v1                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
    ┌──────────────────┐  ┌──────────────────┐
    │   Already Run?   │  │  In Progress?    │
    │   Exit           │  │  Exit            │
    └──────────────────┘  └──────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│         Create Migration Status Document                     │
│         status: 'in_progress'                                │
│         startedAt: now                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Fetch All Users from Firestore                       │
│         collection('users').get()                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Process Each User                                    │
│         (Batch size: 500)                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │  Already Has     │  │  Needs           │
    │  Onboarding      │  │  Migration       │
    │  Fields?         │  │                  │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             │ Skip                │ Process
             │                     │
             │                     ▼
             │          ┌──────────────────────┐
             │          │  Check User Role     │
             │          └──────────┬───────────┘
             │                     │
             │          ┌──────────┴──────────┐
             │          │                     │
             │          ▼                     ▼
             │  ┌──────────────┐    ┌──────────────┐
             │  │   Patient    │    │  Caregiver   │
             │  └──────┬───────┘    └──────┬───────┘
             │         │                   │
             │         ▼                   ▼
             │  ┌──────────────┐    ┌──────────────┐
             │  │ Check Device │    │ Check Links  │
             │  │ - Firestore  │    │ - deviceLinks│
             │  │ - RTDB       │    │   collection │
             │  └──────┬───────┘    └──────┬───────┘
             │         │                   │
             │    ┌────┴────┐         ┌────┴────┐
             │    ▼         ▼         ▼         ▼
             │  ┌───┐     ┌───┐     ┌───┐     ┌───┐
             │  │Has│     │No │     │Has│     │No │
             │  │Dev│     │Dev│     │Lnk│     │Lnk│
             │  └─┬─┘     └─┬─┘     └─┬─┘     └─┬─┘
             │    │         │         │         │
             │    ▼         ▼         ▼         ▼
             │  ┌───────────────────────────────┐
             │  │  Set Onboarding Fields        │
             │  │  - onboardingComplete         │
             │  │  - onboardingStep             │
             │  └───────────┬───────────────────┘
             │              │
             └──────────────┴──────────────────┐
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │  Add to Batch    │
                                    │  (max 500)       │
                                    └────────┬─────────┘
                                             │
                                    ┌────────┴────────┐
                                    │                 │
                                    ▼                 ▼
                            ┌──────────────┐  ┌──────────────┐
                            │ Batch Full?  │  │ More Users?  │
                            │ Commit       │  │ Continue     │
                            └──────┬───────┘  └──────┬───────┘
                                   │                 │
                                   └────────┬────────┘
                                            │
                                            ▼
                                ┌──────────────────────┐
                                │  Commit Final Batch  │
                                └──────────┬───────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  Update Migration    │
                                │  Status              │
                                │  status: 'completed' │
                                │  completedAt: now    │
                                │  details: stats      │
                                └──────────┬───────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │   MIGRATION COMPLETE │
                                └──────────────────────┘
```

## User Processing Decision Tree

```
                        ┌─────────────┐
                        │  User Doc   │
                        └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ Has onboardingComplete│  │ No onboarding fields │
        │ field?                │  │                      │
        └──────────┬────────────┘  └──────────┬───────────┘
                   │                          │
                   ▼                          ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │  SKIP                │  │  PROCESS             │
        │  (Already migrated)  │  │                      │
        └──────────────────────┘  └──────────┬───────────┘
                                              │
                                   ┌──────────┴──────────┐
                                   │                     │
                                   ▼                     ▼
                        ┌──────────────────┐  ┌──────────────────┐
                        │  role: 'patient' │  │ role: 'caregiver'│
                        └────────┬─────────┘  └────────┬─────────┘
                                 │                     │
                                 ▼                     ▼
                    ┌────────────────────┐  ┌────────────────────┐
                    │  Check for Device  │  │  Check for Links   │
                    │                    │  │                    │
                    │  Firestore:        │  │  deviceLinks:      │
                    │  devices           │  │  - userId match    │
                    │  .where(           │  │  - role=caregiver  │
                    │   'primaryPatientId│  │  - status=active   │
                    │    === userId)     │  │                    │
                    │                    │  │                    │
                    │  RTDB:             │  │                    │
                    │  users/{userId}/   │  │                    │
                    │  devices           │  │                    │
                    └────────┬───────────┘  └────────┬───────────┘
                             │                       │
                    ┌────────┴────────┐     ┌────────┴────────┐
                    │                 │     │                 │
                    ▼                 ▼     ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ Has Device   │  │ No Device    │  │ Has Links    │  │ No Links     │
            └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                   │                 │                 │                 │
                   ▼                 ▼                 ▼                 ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │ onboardingComplete│ │ onboardingComplete│ │ onboardingComplete│ │ onboardingComplete│
        │ = true          │ │ = false         │ │ = true          │ │ = false         │
        │                 │ │                 │ │                 │ │                 │
        │ onboardingStep  │ │ onboardingStep  │ │ onboardingStep  │ │ onboardingStep  │
        │ = 'complete'    │ │ = 'device_      │ │ = 'complete'    │ │ = 'device_      │
        │                 │ │    provisioning'│ │                 │ │    connection'  │
        └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Before and After States

### Patient with Device

```
BEFORE MIGRATION                    AFTER MIGRATION
┌─────────────────────┐            ┌─────────────────────┐
│ User Document       │            │ User Document       │
├─────────────────────┤            ├─────────────────────┤
│ id: 'user-123'      │            │ id: 'user-123'      │
│ email: 'p@ex.com'   │            │ email: 'p@ex.com'   │
│ name: 'John'        │            │ name: 'John'        │
│ role: 'patient'     │            │ role: 'patient'     │
│ createdAt: Date     │            │ createdAt: Date     │
│                     │   ──────>  │ onboardingComplete: │
│                     │            │   true          ✓   │
│                     │            │ onboardingStep:     │
│                     │            │   'complete'    ✓   │
│                     │            │ updatedAt: Date ✓   │
└─────────────────────┘            └─────────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────────┐            ┌─────────────────────┐
│ Device Document     │            │ Device Document     │
├─────────────────────┤            ├─────────────────────┤
│ id: 'DEVICE-001'    │            │ id: 'DEVICE-001'    │
│ primaryPatientId:   │            │ primaryPatientId:   │
│   'user-123'    ✓   │            │   'user-123'    ✓   │
└─────────────────────┘            └─────────────────────┘

Result: onboardingComplete = true (has device)
```

### Patient without Device

```
BEFORE MIGRATION                    AFTER MIGRATION
┌─────────────────────┐            ┌─────────────────────┐
│ User Document       │            │ User Document       │
├─────────────────────┤            ├─────────────────────┤
│ id: 'user-456'      │            │ id: 'user-456'      │
│ email: 'n@ex.com'   │            │ email: 'n@ex.com'   │
│ name: 'Jane'        │            │ name: 'Jane'        │
│ role: 'patient'     │            │ role: 'patient'     │
│ createdAt: Date     │            │ createdAt: Date     │
│                     │   ──────>  │ onboardingComplete: │
│                     │            │   false         ✓   │
│                     │            │ onboardingStep:     │
│                     │            │   'device_          │
│                     │            │    provisioning' ✓  │
│                     │            │ updatedAt: Date ✓   │
└─────────────────────┘            └─────────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────────┐            ┌─────────────────────┐
│ No Device Found ✗   │            │ No Device Found ✗   │
└─────────────────────┘            └─────────────────────┘

Result: onboardingComplete = false (no device)
```

### Caregiver with Links

```
BEFORE MIGRATION                    AFTER MIGRATION
┌─────────────────────┐            ┌─────────────────────┐
│ User Document       │            │ User Document       │
├─────────────────────┤            ├─────────────────────┤
│ id: 'user-789'      │            │ id: 'user-789'      │
│ email: 'c@ex.com'   │            │ email: 'c@ex.com'   │
│ name: 'Bob'         │            │ name: 'Bob'         │
│ role: 'caregiver'   │            │ role: 'caregiver'   │
│ createdAt: Date     │            │ createdAt: Date     │
│ patients: [...]     │   ──────>  │ patients: [...]     │
│                     │            │ onboardingComplete: │
│                     │            │   true          ✓   │
│                     │            │ onboardingStep:     │
│                     │            │   'complete'    ✓   │
│                     │            │ updatedAt: Date ✓   │
└─────────────────────┘            └─────────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────────┐            ┌─────────────────────┐
│ DeviceLink Document │            │ DeviceLink Document │
├─────────────────────┤            ├─────────────────────┤
│ userId: 'user-789'  │            │ userId: 'user-789'  │
│ role: 'caregiver'   │            │ role: 'caregiver'   │
│ status: 'active' ✓  │            │ status: 'active' ✓  │
└─────────────────────┘            └─────────────────────┘

Result: onboardingComplete = true (has links)
```

### Caregiver without Links

```
BEFORE MIGRATION                    AFTER MIGRATION
┌─────────────────────┐            ┌─────────────────────┐
│ User Document       │            │ User Document       │
├─────────────────────┤            ├─────────────────────┤
│ id: 'user-012'      │            │ id: 'user-012'      │
│ email: 'nc@ex.com'  │            │ email: 'nc@ex.com'  │
│ name: 'Alice'       │            │ name: 'Alice'       │
│ role: 'caregiver'   │            │ role: 'caregiver'   │
│ createdAt: Date     │            │ createdAt: Date     │
│                     │   ──────>  │ onboardingComplete: │
│                     │            │   false         ✓   │
│                     │            │ onboardingStep:     │
│                     │            │   'device_          │
│                     │            │    connection'  ✓   │
│                     │            │ updatedAt: Date ✓   │
└─────────────────────┘            └─────────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────────┐            ┌─────────────────────┐
│ No Links Found ✗    │            │ No Links Found ✗    │
└─────────────────────┘            └─────────────────────┘

Result: onboardingComplete = false (no links)
```

## Batch Processing Visualization

```
Users Collection (150 users)
┌────────────────────────────────────────────────────────────┐
│ user-001, user-002, user-003, ... user-150                 │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Split into Batches  │
              │  (500 per batch)     │
              └──────────┬───────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Batch 1    │  │  Batch 2    │  │  Batch 3    │
│  (500)      │  │  (500)      │  │  (500)      │
│             │  │             │  │             │
│ user-001    │  │ user-501    │  │ user-1001   │
│ user-002    │  │ user-502    │  │ user-1002   │
│ ...         │  │ ...         │  │ ...         │
│ user-500    │  │ user-1000   │  │ user-1500   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Commit     │  │  Commit     │  │  Commit     │
│  Batch 1    │  │  Batch 2    │  │  Batch 3    │
└─────────────┘  └─────────────┘  └─────────────┘

For this example (150 users):
┌─────────────┐
│  Batch 1    │
│  (150)      │
│             │
│ user-001    │
│ user-002    │
│ ...         │
│ user-150    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Commit     │
│  Single     │
│  Batch      │
└─────────────┘
```

## Migration Status Timeline

```
Time ──────────────────────────────────────────────────────>

T0: Start Migration
    │
    ├─> Create status document
    │   status: 'in_progress'
    │   startedAt: T0
    │
T1: Process Users
    │
    ├─> Batch 1 (users 1-500)
    │   └─> Commit
    │
    ├─> Batch 2 (users 501-1000)
    │   └─> Commit
    │
    ├─> Batch 3 (remaining users)
    │   └─> Commit
    │
T2: Complete Migration
    │
    └─> Update status document
        status: 'completed'
        completedAt: T2
        usersProcessed: 150
        details: { ... }
```

## Error Handling Flow

```
┌─────────────────────┐
│  Process User       │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │  Try Block   │
    └──────┬───────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌────────┐
│Success │   │ Error  │
└───┬────┘   └───┬────┘
    │            │
    │            ▼
    │     ┌──────────────┐
    │     │ Log Error    │
    │     │ Add to Array │
    │     └──────┬───────┘
    │            │
    │            ▼
    │     ┌──────────────┐
    │     │ Continue     │
    │     │ Next User    │
    │     └──────┬───────┘
    │            │
    └────────────┴────────>
                 │
                 ▼
          ┌──────────────┐
          │ All Users    │
          │ Processed    │
          └──────┬───────┘
                 │
          ┌──────┴──────┐
          │             │
          ▼             ▼
    ┌─────────┐   ┌─────────┐
    │No Errors│   │ Errors  │
    │status:  │   │ status: │
    │complete │   │ failed  │
    └─────────┘   └─────────┘
```

## Test vs Actual Migration

```
┌──────────────────────────────────────────────────────────┐
│                    TEST MIGRATION                         │
│                  (Dry Run - No Changes)                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. Read all users                                        │
│  2. Analyze each user                                     │
│  3. Determine what WOULD happen                           │
│  4. Report results                                        │
│  5. NO database writes                                    │
│                                                           │
│  Output: Analysis report                                  │
│  - Total users                                            │
│  - Already migrated                                       │
│  - Would be migrated                                      │
│  - Breakdown by category                                  │
│  - Potential errors                                       │
│                                                           │
└──────────────────────────────────────────────────────────┘

                         │
                         │ If test passes
                         ▼

┌──────────────────────────────────────────────────────────┐
│                   ACTUAL MIGRATION                        │
│                  (Makes Real Changes)                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. Check migration status                                │
│  2. Create status document                                │
│  3. Read all users                                        │
│  4. Process each user                                     │
│  5. Write onboarding fields                               │
│  6. Commit in batches                                     │
│  7. Update status to complete                             │
│                                                           │
│  Output: Migration complete                               │
│  - Users processed                                        │
│  - Breakdown by category                                  │
│  - Errors (if any)                                        │
│  - Status document updated                                │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Summary

This visual guide illustrates:
- Complete migration flow from start to finish
- User processing decision tree
- Before/after states for each user type
- Batch processing mechanism
- Migration status timeline
- Error handling approach
- Difference between test and actual migration

Use these diagrams to understand how the migration works and what to expect at each stage.
