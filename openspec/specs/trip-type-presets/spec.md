# trip-type-presets Specification

## Purpose
TBD - created by archiving change trip-type-presets. Update Purpose after archive.
## Requirements
### Requirement: Define a trip type

The system SHALL allow users to create a named trip type with an initially empty list of preset items.

#### Scenario: Successful type creation

- **WHEN** user enters a non-empty trip-type name on the settings page and confirms
- **THEN** a new trip type with a unique ID, the given name, an empty `presetItems` list, and a creation timestamp SHALL be created and persisted

#### Scenario: Empty name rejected

- **WHEN** user attempts to create a trip type with a blank name
- **THEN** the system SHALL display an error and NOT create the trip type

### Requirement: List trip types on the settings page

The system SHALL display all existing trip types on the settings page in creation order as individually collapsible cards.

#### Scenario: No trip types exist

- **WHEN** the user opens the settings page and no trip types have been created
- **THEN** the system SHALL show an empty-state message inviting the user to create a trip type

#### Scenario: Trip types present

- **WHEN** one or more trip types exist
- **THEN** the settings page SHALL list each trip type in creation order as a compact card whose collapsed header shows only the "Trip Type" label, the type's name, and the expand/collapse chevron control

#### Scenario: Type cards start collapsed

- **WHEN** the settings page is rendered with existing trip types
- **THEN** each trip-type card SHALL render in collapsed state until the user expands a card or completes a type jump-search action

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

The system SHALL implement the settings page, settings entry-point button, trip-type dropdowns, jump-search controls, and collapsible trip-type cards using only the existing class/token vocabulary already defined in `app.js` and `style.css` (page shell, content panel, view header, add-form, input-group, btn-primary, btn-icon, item-table, field-error, empty-state, btn-back, section-kicker), and SHALL NOT introduce a new visual language, new colour tokens, or new typography.

#### Scenario: New icon follows existing style

- **WHEN** a collapse/expand icon or affordance is rendered for a trip-type card
- **THEN** it SHALL follow the same inline SVG and button conventions already used by the app's existing icon controls

#### Scenario: Settings page reuses existing layout primitives

- **WHEN** the settings page is rendered with jump-search controls and collapsible cards
- **THEN** it SHALL continue to use the same `page-shell` / `app-header` / `content-panel` / `view-header` / `add-form` / `input-group` / `btn-primary` / `btn-back` markup pattern used by the existing trip-list and trip-detail views

### Requirement: Toggle trip-type card expansion

The system SHALL let the user expand or collapse trip-type cards from the settings page by clicking anywhere on the card header.

#### Scenario: Expand a collapsed type card

- **WHEN** the user toggles a collapsed trip-type card open (by clicking the card header)
- **THEN** the system SHALL expand that card, reveal its preset-item form, preset-item list, edit control, and delete control, and collapse any other currently expanded trip-type card

#### Scenario: Collapse the expanded type card

- **WHEN** the user toggles the currently expanded trip-type card closed (by clicking the card header)
- **THEN** the system SHALL hide its preset-item form and preset-item list and return the card to compact summary state

#### Scenario: Toggle card via header click

- **WHEN** the user clicks anywhere on a collapsed or expanded trip-type card header (excluding active edit/delete/save/cancel controls)
- **THEN** the system SHALL toggle the card's expansion state

### Requirement: Jump to an existing trip type from settings

The system SHALL provide a dropdown-based type query control on the settings page that can jump directly to an existing trip-type card.

#### Scenario: Query controls with no trip types

- **WHEN** no trip types exist
- **THEN** the type query dropdown and query action SHALL remain visible in a non-interactive empty state or disabled state without causing layout issues

#### Scenario: Jump to a selected trip type

- **WHEN** the user selects an existing trip type from the dropdown and confirms the query
- **THEN** the system SHALL expand that trip-type card, collapse any other expanded trip-type card, scroll the selected card into view, and provide a visible focus or highlight cue on the target card

#### Scenario: Query without a selected trip type

- **WHEN** the user activates the query action without selecting a trip type
- **THEN** the system SHALL leave the current card expansion state unchanged

### Requirement: Merge preset items from multiple trip types

The system SHALL merge preset items from multiple selected trip types when creating a new trip, applying intelligent deduplication based on item name.

#### Scenario: Merge items from two types with no overlap

- **WHEN** user selects two trip types with completely different preset items
- **THEN** the new trip's items SHALL contain all preset items from both types, each with `qty: 1`

#### Scenario: Merge items with exact duplicate names

- **WHEN** user selects two trip types where both have a preset item with the exact same name (e.g., "護照" in both types)
- **THEN** the new trip's items SHALL contain only one copy of that item with `qty: 1`, preserving the first occurrence

#### Scenario: Chinese text uses strict comparison

- **WHEN** deduplicating preset items containing Chinese characters
- **THEN** the system SHALL use strict equality comparison (`===`) where "護照" matches "護照" but "護照" does not match "護照 " (with trailing space)

#### Scenario: English text uses case-insensitive comparison

- **WHEN** deduplicating preset items containing only English/ASCII characters
- **THEN** the system SHALL use case-insensitive and trimmed comparison where "Passport", "passport", and " PASSPORT " all match and are deduplicated

#### Scenario: Mixed text uses strict comparison

- **WHEN** deduplicating preset items containing both Chinese and English characters
- **THEN** the system SHALL use strict equality comparison (same as Chinese-only text)

#### Scenario: Merged items preserve original name formatting

- **WHEN** duplicate items are detected and removed
- **THEN** the system SHALL preserve the exact name formatting (capitalization, spacing) of the first occurrence

#### Scenario: Merged items default to quantity 1

- **WHEN** multiple types have the same item with different quantities (e.g., "毛巾 × 2" and "毛巾 × 3")
- **THEN** the merged item SHALL have `qty: 1` regardless of the source quantities

#### Scenario: Items merged in selection order

- **WHEN** user selects types in a specific order
- **THEN** preset items SHALL be processed in that order, with earlier types' items appearing first in the deduplicated result

