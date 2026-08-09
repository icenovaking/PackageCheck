# trip-data-portability Delta

## MODIFIED Requirements

### Requirement: Export the complete current data set

The system SHALL provide an export action on the trip list page that downloads a JSON package containing every current trip, item, quantity, departure check state, return check state, trip type, preset item, and common item.

The JSON package SHALL use the format identifier packcheck-data and version 2, and SHALL contain the current trips, tripTypes, and commonItems collections under a data object.

#### Scenario: User exports complete data

- **WHEN** the user activates 匯出設定 on the trip list page
- **THEN** the browser SHALL download one version 2 JSON file containing the complete current data set without changing application state

##### Example: Exported package contents

- **GIVEN** one trip named Japan, one trip type named Travel, and one common item named Passport
- **WHEN** the user exports the data
- **THEN** the package SHALL contain the trip under data.trips, the trip type under data.tripTypes, and the common item under data.commonItems

### Requirement: Accept only a supported data package

The system SHALL accept an import file only when its text is valid JSON with format equal to packcheck-data, version equal to 1 or 2, data.trips as an array, data.tripTypes as an array, valid required record fields, positive integer quantities, boolean item check states, and resolvable trip type references.

For version 2, data.commonItems SHALL be an array of records with non-empty IDs and names, unique IDs, and unique normalized names. For version 1, a missing data.commonItems field SHALL be normalized to an empty array.

The system SHALL reject unreadable files, malformed JSON, unsupported format values, unsupported versions, missing required arrays, invalid fields, duplicate common item IDs or names within the package, and unresolved trip type references.

#### Scenario: User selects a valid version 2 package

- **WHEN** the user selects a version 2 JSON file satisfying the supported package shape and containing valid commonItems
- **THEN** the system SHALL proceed to merge the package records

#### Scenario: User selects a valid version 1 package

- **WHEN** the user selects a version 1 JSON file without data.commonItems
- **THEN** the system SHALL normalize data.commonItems to an empty array and proceed to merge the trips and trip types

#### Scenario: User selects an invalid package

- **WHEN** the user selects a file with malformed JSON, an invalid package field, or duplicate common item IDs or normalized names
- **THEN** the system SHALL display an actionable error and SHALL NOT modify the current state or localStorage value

### Requirement: Merge imported records by ID

The system SHALL merge imported trip types into the current tripTypes collection only when the imported trip type ID is absent locally.

The system SHALL merge imported trips into the current trips collection only when the imported trip ID is absent locally.

The system SHALL merge an imported common item only when both its ID and its normalized name are absent locally.

When an imported trip, trip type, or common item conflicts with local data, the system SHALL keep the existing local record unchanged.

The system SHALL NOT deduplicate trips or trip types by name. Common item names SHALL be unique across the merged commonItems collection.

#### Scenario: Import adds new records and keeps duplicate IDs local

- **GIVEN** the local state contains trip ID local-trip and the selected package contains local-trip and shared-trip
- **WHEN** the import completes
- **THEN** local-trip SHALL remain unchanged and shared-trip SHALL be added exactly once

#### Scenario: Import skips a common item with an existing ID

- **GIVEN** the local commonItems collection contains ID local-item
- **WHEN** the selected package contains a different common item record with ID local-item
- **THEN** the local common item SHALL remain unchanged and the imported record SHALL be skipped

#### Scenario: Import skips a common item with an existing normalized name

- **GIVEN** the local commonItems collection contains "Passport"
- **WHEN** the selected package contains a common item with a different ID and name " passport "
- **THEN** the imported common item SHALL be skipped and the local common item SHALL remain unchanged

##### Example: Repeated import is idempotent

- **GIVEN** the first import added shared-trip, shared-type, and shared-item
- **WHEN** the user imports the same package again
- **THEN** zero records with those IDs SHALL be added during the second import

### Requirement: Preserve imported relationships and item state

The system SHALL preserve the IDs, names, quantities, createdAt values, typeIds, typeDisplay values, item IDs, and departure and return check states of every newly imported trip and trip type record.

The system SHALL preserve the ID and name of every newly imported common item. Common items SHALL NOT create or require commonItemId references from trips or trip types.

Every non-null typeIds entry on an imported trip SHALL resolve to an imported or existing trip type after the merge.

#### Scenario: Imported trip retains its packing progress

- **GIVEN** the package contains shared-trip with typeIds equal to shared-type and an item whose departureChecked is true and returnChecked is false
- **WHEN** the package is merged
- **THEN** shared-trip SHALL reference shared-type and the item SHALL retain its quantity and both check states

#### Scenario: Imported common item retains its identity

- **GIVEN** the package contains common item shared-item named Passport
- **WHEN** the package is merged without an ID or normalized-name conflict
- **THEN** the resulting commonItems collection SHALL contain shared-item named Passport

### Requirement: Persist successful imports and report the result

After a valid merge, the system SHALL save the merged canonical state through the existing localStorage persistence path and SHALL refresh the visible trip list without a full page reload.

The system SHALL report the number of added and skipped trips, trip types, and common items.

#### Scenario: Valid import survives reload

- **GIVEN** a valid package contains one new trip, one new trip type, and one new common item
- **WHEN** the import completes and the page is reloaded
- **THEN** all three new records SHALL remain available and the UI SHALL report their merge result

#### Scenario: Persistence fails after a merge

- **WHEN** a valid import cannot be written to localStorage
- **THEN** the system SHALL display the existing storage warning, restore the pre-import state, and SHALL NOT claim that the import is durably saved
