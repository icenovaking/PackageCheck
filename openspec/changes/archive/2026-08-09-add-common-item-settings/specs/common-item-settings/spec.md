# common-item-settings Delta

## ADDED Requirements

### Requirement: Manage common items

The system SHALL provide a Common Items settings page where the user can create, list, rename, and delete reusable common item records.

#### Scenario: Create a common item

- **WHEN** the user enters a non-empty common item name and confirms
- **THEN** the system SHALL create a common item with a unique ID and persist it in the commonItems collection

#### Scenario: List common items

- **WHEN** the user opens the Common Items settings page
- **THEN** the system SHALL display every common item in a manageable list

#### Scenario: Rename a common item

- **WHEN** the user changes a common item name to a valid unique name and saves
- **THEN** the system SHALL persist the new name without modifying any existing trip item or trip-type preset item

#### Scenario: Delete a common item

- **WHEN** the user confirms deletion of a common item
- **THEN** the system SHALL remove it from the commonItems collection without modifying any existing trip item or trip-type preset item

### Requirement: Enforce unique common item names

The system SHALL treat common item names as unique after trimming leading and trailing whitespace and applying locale-aware lowercase normalization.

#### Scenario: Reject a duplicate common item name

- **GIVEN** commonItems already contains a common item named "護照"
- **WHEN** the user attempts to create or rename another common item to "護照"
- **THEN** the system SHALL display a duplicate-name error and SHALL NOT change commonItems

#### Scenario: Reject a normalized duplicate

- **GIVEN** commonItems already contains a common item named " Passport "
- **WHEN** the user attempts to create another common item named "passport"
- **THEN** the system SHALL treat the names as duplicates and SHALL NOT create the second common item

### Requirement: Share common item options with item-entry forms

The system SHALL provide the same commonItems options in both the trip-type preset-item form and the actual-trip item form.

#### Scenario: Add a common item to a trip-type preset

- **GIVEN** commonItems contains "護照"
- **WHEN** the user selects "護照" in a trip-type preset-item form and enters a positive integer quantity
- **THEN** the system SHALL add a preset item named "護照" with the entered quantity to that trip type

#### Scenario: Add a common item to a trip

- **GIVEN** commonItems contains "護照"
- **WHEN** the user selects "護照" in an actual-trip item form and enters a positive integer quantity
- **THEN** the system SHALL add a trip item named "護照" with the entered quantity and unchecked departure and return states

#### Scenario: Empty common item catalog

- **GIVEN** commonItems is empty
- **WHEN** the user opens either item-entry form
- **THEN** the common item selector SHALL remain visible in a disabled empty state and manual item entry SHALL remain available

### Requirement: Keep common item selection copy-based

The system SHALL copy the selected common item name into the destination record and SHALL NOT create a commonItemId relationship.

#### Scenario: Common item rename does not propagate

- **GIVEN** a trip item named "護照" was created from a common item
- **WHEN** the user renames the common item to "電子護照"
- **THEN** the existing trip item SHALL remain named "護照"

#### Scenario: Common item deletion does not remove destination records

- **GIVEN** a trip-type preset item and a trip item were created from a common item
- **WHEN** the user deletes the common item
- **THEN** both destination records SHALL remain unchanged

### Requirement: Keep common item creation explicit

The system SHALL NOT add a manually entered one-time item to commonItems automatically.

#### Scenario: Manual item remains local to its destination

- **WHEN** the user manually enters an item name in a trip or trip-type preset form and confirms
- **THEN** the system SHALL add the item only to that destination list and SHALL NOT add a new common item

### Requirement: Provide common item settings navigation

The system SHALL provide a visible Common Items settings control beside the existing trip-type settings control on the trip-list view.

#### Scenario: Open common item settings

- **WHEN** the user activates the Common Items settings control
- **THEN** the system SHALL navigate to the Common Items settings page

#### Scenario: Return to trips

- **WHEN** the user activates the back control on the Common Items settings page
- **THEN** the system SHALL navigate to the trip-list view
