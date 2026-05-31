## ADDED Requirements

### Requirement: Define a trip type

The system SHALL allow users to create a named trip type with an initially empty list of preset items.

#### Scenario: Successful type creation

- **WHEN** user enters a non-empty trip-type name on the settings page and confirms
- **THEN** a new trip type with a unique ID, the given name, an empty `presetItems` list, and a creation timestamp SHALL be created and persisted

#### Scenario: Empty name rejected

- **WHEN** user attempts to create a trip type with a blank name
- **THEN** the system SHALL display an error and NOT create the trip type

### Requirement: List trip types on the settings page

The system SHALL display all existing trip types on the settings page in creation order.

#### Scenario: No trip types exist

- **WHEN** the user opens the settings page and no trip types have been created
- **THEN** the system SHALL show an empty-state message inviting the user to create a trip type

#### Scenario: Trip types present

- **WHEN** one or more trip types exist
- **THEN** the settings page SHALL list each trip type with its name and its current preset-item list

### Requirement: Rename a trip type

The system SHALL allow users to rename an existing trip type.

#### Scenario: Successful rename

- **WHEN** user edits a trip type's name to a non-empty value and saves
- **THEN** the trip type's name SHALL be updated and persisted

#### Scenario: Empty rename rejected

- **WHEN** user attempts to save a blank trip-type name
- **THEN** the system SHALL display an error and NOT change the name

### Requirement: Delete a trip type

The system SHALL allow users to delete a trip type without affecting any existing trips.

#### Scenario: Confirm before delete

- **WHEN** user initiates trip-type deletion
- **THEN** the system SHALL prompt for confirmation before permanently removing the trip type

#### Scenario: Trip type removed, existing trips untouched

- **WHEN** user confirms deletion of a trip type
- **THEN** the trip type SHALL be removed from storage and the settings list, AND any existing trips previously created from that type SHALL remain unchanged

### Requirement: Add a preset item to a trip type

The system SHALL allow users to add a preset item (name and positive integer quantity) to a trip type.

#### Scenario: Successful preset addition

- **WHEN** user enters a non-empty item name and a positive integer quantity for a given trip type and confirms
- **THEN** a new preset item with a unique ID, the given name, and the given quantity SHALL be appended to that trip type's `presetItems` and persisted

#### Scenario: Invalid input rejected

- **WHEN** user submits a blank name or a quantity that is not a positive integer
- **THEN** the system SHALL display an error and NOT add the preset item

### Requirement: Edit a preset item

The system SHALL allow users to edit the name or quantity of an existing preset item within a trip type.

#### Scenario: Successful preset edit

- **WHEN** user edits a preset item's name or quantity to valid values and saves
- **THEN** the preset item SHALL reflect the updated values and the change SHALL be persisted

### Requirement: Delete a preset item

The system SHALL allow users to remove a preset item from a trip type.

#### Scenario: Preset item removed

- **WHEN** user confirms deletion of a preset item
- **THEN** the preset item SHALL be removed from the trip type's `presetItems` and from storage

### Requirement: Navigate to the settings page

The system SHALL provide a visible control on the trip-list view that navigates to the settings page.

#### Scenario: Open settings from trip list

- **WHEN** user taps/clicks the settings button on the trip-list view
- **THEN** the system SHALL navigate to the settings page (route `#settings`)

#### Scenario: Return from settings

- **WHEN** user activates the back control on the settings page
- **THEN** the system SHALL navigate back to the trip-list view (`#trips`)

### Requirement: Edits to a trip type do not affect existing trips

The system SHALL treat preset application as a one-time copy at trip creation; modifying or deleting preset items afterwards SHALL NOT alter items already present in previously created trips.

#### Scenario: Preset edit isolated

- **WHEN** a user edits or deletes a preset item on a trip type that was previously used to create a trip
- **THEN** the items inside that existing trip SHALL remain unchanged

### Requirement: New UI reuses existing visual vocabulary

The system SHALL implement the settings page, settings entry-point button, and trip-type dropdown using only the existing class/token vocabulary already defined in `app.js` and `style.css` (page shell, content panel, view header, add-form, input-group, btn-primary, btn-icon, item-table, field-error, empty-state, btn-back, section-kicker), and SHALL NOT introduce a new visual language, new colour tokens, or new typography.

#### Scenario: New icon follows existing style

- **WHEN** the settings (gear) icon is rendered in the trip-list header
- **THEN** it SHALL be an inline SVG using the same 24×24 viewBox, `stroke-width: 1.8`, `stroke-linecap: round`, `stroke-linejoin: round` conventions as the existing icons in the `ICONS` map

#### Scenario: Settings page reuses existing layout primitives

- **WHEN** the settings page is rendered
- **THEN** it SHALL use the same `page-shell` / `app-header` / `content-panel` / `view-header` / `add-form` / `input-group` / `btn-primary` / `btn-back` markup pattern used by the existing trip-list and trip-detail views
