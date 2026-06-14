## MODIFIED Requirements

### Requirement: List trip types on the settings page

The system SHALL display all existing trip types on the settings page in creation order as individually collapsible cards.

#### Scenario: No trip types exist

- **WHEN** the user opens the settings page and no trip types have been created
- **THEN** the system SHALL show an empty-state message inviting the user to create a trip type

#### Scenario: Trip types present

- **WHEN** one or more trip types exist
- **THEN** the settings page SHALL list each trip type in creation order as a compact card whose collapsed header shows the type's identity and management controls

#### Scenario: Type cards start collapsed

- **WHEN** the settings page is rendered with existing trip types
- **THEN** each trip-type card SHALL render in collapsed state until the user expands a card or completes a type jump-search action

### Requirement: New UI reuses existing visual vocabulary

The system SHALL implement the settings page, settings entry-point button, trip-type dropdowns, jump-search controls, and collapsible trip-type cards using only the existing class/token vocabulary already defined in `app.js` and `style.css` (page shell, content panel, view header, add-form, input-group, btn-primary, btn-icon, item-table, field-error, empty-state, btn-back, section-kicker), and SHALL NOT introduce a new visual language, new colour tokens, or new typography.

#### Scenario: New icon follows existing style

- **WHEN** a collapse/expand icon or affordance is rendered for a trip-type card
- **THEN** it SHALL follow the same inline SVG and button conventions already used by the app's existing icon controls

#### Scenario: Settings page reuses existing layout primitives

- **WHEN** the settings page is rendered with jump-search controls and collapsible cards
- **THEN** it SHALL continue to use the same `page-shell` / `app-header` / `content-panel` / `view-header` / `add-form` / `input-group` / `btn-primary` / `btn-back` markup pattern used by the existing trip-list and trip-detail views

## ADDED Requirements

### Requirement: Toggle trip-type card expansion

The system SHALL let the user expand or collapse trip-type cards from the settings page using an explicit card toggle control.

#### Scenario: Expand a collapsed type card

- **WHEN** the user toggles a collapsed trip-type card open
- **THEN** the system SHALL expand that card, reveal its preset-item form and preset-item list, and collapse any other currently expanded trip-type card

#### Scenario: Collapse the expanded type card

- **WHEN** the user toggles the currently expanded trip-type card closed
- **THEN** the system SHALL hide its preset-item form and preset-item list and return the card to compact summary state

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
