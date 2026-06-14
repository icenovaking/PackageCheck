## MODIFIED Requirements

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
