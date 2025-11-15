# Implementation Plan

- [x] 1. HOTFIX: Implement duplicate dose prevention




  - Create `canTakeDose` function that queries existing intake records for the same medication and scheduled time
  - Add completion check before creating new intake record in `handleTakeUpcomingMedication`
  - Update `UpcomingDoseCard` component to accept and display `isCompleted` prop
  - Add visual indicators (checkmark, disabled state) for completed doses
  - Modify adherence calculation to use unique dose identifiers
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. HOTFIX: Implement dose inventory tracking




  - Add inventory fields to Medication type: `trackInventory`, `currentQuantity`, `initialQuantity`, `lowQuantityThreshold`, `lastRefillDate`
  - Create `InventoryService` with methods: `decrementInventory`, `refillInventory`, `checkLowQuantity`, `getInventoryStatus`
  - Integrate inventory decrement into dose taking flow after successful intake recording
  - Implement low quantity threshold calculation based on dosing schedule
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_




- [x] 3. HOTFIX: Implement low quantity alerts






  - Create `LowQuantityBanner` component for medication detail screen
  - Add low quantity badge to `MedicationCard` component
  - Implement notification trigger when inventory falls below threshold
  - Create refill dialog component with quantity input and date update




  - Add daily background check for low inventory medications
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 4. Create medication wizard container and navigation

  - Create `MedicationWizard` container component with step management
  - Implement wizard state management for form data persistence across steps
  - Build step navigation logic with validation gates
  - Create progress indicator component showing current step
  - Add exit confirmation dialog for unsaved changes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_




- [ ] 5. Implement Step 1: Icon & Name Selection

  - Create `MedicationIconNameStep` component
  - Integrate native emoji picker using platform APIs or `expo-emoji-picker`
  - Build emoji preview display (72x72 dp)



  - Add medication name text input with character limit (50)
  - Implement real-time validation for emoji and name fields
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Implement Step 2: Schedule Configuration









  - Create `MedicationScheduleStep` component with visual time picker
  - Build multiple time slot management (add/remove times)



  - Implement day-of-week selector with chip UI
  - Create visual timeline preview component
  - Add 12/24 hour format support based on device settings
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7. Integrate native alarm system





  - Create `AlarmService` abstraction layer for platform-specific alarm APIs
  - Implement iOS alarm creation using `expo-notifications` with `UNCalendarNotificationTrigger`
  - Implement Android alarm creation using `expo-notifications` with `AlarmManager`
  - Add alarm permission request flow with user guidance
  - Store alarm IDs in medication record for future updates/deletions


  - Implement alarm update and deletion methods

  - Add fallback to in-app notifications if permissions denied
  - _Requirements: 3.5_

- [x] 8. Implement Step 3: Dosage Configuration





  - Create `MedicationDosageStep` component with large numeric input
  - Build visual unit selector from predefined list
  - Implement quantity type selector with icons
  - Create dosage visualizer component (pills, liquid, weight representations)



  - Add decimal value support and validation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Implement Step 4: Inventory Setup






  - Create `MedicationInventoryStep` component (add mode only)



  - Build initial quantity input with large numeric keypad
  - Implement auto-calculation of low quantity threshold
  - Add visual quantity indicator (progress bar or pill count)
  - Create manual threshold adjustment option
  - Add skip option for medications without inventory tracking
  - _Requirements: 8.1, 8.5_





- [x] 10. Integrate wizard with medication creation flow






  - Replace existing `MedicationForm` with `MedicationWizard` in add medication screen
  - Update medication creation Redux action to handle new fields (emoji, nativeAlarmIds, inventory)
  - Implement wizard completion handler that saves medication with all new fields



  - Add error handling and retry logic for save failures
  - _Requirements: 1.3_

