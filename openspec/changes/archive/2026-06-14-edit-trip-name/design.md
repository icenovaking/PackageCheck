## Context

Currently, the application allows users to create and delete trips but offers no way to rename an existing trip. Users who make a spelling mistake or wish to update a trip name must delete the trip, which permanently removes all its items, and recreate it. This document outlines the design for inline trip name editing within the main trip card.

## Goals / Non-Goals

**Goals:**
- Provide a simple, inline editing experience for trip names in the trip list view.
- Support "Save" and "Cancel" actions via both mouse clicks and keyboard shortcuts (Enter and Escape).
- Ensure input validation prevents empty names from being saved.
- Avoid invalid nested HTML interactive elements in the trip card header.
- Persist name changes immediately to localStorage.

**Non-Goals:**
- Support editing multiple trip names simultaneously.
- Rename items directly from the trip card (this remains scoped to the route-based detail view).
- Modify the trip types from the card header.

## Decisions

### Decision 1: UI State Tracking
- **Choice**: Add `editingTripId` (string | null) to the global `uiState` object.
- **Rationale**: This matches the design pattern used for renaming trip types (`editingTypeId`). It makes it easy to check if a specific trip is in edit mode during rendering and event binding.

### Decision 2: Avoiding Nested Interactive Elements
- **Choice**: When a card is in edit mode, replace the card header `<button class="card-toggle">` element with a `<div>` element styled identically via `.card-toggle-editing`.
- **Rationale**: In the default state, the entire card header is a `<button>` that expands or collapses the card. Nesting an `<input>` and action buttons (`js-save-trip`, `js-cancel-trip`) inside a `<button>` is invalid HTML and would cause browser bugs and unexpected click triggers. Changing it to a `<div>` in edit mode removes the toggle click handler and ensures valid markup.

### Decision 3: Inline Validation
- **Choice**: Validate that the input is non-empty before saving. If invalid, keep the input focused and show a native browser `alert()` dialog.
- **Rationale**: Matches the validation style of the item list editing in the detail page.

### Decision 4: Keyboard Shortcuts
- **Choice**: Add keydown listeners to the edit input:
  - `Enter`: Trigger save operation.
  - `Escape`: Trigger cancel operation.
- **Rationale**: Standard desktop/web accessibility and convenience pattern for inline text fields.

## Risks / Trade-offs

- **Risk**: User accidentally clicks outside or collapses card while editing, losing changes.
  - **Mitigation**: By replacing the toggle `<button>` with a `<div>` in edit mode, the card header is no longer clickable to collapse. The card can only be collapsed by saving or canceling.
- **Risk**: Inputs stretch or overflow on narrow mobile screens.
  - **Mitigation**: The input will use `.edit-name-input` which inherits `width: 100%` and `min-width: 0`, and the surrounding container uses flex/grid with `minmax(0, 1fr)` to prevent overflow.
