## MODIFIED Requirements

### Requirement: Add an item to a trip

The system SHALL allow users to add a new item to the current trip by providing either a manual non-empty name or one selected common item, together with a quantity selected from the integers 1 through 10. The two name sources SHALL be mutually exclusive. A new item SHALL receive a unique ID and SHALL retain unchecked departure and return states without a commonItemId relationship.

#### Scenario: Successful manual item addition

- **WHEN** the user enters a non-empty item name manually, leaves the common item selector empty, selects a quantity from 1 through 10, and confirms
- **THEN** a new item with a unique ID, the given name, the selected quantity, and both checkboxes unchecked SHALL be appended to the trip's item list and persisted

#### Scenario: Successful common item addition

- **GIVEN** commonItems contains a common item named "護照"
- **WHEN** the user selects "護照", selects a quantity from 1 through 10, and confirms
- **THEN** a new item named "護照" with the selected quantity and both checkboxes unchecked SHALL be appended to the trip's item list and persisted

#### Scenario: Quantity selection boundaries

- **WHEN** the add-item form is rendered
- **THEN** its quantity control SHALL provide each integer from 1 through 10 exactly once and SHALL default to 1

##### Example: Standard quantity options

| Boundary | Expected selected or available value |
| ----- | ----- |
| Default | 1 selected |
| Minimum | 1 available |
| Maximum | 10 available |
| Above range | 11 not available for a new item |

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

#### Scenario: Invalid or tampered quantity rejected

- **WHEN** the submitted quantity is zero, negative, non-numeric, or not one of the rendered add-item options
- **THEN** the system SHALL display an error and SHALL NOT add the item

#### Scenario: Duplicate trip item name rejected

- **GIVEN** the trip already contains an item whose normalized name is "護照"
- **WHEN** the user attempts to add a manual or selected common item whose normalized name is "護照"
- **THEN** the system SHALL display a duplicate-name error and SHALL NOT add another item to that trip

### Requirement: Edit an item

The system SHALL allow users to edit an existing item's name and select a quantity from 1 through 10. When the existing quantity is a positive integer greater than 10, the system SHALL also expose that exact current value as a selected compatibility option for that edit session.

#### Scenario: Successful edit within the standard range

- **WHEN** the user edits an item's name or selects a quantity from 1 through 10 and saves
- **THEN** the item SHALL reflect the updated values and the change SHALL be persisted

#### Scenario: Existing quantity above 10 is preserved

- **GIVEN** an existing item has quantity 12
- **WHEN** the user enters edit mode, changes only the item name, and saves
- **THEN** the quantity selector SHALL initially select 12 and the persisted item quantity SHALL remain 12

#### Scenario: Existing quantity above 10 can move into the standard range

- **GIVEN** an existing item has quantity 12
- **WHEN** the user selects 4 and saves
- **THEN** the persisted item quantity SHALL become 4 and the UI SHALL NOT offer arbitrary new values above 10

#### Scenario: Invalid or tampered edit quantity rejected

- **WHEN** an edit submission contains zero, a negative value, a non-numeric value, or a value absent from that edit session's rendered options
- **THEN** the system SHALL NOT modify or persist the item