- [x] 11. Integrate wizard with medication editing flow






  - Add `MedicationWizard` to edit medication screen with pre-populated data


  - Implement data migration for existing medications (default emoji, skip inventory step)
  - Update medication update Redux action to handle new fields
  - Handle alarm updates when schedule changes
  - Preserve unmodified fields during partial updates
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 12. Create medication event data model and service





  - Define `MedicationEvent` interface with all required fields
  - Create Firestore collection structure for `medicationEvents`
  - Build `EventQueueService` for local event storage and sync
  - Implement event generation helper functions for create/update/delete operations


  - Add event persistence using AsyncStorage for offline queue
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Implement event queue and sync system






  - Create `MedicationEventQueue` class with enqueue/dequeue methods
  - Implement immediate sync attempt on event creation



  - Add background sync with 5-minute retry interval
  - Implement app foreground sync trigger
  - Create sync status tracking and error handling
  - Add pending event count indicator in UI
  - _Requirements: 6.3, 6.4_




- [x] 14. Integrate event generation into medication lifecycle




- [ ] 14. Integrate event generation into medication lifecycle


  - Add event generation to `addMedication` Redux thunk
  - Add event generation to `updateMedication` Redux thunk with change diff
  - Add event generation to `deleteMedication` Redux thunk
  - Implement caregiver ID validation before event creation



  - Add error handling that doesn't block medication operations
  - _Requirements: 6.1, 6.5_

- [x] 15. Create caregiver event registry UI

  - Create `MedicationEventRegistry` screen component
  - Build event list with infinite scroll and pull-to-refresh




  - Implement event card component with type icons and color coding
  - Add relative timestamp display ("2 hours ago")
  - Create Firestore listener for real-time event updates
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 16. Implement event filtering and search





  - Create filter controls for patient, event type, and date range
  - Build search functionality for medication name
  - Implement Firestore queries with filter combinations
  - Add filter state management and persistence
  - Create clear filters action
  - _Requirements: 10.4_

- [x] 17. Create event detail view






  - Build event detail screen showing full medication snapshot
  - Implement change diff display for update events
  - Add patient contact information section
  - Create action buttons: "View Medication", "Contact Patient"
  - Add navigation to patient's medication list
  - _Requirements: 10.5_

- [ ] 18. Update Firestore security rules

  - Add security rules for `medicationEvents` collection
  - Restrict event read access to assigned caregiver only
  - Restrict event write access to authenticated patients
  - Add validation rules for event data structure
  - Implement rate limiting rules (max 100 events/hour per patient)
  - _Requirements: 6.5_

- [ ] 19. Implement data migration for existing medications

  - Create migration script to add default emoji (💊) to existing medications
  - Set `trackInventory: false` for all existing medications
  - Generate `completionToken` for existing intake records
  - Backfill `deviceSource: 'manual'` for existing intake records
  - Add migration status tracking to prevent duplicate runs
  - _Requirements: 1.1, 7.5, 8.1_

- [ ] 20. Add accessibility features

  - Implement screen reader support for wizard step progress
  - Add ARIA labels to all interactive elements
  - Ensure minimum touch target size (44x44 dp) for all buttons
  - Add haptic feedback for step transitions and dose completion
  - Implement keyboard navigation for wizard steps
  - Add high contrast mode support for visual indicators
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.3, 9.1_

- [x] 21. Performance optimization






  - Add Firestore indexes for `medicationId`, `scheduledTime`, `status` on intakeRecords
  - Implement lazy loading for wizard step components
  - Add debouncing (300ms) to validation checks
  - Optimize medication card renders with React.memo
  - Implement virtualization for event registry list
  - Add skeleton loaders for async operations
  - _Requirements: 7.1, 10.1_

- [x] 22. Error handling and edge cases






  - Add network error handling with offline queue for all operations
  - Implement permission error guidance for alarms and notifications
  - Add validation error messages for all form fields
  - Handle platform API failures with graceful degradation
  - Add retry logic with exponential backoff for sync failures
  - Implement error logging for debugging
  - _Requirements: 1.5, 3.5, 6.3, 7.5_
