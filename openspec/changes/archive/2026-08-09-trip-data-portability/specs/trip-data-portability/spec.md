# trip-data-portability Specification

## Purpose

Defines browser-only export and import of the complete PackCheck data set so users can back up, move, and share trip plans without a server.

## ADDED Requirements

### Requirement: Export the complete current data set

The system SHALL provide an export action on the trip list page that downloads a JSON package containing every current trip, item, quantity, departure check state, return check state, trip type, and preset item.

The JSON package SHALL use the format identifier packcheck-data and version 1, and SHALL contain the current trips and tripTypes collections under a data object.

#### Scenario: User exports complete data

- **WHEN** the user activates 匯出設定 on the trip list page
- **THEN** the browser downloads one JSON file containing the complete current data set without changing the application state

##### Example: Exported package contents

- **GIVEN** one trip named Japan with one checked passport item and one trip type named Travel with one passport preset
- **WHEN** the user exports the data
- **THEN** the package contains the Japan trip, its item check state, the Travel trip type, and its passport preset under data.trips and data.tripTypes

### Requirement: Accept only a supported data package

The system SHALL accept an import file only when its text is valid JSON with format equal to packcheck-data, version equal to 1, data.trips as an array, data.tripTypes as an array, valid required record fields, positive integer quantities, boolean item check states, and resolvable trip type references.

The system SHALL reject unreadable files, malformed JSON, unsupported format values, unsupported versions, missing arrays, invalid fields, and unresolved trip type references.

#### Scenario: User selects a valid version 1 package

- **WHEN** the user selects a JSON file that satisfies the supported package shape
- **THEN** the system proceeds to merge the package records

#### Scenario: User selects an invalid package

- **WHEN** the user selects a file with malformed JSON or an invalid package field
- **THEN** the system displays an actionable error and does not modify the current state or localStorage value

### Requirement: Merge imported records by ID

The system SHALL merge imported trip types into the current tripTypes collection only when the imported trip type ID is absent locally.

The system SHALL merge imported trips into the current trips collection only when the imported trip ID is absent locally.

When an imported ID already exists locally, the system SHALL keep the existing local record unchanged.

The system SHALL NOT deduplicate records by name.

#### Scenario: Import adds new records and keeps duplicates local

- **GIVEN** the local state contains trip ID local-trip and the selected package contains local-trip and shared-trip
- **WHEN** the import completes
- **THEN** local-trip remains unchanged and shared-trip is added exactly once

##### Example: Repeated import is idempotent

- **GIVEN** the first import added shared-trip and shared-type
- **WHEN** the user imports the same package again
- **THEN** zero records with IDs shared-trip or shared-type are added during the second import

### Requirement: Preserve imported relationships and item state

The system SHALL preserve the IDs, names, quantities, createdAt values, typeIds, typeDisplay values, item IDs, and departure and return check states of every newly imported record.

Every non-null typeIds entry on an imported trip SHALL resolve to an imported or existing trip type after the merge.

#### Scenario: Imported trip retains its packing progress

- **GIVEN** the package contains shared-trip with typeIds equal to shared-type and an item whose departureChecked is true and returnChecked is false
- **WHEN** the package is merged
- **THEN** shared-trip references shared-type and the item retains its quantity and both check states

### Requirement: Persist successful imports and report the result

After a valid merge, the system SHALL save the merged canonical state through the existing localStorage persistence path and SHALL refresh the visible trip list without a full page reload.

The system SHALL report the number of added trips, added trip types, and skipped duplicate records.

#### Scenario: Valid import survives reload

- **GIVEN** a valid package contains one new trip and one new trip type
- **WHEN** the import completes and the page is reloaded
- **THEN** both new records remain available and the UI reports the merge result

#### Scenario: Persistence fails after a merge

- **WHEN** a valid import cannot be written to localStorage
- **THEN** the system displays the existing storage warning and does not claim that the import is durably saved

### Requirement: Keep transfer controls usable from the header

The system SHALL expose 匯出設定 and 匯入設定 controls in the trip list header.

The import control SHALL open a browser file picker restricted to JSON file types, and the file input SHALL reset after processing so the same file can be selected again.

#### Scenario: User opens the import picker

- **WHEN** the user activates 匯入設定
- **THEN** the browser opens the JSON file picker and the user can select a package using keyboard or pointer input

#### Scenario: User imports the same file after an earlier attempt

- **WHEN** the user selects the same JSON file after a completed or rejected import
- **THEN** the file change handler processes the selection again
