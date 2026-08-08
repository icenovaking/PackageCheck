## Context

PackCheck is a browser-only application. Its canonical state is an object containing trips and trip types, and the existing persistence layer serializes that state to localStorage under the packcheck_data key. The trip list is rendered by app.js, while index.html provides the application shell and style.css controls the header layout.

Users need to move or share complete trip plans without a server, account, or external storage service. The change crosses the header UI, browser file APIs, state validation and merge logic, local persistence, and visible rendering.

## Goals / Non-Goals

**Goals:**

- Let users download the complete current state as a versioned JSON file.
- Let users select a JSON file and merge valid new trips and trip types into the current state.
- Preserve item quantities, departure and return check states, preset items, and trip-to-trip-type relationships.
- Deduplicate by record ID while keeping existing local records authoritative.
- Reject invalid input atomically, persist successful imports, and provide visible feedback.
- Keep the flow entirely client-side and compatible with the existing localStorage persistence model.

**Non-Goals:**

- No server synchronization, user accounts, cloud storage, authentication, or conflict-resolution service.
- No name-based deduplication or automatic reconciliation of two different records with similar names.
- No replacement or destructive restore mode in this change.
- No import of arbitrary legacy formats outside the versioned JSON package defined below.

## Decisions

### Decision: Use a versioned JSON package

Exports SHALL use an envelope with format, version, export timestamp, and data fields:

    {
      "format": "packcheck-data",
      "version": 1,
      "exportedAt": "2026-08-08T00:00:00.000Z",
      "data": {
        "trips": [],
        "tripTypes": []
      }
    }

The data fields SHALL use the canonical state shape already consumed by the application. A versioned envelope makes the file identifiable and leaves a controlled migration point for future formats.

The alternative of exporting the bare localStorage object was rejected because it provides no format discriminator or migration boundary.

### Decision: Merge by ID with local records taking precedence

Import SHALL append an imported trip type only when its ID is absent from the current tripTypes collection. Import SHALL append an imported trip only when its ID is absent from the current trips collection. Existing records SHALL remain unchanged when IDs match.

The merge SHALL not deduplicate by name. This preserves distinct trips that happen to share a name and makes repeated imports of the same file idempotent.

The alternative of replacing all state was rejected because sharing another person's trip would risk deleting local work. The alternative of updating matching IDs was rejected because a shared file could overwrite newer local edits.

### Decision: Validate and merge atomically

The file text SHALL be parsed and validated before the current state is mutated. Validation SHALL check the package discriminator, supported version, array types, required identifiers, item quantities, boolean check fields, trip type references, and the canonical nested data shape.

The implementation SHALL build a candidate merged state, persist it once, and then re-render the trip list. A parse or validation failure SHALL leave both the in-memory state and localStorage unchanged.

### Decision: Use native browser file APIs

Export SHALL use JSON.stringify, Blob, a temporary object URL, and a download link. Import SHALL use a hidden file input with a JSON accept filter and the File.text API. No external package or server endpoint is required.

The header actions SHALL remain available on the trip list page. The import input SHALL reset after handling a file so the same file can be selected again.

### Decision: Report transfer results in the existing UI

A successful export SHALL report that the file was downloaded. A successful import SHALL report counts for added trips and trip types, plus skipped records whose IDs already existed. A rejected file SHALL report a concise actionable error and SHALL not clear or partially apply data.

## Implementation Contract

### Observable behavior

The trip list header SHALL expose buttons labelled 匯出設定 and 匯入設定. Clicking 匯出設定 SHALL download one JSON file containing the complete current state. Clicking 匯入設定 SHALL open the browser file picker restricted to JSON files.

After selecting a valid package, the application SHALL merge new records, keep local records for duplicate IDs, save the merged state to localStorage, and refresh the visible trip list without a full page reload.

### Data shape

The supported package SHALL have:

- format: the exact string packcheck-data.
- version: the integer 1.
- exportedAt: an ISO timestamp string.
- data.trips: an array of trip records.
- data.tripTypes: an array of trip type records.

Each trip type SHALL contain id, name, createdAt, and presetItems. Each preset item SHALL contain id, name, and a positive integer qty.

Each trip SHALL contain id, name, createdAt, items, and the canonical typeIds and typeDisplay fields. typeIds SHALL be null or an array of strings. Each item SHALL contain id, name, a positive integer qty, and boolean departureChecked and returnChecked fields.

A non-null imported typeIds entry SHALL resolve to either an imported trip type or an existing local trip type after the merge. A package with an unresolved reference SHALL be rejected.

### Merge behavior

For an existing local state containing trip ID local-trip and an imported package containing local-trip plus shared-trip:

- local-trip SHALL remain byte-for-byte equivalent to its pre-import local record.
- shared-trip SHALL be appended with all item records and check states unchanged.
- Re-importing the same package SHALL add zero records for IDs already present.
- A trip type referenced by shared-trip SHALL be available under the same ID after the merge.

### Failure modes

The application SHALL reject unreadable files, invalid JSON, unsupported format values, unsupported versions, missing data arrays, invalid record fields, and unresolved trip type references. The rejection SHALL display a user-readable message and SHALL preserve the current state and localStorage value.

A successful in-memory merge that cannot be persisted SHALL use the existing storage warning behavior and SHALL not claim durable success.

### Acceptance criteria

- A manual export followed by JSON parsing shows every current trip, item, check state, trip type, and preset item in the package.
- Importing a package with one duplicate trip and one new trip leaves the duplicate local record unchanged and adds exactly one trip.
- Importing the same package twice adds no records during the second import.
- A package with malformed JSON or an invalid field produces an error and leaves the trip list and localStorage unchanged.
- A valid import persists through page reload and displays the added records.
- The header controls work with keyboard focus and the file picker accepts JSON files.
- Existing trip creation, item editing/checking, trip type editing, and localStorage reload behavior remain unchanged.

### Scope boundaries

In scope: app.js state transfer and validation logic, index.html transfer controls or file input support, style.css header and feedback presentation, and tests for export, validation, merge, persistence, and rendering behavior.

Out of scope: server-side sync, authentication, cloud backup, import replacement, name-based matching, record editing conflict resolution, and support for unversioned third-party JSON.

## Risks / Trade-offs

- [Risk] Shared JSON is user-editable and can contain malformed or unexpected values. → Mitigation: validate the complete package before mutation, escape rendered values through the existing rendering path, and apply merges atomically.
- [Risk] ID collisions between independent files can cause an imported record to be skipped. → Mitigation: keep the existing local record authoritative as the documented conflict rule; generated IDs already use a timestamp and random suffix.
- [Risk] Browser download or localStorage APIs can fail. → Mitigation: surface the failure through visible status or the existing storage warning and avoid reporting durable success when persistence fails.
- [Risk] Export files can become large as trip history grows. → Mitigation: keep the format compact JSON and defer compression or size management until a measured need exists.

## Migration Plan

No existing localStorage migration is required. The existing state remains the source of truth, and export creates the new versioned package on demand. Import only accepts the version 1 package and writes the merged canonical state through the existing persistence path.

Rollback consists of removing the transfer controls and handlers; existing localStorage data remains in the established packcheck_data format.
