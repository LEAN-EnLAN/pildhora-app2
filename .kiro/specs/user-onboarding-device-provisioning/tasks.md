# Implementation Plan

- [x] 1. Enhance user data model and authentication flow





  - Update User interface in types to include onboarding fields (onboardingComplete, onboardingStep, deviceId)
  - Modify authSlice to handle onboarding status in user state
  - Update signup flow to initialize onboarding fields in Firestore user documents
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 9.1_


- [x] 2. Implement onboarding service




  - Create src/services/onboarding.ts with OnboardingService interface
  - Implement needsOnboarding() to check if user requires onboarding
  - Implement getOnboardingStep() to retrieve current onboarding progress
  - Implement updateOnboardingStep() to track wizard progress
  - Implement completeOnboarding() to mark onboarding as finished
  - Add error handling with user-friendly messages
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 3. Implement connection code service





  - Create src/services/connectionCode.ts with ConnectionCodeService interface
  - Implement generateCode() to create time-limited connection codes
  - Implement validateCode() to check code validity and expiration
  - Implement useCode() to mark code as used and create device link
  - Implement revokeCode() to invalidate codes
  - Implement getActiveCodes() to list patient's active codes
  - Add Firestore connectionCodes collection schema
  - Add security rules for connectionCodes collection
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
-

- [x] 4. Create routing service for post-authentication navigation




  - Create src/services/routing.ts with RoutingService interface
  - Implement getPostAuthRoute() to determine user destination after login
  - Implement hasCompletedSetup() to check if user finished onboarding
  - Add logic to route patients without devices to provisioning wizard
  - Add logic to route caregivers without links to connection interface
  - Add logic to route completed users to their home/dashboard
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5. Update authentication screens with routing logic





  - Modify app/auth/login.tsx to use routing service after successful login
  - Modify app/auth/signup.tsx to use routing service after account creation
  - Update app/index.tsx to check onboarding status and route accordingly
  - Add loading states during routing determination
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
-

- [x] 6. Create device provisioning wizard structure




  - Create app/patient/device-provisioning.tsx as wizard container
  - Create src/components/patient/provisioning/ directory for wizard components
  - Implement WizardContainer component with step navigation
  - Implement WizardProgressIndicator to show current step
  - Add wizard state management (local state or Redux slice)
  - Implement step validation and navigation logic
  - _Requirements: 3.1, 3.2, 11.1, 11.2_

- [x] 7. Implement device provisioning wizard steps






- [x] 7.1 Create Step 1: Welcome and Instructions






  - Build WelcomeStep component with setup overview
  - Add visual guide for locating device ID
  - Include troubleshooting tips and help links
  - _Requirements: 3.1, 11.1, 11.4_

-

- [x] 7.2 Create Step 2: Device ID Entry





  - Build DeviceIdStep component with input field
  - Add real-time format validation (alphanumeric, 5-100 chars)
  - Implement device availability check
  - Show inline validation errors
  - _Requirements: 3.2, 3.3, 4.3, 11.3, 11.4_


-

- [x] 7.3 Create Step 3: Device Verification






  - Build VerificationStep component
  - Verify device exists and is unclaimed
  - Create device document in Firestore with patient as owner
  - Create deviceLink document for patient
  - Update RTDB users/{userId}/devices mapping
  - Show verification progress
  - _Requirements: 3.4, 4.1, 4.2, 4.4, 4.5_


-

- [x] 7.4 Create Step 4: WiFi Configuration





  - Build WiFiConfigStep component
  - Add WiFi SSID and password input fields
  - Implement secure credential handling
  - Write WiFi config to RTDB devices/{deviceId}/config
  - Add connection testing and feedback
  - _Requirements: 3.5, 10.1, 10.2, 10.3_





- [x] 7.5 Create Step 5: Device Preferences





  - Build PreferencesStep component
  - Add alarm mode selector (sound/vibrate/both/silent)
  - Add LED intensity slider (0-100)
  - Add LED color picker
  - Add volume slider (0-100)
  - Implement test alarm functionality
  - Save preferences using deviceConfig service
  - _Requirements: 3.6, 10.1, 10.2_

