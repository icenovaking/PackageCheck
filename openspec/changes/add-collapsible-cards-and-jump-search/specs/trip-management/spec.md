## MODIFIED Requirements

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

### Requirement: Existing trip-list and trip-detail behaviour is preserved

The system SHALL preserve the existing trip-detail route as the only place where trip items are created, edited, deleted, and checked.

#### Scenario: Expanded trip card excludes item-management controls

- **WHEN** the user expands a trip card from the trip-list page
- **THEN** the expanded card SHALL NOT render the add-item form, item table, inline item editing controls, or item checkbox controls

#### Scenario: Dedicated detail route remains unchanged

- **WHEN** the user opens `#trip/<id>` directly or through a full-detail control
- **THEN** the system SHALL render the existing dedicated trip-detail experience for that trip

## ADDED Requirements

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
