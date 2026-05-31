## ADDED Requirements

### Requirement: Create a trip

The system SHALL allow users to create a new trip by providing a trip name.

#### Scenario: Successful trip creation

- **WHEN** user enters a non-empty trip name and confirms
- **THEN** a new trip with a unique ID, the given name, and an empty items list SHALL be created and persisted

#### Scenario: Empty name rejected

- **WHEN** user attempts to create a trip with a blank name
- **THEN** the system SHALL display an error and NOT create the trip

### Requirement: List trips

The system SHALL display all existing trips on the home screen.

#### Scenario: No trips exist

- **WHEN** there are no saved trips
- **THEN** the system SHALL show an empty-state message prompting the user to create a trip

#### Scenario: Trips present

- **WHEN** one or more trips exist
- **THEN** the system SHALL list every trip by name in the order they were created

### Requirement: Navigate into a trip

The system SHALL allow the user to select a trip and view its items.

#### Scenario: Open trip

- **WHEN** user taps/clicks a trip in the list
- **THEN** the system SHALL navigate to that trip's detail view showing its items

### Requirement: Delete a trip

The system SHALL allow users to delete an existing trip and all its items.

#### Scenario: Confirm before delete

- **WHEN** user initiates trip deletion
- **THEN** the system SHALL prompt for confirmation before permanently removing the trip

#### Scenario: Trip removed

- **WHEN** user confirms deletion
- **THEN** the trip and all its items SHALL be removed from storage and the trip list
