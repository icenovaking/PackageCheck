## Why

PackCheck currently stores all trip data only in the current browser's localStorage, so users cannot back up, move, or share a well-prepared trip with another device or person. A browser-only JSON export/import flow provides portable data without introducing a server or account system.

## What Changes

- Replace the static top-right header chip on the trip list with 匯出設定 and 匯入設定 actions.
- Export the complete current application data, including trips, items, quantities, departure and return check states, trip types, and preset items, as a JSON file.
- Import a JSON file through the browser file picker and merge valid imported data into the current state.
- Deduplicate imported trips and trip types by ID, keeping existing local data when an ID already exists.
- Preserve imported trip-to-trip-type ID relationships and item check states when adding new records.
- Reject invalid, malformed, or unsupported JSON without changing existing data, and show a user-readable result.
- Persist a successful merge to localStorage and refresh the visible trip list.

## Capabilities

### New Capabilities

- trip-data-portability: Export and import the complete local trip data set as a validated, mergeable JSON package.

### Modified Capabilities

- None

## Impact

- Affected specs: new trip-data-portability; integrates with the existing local-persistence, trip-management, and trip-type-presets capabilities.
- Affected code:
  - Modified: app.js, index.html, style.css
  - New: none
  - Removed: none
- No server, database, authentication, or external dependency is introduced.
