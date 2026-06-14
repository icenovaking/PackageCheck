## 1. UI State & Card Rendering

- [x] 1.1 Add `editingTripId: null` to the global `uiState` object in `app.js`.
- [x] 1.2 Update `buildTripCard(trip)` to determine if the trip is in edit mode: `const editing = uiState.editingTripId === trip.id;`.
- [x] 1.3 In `buildTripCard(trip)`, when `editing` is true, render the header as `<div class="card-toggle-editing">` instead of `<button class="card-toggle">` to prevent nested interactive element warnings.
- [x] 1.4 In `buildTripCard(trip)`, when `editing` is true, render an input field `<input type="text" class="edit-name-input js-edit-trip-input" value="${esc(trip.name)}" maxlength="100" />` instead of the text `<span>`.
- [x] 1.5 In `buildTripCard(trip)`, render `Save` (check icon) and `Cancel` (cross icon) buttons in `.trip-card-header-actions` when `editing` is true.
- [x] 1.6 In `buildTripCard(trip)`, render the `Edit` button (pencil icon) next to the `Delete` button when expanded is true and `editing` is false.

## 2. Event Listeners & Logic

- [x] 2.1 Bind click event handler for `.js-edit-trip` in `renderTripList(app)` to set `uiState.editingTripId = id`, re-render the trip list, and focus/select the input field.
- [x] 2.2 Bind click event handler for `.js-save-trip` in `renderTripList(app)` to read the trimmed value, show an alert if empty, update `trip.name` in state, call `saveState()`, clear `uiState.editingTripId`, and re-render.
- [x] 2.3 Bind click event handler for `.js-cancel-trip` in `renderTripList(app)` to clear `uiState.editingTripId` and re-render the trip list.
- [x] 2.4 Bind a `keydown` listener for `.js-edit-trip-input` to trigger save on `Enter` and cancel on `Escape`.

## 3. CSS Styles

- [x] 3.1 Update the `.card-toggle` selectors in `style.css` to also apply to `.card-toggle-editing`.
- [x] 3.2 Add styles for `.trip-card-main .edit-name-input` in `style.css` to match the display font family, size (`clamp(1.5rem, 4vw, 2.25rem)`), padding, and layout of the trip name.

## 4. Testing & Verification

- [x] 4.1 Verify that clicking the edit button activates the input and focuses it.
- [x] 4.2 Verify that entering a new name and clicking save or pressing Enter successfully updates the trip name.
- [x] 4.3 Verify that clicking cancel or pressing Escape discards the changes.
- [x] 4.4 Verify that trying to save an empty trip name displays an error alert.
- [x] 4.5 Verify that clicking inside the input field does not collapse/expand the card.
