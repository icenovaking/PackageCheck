## MODIFIED Requirements

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
- **THEN** the system SHALL reveal the trip's type badges, departure progress pill, return progress pill, edit control, delete control, and full-detail button beneath the trip name

#### Scenario: Progress pills align as a pair

- **WHEN** the departure and return progress pills are shown on a phone-sized viewport
- **THEN** the two pills SHALL remain visually aligned on the same row

## ADDED Requirements

### Requirement: Rename a trip from the trip list

The system SHALL allow users to rename an existing trip directly from its expanded trip card in the trip list.

#### Scenario: Enter trip name edit mode

- **WHEN** the user activates the edit control on an expanded trip card
- **THEN** the system SHALL replace the trip name text with an input field populated with the current name, disable the card header collapse toggle action, and replace the edit and delete controls with save and cancel controls

#### Scenario: Save trip name rename

- **WHEN** the user enters a non-empty name in the trip name input field and activates the save control (or presses Enter)
- **THEN** the system SHALL update the trip name, persist the change to local storage, exit edit mode, enable the card header collapse toggle, and re-render the card with the updated name

#### Scenario: Cancel trip name rename

- **WHEN** the user activates the cancel control (or presses Escape) while in edit mode
- **THEN** the system SHALL discard any changes, exit edit mode, enable the card header collapse toggle, and restore the original trip name

#### Scenario: Empty trip name rejected

- **WHEN** the user attempts to save a blank or empty trip name
- **THEN** the system SHALL display an error message and NOT update the name, keeping the input field in edit mode
