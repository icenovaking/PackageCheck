# item-management Delta

## MODIFIED Requirements

### Requirement: Add an item to a trip

The system SHALL allow users to add a new item to the current trip by providing either a manual non-empty name or one selected common item, together with a positive integer quantity. The two name sources SHALL be mutually exclusive. A new item SHALL receive a unique ID and SHALL retain unchecked departure and return states without a commonItemId relationship.

#### Scenario: Successful manual item addition

- **WHEN** the user enters a non-empty item name manually, leaves the common item selector empty, enters a positive integer quantity, and confirms
- **THEN** a new item with a unique ID, the given name, the given quantity, and both checkboxes unchecked SHALL be appended to the trip's item list and persisted

#### Scenario: Successful common item addition

- **GIVEN** commonItems contains a common item named "護照"
- **WHEN** the user selects "護照", enters a positive integer quantity, and confirms
- **THEN** a new item named "護照" with the given quantity and both checkboxes unchecked SHALL be appended to the trip's item list and persisted

#### Scenario: Manual and common sources are mutually exclusive

- **WHEN** the user enters a non-blank manual name
- **THEN** the common item selector SHALL be disabled until the manual name is cleared

#### Scenario: Common item selection disables manual entry

- **WHEN** the user selects a common item
- **THEN** the manual name input SHALL be disabled until the common item selection is cleared

#### Scenario: Empty name source rejected

- **WHEN** the user attempts to add an item with both name sources empty
- **THEN** the system SHALL display an error and SHALL NOT add the item

#### Scenario: Dual name source rejected

- **WHEN** the user attempts to submit with both a manual name and a selected common item
- **THEN** the system SHALL display an error and SHALL NOT add the item

#### Scenario: Invalid quantity rejected

- **WHEN** the user enters a quantity that is not a positive integer, including zero, a negative value, or a non-numeric value
- **THEN** the system SHALL display an error and SHALL NOT add the item

#### Scenario: Duplicate trip item name rejected

- **GIVEN** the trip already contains an item whose normalized name is "護照"
- **WHEN** the user attempts to add a manual or selected common item whose normalized name is "護照"
- **THEN** the system SHALL display a duplicate-name error and SHALL NOT add another item to that trip