-

- [x] 7.6 Create Step 6: Completion





  - Build CompletionStep component
  - Show success message and summary
  - Mark onboarding as complete in user document
  - Provide next steps guidance
  - Add button to navigate to patient home
  - _Requirements: 3.7, 3.8, 9.4_
-

- [x] 8. Implement device connection interface for caregivers




  - Create app/caregiver/device-connection.tsx
  - Build connection code entry form with validation
  - Implement code format validation (6-8 alphanumeric)
  - Add real-time code validation feedback
  - _Requirements: 5.1, 5.2, 5.3_
-

- [x] 9. Implement connection flow components




- [x] 9.1 Create connection code validation







  - Call connectionCodeService.validateCode() on code entry
  - Handle expired codes with clear error messages
  - Handle already-used codes
  - Handle invalid codes
  - _Requirements: 5.3, 5.4_
-

- [x] 9.2 Create patient information display






  - Fetch and display patient name from validated code
  - Show device information
  - Display connection confirmation dialog
  - Add cancel option
  - _Requirements: 5.4_

- [x] 9.3 Create connection establishment







  - Call connectionCodeService.useCode() to create link
  - Create deviceLink document in Firestore
  - Update RTDB users/{caregiverId}/devices mapping
  - Send notification to patient about new caregiver connection
  - _Requirements: 5.4, 5.5, 5.6_
-

- [x] 9.4 Create success confirmation






  - Show successful connection message
  - Display patient dashboard preview
  - Mark caregiver onboarding as complete
  - Add button to navigate to caregiver dashboard
  - _Requirements: 5.6, 9.5_
- [x] 10. Create patient device management screen




- [ ] 10. Create patient device management screen

  - Create app/patient/device-settings.tsx
  - Display connected caregivers list with names and connection dates
  - Implement revoke caregiver access functionality
  - Add connection code generation button
  - Display active connection codes with expiration times
  - Add code revocation functionality
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
-

- [x] 11. Enhance device document schema




  - Update Device interface in types to include provisioning fields
  - Add provisioningStatus field (pending/active/inactive)
  - Add provisionedAt and provisionedBy fields
  - Add wifiConfigured and wifiSSID fields
  - Update device creation logic to set provisioning metadata
  - _Requirements: 3.4, 4.1, 4.4_

- [x] 12. Update Firestore security rules





- [x] 12.1 Add device provisioning rules






  - Allow device creation only for unclaimed devices
  - Restrict device updates to device owner
  - Allow read access to device owner and linked caregivers
  - _Requirements: 4.1, 4.2, 4.5, 12.1, 12.2, 12.3, 12.4_

-

- [x] 12.2 Add connection code rules





  - Allow patients to create codes for their devices
  - Allow authenticated users to read codes for validation
  - Allow patients to delete their own codes
  - Allow code usage marking by authenticated users
  - Prevent code reuse
  - _Requirements: 5.1, 5.2, 5.3, 12.1, 12.2, 12.3, 12.4_



- [x] 12.3 Add deviceLink rules






  - Enforce proper authorization for link creation
  - Allow users to read their own links
  - Allow device owners to revoke caregiver links
  - _Requirements: 5.4, 5.5, 7.4, 12.1, 12.2, 12.3, 12.4_
-

- [x] 13. Implement data synchronization




  - Ensure medication changes sync to device within 5 seconds
  - Ensure device events sync to Firestore within 5 seconds
  - Implement offline queue for network interruptions
  - Add sync status indicators in UI
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
-

- [x] 14. Add role-based screen variants




  - Update shared screens to detect user role from auth state
  - Implement patient variant rendering for shared screens
  - Implement caregiver variant rendering for shared screens
  - Show device management features only to device owners
  - Show patient selection features only to caregivers
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 15. Implement caregiver treatment control





  - Enable medication creation for caregivers on linked devices
  - Enable medication editing for caregivers on linked devices
  - Enable medication deletion for caregivers on linked devices
  - Display all medication events from linked devices to caregivers
  - Enable device action triggers for caregivers
  - Implement critical event notifications for caregivers
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
- [x] 16. Create error handling components






