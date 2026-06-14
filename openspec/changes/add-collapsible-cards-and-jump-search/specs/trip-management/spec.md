## MODIFIED Requirements

### Requirement: List trips

The system SHALL display all existing trips on the home screen as individually collapsible cards in creation order.

#### Scenario: No trips exist

- **WHEN** there are no saved trips
- **THEN** the system SHALL show an empty-state message prompting the user to create a trip

#### Scenario: Trips present

- **WHEN** one or more trips exist
- **THEN** the system SHALL list every trip by name in the order they were created as a compact card whose collapsed header still exposes identifying summary information

#### Scenario: Cards start collapsed

- **WHEN** the trip-list view is rendered with existing trips
- **THEN** each trip card SHALL render in collapsed state until the user expands a card or completes a trip jump-search action

### Requirement: Navigate into a trip

The system SHALL allow the user to view a trip's items either inline from the trip-list page or through the dedicated route-based detail view.

#### Scenario: Open trip inline

- **WHEN** user expands a trip card in the list
- **THEN** the system SHALL reveal that trip's actionable content inline without navigating away from `#trips`

#### Scenario: Open trip detail route

- **WHEN** user activates the dedicated full-detail control for a trip
- **THEN** the system SHALL navigate to that trip's detail view at route `#trip/<id>` showing its items

### Requirement: Existing trip-list and trip-detail behaviour is preserved

The system SHALL preserve the existing trip-detail route and the existing item-management behavior even when trip content is also available inline from an expanded trip card.

#### Scenario: Inline trip controls behave like detail view

- **WHEN** the user interacts with add-item, checkbox-toggle, inline-edit, or delete controls inside an expanded trip card
- **THEN** each control SHALL invoke the same validation, persistence, and item-management outcome as the dedicated trip-detail view

#### Scenario: Dedicated detail route remains unchanged

- **WHEN** the user opens `#trip/<id>` directly or through a full-detail control
- **THEN** the system SHALL render the existing dedicated trip-detail experience for that trip

## ADDED Requirements

### Requirement: Toggle trip card expansion

The system SHALL let the user expand or collapse trip cards from the trip-list page using an explicit card toggle control.

#### Scenario: Expand a collapsed trip card

- **WHEN** the user toggles a collapsed trip card open
- **THEN** the system SHALL expand that card, reveal its inline content, and collapse any other currently expanded trip card

#### Scenario: Collapse the expanded trip card

- **WHEN** the user toggles the currently expanded trip card closed
- **THEN** the system SHALL hide its inline content and return the card to compact summary state

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
