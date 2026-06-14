## Why

Currently, users cannot rename a trip after it has been created. If they make a typo or want to update a trip's name, they must delete the trip (which permanently deletes all its packing items) and create a new one. This change solves this issue by allowing users to edit a trip's name directly and inline from the expanded trip card.

## What Changes

- Add a touch-friendly edit button (pencil icon) next to the delete button (trash icon) in the header of an expanded trip card.
- Allow clicking the edit button to toggle the card into an inline edit mode.
- In edit mode, the trip name text is replaced with an input field populated with the current name.
- In edit mode, the header actions change to a save button (check icon) and a cancel button (cross icon).
- In edit mode, the card header toggle is temporarily disabled so that clicks inside the input do not trigger collapse/expansion.
- Support saving the new name (via Save button or Enter key) and persisting it to local storage.
- Support canceling the edit (via Cancel button or Escape key) to revert back to the original name.
- Input validation to ensure empty names are rejected.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `trip-management`: Update the trip listing requirements to include inline renaming controls and behavior on expanded cards.

## Impact

- `app.js`: Add `editingTripId` to `uiState`, update `buildTripCard()` to support edit-mode rendering, and add event handlers for editing, saving, canceling, and keyboard controls.
- `style.css`: Add styles for `.card-toggle-editing` and style the input field on the trip card to match the visual theme.
- Local Storage: Updates existing trip names in the persisted state.
