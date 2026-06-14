## 1. UI Template & Rendering Refactoring

- [x] 1.1 In `buildTripTypeCard(type)`, check if the card is in edit mode: `const editing = uiState.editingTypeId === type.id;`.
- [x] 1.2 In `buildTripTypeCard(type)`, when `editing` is false, wrap the header main section and chevron indicator inside `<button type="button" class="card-toggle trip-type-card-toggle js-toggle-type" data-id="${esc(type.id)}" aria-expanded="${expanded}">`.
- [x] 1.3 In `buildTripTypeCard(type)`, when `editing` is true, wrap the header in `<div class="card-toggle-editing">` to support the inline text input without nested interactive button elements.
- [x] 1.4 In `buildTripTypeCard(type)`, only render the actions container (`.trip-type-header-actions`) containing the Edit and Delete buttons (or Save and Cancel buttons) when `expanded` is true.

## 2. Event Listeners & CSS Styles

- [x] 2.1 Update the chevron button class in the card toggle from `.btn-icon` to `.card-toggle-indicator` to align with the trip card chevron design.
- [x] 2.2 In `style.css`, group `.trip-type-header` styling with `.trip-card-header` to apply the grid layout (`grid-template-columns: minmax(0, 1fr) auto; gap: 0.45rem; align-items: start;`).
- [x] 2.3 In `style.css`, group `.trip-type-header-actions` styling with `.trip-card-header-actions` to apply the flex layout (`display: flex; align-items: flex-start; justify-content: flex-end; gap: 0.45rem;`).
- [x] 2.4 In `style.css`, update mobile media queries (`@media (max-width: 768px)`) to apply the single-column stacking (`grid-template-columns: 1fr;`) and right-alignment (`justify-content: flex-end;`) to `.trip-type-header` and `.trip-type-header-actions` respectively.

## 3. Verification & Manual Testing

- [x] 3.1 Verify that collapsed trip-type cards show only the "TRIP TYPE" badge, type name, and chevron button, while hiding edit and delete buttons.
- [x] 3.2 Verify that clicking anywhere on the header of a collapsed trip-type card successfully expands it.
- [x] 3.3 Verify that expanding a card reveals the edit and delete buttons.
- [x] 3.4 Verify that the chevron button aligns vertically to the top (flex-start) with the "TRIP TYPE" badge.
- [x] 3.5 Verify that button sizes, spacings, and mobile positions match the trip list cards exactly.