- [ ] 16. Create error handling components



- [x] 16.1 Create device provisioning error handler





  - Handle DEVICE_NOT_FOUND errors with troubleshooting steps
  - Handle DEVICE_ALREADY_CLAIMED errors with clear messaging
  - Handle INVALID_DEVICE_ID errors with format guidance
  - Handle WIFI_CONFIG_FAILED errors with retry options
  - Handle DEVICE_OFFLINE errors with connectivity tips
  - Handle PERMISSION_DENIED errors with support guidance
  - _Requirements: 11.4, 11.6_
-

- [x] 16.2 Create connection code error handler





  - Handle CODE_NOT_FOUND errors
  - Handle CODE_EXPIRED errors with new code generation prompt
  - Handle CODE_ALREADY_USED errors
  - Handle INVALID_CODE_FORMAT errors with format guidance
  - Handle DEVICE_NOT_FOUND errors
  - _Requirements: 11.4_
-

- [x] 17. Add wizard persistence and recovery




  - Save wizard progress to AsyncStorage
  - Implement resume from last completed step
  - Add "Continue Setup" prompt on app restart
  - Clear wizard data on completion or cancellation
  - _Requirements: 11.5_

- [x] 18. Implement accessibility features





  - Add keyboard navigation to wizard steps
  - Implement screen reader announcements for step changes
  - Add ARIA labels to all form inputs
  - Ensure minimum touch target sizes (44x44)
  - Add high contrast mode support
  - Test with screen readers
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 19. Add internationalization support





  - Extract all wizard text to translation files
  - Extract all error messages to translation files
  - Extract all button labels to translation files
  - Add Spanish translations
  - Add English translations
  - Test language switching
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 20. Create onboarding analytics





  - Track wizard step completion rates
  - Track wizard abandonment points
  - Track time spent on each step
  - Track device provisioning success rate
  - Track connection code usage metrics
  - Track error occurrences by type
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 21. Write integration tests
  - Test complete patient onboarding flow (signup → provision → home)
  - Test complete caregiver onboarding flow (signup → connect → dashboard)
  - Test multi-caregiver connection to same patient
  - Test device already claimed scenario
  - Test expired connection code scenario
  - Test network failure recovery
  - _Requirements: All_

- [ ]* 22. Write unit tests
  - Test onboardingService methods
  - Test connectionCodeService methods
  - Test routingService logic
  - Test device ID validation
  - Test connection code generation and validation
  - Test error handlers
  - _Requirements: All_
- [x] 23. Create user documentation




- [ ] 23. Create user documentation

  - Write patient device provisioning guide
  - Write caregiver connection guide
  - Create troubleshooting documentation
  - Add FAQ section
  - Create video tutorials (optional)
  - _Requirements: 11.1, 11.6_

- [x] 24. Perform security audit





  - Review Firestore security rules
  - Review RTDB security rules
  - Test unauthorized access attempts
  - Verify WiFi credential encryption
  - Test connection code security
  - Verify device ownership enforcement
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 25. Optimize performance





  - Implement lazy loading for wizard steps
  - Add caching for device validation
  - Optimize Firestore queries with indexes
  - Implement optimistic UI updates
  - Add progress indicators for async operations
  - Test on slow network conditions
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 26. Handle existing user migration




  - Add migration script to add onboarding fields to existing users
  - Set onboardingComplete=true for users with devices
  - Set onboardingComplete=false for users without devices
  - Test migration with production data snapshot
  - _Requirements: 9.1, 9.2, 9.3_
-

- [x] 27. Final integration and testing




  - Test complete end-to-end flows for both roles
  - Verify all requirements are met
  - Test on multiple devices (iOS, Android, Web)
  - Perform user acceptance testing
  - Fix any remaining bugs
  - Prepare for deployment
  - _Requirements: All_
