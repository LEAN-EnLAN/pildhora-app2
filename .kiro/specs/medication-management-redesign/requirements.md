# Requirements Document

## Introduction

This specification defines a comprehensive redesign of the medication management system for patients, addressing critical usability issues and adding essential tracking capabilities. The redesign transforms the current single-screen add/edit flow into a multi-step, visually-guided experience that integrates with native platform features. Additionally, it introduces a caregiver notification system for medication lifecycle events and fixes critical bugs related to dose tracking and inventory management.

## Glossary

- **Medication Management System**: The subsystem responsible for creating, editing, scheduling, and tracking medications within the patient application
- **Patient Application**: The mobile application interface used by patients to manage their medications
- **Caregiver Application**: The mobile application interface used by caregivers to monitor patient medication activities
- **Dose Intake Event**: A recorded instance of a patient taking a prescribed medication dose
- **Medication Event**: Any create, update, or delete action performed on a medication record
- **Event Queue**: A temporary storage mechanism that holds medication events until caregiver connection is established
- **Native Alarm**: Platform-specific (iOS/Android) alarm functionality integrated with the device's clock application
- **Dose Inventory**: The remaining quantity of medication doses available for a specific medication
- **Low Quantity Threshold**: The minimum number of remaining doses that triggers a low inventory alert

## Requirements

### Requirement 1: Multi-Step Medication Creation Flow

**User Story:** As a patient, I want to add a new medication through a simple step-by-step process, so that I can easily configure my medication without feeling overwhelmed

#### Acceptance Criteria

1. WHEN the patient initiates medication creation, THE Medication Management System SHALL display a step-by-step wizard interface with progress indication
2. THE Medication Management System SHALL divide the creation process into separate screens for icon selection, scheduling, and dosage configuration
3. WHEN the patient completes all required steps, THE Medication Management System SHALL save the medication record with all configured properties
4. THE Medication Management System SHALL allow the patient to navigate backward to previous steps without losing entered data
5. WHERE the patient exits the wizard before completion, THE Medication Management System SHALL discard the incomplete medication record

### Requirement 2: Native Emoji Icon Selection

**User Story:** As a patient, I want to select an emoji icon and name for my medication using my device's native emoji picker, so that I can quickly identify medications visually

#### Acceptance Criteria

1. THE Medication Management System SHALL provide a dedicated screen for medication icon and name configuration
2. THE Medication Management System SHALL integrate the platform-native emoji picker (iOS or Android) for icon selection
3. THE Medication Management System SHALL provide a text input field for medication name entry on the same screen
4. WHEN the patient selects an emoji, THE Medication Management System SHALL display the selected emoji as a preview
5. THE Medication Management System SHALL require both emoji and name selection before allowing progression to the next step

### Requirement 3: Visual Time and Date Scheduling

**User Story:** As a patient, I want to set medication times using a visual interface that creates actual device alarms, so that I receive reliable reminders through my phone's native notification system

#### Acceptance Criteria

1. THE Medication Management System SHALL provide a dedicated screen for medication schedule configuration with visual time and date selectors
2. WHEN the patient configures a medication schedule, THE Medication Management System SHALL create corresponding alarms in the device's native clock application
3. THE Medication Management System SHALL display a visual representation of selected times within the scheduling interface
4. THE Medication Management System SHALL support multiple daily dose times for a single medication
5. WHEN the patient modifies an existing medication schedule, THE Medication Management System SHALL update the corresponding native alarms

### Requirement 4: Enhanced Dosage Configuration

**User Story:** As a patient, I want to configure medication dosage using clear visual representations, so that I can accurately set the correct amount without confusion

#### Acceptance Criteria

1. THE Medication Management System SHALL provide a dedicated screen for dosage configuration with visual dosage representations
2. THE Medication Management System SHALL maintain compatibility with the existing dosage data model
3. THE Medication Management System SHALL display dosage units and quantities using visual indicators appropriate to the medication type
4. THE Medication Management System SHALL validate dosage input to prevent invalid configurations
5. THE Medication Management System SHALL provide clear visual feedback for the configured dosage amount

### Requirement 5: Multi-Step Medication Editing Flow

**User Story:** As a patient, I want to edit existing medications using the same step-by-step interface as creation, so that I have a consistent and familiar experience

