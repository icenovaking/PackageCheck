## MODIFIED Requirements

### Requirement: Persist trips and items across page reloads

The system SHALL save all trip, item, and trip-type data to `localStorage` so it is available after the page is refreshed or the browser is restarted.

#### Scenario: Data survives reload

- **WHEN** user refreshes the page or reopens the tab
- **THEN** all trips with their items, plus all trip types with their preset items, SHALL be restored exactly as they were

### Requirement: Write-through persistence

The system SHALL persist every change immediately when it occurs, without requiring a manual save action.

#### Scenario: Immediate save on change

- **WHEN** user creates, edits, or deletes a trip, an item, a trip type, or a preset item, or toggles a checkbox
- **THEN** the updated data SHALL be written to `localStorage` before the next user interaction is accepted

### Requirement: Graceful handling of missing or corrupt storage

The system SHALL handle the case where `localStorage` is unavailable or contains invalid JSON without crashing, and SHALL tolerate older payloads that predate the trip-types field.

#### Scenario: Corrupt data

- **WHEN** the stored JSON cannot be parsed
- **THEN** the system SHALL start with an empty trips list and an empty trip-types list and display a non-blocking warning to the user

#### Scenario: localStorage unavailable

- **WHEN** `localStorage` is blocked (e.g. private browsing with storage disabled)
- **THEN** the system SHALL operate in-memory for the session and display a warning that data will not be saved

#### Scenario: Legacy payload without trip types

- **WHEN** the stored JSON is a valid object containing a `trips` array but no `tripTypes` field
- **THEN** the system SHALL load the trips as-is and initialise `tripTypes` to an empty array, without showing a warning
