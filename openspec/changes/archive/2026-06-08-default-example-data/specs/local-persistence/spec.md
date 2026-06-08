## MODIFIED Requirements

### Requirement: Graceful handling of missing or corrupt storage

The system SHALL handle the case where `localStorage` is unavailable or contains invalid JSON without crashing, SHALL tolerate older payloads that predate the trip-types field, and SHALL seed example data on first launch when no data exists.

#### Scenario: Corrupt data

- **WHEN** the stored JSON cannot be parsed
- **THEN** the system SHALL start with an empty trips list and an empty trip-types list and display a non-blocking warning to the user

#### Scenario: localStorage unavailable

- **WHEN** `localStorage` is blocked (e.g. private browsing with storage disabled)
- **THEN** the system SHALL operate in-memory for the session and display a warning that data will not be saved

#### Scenario: Legacy payload without trip types

- **WHEN** the stored JSON is a valid object containing a `trips` array but no `tripTypes` field
- **THEN** the system SHALL load the trips as-is and initialise `tripTypes` to an empty array, without showing a warning

#### Scenario: First launch - no existing data

- **WHEN** `localStorage.getItem()` returns `null` for the app's storage key
- **THEN** the system SHALL seed the state with example data (as defined in the `default-example-data` capability), save it to `localStorage`, and proceed with normal operation
