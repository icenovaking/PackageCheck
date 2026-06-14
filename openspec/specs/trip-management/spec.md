## Purpose

Defines how users create, list, open, and delete trips — the top-level entities that own packing items.
## Requirements
### Requirement: Create a trip

The system SHALL allow users to create a new trip by providing a trip name and optionally selecting up to 3 trip types whose preset items SHALL be merged and seeded into the new trip's item list.

#### Scenario: Successful trip creation without any types

- **WHEN** user enters a non-empty trip name, leaves all trip-type checkboxes unchecked (or checks "（無）"), and confirms
- **THEN** a new trip with a unique ID, the given name, an empty items list, `typeIds: null`, and `typeDisplay: null` SHALL be created and persisted

#### Scenario: Successful trip creation with one type

- **WHEN** user enters a non-empty trip name, selects exactly one trip type, and confirms
- **THEN** a new trip SHALL be created whose `items` list contains a deep copy of every preset item of that type (each with a freshly generated item ID, the preset's name, `qty: 1`, and both `departureChecked` and `returnChecked` set to `false`), whose `typeIds` array contains the selected type's ID, whose `typeDisplay` string contains the type's name, and which SHALL be persisted

#### Scenario: Successful trip creation with multiple types

- **WHEN** user enters a non-empty trip name, selects 2 or 3 trip types, and confirms
- **THEN** a new trip SHALL be created whose `items` list contains merged and deduplicated preset items from all selected types (each with a freshly generated item ID, the preset's name, `qty: 1`, and both checkboxes set to `false`), whose `typeIds` array contains all selected type IDs in selection order, whose `typeDisplay` string contains all type names joined by "+" (e.g., "旅遊+潛水"), and which SHALL be persisted

#### Scenario: Empty name rejected

- **WHEN** user attempts to create a trip with a blank name
- **THEN** the system SHALL display an error and NOT create the trip

#### Scenario: Selection limit enforced

- **WHEN** user has selected 3 trip types
- **THEN** all unselected type checkboxes SHALL be disabled until user deselects one of the current selections

### Requirement: List trips

The system SHALL display all existing trips on the home screen as individually collapsible cards in creation order.

#### Scenario: No trips exist

- **WHEN** there are no saved trips
- **THEN** the system SHALL show an empty-state message prompting the user to create a trip

#### Scenario: Trips present

- **WHEN** one or more trips exist
- **THEN** the system SHALL list every trip by name in the order they were created as a compact card whose collapsed state shows only the `Trip Plan` label, the joined-item summary text, the expand/collapse control, and the trip name

#### Scenario: Cards start collapsed

- **WHEN** the trip-list view is rendered with existing trips
- **THEN** each trip card SHALL render in collapsed state until the user expands a card or completes a trip jump-search action

### Requirement: Navigate into a trip

The system SHALL allow the user to open a trip's full item-management experience through the dedicated route-based detail view, while using expansion on the trip-list page only for summary details.

#### Scenario: Open trip detail route

- **WHEN** user activates the dedicated full-detail control for a trip
- **THEN** the system SHALL navigate to that trip's detail view at route `#trip/<id>` showing its items

### Requirement: Delete a trip

The system SHALL allow users to delete an existing trip and all its items.

#### Scenario: Confirm before delete

- **WHEN** user initiates trip deletion
- **THEN** the system SHALL prompt for confirmation before permanently removing the trip

#### Scenario: Trip removed

- **WHEN** user confirms deletion
- **THEN** the trip and all its items SHALL be removed from storage and the trip list

### Requirement: Trip-type selector on the add-trip form

The system SHALL display trip-type checkboxes on the add-trip form that list `（無）` plus every user-defined trip type, with a maximum selection of 3 types.

#### Scenario: No trip types defined

- **WHEN** the user opens the trip-list view and no trip types exist
- **THEN** the checkbox list SHALL still be visible and SHALL contain only the `（無）` option

#### Scenario: Trip types defined

- **WHEN** one or more trip types exist
- **THEN** the checkbox list SHALL display `（無）` followed by every trip type by name, and the default state SHALL be all unchecked

#### Scenario: Selection counter displayed

- **WHEN** user has selected one or more trip types (excluding "（無）")
- **THEN** the system SHALL display a counter showing "已選 X 個（最多 3 個）" where X is the number of selected types

#### Scenario: Limit reached indicator

- **WHEN** user has selected exactly 3 trip types
- **THEN** the counter SHALL display "已選 3 個（已達上限）" with visual emphasis and all unselected checkboxes SHALL be disabled

#### Scenario: None option mutual exclusivity

- **WHEN** user checks the "（無）" option
- **THEN** all other trip-type checkboxes SHALL be unchecked automatically

#### Scenario: Type selection clears None

- **WHEN** user checks any trip type while "（無）" is checked
- **THEN** the "（無）" checkbox SHALL be unchecked automatically

### Requirement: Existing trip-list and trip-detail behaviour is preserved

The system SHALL preserve the existing trip-detail route as the only place where trip items are created, edited, deleted, and checked.

#### Scenario: Expanded trip card excludes item-management controls

- **WHEN** the user expands a trip card from the trip-list page
- **THEN** the expanded card SHALL NOT render the add-item form, item table, inline item editing controls, or item checkbox controls

#### Scenario: Dedicated detail route remains unchanged

- **WHEN** the user opens `#trip/<id>` directly or through a full-detail control
- **THEN** the system SHALL render the existing dedicated trip-detail experience for that trip

### Requirement: Toggle trip card expansion

The system SHALL let the user expand or collapse trip cards from the trip-list page using an explicit card toggle control.

#### Scenario: Expand a collapsed trip card

- **WHEN** the user toggles a collapsed trip card open
- **THEN** the system SHALL expand that card, reveal its secondary summary content, and collapse any other currently expanded trip card

#### Scenario: Collapse the expanded trip card

- **WHEN** the user toggles the currently expanded trip card closed
- **THEN** the system SHALL hide its inline content and return the card to compact summary state

#### Scenario: Expanded card reveals secondary summary details

- **WHEN** a trip card is expanded
- **THEN** the system SHALL reveal the trip's type badges, departure progress pill, return progress pill, delete control, and full-detail button beneath the trip name

#### Scenario: Progress pills align as a pair

- **WHEN** the departure and return progress pills are shown on a phone-sized viewport
- **THEN** the two pills SHALL remain visually aligned on the same row

### Requirement: Jump to an existing trip from the trip list

The system SHALL provide a dropdown-based trip query control on the trip-list page that can jump directly to an existing trip card.

#### Scenario: Query controls with no trips

- **WHEN** there are no saved trips
- **THEN** the trip query dropdown and query action SHALL remain visible in a non-interactive empty state or disabled state without causing layout issues

#### Scenario: Jump to a selected trip

- **WHEN** the user selects an existing trip from the dropdown and confirms the query
- **THEN** the system SHALL expand that trip card, collapse any other expanded trip card, scroll the selected card into view, and provide a visible focus or highlight cue on the target card

#### Scenario: Query without a selected trip

- **WHEN** the user activates the query action without selecting a trip
- **THEN** the system SHALL leave the current card expansion state unchanged

### Requirement: Display trip types on trip cards

The system SHALL display selected trip types as badge components on each trip card in the trip list.

#### Scenario: Trip has no types

- **WHEN** a trip's `typeDisplay` is null or empty
- **THEN** no type badges SHALL be displayed on that trip's card

#### Scenario: Trip has one or more types

- **WHEN** a trip's `typeDisplay` contains type names (e.g., "旅遊+潛水")
- **THEN** the trip card SHALL display tag badges for each type name (split on "+"), styled as small rounded components with light background color

#### Scenario: Badge styling matches visual theme

- **WHEN** type badges are rendered
- **THEN** they SHALL use the existing badge/tag design pattern (similar to "Trip Plan" tag) with consistent padding, border-radius, font-size, and color scheme

### Requirement: Backward compatibility for existing trips

The system SHALL support reading trips created before this change that have `typeId` (string) instead of `typeIds` (array).

#### Scenario: Load trip with legacy typeId

- **WHEN** the system loads a trip from storage that has `typeId` field but no `typeIds` or `typeDisplay` fields
- **THEN** the system SHALL migrate it by setting `typeIds` to an array containing the single `typeId` value, setting `typeDisplay` to the corresponding type's name (or null if type not found), and removing the legacy `typeId` field

#### Scenario: Legacy trip displays correctly

- **WHEN** a migrated trip with one type is displayed
- **THEN** it SHALL show one type badge and behave identically to a newly created single-type trip