#### Acceptance Criteria

1. WHEN the patient initiates medication editing, THE Medication Management System SHALL display the step-by-step wizard interface pre-populated with existing medication data
2. THE Medication Management System SHALL allow the patient to modify any medication property through the appropriate step screen
3. WHEN the patient completes editing, THE Medication Management System SHALL update the medication record with modified properties
4. THE Medication Management System SHALL preserve unmodified properties when the patient updates only specific fields
5. WHERE the patient cancels editing, THE Medication Management System SHALL retain the original medication configuration

### Requirement 6: Caregiver Notification System

**User Story:** As a caregiver, I want to be notified when my patients create, modify, or delete medications, so that I can stay informed about their medication management activities

#### Acceptance Criteria

1. WHEN a patient creates, modifies, or deletes a medication, THE Medication Management System SHALL generate a Medication Event
2. WHERE a caregiver connection exists for the patient, THE Medication Management System SHALL transmit the Medication Event to the Caregiver Application immediately
3. WHERE no caregiver connection exists, THE Medication Management System SHALL store the Medication Event in the Event Queue
4. WHEN a caregiver connection is established, THE Medication Management System SHALL transmit all queued Medication Events to the Caregiver Application
5. THE Medication Management System SHALL include medication details, timestamp, and event type in each Medication Event

### Requirement 7: Dose Retake Prevention (HOTFIX)

**User Story:** As a patient, I want the system to prevent me from accidentally taking the same medication dose multiple times, so that my adherence statistics remain accurate

#### Acceptance Criteria

1. WHEN a patient records a Dose Intake Event, THE Medication Management System SHALL mark that specific scheduled dose as completed
2. THE Medication Management System SHALL prevent recording additional Dose Intake Events for an already-completed scheduled dose
3. WHEN a patient attempts to record a duplicate Dose Intake Event, THE Medication Management System SHALL display a clear message indicating the dose has already been taken
4. THE Medication Management System SHALL maintain accurate local adherence statistics by counting each scheduled dose only once
5. THE Medication Management System SHALL synchronize completed dose status with the backend to prevent duplicate recordings across devices

### Requirement 8: Dose Inventory Tracking

**User Story:** As a patient, I want the system to track how many doses I have remaining for each medication, so that I know when I need to refill my prescription

#### Acceptance Criteria

1. THE Medication Management System SHALL maintain a Dose Inventory count for each medication
2. WHEN a patient records a Dose Intake Event, THE Medication Management System SHALL decrement the Dose Inventory count by the consumed quantity
3. THE Medication Management System SHALL display the current Dose Inventory count in the medication details view
4. THE Medication Management System SHALL persist Dose Inventory counts across application sessions
5. THE Medication Management System SHALL allow the patient to manually adjust the Dose Inventory count when refilling medications

### Requirement 9: Low Quantity Alerts

**User Story:** As a patient, I want to receive alerts when my medication supply is running low, so that I can refill my prescription before running out

#### Acceptance Criteria

1. THE Medication Management System SHALL define a Low Quantity Threshold for each medication based on the dosing schedule
2. WHEN the Dose Inventory falls below the Low Quantity Threshold, THE Medication Management System SHALL display a low quantity indicator on the medication card
3. THE Medication Management System SHALL send a notification to the patient when the Dose Inventory reaches the Low Quantity Threshold
4. THE Medication Management System SHALL calculate the Low Quantity Threshold as a minimum of 3 days of scheduled doses
5. WHEN the Dose Inventory reaches zero, THE Medication Management System SHALL display a prominent out-of-stock indicator

### Requirement 10: Medication Event Registry for Caregivers

**User Story:** As a caregiver, I want to view a history of medication changes made by my patients, so that I can understand their medication management patterns

#### Acceptance Criteria

1. THE Caregiver Application SHALL display a registry screen showing all received Medication Events for connected patients
2. THE Caregiver Application SHALL organize Medication Events chronologically with the most recent events displayed first
3. THE Caregiver Application SHALL display the patient name, medication name, event type, and timestamp for each Medication Event
4. THE Caregiver Application SHALL allow caregivers to filter Medication Events by patient, event type, or date range
5. THE Caregiver Application SHALL persist the Medication Event history for caregiver review
