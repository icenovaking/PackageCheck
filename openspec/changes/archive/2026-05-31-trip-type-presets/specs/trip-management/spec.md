## MODIFIED Requirements

### Requirement: Create a trip

The system SHALL allow users to create a new trip by providing a trip name and optionally selecting a trip type whose preset items SHALL seed the new trip's item list.

#### Scenario: Successful trip creation without a type

- **WHEN** user enters a non-empty trip name, leaves the trip-type selector at "（無）", and confirms
- **THEN** a new trip with a unique ID, the given name, an empty items list, and `typeId: null` SHALL be created and persisted

#### Scenario: Successful trip creation with a type

- **WHEN** user enters a non-empty trip name, selects an existing trip type, and confirms
- **THEN** a new trip SHALL be created whose `items` list contains a deep copy of every preset item of that type (each with a freshly generated item ID, the preset's name and quantity, and both `departureChecked` and `returnChecked` set to `false`), whose `typeId` records the selected type's ID, and which SHALL be persisted

#### Scenario: Empty name rejected

- **WHEN** user attempts to create a trip with a blank name
- **THEN** the system SHALL display an error and NOT create the trip

## ADDED Requirements

### Requirement: Trip-type selector on the add-trip form

The system SHALL display a trip-type selector on the add-trip form that lists `（無）` plus every user-defined trip type.

#### Scenario: No trip types defined

- **WHEN** the user opens the trip-list view and no trip types exist
- **THEN** the selector SHALL still be visible and SHALL contain only the `（無）` option

#### Scenario: Trip types defined

- **WHEN** one or more trip types exist
- **THEN** the selector SHALL list `（無）` followed by every trip type by name, and the default selection SHALL be `（無）`

### Requirement: Existing trip-list and trip-detail behaviour is preserved

The system SHALL preserve all pre-existing trip-list and trip-detail UI markup, styling, and interaction logic. Additions for this change SHALL be strictly additive and SHALL NOT modify the existing trip-card layout, item-table layout, validation messages, checkbox toggle behaviour, inline-edit flow, delete-with-confirm flow, or routing of `#trips` and `#trip/<id>`.

#### Scenario: No trip types defined, no type selected

- **WHEN** the user has not defined any trip types and creates a trip with the selector left at `（無）`
- **THEN** the trip-list view, the resulting trip, and the trip-detail view SHALL behave and render identically to the pre-change version (apart from the presence of the settings button and the empty selector row)

#### Scenario: Existing event handlers remain intact

- **WHEN** the user interacts with existing controls (delete trip, toggle departure checkbox, toggle return checkbox, edit item, delete item)
- **THEN** each control SHALL invoke the same handler and produce the same persistence and rendering outcome as before this change
