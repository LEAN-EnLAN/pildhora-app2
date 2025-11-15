# Requirements Document

## Introduction

This specification defines the requirements for fixing and improving the medication wizard components in the Pildhora application. The wizard currently has several critical usability issues including inconsistent language (mixing English and Spanish), poor UI layout, non-functional features, and illogical medication type/unit relationships. This refactor will ensure all text is in Spanish, improve visual design and layout, fix broken functionality, and implement intelligent unit selection based on medication type.

## Glossary

- **System**: The Pildhora medication wizard interface (React Native components)
- **Wizard**: Multi-step medication creation/editing interface
- **Step 1**: Icon and name selection screen
- **Step 2**: Schedule configuration screen
- **Step 3**: Dosage configuration screen
- **Emoji Mosaic**: Grid of emoji icons for medication selection
- **Schedule Card**: Visual representation of a scheduled medication time
- **Quick Settings**: Day-of-week selector chips
- **Schedule Preview**: Visual timeline showing medication times
- **Medication Type**: Form factor of medication (tablets, liquid, cream, etc.)
- **Dose Unit**: Unit of measurement (mg, ml, g, etc.)
- **Dose Value**: Numeric quantity of medication

## Requirements

### Requirement 1: Complete Spanish Language Implementation

**User Story:** As a Spanish-speaking user, I want all text in the medication wizard to be in Spanish, so that I can understand and use the interface without confusion.

#### Acceptance Criteria

1. WHEN the user views any wizard step, THE System SHALL display all labels, buttons, placeholders, and messages in Spanish
2. WHEN the user encounters validation errors, THE System SHALL display error messages in Spanish
3. WHEN the user views helper text or instructions, THE System SHALL display all guidance in Spanish
4. WHEN the user interacts with the emoji selector, THE System SHALL display "Más emojis" button text in Spanish
5. WHEN the user views medication type labels, THE System SHALL display all type names in Spanish (Tabletas, Cápsulas, Líquido, Crema, Inhalador, Gotas, Spray, Otro)

### Requirement 2: Emoji Mosaic Layout Improvement

**User Story:** As a user selecting a medication icon, I want the emoji grid to be centered and fit properly on my screen, so that I can easily see and select all available options.

#### Acceptance Criteria

1. WHEN the user views the emoji mosaic, THE System SHALL center the grid horizontally on the screen
2. WHEN the user views the emoji mosaic, THE System SHALL ensure all emojis are visible without horizontal scrolling
3. WHEN the user views the emoji mosaic on different screen sizes, THE System SHALL adapt the grid layout responsively
4. WHEN the user views the emoji mosaic, THE System SHALL maintain consistent spacing between emoji buttons
5. WHEN the user views the emoji mosaic, THE System SHALL ensure emoji buttons have adequate touch targets (minimum 48x48 dp)

### Requirement 3: Functional "Más Emojis" Button

**User Story:** As a user who wants more emoji options, I want the "Más emojis" button to open my device's native emoji keyboard, so that I can select from all available emojis.

#### Acceptance Criteria

1. WHEN the user taps the "Más emojis" button, THE System SHALL open the device's native emoji keyboard
2. WHEN the user selects an emoji from the native keyboard, THE System SHALL update the medication icon preview
3. WHEN the user selects an emoji from the native keyboard, THE System SHALL close the keyboard and return to the wizard
4. WHEN the native emoji keyboard is unavailable, THE System SHALL display an appropriate fallback message
5. WHEN the user cancels the native emoji keyboard, THE System SHALL return to the wizard without changes

### Requirement 4: Schedule Screen Complete Redesign

**User Story:** As a user configuring medication schedules, I want a clean, intuitive interface for adding times and selecting days, so that I can easily set up my medication routine.

#### Acceptance Criteria

1. WHEN the user views the schedule screen, THE System SHALL display a modern card-based layout for time entries
2. WHEN the user adds a new time, THE System SHALL display a native time picker modal with proper styling
3. WHEN the user views scheduled times, THE System SHALL display each time in a visually distinct card with edit and delete actions
4. WHEN the user selects days of the week, THE System SHALL display day chips in a horizontal scrollable row
5. WHEN the user views the schedule preview, THE System SHALL display a custom-built visual timeline without external packages

### Requirement 5: Schedule Preview Redesign

**User Story:** As a user reviewing my medication schedule, I want a clear visual representation of when I need to take my medication, so that I can verify my schedule at a glance.

#### Acceptance Criteria

