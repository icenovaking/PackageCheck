## MODIFIED Requirements

### Requirement: Add a preset item to a trip type

The system SHALL allow users to add a preset item to a trip type by providing either a manual non-empty name or one selected common item, together with a quantity selected from the integers 1 through 10. The two name sources SHALL be mutually exclusive, and the resulting preset item SHALL receive a unique ID and SHALL NOT contain a commonItemId relationship.

#### Scenario: Successful manual preset addition

- **WHEN** the user enters a non-empty item name manually, leaves the common item selector empty, selects a quantity from 1 through 10, and confirms
- **THEN** the system SHALL append a preset item with the entered name and selected quantity to that trip type's presetItems and SHALL persist the change

#### Scenario: Successful common item preset addition

- **GIVEN** commonItems contains a common item named "護照"
- **WHEN** the user selects "護照", selects a quantity from 1 through 10, and confirms
- **THEN** the system SHALL append a preset item named "護照" with the selected quantity to that trip type's presetItems and SHALL persist the change

#### Scenario: Preset quantity selection boundaries

- **WHEN** the add-preset-item form is rendered
- **THEN** its quantity control SHALL provide each integer from 1 through 10 exactly once and SHALL default to 1

##### Example: Standard preset quantity options

| Boundary | Expected selected or available value |
| ----- | ----- |
| Default | 1 selected |
| Minimum | 1 available |
| Maximum | 10 available |
| Above range | 11 not available for a new preset item |

#### Scenario: Manual and common sources are mutually exclusive

- **WHEN** the user enters a non-blank manual name
- **THEN** the common item selector SHALL be disabled until the manual name is cleared

#### Scenario: Common item selection disables manual entry

- **WHEN** the user selects a common item
- **THEN** the manual name input SHALL be disabled until the common item selection is cleared

#### Scenario: Blank or dual source rejected

- **WHEN** the user submits with both name sources empty or with both sources populated
- **THEN** the system SHALL display an error and SHALL NOT add a preset item

#### Scenario: Invalid or tampered preset quantity rejected

- **WHEN** the submitted quantity is zero, negative, non-numeric, or not one of the rendered add-preset-item options
- **THEN** the system SHALL display an error and SHALL NOT add a preset item

#### Scenario: Duplicate preset name rejected

- **GIVEN** the trip type already contains a preset item whose normalized name is "護照"
- **WHEN** the user attempts to add a manual or selected common item whose normalized name is "護照"
- **THEN** the system SHALL display a duplicate-name error and SHALL NOT add another preset item to that trip type

### Requirement: Edit a preset item

The system SHALL allow users to edit the name of an existing preset item and select a quantity from 1 through 10. When the existing quantity is a positive integer greater than 10, the system SHALL also expose that exact current value as a selected compatibility option for that edit session.

#### Scenario: Successful preset edit within the standard range

- **WHEN** the user edits a preset item's name or selects a quantity from 1 through 10 and saves
- **THEN** the preset item SHALL reflect the updated values and the change SHALL be persisted

#### Scenario: Existing preset quantity above 10 is preserved

- **GIVEN** an existing preset item has quantity 12
- **WHEN** the user enters edit mode, changes only its name, and saves
- **THEN** the quantity selector SHALL initially select 12 and the persisted preset item quantity SHALL remain 12

#### Scenario: Existing preset quantity above 10 can move into the standard range

- **GIVEN** an existing preset item has quantity 12
- **WHEN** the user selects 4 and saves
- **THEN** the persisted preset item quantity SHALL become 4 and the UI SHALL NOT offer arbitrary new values above 10

#### Scenario: Invalid or tampered preset edit quantity rejected

- **WHEN** a preset edit submission contains zero, a negative value, a non-numeric value, or a value absent from that edit session's rendered options
- **THEN** the system SHALL NOT modify or persist the preset item
