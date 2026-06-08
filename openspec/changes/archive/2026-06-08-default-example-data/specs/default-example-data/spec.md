## ADDED Requirements

### Requirement: Seed example data on first launch

The system SHALL detect when the app is opened for the first time (localStorage contains no saved data) and SHALL seed the state with predefined example trip types and trips before normal operation begins.

#### Scenario: First launch with empty localStorage

- **WHEN** `localStorage` contains no data for the app's storage key (returns `null`)
- **THEN** the system SHALL initialize state with example trip types and trips, save that state to `localStorage`, and proceed with normal rendering

#### Scenario: Subsequent launches with data present

- **WHEN** `localStorage` contains any saved data (even if `trips` and `tripTypes` arrays are empty)
- **THEN** the system SHALL NOT seed example data and SHALL load the existing state as normal

#### Scenario: User deletes all example data

- **WHEN** user deletes all trips and trip types that were seeded on first launch
- **THEN** the system SHALL save the empty state to `localStorage` and SHALL NOT re-seed examples on subsequent page loads

### Requirement: Example trip type content

The example data SHALL include exactly one trip type named "旅遊" with one preset item named "護照" with quantity 1.

#### Scenario: Trip type structure

- **WHEN** example data is seeded
- **THEN** the trip type SHALL have:
  - A unique ID with prefix `demo-type-`
  - Name: "旅遊"
  - Creation timestamp: fixed date (not current time)
  - Preset items array containing one item:
    - ID with prefix `demo-preset-`
    - Name: "護照"
    - Quantity: 1

### Requirement: Example trip content

The example data SHALL include exactly one trip named "11月日本土浦煙火行" that references the example trip type and contains two items.

#### Scenario: Trip structure and type linkage

- **WHEN** example data is seeded
- **THEN** the trip SHALL have:
  - A unique ID with prefix `demo-trip-`
  - Name: "11月日本土浦煙火行"
  - Creation timestamp: fixed date (not current time)
  - `typeId` referencing the example trip type's ID
  - Items array containing two items

#### Scenario: Trip items content

- **WHEN** example data is seeded
- **THEN** the trip's items SHALL include:
  - First item: name "護照", quantity 1 (representing the item from the trip type preset)
  - Second item: name "手機", quantity 1 (representing a manually added item)
  - Both items SHALL have unique IDs with prefix `demo-item-`
  - Both items SHALL have `departureChecked: false` and `returnChecked: false`

### Requirement: Example data identification

All example data objects SHALL use ID prefixes that clearly distinguish them from user-generated content.

#### Scenario: ID prefix convention

- **WHEN** example data is seeded
- **THEN** all IDs SHALL use the following prefixes:
  - Trip type IDs: `demo-type-`
  - Preset item IDs: `demo-preset-`
  - Trip IDs: `demo-trip-`
  - Trip item IDs: `demo-item-`