1. WHEN the user views the schedule preview, THE System SHALL display a 24-hour timeline with hour markers
2. WHEN the user has scheduled times, THE System SHALL display visual indicators at the corresponding hours
3. WHEN the user views the timeline, THE System SHALL highlight scheduled times with the medication emoji
4. WHEN the user has multiple times in one hour, THE System SHALL stack or group the indicators
5. WHEN the user views the timeline, THE System SHALL remove dependency on react-native-horizontal-timeline package

### Requirement 6: Dosage Screen Visual Improvements

**User Story:** As a user configuring medication dosage, I want an attractive and clear interface for entering dose information, so that I can confidently input the correct dosage.

#### Acceptance Criteria

1. WHEN the user views the dosage preview, THE System SHALL display a visually appealing representation of the medication
2. WHEN the user views the dosage preview for tablets, THE System SHALL display pill icons in an organized grid layout
3. WHEN the user views the dosage preview for liquid, THE System SHALL display a filled container visualization
4. WHEN the user views the dosage preview for other types, THE System SHALL display appropriate visual representations
5. WHEN the user views the dosage preview, THE System SHALL use consistent styling with rounded corners and proper spacing

### Requirement 7: Intelligent Unit Selection Based on Medication Type

**User Story:** As a user selecting medication type and units, I want the system to show only relevant units for my medication type, so that I don't see illogical combinations like "gramos" for "crema".

#### Acceptance Criteria

1. WHEN the user selects "Tabletas" or "Cápsulas" as medication type, THE System SHALL display only unit options: unidades, mg, g, mcg
2. WHEN the user selects "Líquido" as medication type, THE System SHALL display only unit options: ml, l, gotas
3. WHEN the user selects "Crema" as medication type, THE System SHALL display only unit options: g, ml, aplicaciones
4. WHEN the user selects "Inhalador" as medication type, THE System SHALL display only unit options: inhalaciones, puffs
5. WHEN the user selects "Gotas" as medication type, THE System SHALL display only unit options: gotas, ml
6. WHEN the user selects "Spray" as medication type, THE System SHALL display only unit options: sprays, aplicaciones, ml
7. WHEN the user selects "Otro" as medication type, THE System SHALL display all unit options including "Unidad personalizada"
8. WHEN the user changes medication type, THE System SHALL reset the selected unit if it's not compatible with the new type
9. WHEN the user changes medication type, THE System SHALL display a message if their previous unit selection was cleared

### Requirement 8: Improved Dosage Preview Aesthetics

**User Story:** As a user viewing the dosage preview, I want an attractive and professional visualization, so that the interface feels polished and trustworthy.

#### Acceptance Criteria

1. WHEN the user views any dosage preview, THE System SHALL use rounded corners and soft shadows
2. WHEN the user views the pill preview, THE System SHALL display pills in a neat grid with consistent spacing
3. WHEN the user views the liquid preview, THE System SHALL display a gradient-filled container with level indicator
4. WHEN the user views the cream preview, THE System SHALL display a tube or jar icon with fill level
5. WHEN the user views any preview, THE System SHALL use the medication's selected emoji as part of the visualization

### Requirement 9: Schedule Card Visual Enhancement

**User Story:** As a user viewing my scheduled medication times, I want each time displayed in an attractive card, so that I can easily read and manage my schedule.

#### Acceptance Criteria

1. WHEN the user views a schedule card, THE System SHALL display the time in large, bold text
2. WHEN the user views a schedule card, THE System SHALL display a clock icon or emoji
3. WHEN the user views a schedule card, THE System SHALL use rounded corners and subtle shadows
4. WHEN the user views a schedule card, THE System SHALL display edit and delete buttons with clear icons
5. WHEN the user taps a schedule card, THE System SHALL provide visual feedback (press state)

### Requirement 10: Responsive Layout for All Screen Sizes

**User Story:** As a user on any device size, I want the wizard to adapt to my screen, so that all content is visible and accessible.

#### Acceptance Criteria

1. WHEN the user views the wizard on a small phone, THE System SHALL adjust grid columns to fit the screen width
2. WHEN the user views the wizard on a tablet, THE System SHALL utilize the extra space with larger grids
3. WHEN the user views the wizard in landscape orientation, THE System SHALL adapt the layout appropriately
4. WHEN the user views the wizard, THE System SHALL ensure all interactive elements remain accessible
5. WHEN the user scrolls through wizard steps, THE System SHALL maintain smooth performance on all devices

