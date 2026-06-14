## Context

The settings page displays user-defined trip types. Currently, each trip-type card header renders a `.action-group` containing three buttons: edit, delete, and chevron toggle. This layout differs from the main trip card, which uses a full-header clickable button for toggling, and reveals the edit and delete buttons only when expanded.

This document describes how we will refactor the trip-type card header to share structure and styling with the main trip card header, ensuring visual alignment, spacing consistency, and unified toggle interactions.

## Goals / Non-Goals

**Goals:**
- Hide edit and delete controls for a trip type when its card is collapsed.
- Reveal edit and delete controls only when expanded.
- Make the entire header (except edit/delete action buttons) clickable to expand/collapse the card.
- Vertically align the chevron button with the top of the "TRIP TYPE" badge.
- Match all button sizes, spacings (`0.45rem`), and mobile responsive stacking with the trip list cards.

**Non-Goals:**
- Add a separate route or full page for trip types (they continue to expand directly on the settings page).
- Modify how preset packing items are managed inside the expanded card.

## Decisions

### Decision 1: Shared Grid Layout in CSS
- **Choice**: Share CSS styles between `.trip-card-header` / `.trip-card-header-actions` and `.trip-type-header` / `.trip-type-header-actions`.
- **Rationale**: By using the same CSS classes (or grouping them), the trip-type header will automatically use `grid-template-columns: minmax(0, 1fr) auto; gap: 0.45rem; align-items: start;` on desktop and collapse to `grid-template-columns: 1fr;` on mobile. This keeps the spacing and layout 100% identical.

### Decision 2: Full-Header Button Toggle
- **Choice**: Wrap the trip-type name and chevron indicator in a `<button type="button" class="card-toggle trip-type-card-toggle js-toggle-type">` when not editing, and in a `<div class="card-toggle-editing">` when editing.
- **Rationale**: Wrapping it in `<button class="card-toggle">` enables clicking anywhere on the header to toggle, matching the trip card interaction. It also places the chevron toggle button inside the header column (column 1), leaving column 2 for the edit and delete actions. Swapping to a `<div>` in edit mode avoids nesting input fields inside a button.

### Decision 3: Align Chevron vertically to the top
- **Choice**: Keep `align-items: flex-start` (or `start`) on the grid header and `.card-toggle` elements.
- **Rationale**: Since the badge and name wrap inside a flex container at the top of the card header column, and the chevron toggle button is aligned to the top (flex-start), the chevron's top edge will vertically align perfectly with the "TRIP TYPE" badge.

## Risks / Trade-offs

- **Risk**: Event bubbling or double click triggers when actions are clicked.
  - **Mitigation**: The actions container `.trip-type-header-actions` is placed as a sibling to the toggle button `.card-toggle` inside `.trip-type-header`, so clicks on edit or delete will not bubble up to trigger the collapse/expand toggle.
